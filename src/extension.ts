import * as vscode from "vscode";
import { DryRunInstallAgent } from "./agent";
import { LocalFallbackSearchClient } from "./search";
import type { WorkspaceContext } from "./types";

const searchClient = new LocalFallbackSearchClient();
const installAgent = new DryRunInstallAgent();

async function getWorkspaceContext(): Promise<WorkspaceContext | undefined> {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    return undefined;
  }

  const packageJsonUri = vscode.Uri.joinPath(folder.uri, "package.json");
  let hasPackageJson = false;

  try {
    await vscode.workspace.fs.stat(packageJsonUri);
    hasPackageJson = true;
  } catch {
    hasPackageJson = false;
  }

  return {
    rootPath: folder.uri.fsPath,
    hasPackageJson,
    manager: "npm"
  };
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const disposable = vscode.commands.registerCommand("packpilot.openSearch", async () => {
    const workspace = await getWorkspaceContext();
    if (!workspace) {
      vscode.window.showWarningMessage("PackPilot needs an open workspace.");
      return;
    }

    const query = await vscode.window.showInputBox({
      prompt: "Search for a package or describe what you need",
      placeHolder: "e.g. HTTP client for Node"
    });

    if (!query) {
      return;
    }

    const results = await searchClient.search({
      query,
      ecosystem: "npm",
      workspace
    });

    if (results.length === 0) {
      vscode.window.showInformationMessage("No packages found for that query.");
      return;
    }

    const pick = await vscode.window.showQuickPick(
      results.map((result) => ({
        label: result.name,
        description: `${result.version} | ${result.license ?? "unknown license"}`,
        detail: result.summary
      })),
      {
        title: "PackPilot package results"
      }
    );

    if (!pick) {
      return;
    }

    const chosen = results.find((result) => result.name === pick.label);
    if (!chosen) {
      return;
    }

    const installResult = await installAgent.install({
      packageName: chosen.name,
      version: chosen.version,
      devDependency: false,
      workspace
    });

    if (installResult.ok) {
      vscode.window.showInformationMessage(installResult.stdout);
    } else {
      vscode.window.showErrorMessage(installResult.stderr || "PackPilot install failed.");
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate(): void {
  // Nothing to clean up yet.
}

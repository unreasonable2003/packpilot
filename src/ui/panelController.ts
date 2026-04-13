import * as vscode from "vscode";
import { toErrorMessage } from "../core/errors";
import { assertNonEmptyQuery } from "../core/validation";
import type { WebviewRequestMessage, WebviewResponseMessage } from "../domain/messages";
import { parseWebviewRequestMessage } from "../domain/messageParser";
import type { PackageDetails } from "../domain/types";
import { NpmInstallService } from "../services/npmInstallService";
import { NpmRegistrySearchService } from "../services/npmRegistryService";
import { getPackPilotWebviewHtml } from "./panelView";
import { getPrimaryWorkspaceContext, requirePrimaryWorkspaceContext } from "../workspace/context";

export class PackPilotPanelController {
  private currentPanel: vscode.WebviewPanel | undefined;
  private readonly outputChannel: vscode.OutputChannel;
  private readonly searchService = new NpmRegistrySearchService();
  private readonly installService = new NpmInstallService();
  private readonly detailsCache = new Map<string, PackageDetails>();

  constructor(private readonly context: vscode.ExtensionContext) {
    this.outputChannel = vscode.window.createOutputChannel("PackPilot");
    this.context.subscriptions.push(this.outputChannel);
  }

  async open(): Promise<void> {
    if (this.currentPanel) {
      this.currentPanel.reveal(vscode.ViewColumn.One);
      await this.postWorkspaceState(this.currentPanel);
      return;
    }

    const panel = vscode.window.createWebviewPanel("packpilot", "PackPilot", vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true
    });

    panel.webview.html = getPackPilotWebviewHtml(panel.webview);
    panel.onDidDispose(() => {
      if (this.currentPanel === panel) {
        this.currentPanel = undefined;
      }
    });

    panel.webview.onDidReceiveMessage(
      async (message: unknown) => {
        await this.handleMessage(panel, parseWebviewRequestMessage(message));
      },
      undefined,
      this.context.subscriptions
    );

    this.currentPanel = panel;
    await this.postWorkspaceState(panel);
  }

  dispose(): void {
    this.outputChannel.dispose();
  }

  private async handleMessage(panel: vscode.WebviewPanel, message: WebviewRequestMessage): Promise<void> {
    try {
      switch (message.type) {
        case "ready":
          await this.postWorkspaceState(panel);
          break;
        case "search":
          await this.handleSearch(panel, message.query);
          break;
        case "loadPackage":
          await this.handleLoadPackage(panel, message.packageName);
          break;
        case "install":
          await this.handleInstall(panel, message.packageName, message.version, message.installMode);
          break;
        case "openExternal":
          await vscode.env.openExternal(vscode.Uri.parse(message.url));
          break;
        default:
          break;
      }
    } catch (error) {
      const errorMessage = toErrorMessage(error);
      await this.handleFailure(panel, message.type, errorMessage);
    }
  }

  private async handleSearch(panel: vscode.WebviewPanel, rawQuery: string): Promise<void> {
    const query = assertNonEmptyQuery(rawQuery);
    await this.postMessage(panel, { type: "searchStarted" });
    const workspace = await getPrimaryWorkspaceContext();
    const results = await this.searchService.search({
      query,
      ecosystem: "npm",
      workspace
    });
    await this.postMessage(panel, { type: "searchResults", results });
  }

  private async handleLoadPackage(panel: vscode.WebviewPanel, packageName: string): Promise<void> {
    await this.postMessage(panel, { type: "packageDetailStarted" });
    if (!this.detailsCache.has(packageName)) {
      this.detailsCache.set(packageName, await this.searchService.getPackageDetails(packageName));
    }

    await this.postMessage(panel, {
      type: "packageDetail",
      detail: this.detailsCache.get(packageName) as PackageDetails
    });
  }

  private async handleInstall(
    panel: vscode.WebviewPanel,
    packageName: string,
    version: string,
    installMode: "dependency" | "devDependency"
  ): Promise<void> {
    const workspace = await requirePrimaryWorkspaceContext();

    this.outputChannel.clear();
    this.outputChannel.appendLine(`[PackPilot] Installing ${packageName}@${version}`);
    await this.postMessage(panel, { type: "installStarted" });

    const result = await this.installService.install({
      packageName,
      version,
      installMode,
      workspace,
      onProgress: (chunk) => {
        this.outputChannel.append(chunk);
        void this.postMessage(panel, { type: "installLog", chunk });
      }
    });

    const summary = [
      result.ok ? "Install finished successfully." : "Install failed.",
      `Command: ${result.command}`,
      `Exit code: ${result.exitCode}`,
      `Duration: ${result.durationMs}ms`,
      ...result.manifestChanges
    ].join("\n");

    this.outputChannel.appendLine(summary);
    await this.postWorkspaceState(panel);
    await this.postMessage(panel, {
      type: "installFinished",
      success: result.ok,
      summary
    });

    if (result.ok) {
      void vscode.window.showInformationMessage(`PackPilot installed ${packageName}.`);
    }
  }

  private async handleFailure(
    panel: vscode.WebviewPanel,
    operation: WebviewRequestMessage["type"],
    errorMessage: string
  ): Promise<void> {
    switch (operation) {
      case "search":
        await this.postMessage(panel, { type: "searchFailed", error: errorMessage });
        break;
      case "loadPackage":
        await this.postMessage(panel, { type: "packageDetailFailed", error: errorMessage });
        break;
      case "install":
        this.outputChannel.appendLine(`[PackPilot] ${errorMessage}`);
        await this.postMessage(panel, { type: "installFinished", success: false, summary: errorMessage });
        break;
      case "ready":
      case "openExternal":
      default:
        break;
    }
  }

  private async postWorkspaceState(panel: vscode.WebviewPanel): Promise<void> {
    const workspace = await getPrimaryWorkspaceContext();
    await this.postMessage(panel, {
      type: "workspaceState",
      workspace: workspace ?? null
    });
  }

  private async postMessage(panel: vscode.WebviewPanel, message: WebviewResponseMessage): Promise<void> {
    await panel.webview.postMessage(message);
  }
}

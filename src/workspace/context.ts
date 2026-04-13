import * as vscode from "vscode";
import { PackPilotError } from "../core/errors";
import type { WorkspaceContext } from "../domain/types";

export async function getPrimaryWorkspaceContext(): Promise<WorkspaceContext | undefined> {
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
    workspaceName: folder.name,
    hasPackageJson,
    manager: "npm"
  };
}

export async function requirePrimaryWorkspaceContext(): Promise<WorkspaceContext> {
  const workspace = await getPrimaryWorkspaceContext();
  if (!workspace) {
    throw new PackPilotError("missing_workspace", "Open a workspace before installing packages.");
  }

  return workspace;
}

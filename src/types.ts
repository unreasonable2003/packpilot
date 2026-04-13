export type Ecosystem = "npm";

export interface WorkspaceContext {
  rootPath: string;
  hasPackageJson: boolean;
  manager: Ecosystem;
}

export interface PackageSearchQuery {
  query: string;
  ecosystem: Ecosystem;
  workspace: WorkspaceContext;
}

export interface PackageSearchResult {
  name: string;
  version: string;
  summary: string;
  downloadsWeekly: number;
  license?: string;
  trustScore: number;
  reason: string;
}

export interface InstallRequest {
  packageName: string;
  version: string;
  devDependency: boolean;
  workspace: WorkspaceContext;
}

export interface InstallResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

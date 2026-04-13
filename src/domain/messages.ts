import type { InstallMode, PackageDetails, PackageSearchResult, WorkspaceContext } from "./types";

export type WebviewRequestMessage =
  | { type: "ready" }
  | { type: "search"; query: string }
  | { type: "loadPackage"; packageName: string }
  | { type: "install"; packageName: string; version: string; installMode: InstallMode }
  | { type: "openExternal"; url: string };

export type WebviewResponseMessage =
  | { type: "workspaceState"; workspace: WorkspaceContext | null }
  | { type: "searchStarted" }
  | { type: "searchResults"; results: PackageSearchResult[] }
  | { type: "searchFailed"; error: string }
  | { type: "packageDetailStarted" }
  | { type: "packageDetail"; detail: PackageDetails }
  | { type: "packageDetailFailed"; error: string }
  | { type: "installStarted" }
  | { type: "installLog"; chunk: string }
  | { type: "installFinished"; success: boolean; summary: string };

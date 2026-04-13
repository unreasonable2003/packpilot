import { spawn } from "node:child_process";
import { PackPilotError } from "../core/errors";
import { assertValidPackageName, assertValidVersion } from "../core/validation";
import type { InstallRequest, InstallResult } from "../domain/types";
import { buildManifestChanges, readPackageJson } from "../workspace/packageManifest";

export interface InstallAgent {
  install(request: InstallRequest): Promise<InstallResult>;
}

function getNpmCommand(): string {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function buildInstallArgs(request: InstallRequest): string[] {
  const packageName = assertValidPackageName(request.packageName);
  const version = assertValidVersion(request.version);
  const packageSpecifier = version === "latest" ? packageName : `${packageName}@${version}`;

  return [
    "install",
    request.installMode === "devDependency" ? "--save-dev" : undefined,
    packageSpecifier
  ].filter((value): value is string => Boolean(value));
}

export class NpmInstallService implements InstallAgent {
  async install(request: InstallRequest): Promise<InstallResult> {
    if (!request.workspace.hasPackageJson) {
      throw new PackPilotError(
        "missing_package_json",
        "PackPilot needs a package.json in the current workspace before it can install packages."
      );
    }

    const args = buildInstallArgs(request);
    const command = `${getNpmCommand()} ${args.join(" ")}`;
    const beforeManifest = await readPackageJson(request.workspace.rootPath);
    const startedAt = Date.now();

    return new Promise<InstallResult>((resolve, reject) => {
      const child = spawn(getNpmCommand(), args, {
        cwd: request.workspace.rootPath,
        shell: false,
        env: process.env
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (chunk: Buffer | string) => {
        const text = chunk.toString();
        stdout += text;
        request.onProgress?.(text, "stdout");
      });

      child.stderr.on("data", (chunk: Buffer | string) => {
        const text = chunk.toString();
        stderr += text;
        request.onProgress?.(text, "stderr");
      });

      child.on("error", (error) => {
        reject(new PackPilotError("install_start_failed", `Failed to start npm install: ${error.message}`, error));
      });

      child.on("close", async (exitCode) => {
        try {
          const afterManifest = await readPackageJson(request.workspace.rootPath);
          resolve({
            ok: exitCode === 0,
            stdout,
            stderr,
            exitCode: exitCode ?? -1,
            command,
            durationMs: Date.now() - startedAt,
            manifestChanges: buildManifestChanges(beforeManifest, afterManifest, request.packageName)
          });
        } catch (error) {
          reject(new PackPilotError("manifest_read_failed", "Install finished but package.json could not be read.", error));
        }
      });
    });
  }
}

import type { InstallRequest, InstallResult } from "./types";

export interface InstallAgent {
  install(request: InstallRequest): Promise<InstallResult>;
}

export class DryRunInstallAgent implements InstallAgent {
  async install(request: InstallRequest): Promise<InstallResult> {
    const command = request.devDependency
      ? `npm install --save-dev ${request.packageName}@${request.version}`
      : `npm install ${request.packageName}@${request.version}`;

    return {
      ok: true,
      stdout: `Dry-run only. Would run: ${command}`,
      stderr: "",
      exitCode: 0
    };
  }
}

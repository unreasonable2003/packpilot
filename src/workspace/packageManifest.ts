import * as fs from "node:fs/promises";
import * as path from "node:path";
import { PackPilotError } from "../core/errors";

export interface PackageJsonShape {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export async function readPackageJson(workspaceRoot: string): Promise<PackageJsonShape> {
  const manifestPath = path.join(workspaceRoot, "package.json");
  const manifest = await fs.readFile(manifestPath, "utf8");

  if (!manifest.trim()) {
    throw new PackPilotError(
      "invalid_package_json",
      "The workspace package.json is empty. Fix package.json before installing packages."
    );
  }

  try {
    return JSON.parse(manifest) as PackageJsonShape;
  } catch (error) {
    throw new PackPilotError(
      "invalid_package_json",
      "The workspace package.json is not valid JSON. Fix package.json before installing packages.",
      error
    );
  }
}

export function getDependencyVersion(
  manifest: PackageJsonShape | undefined,
  packageName: string
): { type: "dependencies" | "devDependencies"; version: string } | undefined {
  if (manifest?.dependencies?.[packageName]) {
    return {
      type: "dependencies",
      version: manifest.dependencies[packageName]
    };
  }

  if (manifest?.devDependencies?.[packageName]) {
    return {
      type: "devDependencies",
      version: manifest.devDependencies[packageName]
    };
  }

  return undefined;
}

export function buildManifestChanges(
  beforeManifest: PackageJsonShape | undefined,
  afterManifest: PackageJsonShape | undefined,
  packageName: string
): string[] {
  const beforeValue = getDependencyVersion(beforeManifest, packageName);
  const afterValue = getDependencyVersion(afterManifest, packageName);

  if (!beforeValue && !afterValue) {
    return [];
  }

  if (!beforeValue && afterValue) {
    return [`Added ${packageName} to ${afterValue.type} as ${afterValue.version}.`];
  }

  if (beforeValue && !afterValue) {
    return [`Removed ${packageName} from ${beforeValue.type}.`];
  }

  if (beforeValue && afterValue && beforeValue.type !== afterValue.type) {
    return [`Moved ${packageName} from ${beforeValue.type} to ${afterValue.type}.`];
  }

  if (beforeValue && afterValue && beforeValue.version !== afterValue.version) {
    return [
      `Updated ${packageName} in ${afterValue.type} from ${beforeValue.version} to ${afterValue.version}.`
    ];
  }

  return [`Confirmed ${packageName} remains in ${afterValue?.type}.`];
}

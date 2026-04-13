import { PackPilotError } from "./errors";

const PACKAGE_NAME_PATTERN = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/i;
const VERSION_PATTERN = /^[a-z0-9*.+\-^~<>=| ]+$/i;

export function assertNonEmptyQuery(value: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new PackPilotError("invalid_query", "Enter a package name or a package intent to search.");
  }

  return normalized;
}

export function assertValidPackageName(value: string): string {
  const normalized = value.trim();
  if (!PACKAGE_NAME_PATTERN.test(normalized)) {
    throw new PackPilotError("invalid_package_name", "Invalid npm package name.");
  }

  return normalized;
}

export function assertValidVersion(value: string): string {
  const normalized = value.trim();
  if (!normalized) {
    return "latest";
  }

  if (normalized === "latest") {
    return normalized;
  }

  if (!VERSION_PATTERN.test(normalized)) {
    throw new PackPilotError("invalid_package_version", "Invalid package version.");
  }

  return normalized;
}

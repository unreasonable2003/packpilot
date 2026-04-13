import { PackPilotError } from "../core/errors";
import type { WebviewRequestMessage } from "./messages";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseWebviewRequestMessage(value: unknown): WebviewRequestMessage {
  if (!isRecord(value) || typeof value.type !== "string") {
    throw new PackPilotError("invalid_message", "Received an invalid webview message.");
  }

  switch (value.type) {
    case "ready":
      return { type: "ready" };
    case "search":
      if (typeof value.query !== "string") {
        break;
      }
      return { type: "search", query: value.query };
    case "loadPackage":
      if (typeof value.packageName !== "string") {
        break;
      }
      return { type: "loadPackage", packageName: value.packageName };
    case "install":
      if (
        typeof value.packageName !== "string" ||
        typeof value.version !== "string" ||
        (value.installMode !== "dependency" && value.installMode !== "devDependency")
      ) {
        break;
      }
      return {
        type: "install",
        packageName: value.packageName,
        version: value.version,
        installMode: value.installMode
      };
    case "openExternal":
      if (typeof value.url !== "string") {
        break;
      }
      return { type: "openExternal", url: value.url };
    default:
      break;
  }

  throw new PackPilotError("invalid_message", "Received an unsupported webview message.");
}

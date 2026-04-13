import * as https from "node:https";
import { PackPilotError } from "./errors";

export interface JsonRequestOptions {
  timeoutMs?: number;
  headers?: Record<string, string>;
}

export class JsonHttpClient {
  async getJson<T>(url: string, options?: JsonRequestOptions): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const request = https.get(
        url,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": "packpilot-vscode-extension",
            ...(options?.headers ?? {})
          }
        },
        (response) => {
          const statusCode = response.statusCode ?? 500;

          if (statusCode >= 300 && statusCode < 400 && response.headers.location) {
            response.resume();
            void this.getJson<T>(response.headers.location, options).then(resolve, reject);
            return;
          }

        if (statusCode >= 400) {
          response.resume();
          reject(new PackPilotError("http_status", `Request failed with status ${statusCode}.`));
          return;
        }

        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer | string) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        response.on("end", () => {
          try {
            const payload = Buffer.concat(chunks).toString("utf8");
            if (!payload.trim()) {
              reject(
                new PackPilotError(
                  "http_empty_body",
                  "The registry returned an empty response. Please try again."
                )
              );
              return;
            }
            resolve(JSON.parse(payload) as T);
          } catch (error) {
            reject(new PackPilotError("http_parse", "Could not parse the registry response.", error));
          }
        });
        }
      );

      const timeoutMs = options?.timeoutMs ?? 10_000;
      request.setTimeout(timeoutMs, () => {
        request.destroy(new PackPilotError("http_timeout", "The registry request timed out."));
      });

      request.on("error", (error) => {
        reject(new PackPilotError("http_error", "The registry request failed.", error));
      });
    });
  }
}

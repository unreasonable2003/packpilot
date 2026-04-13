import * as vscode from "vscode";
import { PackPilotPanelController } from "./ui/panelController";

let controller: PackPilotPanelController | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  controller = new PackPilotPanelController(context);
  context.subscriptions.push(
    vscode.commands.registerCommand("packpilot.openSearch", async () => {
      await controller?.open();
    })
  );
}

export function deactivate(): void {
  controller?.dispose();
  controller = undefined;
}

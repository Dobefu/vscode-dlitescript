import {
  commands,
  ExtensionContext,
  StatusBarAlignment,
  StatusBarItem,
  window,
  workspace,
} from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  RevealOutputChannelOn,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

import path from "path";
import fs from "fs";

let client: LanguageClient | undefined;
let statusBarItem: StatusBarItem | undefined;

export async function activate(
  context: ExtensionContext,
): Promise<LanguageClient | undefined> {
  context.subscriptions.push(
    commands.registerCommand("dlitescript.restartServer", restartServer),
  );

  context.subscriptions.push(
    commands.registerCommand("dlitescript.toggleServer", toggleServer),
  );

  statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100);
  statusBarItem.name = "DLiteScript LSP Status";
  statusBarItem.command = "dlitescript.toggleServer";
  context.subscriptions.push(statusBarItem);

  try {
    const result = await startServer();

    if (!result) {
      return;
    }

    console.info("DLiteScript LSP server started");
    context.subscriptions.push(result);

    return result;
  } catch (error) {
    console.error(`Failed to start DLiteScript LSP server: ${error}`);
    window.showErrorMessage(`Failed to start DLiteScript LSP server: ${error}`);

    if (statusBarItem) {
      statusBarItem.text = "$(error) DLiteScript LSP Failed";
      statusBarItem.tooltip = `DLiteScript LSP failed to start: ${error}`;
      statusBarItem.show();
    }

    return;
  }
}

export async function deactivate() {
  if (statusBarItem) {
    statusBarItem.hide();
  }

  return await stopServer();
}

async function startServer(): Promise<LanguageClient | undefined> {
  const config = workspace.getConfiguration("dlitescript");

  if (!config.get<boolean>("lsp.enable")) {
    console.info("DLiteScript LSP is disabled");

    if (statusBarItem) {
      statusBarItem.text = "$(circle-slash) DLiteScript LSP Disabled";
      statusBarItem.tooltip = "DLiteScript LSP is disabled in configuration";
      statusBarItem.show();
    }

    return;
  }

  if (client?.isRunning()) {
    return client;
  }

  let serverPath = config.get<string>("lsp.serverPath");

  if (!serverPath || serverPath === "dlitescript") {
    const platform = process.platform;
    const arch = process.arch;
    const bundledPath = path.join(
      __dirname,
      "..",
      "resources",
      `dlitescript-${platform}-${arch}`,
    );

    if (fs.existsSync(bundledPath)) {
      serverPath = bundledPath;
    } else {
      serverPath = "dlitescript";
    }
  }

  const serverArgs = config.get<string[]>("lsp.serverArgs") ?? ["lsp"];

  const serverOptions: ServerOptions = {
    command: serverPath ?? "dlitescript",
    args: serverArgs ?? ["lsp"],
    transport: TransportKind.stdio,
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: "file", language: "dlitescript" },
      { scheme: "untitled", language: "dlitescript" },
    ],
    outputChannelName: "DLiteScript LSP",
    revealOutputChannelOn: RevealOutputChannelOn.Error,
  };

  client = new LanguageClient(
    "dlitescript-lsp",
    "DLiteScript LSP",
    serverOptions,
    clientOptions,
  );

  try {
    await client.start();

    if (statusBarItem) {
      statusBarItem.text = "$(check) DLiteScript LSP Running";
      statusBarItem.tooltip = "DLiteScript Language Server is active";
      statusBarItem.show();
    }
  } catch (error) {
    if (statusBarItem) {
      statusBarItem.text = "$(error) DLiteScript LSP Failed to Start";
      statusBarItem.tooltip = `DLiteScript LSP has failed to start: ${error}`;
      statusBarItem.show();
    }

    if (client) {
      client.dispose();
      client = undefined;
    }

    throw error;
  }

  return client;
}

async function stopServer() {
  if (!client?.isRunning()) {
    return;
  }

  if (statusBarItem) {
    statusBarItem.text = "$(error) DLiteScript LSP Stopped";
    statusBarItem.tooltip = "DLiteScript Language Server has been stopped";
  }

  await client.stop();
  client = undefined;

  if (statusBarItem) {
    statusBarItem.text = "$(circle-slash) DLiteScript LSP Stopped";
    statusBarItem.tooltip = "DLiteScript Language Server is inactive";
  }
}

async function restartServer() {
  try {
    if (statusBarItem) {
      statusBarItem.text = "$(sync~spin) DLiteScript LSP Restarting...";
      statusBarItem.tooltip = "DLiteScript LSP is restarting...";
    }

    window.showInformationMessage("Restarting DLiteScript LSP server...");

    await stopServer();

    // Wait a bit, just in case.
    await new Promise((resolve) => setTimeout(resolve, 100));

    await startServer();

    window.showInformationMessage("DLiteScript LSP server has been restarted");
  } catch (error) {
    if (statusBarItem) {
      statusBarItem.text = "$(error) DLiteScript LSP Restart Failed";
      statusBarItem.tooltip = `Failed to restart: ${error}`;
    }

    window.showErrorMessage(
      `Failed to restart DLiteScript LSP server: ${error}`,
    );
  }
}

async function toggleServer() {
  const config = workspace.getConfiguration("dlitescript");

  if (!config.get<boolean>("lsp.enable")) {
    return;
  }

  if (client?.isRunning()) {
    try {
      await stopServer();
    } catch (error) {
      window.showErrorMessage(
        `Failed to stop DLiteScript LSP server: ${error}`,
      );
    }
  } else {
    try {
      await startServer();
    } catch (error) {
      window.showErrorMessage(
        `Failed to start DLiteScript LSP server: ${error}`,
      );
    }
  }
}

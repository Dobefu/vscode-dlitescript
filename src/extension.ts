import { commands, ExtensionContext, window, workspace } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  RevealOutputChannelOn,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";
import * as path from "path";
import * as fs from "fs";

let client: LanguageClient | undefined;

export async function activate(
  context: ExtensionContext,
): Promise<LanguageClient | undefined> {
  try {
    const result = await startServer();

    if (!result) {
      return;
    }

    console.info("DLiteScript LSP server started");
    context.subscriptions.push(result);

    const restartCommand = commands.registerCommand(
      "dlitescript.restartServer",
      restartServer,
    );

    context.subscriptions.push(restartCommand);

    return result;
  } catch (error) {
    console.error(`Failed to start DLiteScript LSP server: ${error}`);
    window.showErrorMessage(`Failed to start DLiteScript LSP server: ${error}`);

    return;
  }
}

export async function deactivate() {
  return await stopServer();
}

async function startServer(): Promise<LanguageClient | undefined> {
  const config = workspace.getConfiguration("dlitescript");

  if (!config.get<boolean>("lsp.enable")) {
    console.info("DLiteScript LSP is disabled");

    return;
  }

  if (client && client.isRunning()) {
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
    command: serverPath,
    args: serverArgs,
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
  } catch (error) {
    if (client) {
      client.dispose();
      client = undefined;
    }

    throw error;
  }

  return client;
}

async function stopServer() {
  if (!client || !client.isRunning()) {
    return;
  }

  await client.stop();
  client = undefined;
}

async function restartServer() {
  try {
    window.showInformationMessage("Restarting DLiteScript LSP server...");

    await stopServer();

    // Wait a bit, to ensure that the status messages are shown in order.
    await new Promise((resolve) => setTimeout(resolve, 100));

    await startServer();

    window.showInformationMessage("DLiteScript LSP server has been restarted");
  } catch (error) {
    window.showErrorMessage(
      `Failed to restart DLiteScript LSP server: ${error}`,
    );
  }
}

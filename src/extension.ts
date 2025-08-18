import { commands, ExtensionContext, window, workspace } from "vscode";
import { LanguageClient, LanguageClientOptions, RevealOutputChannelOn, ServerOptions, TransportKind } from "vscode-languageclient/node";

let client: LanguageClient | undefined;

export async function activate(context: ExtensionContext) {
  try {
    await startServer();
    console.log("DLiteScript LSP server started");
  }
  catch (error) {
    console.error(`Failed to start DLiteScript LSP server: ${error}`);
    window.showErrorMessage(`Failed to start DLiteScript LSP server: ${error}`);
  }

  const restartCommand = commands.registerCommand(
    "dlitescript.restartServer",
    restartServer,
  );

  context.subscriptions.push(restartCommand);

  if (client) {
    context.subscriptions.push(client);
  }

  return client
}

export async function deactivate() {
  return await stopServer();
}

async function startServer() {
  if (client && client.isRunning()) {
    return client;
  }

  const config = workspace.getConfiguration("dlitescript");
  const serverPath = config.get<string>("lsp.serverPath") ?? "DLiteScript";
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
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher("**/*.dl"),
    },
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
    throw error;
  }

  return client;
}

async function stopServer() {
  if (!client) {
    return;
  }

  if (!client.isRunning()) {
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
  }
  catch (error) {
    window.showErrorMessage(`Failed to restart DLiteScript LSP server: ${error}`);
  }
}

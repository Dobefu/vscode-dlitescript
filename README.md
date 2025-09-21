# DLiteScript Language Support

Language support for DLiteScript.

## Features

- **Syntax Highlighting**
- **Bracket Matching**
- **Comment Support**
- **String Features**
- **Language Configuration**
- **LSP Server**

## Requirements

None. This extension works out of the box with VS Code.

## Extension Settings

This extension contributes the following settings:

- `dlitescript.lsp.enable`: Enable/disable the DLiteScript Language Server Protocol (default: true)
- `dlitescript.lsp.serverPath`: Path to the DLiteScript Language Server executable (default: "dlitescript")
- `dlitescript.lsp.serverArgs`: Arguments to pass to the Language Server (default: ["lsp"])

## Commands

- `dlitescript.restartServer`: Restart the DLiteScript Language Server
- `dlitescript.toggleServer`: Toggle the DLiteScript LSP server

## Example

```dlitescript
// Variable declarations
var name string
var age number = 25
var message string = "Hello %s!"

// Assignments
name = "DLiteScript"
age = age + 1

// Function calls
printf("Hello %s\n", name)
printf("Age: %g\n", age)

// Block scoping
{
    const localVar string = "scoped"
    printf("Inside block: %s\n", localVar)
}

// Expressions with operators
var result number = 2 ** 3 + 4 * 5
var calculation number = (result - 10) / 2
```

## Related

- [DLiteScript](https://github.com/Dobefu/DLiteScript) - Main language implementation
- [tree-sitter-dlitescript](https://github.com/Dobefu/tree-sitter-dlitescript) - Grammar definition
- [vscode-dlitescript](https://github.com/Dobefu/vscode-dlitescript) - Source code
- [nvim-dlitescript](https://github.com/Dobefu/nvim-dlitescript) - NeoVim plugin

# DLiteScript Language Support

Language support for DLiteScript.

## Features

- **Syntax Highlighting**
- **Bracket Matching**
- **Comment Support**
- **String Features**
- **Language Configuration**

## Requirements

None. This extension works out of the box with VS Code.

## Extension Settings

This extension adds no additional settings.

## Example

```dlitescript
// Variable declarations
var name string
const age number = 25
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

## Release Notes

### 0.1.0

Initial release with syntax highlighting and basic language support.

## Related

- [DLiteScript](https://github.com/Dobefu/DLiteScript) - Main language implementation
- [tree-sitter-dlitescript](https://github.com/Dobefu/tree-sitter-dlitescript) - Grammar definition
- [vscode-dlitescript](https://github.com/Dobefu/vscode-dlitescript) - Source code

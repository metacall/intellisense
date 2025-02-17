import * as vscode from 'vscode';

export function activateHoverProvider(context: vscode.ExtensionContext) {
    console.log("mc-int is now active!");

    let hoverProvider = vscode.languages.registerHoverProvider(
        { scheme: 'file', language: 'python' },
        {
            provideHover(document, position, token) {
                const range = document.getWordRangeAtPosition(position);
                if (!range) { return; };

                const functionName = document.getText(range);
                console.log(`Hover detected on: ${functionName}`);

                const args = [
                    { name: "x", type: "int" },
                    { name: "y", type: "float" }
                ];

                const returnType = "str";

                const markdownContent = new vscode.MarkdownString();
                markdownContent.isTrusted = true;
                markdownContent.supportThemeIcons = true; // enable icon in markdown

                markdownContent.appendCodeblock(`def ${functionName}(${args.map(arg => `${arg.name}: ${arg.type}`).join(", ")}) -> ${returnType}:`, "python");

                markdownContent.appendMarkdown("\n\n This is a function that does something cool!\n\n");

                return new vscode.Hover(markdownContent);
            }
        }
    );

    context.subscriptions.push(hoverProvider);
}
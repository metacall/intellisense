import * as vscode from "vscode";
import * as fs from "fs";
import * as ts from "typescript";
import * as path from "path";

/**
 * Watches `.ts` files to inject MetaCall function types dynamically.
 */
export function pythonTsWatcher(context: vscode.ExtensionContext) {
    const watcher = vscode.workspace.createFileSystemWatcher("**/*.{ts,py}");

    watcher.onDidChange((uri) => processFile(uri.fsPath));
    watcher.onDidCreate((uri) => processFile(uri.fsPath));

    context.subscriptions.push(watcher);
}

/**
 * Process the file based on its type (inject types in `.ts` files).
 */
function processFile(filePath: string) {
    if (filePath.endsWith(".ts")) {
        injectTypes(filePath);
    }
}

/**
 * Inject function return & argument types dynamically in `.ts` files.
 */
function injectTypes(filePath: string) {
    const sourceCode = fs.readFileSync(filePath, "utf8");
    const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.ESNext, true);

    let updatedCode = sourceCode;

    ts.forEachChild(sourceFile, (node) => {
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
            const functionName = node.expression.text;

            // TODO: Fetch actual types from MetaCall API
            const injectedType = `(arg1: number, arg2: string) => boolean`;

            if (!updatedCode.includes(`declare function ${functionName}`)) {
                updatedCode = `declare function ${functionName}${injectedType};\n` + updatedCode;
            }
        }
    });

    if (updatedCode !== sourceCode) {
        fs.writeFileSync(filePath, updatedCode, "utf8");
        vscode.window.showInformationMessage(`Injected types into ${path.basename(filePath)}`);
    }
}
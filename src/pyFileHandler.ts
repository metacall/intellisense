import * as vscode from 'vscode';
import { extractFunctionInfo } from './ast/ts/tsAST';
import * as path from 'path';

// export function pythonStubfromTsAST(ast: object): string {
// }
const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
const fileName = path.join(workspaceFolder, 'b.ts');

export function pythonTsWatcher(context: vscode.ExtensionContext) {
    // const fileWatcher = vscode.workspace.onDidChangeTextDocument((e) => {
    //     if (e.document.languageId === 'typescript') {
    //         extractFunctionInfo(fileName);
    //     }
    // })

    const saveWatcher = vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.languageId === "typescript") {
            extractFunctionInfo(fileName);
        }
    });

    // context.subscriptions.push(fileWatcher, saveWatcher);
    context.subscriptions.push(saveWatcher);
}
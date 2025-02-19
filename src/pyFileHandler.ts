import * as vscode from 'vscode';
import { parseTSFunction, tsAstOutputPath } from './ast/ts/tsAST';
import * as path from 'path';
import updateTSPyiFile from './ast/stubsHandler/tsPyStubsGenerator';
import * as fs from 'fs';

// export function pythonStubfromTsAST(ast: object): string {
// }
const sourceTsFileName = 'b';
const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
const importedTSFileNamePath = path.join(workspaceFolder, sourceTsFileName + '.ts');

const stubsFolderPath = path.join(workspaceFolder, '.metacall', 'stubs', sourceTsFileName);
const tsPyStubsFilePath = path.join(stubsFolderPath, 'ts.pyi'); // path: .metacall/stubs/b/ts.pyi

if (!fs.existsSync(stubsFolderPath)) {
    fs.mkdirSync(stubsFolderPath, { recursive: true });
}

export function pythonTsWatcher(context: vscode.ExtensionContext) {
    const saveWatcher = vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.languageId === "typescript") {
            parseTSFunction(importedTSFileNamePath);
            updateTSPyiFile(tsAstOutputPath, tsPyStubsFilePath);
        }
    });

    // context.subscriptions.push(fileWatcher, saveWatcher);
    context.subscriptions.push(saveWatcher);
}
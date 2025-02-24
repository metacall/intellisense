import * as vscode from 'vscode';
import { parseTSFunction, tsAstOutputPath } from './ast/ts/tsAST';
import * as path from 'path';
import updateTSPyiFile from './ast/stubsHandler/tsPyStubsGenerator';
import * as fs from 'fs';

// export function pythonStubfromTsAST(ast: object): string {
// }
const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';

const tsFiles = fs.readdirSync(workspaceFolder).filter(file => file.endsWith('.ts'));

// Helper function to get stub paths for a TS file
function getStubPaths(tsFileName: string) {
    const stubsFolderPath = path.join(workspaceFolder, '.metacall', 'stubs', tsFileName);
    const tsPyStubsFilePath = path.join(stubsFolderPath, 'ts.pyi');
    return { stubsFolderPath, tsPyStubsFilePath };
}

if (workspaceFolder) {
    tsFiles.forEach(tsFile => {
        const sourceTsFileName = path.basename(tsFile, '.ts');
        const { stubsFolderPath } = getStubPaths(sourceTsFileName);

        if (!fs.existsSync(stubsFolderPath)) {
            fs.mkdirSync(stubsFolderPath, { recursive: true });
        }
    });
}

export function pythonTsWatcher(context: vscode.ExtensionContext) {
    const saveWatcher = vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.languageId === "typescript") {
            const tsFilePath = document.fileName;
            const tsFilePathBaseName = path.basename(tsFilePath, '.ts');
            const { tsPyStubsFilePath } = getStubPaths(tsFilePathBaseName);

            console.log({ tsFilePath, tsPyStubsFilePath });
            
            parseTSFunction(tsFilePath);
            updateTSPyiFile(tsAstOutputPath, tsPyStubsFilePath);
        }
    });

    // on file change watcher is causing a lot of lag so just using save watcher
    // context.subscriptions.push(fileWatcher, saveWatcher);
    context.subscriptions.push(saveWatcher);
}
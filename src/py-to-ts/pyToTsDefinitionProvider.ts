import * as vscode from 'vscode';
import * as path from 'path';
import { spawn } from 'child_process';
import * as fs from 'fs';

export function registerPyDefinitionProvider(context: vscode.ExtensionContext) {
    const provider = vscode.languages.registerDefinitionProvider(
        [{ language: 'typescript' }, { language: 'javascript' }],
        {
            provideDefinition(document, position, token) {
                const range = document.getWordRangeAtPosition(position);
                if (!range) return null;

                const word = document.getText(range);
                const filePath = document.uri.fsPath;
                console.log({ filePath });

                const pythonLocation = findPythonDefinition(word);
                console.log({ pythonLocation });

                if (pythonLocation) {
                    return new vscode.Location(
                        vscode.Uri.file(pythonLocation.file),
                        new vscode.Position(pythonLocation.line, 0)
                    );
                }

                return null;
            }
        }
    );

    context.subscriptions.push(provider);
}



function findPythonDefinition(symbol: string): { file: string, line: number } | null {

    // TODO: instead of making a new json for function goto definitions, put all this data in the language ast json itself and use that

    const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
    const functionMapPath = path.join(__dirname, '..', '..', 'src', 'py-to-ts', 'workspaceFunctionMap.json'); // we can save in the extension or can save in .metacall folder in workspace

    // use cached function map from the saved json
    let functionMap: Record<string, { file: string, line: number }> = {};
    try {
        if (fs.existsSync(functionMapPath)) {
            functionMap = JSON.parse(fs.readFileSync(functionMapPath, 'utf8'));
        }
    } catch (err) {
        console.error('Error loading cached function map:', err);
    }

    if (workspaceFolder) {
        const pyFiles = fs.readdirSync(workspaceFolder).filter(file => file.endsWith('.py'));
        const scriptPath = path.join(__dirname, '..', '..', 'src', 'py-to-ts', 'pyToTsGotoDefinitions.py');

        Promise.all(pyFiles.map(pyFile => {
            return new Promise<void>((resolve) => {
                const sourcePyFilePath = path.join(workspaceFolder, pyFile);
                console.log({ sourcePyFilePath });

                const pythonProcess = spawn("python", [scriptPath, sourcePyFilePath]);
                let output = '';

                pythonProcess.stdout.on("data", (data) => {
                    output += data.toString();
                });

                pythonProcess.stderr.on("data", (data) => {
                    console.error(`Error: ${data.toString()}`);
                });

                pythonProcess.on("close", (code) => {
                    console.log(`Process exited with code ${code}`);
                    try {
                        const fileFunctionMap = JSON.parse(output);
                        functionMap = { ...functionMap, ...fileFunctionMap };
                        fs.writeFileSync(functionMapPath, JSON.stringify(functionMap, null, 2), 'utf8');
                    } catch (e) {
                        console.error('Error parsing Python output:', e);
                    }
                    resolve();
                });
            });
        })).then(() => {
            console.log('Updated function map:', functionMap);
        });
    }

    return functionMap[symbol] || null;
}
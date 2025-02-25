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

                // Check if the function exists in Python, regardless of the file type
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
    const pyFiles = fs.readdirSync(workspaceFolder).filter(file => file.endsWith('.py'));

    let scriptPath = path.join(__dirname, '..', '..', 'src', 'py-to-ts', 'pyToTsGotoDefinitions.py');

    if (workspaceFolder) {
        pyFiles.forEach(pyFile => {
            const sourcePyFilePath = path.join(workspaceFolder, pyFile);

            console.log({ sourcePyFilePath });

            const pythonProcess = spawn("python", [sourcePyFilePath]);

            pythonProcess.stdout.on("data", (data) => {
                console.log(`Output: ${data.toString()}`);
            });

            pythonProcess.stderr.on("data", (data) => {
                console.error(`Error: ${data.toString()}`);
            });

            pythonProcess.on("close", (code) => {
                console.log(`Process exited with code ${code}`);
            });
        });
    }

    const functionMap: Record<string, { file: string, line: number }> = {
        "add": {
            // "file": "/Users/abhinavmishra/Coding/mc-int/sandbox/goto-def/math_utils.py",
            "file": "f:/A/mc-int/sandbox/goto-def/math_utils.py",
            "line": 2
        },
        "subtract": {
            // "file": "/Users/abhinavmishra/Coding/mc-int/sandbox/goto-def/math_utils.py",
            "file": "f:/A/mc-int/sandbox/goto-def/math_utils.py",
            "line": 6
        }
    };

    return functionMap[symbol] || null;
}
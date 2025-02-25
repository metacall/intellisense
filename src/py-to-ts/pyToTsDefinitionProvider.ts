import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';

export function registerPyDefinitionProvider(context: vscode.ExtensionContext) {
    const provider = vscode.languages.registerDefinitionProvider(
        [{ language: 'typescript' }, { language: 'javascript' }], // Now works for both JS and TS
        {
            provideDefinition(document, position, token) {
                const range = document.getWordRangeAtPosition(position);
                if (!range) return null;

                const word = document.getText(range);
                const filePath = document.uri.fsPath;

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
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import metacallInspection from '../metacall_inspection.json';

const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
const STUBS_DIR = path.join(workspaceFolder, '.metacall', 'stubs');

if (!fs.existsSync(STUBS_DIR)) {
    fs.mkdirSync(STUBS_DIR, { recursive: true });
}

export function updatePythonSettings() {
    const settings = vscode.workspace.getConfiguration('python');
    const extraPaths = settings.get<string[]>('analysis.extraPaths') || [];
    const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
    const stubsPath = path.join(workspaceFolder, '.metacall', 'stubs');

    // Remove any existing paths for stubs
    const cleanedPaths = extraPaths.filter(p => !p.includes('.metacall/stubs'));

    // Add the absolute path for the stubs
    cleanedPaths.push(stubsPath);

    // Update the setting
    settings.update('analysis.extraPaths', cleanedPaths, vscode.ConfigurationTarget.Workspace);

    // Optionally set type checking mode if needed
    settings.update('analysis.typeCheckingMode', 'basic', vscode.ConfigurationTarget.Workspace);
}



function generateStub(functionName, args, returnType, pythonFile, functionType) {
    const fileName = path.basename(pythonFile, '.py');
    const stubFilePath = path.join(STUBS_DIR, `${fileName}.pyi`);
    // if (!returnType) {
    //     returnType = "object"; // could have done None but object is more generic
    // }

    const typeMapping: { [key: string]: string } = {
        number: "int",
        string: "str",
        boolean: "bool",
        object: "dict",
        any: "object"
    };

    const toPythonType = (tsType: string): string => typeMapping[tsType] || tsType;

    let stubContent = '';
    if (fs.existsSync(stubFilePath)) {
        // If the stub file exists, read its content to append new functions
        stubContent = fs.readFileSync(stubFilePath, 'utf8');
    }

    let functionSignature = '';
    if (functionType === 'TypeScript') {
        const pythonArgs = args.map(arg => `${arg.name}${arg.type.name && (': ' + toPythonType(arg.type.name))}`).join(", ");
        const pythonReturnType = toPythonType(returnType);
        functionSignature = `def ${functionName}(${pythonArgs}) ${pythonReturnType ? ('-> ' + pythonReturnType + ':') : (pythonReturnType + ':')} ...\n`;
    }
    else if (functionType === 'Python') {
        const pythonArgs = args.map(arg => `${arg.name}${arg.type.name && (': ' + arg.type.name)}`).join(", ");
        functionSignature = `def ${functionName}(${pythonArgs}) ${returnType ? ('-> ' + returnType + ':') : (returnType + ':')} ...\n`;
    }

    // Only add if the function signature doesn't already exist
    if (!stubContent.includes(functionSignature)) {
        stubContent += functionSignature;
        fs.writeFileSync(stubFilePath, stubContent, 'utf8');
    }
}


function convertToPython(language: 'TS' | 'GO' | 'CPP', functionName: string, args: any, returnType: string): string {
    let pyString = '';
    if (language === 'TS') {
        const typeMapping: { [key: string]: string } = {
            number: "int",
            string: "str",
            boolean: "bool",
            unknown: "object"
        };

        const toPythonType = (tsType: string): string => typeMapping[tsType] || tsType;

        pyString = `def ${functionName}(${args.map(arg => `${arg.name}${arg.type.name && (': ' + toPythonType(arg.type.name))}`).join(", ")}) -> ${toPythonType(returnType)}`,
            "python"
    }
    return pyString;
}


export function activateHoverProvider(context: vscode.ExtensionContext) {
    console.log("mc-int is now active!");

    let hoverProvider = vscode.languages.registerHoverProvider(
        { scheme: 'file', language: 'python' },
        {
            provideHover(document, position, token) {
                const range = document.getWordRangeAtPosition(position);
                if (!range) { return; }

                const functionName = document.getText(range);
                console.log(`Hover detected on: ${functionName}`);

                enum FunctionType {
                    Python = "Python",
                    TypeScript = "TypeScript"
                }

                let functionType: FunctionType = FunctionType.Python;
                const text = document.getText();
                const lines = text.split('\n');
                for (const line of lines) {
                    if (line.includes('import') && line.includes('.ts') && line.includes(functionName)) {
                        functionType = FunctionType.TypeScript;
                        break;
                    }
                }
                console.log(`Function type: ${functionType}`);

                const pyFiles = metacallInspection.py;
                const tsFiles = metacallInspection.ts;
                let signatureFound;
                if (functionType === FunctionType.Python) {
                    for (const file of pyFiles) {
                        if (file.scope && file.scope.funcs) {
                            signatureFound = file.scope.funcs.find(func => func.name === functionName);
                            if (signatureFound) {
                                generateStub(functionName, signatureFound.signature.args, signatureFound.signature.ret.type.name, file.name, 'Python');
                                break;
                            }
                        }
                    }
                } else if (functionType === FunctionType.TypeScript) {
                    for (const file of tsFiles) {
                        if (file.scope && file.scope.funcs) {
                            signatureFound = file.scope.funcs.find(func => func.name === functionName);
                            if (signatureFound) {
                                generateStub(functionName, signatureFound.signature.args, signatureFound.signature.ret.type.name, file.name, 'TypeScript');
                                break;
                            }
                        }
                    }
                }
                if (!signatureFound) {
                    console.log(`Signature not found for ${functionName}`);
                    return;
                }

                const args = signatureFound.signature.args;
                let returnType = signatureFound.signature.ret.type.name;
                if (!returnType) {
                    if (functionType === FunctionType.TypeScript) {
                        returnType = "unknown"; // as no return type is there in the metacall_inspect json
                    } else {
                        returnType = "object"; // could have done None but object is more generic
                    }
                    console.log(`Return type not found for ${functionName}`);
                }

                const markdownContent = new vscode.MarkdownString();
                markdownContent.isTrusted = true;
                markdownContent.supportThemeIcons = true;

                if (functionType === FunctionType.TypeScript) {
                    markdownContent.appendCodeblock(
                        `function ${functionName}(${args.map(arg => `${arg.name}${arg.type.name && (': ' + arg.type.name)}`).join(", ")}): ${returnType}`,
                        "typescript"
                    );
                    markdownContent.appendMarkdown(`\n\n _Python equivalent_:\n\n`);

                    markdownContent.appendCodeblock(
                        convertToPython('TS', functionName, args, returnType),
                        "python"
                    );
                } else if (functionType === FunctionType.Python) {
                    markdownContent.appendCodeblock(
                        `def ${functionName}(${args.map(arg => `${arg.name}${arg.type.name && (': ' + arg.type.name)}`).join(", ")}) -> ${returnType}`,
                        "python"
                    );
                }
                markdownContent.appendMarkdown(`\n\nThis function is recognized as a **${functionType}** function.\n\n`);
                markdownContent.appendMarkdown('\n---\n');
                if (!returnType) {
                    markdownContent.appendMarkdown("No return type found so \n```python\nreturn None\n```");
                }

                return new vscode.Hover(markdownContent);
            }
        }
    )
    context.subscriptions.push(hoverProvider);
}

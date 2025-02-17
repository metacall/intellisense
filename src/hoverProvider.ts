import * as vscode from 'vscode';
import metacallInspection from '../metacall_inspection.json';

export function activateHoverProvider(context: vscode.ExtensionContext){
    console.log("mc-int is now active!");

    let hoverProvider = vscode.languages.registerHoverProvider(
        { scheme: 'file', language: 'python' },
        {
            provideHover(document, position, token) {
                const range = document.getWordRangeAtPosition(position);
                if (!range) { return; }

                const functionName = document.getText(range);
                console.log(`Hover detected on: ${functionName}`);

                // Determine the function type by searching the top lines of the document.
                enum FunctionType {
                    Python = "Python",
                    TypeScript = "TypeScript"
                }

                let functionType: FunctionType = FunctionType.Python;
                // Check from the beginning of the document if there's an import from a .ts file that mentions the function name.
                const text = document.getText();
                const lines = text.split('\n');
                for (const line of lines) {
                    if (line.includes('import') && line.includes('.ts') && line.includes(functionName)) {
                        functionType = FunctionType.TypeScript;
                        break;
                    }
                }
                console.log(`Function type: ${functionType}`);

                // Search through the "py" array in the inspection JSON to find the function signature.
                const pyFiles = metacallInspection.py;
                const tsFiles = metacallInspection.ts;
                let signatureFound;
                if (functionType === FunctionType.Python) {
                    for (const file of pyFiles) {
                        if (file.scope && file.scope.funcs) {
                            signatureFound = file.scope.funcs.find(func => func.name === functionName);
                            if (signatureFound) break;
                        }
                    }
                }
                else if (functionType === FunctionType.TypeScript) {
                    for (const file of tsFiles) {
                        if (file.scope && file.scope.funcs) {
                            signatureFound = file.scope.funcs.find(func => func.name === functionName);
                            if (signatureFound) break;
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
                        returnType = "None";
                    }
                    console.log(`Return type not found for ${functionName}`);
                }

                const markdownContent = new vscode.MarkdownString();
                markdownContent.isTrusted = true;
                markdownContent.supportThemeIcons = true;

                if (functionType === FunctionType.TypeScript) {
                    markdownContent.appendCodeblock(
                        `function ${functionName}(${args.map(arg => `${arg.name}: ${arg.type.name}`).join(", ")}): ${returnType}`,
                        "typescript"
                    );
                    markdownContent.appendMarkdown(`\n\n _Python equivalent_:\n\n`);
                    const typeMapping: { [key: string]: string } = {
                        number: "int",
                        string: "str",
                        boolean: "bool"
                    };

                    const toPythonType = (tsType: string): string => typeMapping[tsType] || tsType;

                    markdownContent.appendCodeblock(
                        `def ${functionName}(${args.map(arg => `${arg.name}: ${toPythonType(arg.type.name)}`).join(", ")}) -> ${toPythonType(returnType)}`,
                        "python"
                    );
                } else if (functionType === FunctionType.Python) {
                    markdownContent.appendCodeblock(
                        `def ${functionName}(${args.map(arg => `${arg.name}: ${arg.type.name}`).join(", ")}) -> ${returnType}`,
                        "python"
                    );
                }
                markdownContent.appendMarkdown(`\n\nThis function is recognized as a ${functionType} function.\n\n`);
                markdownContent.appendMarkdown('\n---\n');
                if (!returnType) {
                    markdownContent.appendMarkdown("No return type found so \n```python\nreturn None\n```");
                }

                return new vscode.Hover(markdownContent);
            }
        }
    );

    context.subscriptions.push(hoverProvider);
}
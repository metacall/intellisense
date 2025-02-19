import { execSync } from "child_process";
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function isMetacallInstalled(command: string): boolean {
    try {
        execSync(`${command} --version`, { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

export function typeMappingForPython(language: 'TS' | 'GO'): { [key: string]: string } {
    switch (language) {
        case 'TS':
            return {
                number: "int",
                string: "str",
                boolean: "bool",
                unknown: "object"
            };
        case 'GO':
            return {
                int: "int",
                string: "str",
                bool: "bool",
                "interface{}": "dict"
            };
        default:
            throw new Error("Invalid language");
    }
}

export function generateStub(functionName, args, returnType, file, functionType) {
    const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
    const STUBS_DIR = path.join(workspaceFolder, '.metacall', 'stubs');
    console.log({ functionName, args, returnType, file, functionType });
    let fileName;
    if (functionType === 'TypeScript') {
        fileName = path.basename(file, '.ts');
        console.log({ fileName });
    }
    const fileDir = path.join(STUBS_DIR, `${fileName}`);
    if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
    }
    const stubFilePath = path.join(fileDir, 'ts.pyi');
    console.log({ stubFilePath });
    // if (!returnType) {
    //     returnType = "object"; // could have done None but object is more generic
    // }

    // const typeMapping: { [key: string]: string } = {
    //     number: "int",
    //     string: "str",
    //     boolean: "bool",
    //     object: "dict",
    //     any: "Unknown",
    //     unknown: "Unknown"
    // };

    const typeMapping = typeMappingForPython('TS');

    const toPythonType = (tsType: string): string => typeMapping[tsType] || tsType;

    let stubContent = '';
    if (fs.existsSync(stubFilePath)) {
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

    if (!stubContent.includes(functionSignature)) {
        stubContent += functionSignature;
        fs.writeFileSync(stubFilePath, stubContent, 'utf8');
    }
}

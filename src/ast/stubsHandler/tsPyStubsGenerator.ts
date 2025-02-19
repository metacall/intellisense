import * as fs from "fs";
import * as path from "path";
import { typeMappingForPython } from "../../utils";

const typeMap = typeMappingForPython("TS");

function translateType(tsType: any): string {
    if (typeof tsType === "string") {
        return typeMap[tsType] || "Any";
    } else if (typeof tsType === "object") {
        return createTypedDictWrapper(tsType);
    }
    return "Any";
}

const typedDicts = new Map<string, string>();

function createTypedDictWrapper(tsObject: object): string {
    const dictName = "ReturnType" + typedDicts.size;
    const fields = Object.entries(tsObject)
        .map(([key, value]) => `    ${key}: ${translateType(value)}`)
        .join("\n");

    const typedDictDefinition = `class ${dictName}(TypedDict):\n${fields}\n`;
    const wrapperDefinition = `class ${dictName}Wrapper:\n    def __init__(self, data: ${dictName}):\n        self.__data = data\n\n    def __getattr__(self, key: str) -> Any:\n        return self.__data[key]\n\n    def __getitem__(self, key: str) -> Any:\n        return self.__data[key]\n\n    def __repr__(self):\n        return repr(self.__data)\n`;

    typedDicts.set(dictName, typedDictDefinition + "\n" + wrapperDefinition);
    return dictName + "Wrapper";
}

function generatePyiContent(jsonData: any): string {
    typedDicts.clear();
    let output = `from typing import Any, List, Dict, TypedDict\n\n`;

    jsonData.functions.forEach((func: any) => {
        const funcName = func.name;
        const params = func.params
            .map((param: any) => `${param.name}: ${translateType(param.type)}`)
            .join(", ");
        const returnType = translateType(func.returnType);
        const docstring = func.jsDoc ? `    \"\"\"${func.jsDoc}\"\"\"\n` : "";
        output += `def ${funcName}(${params}) -> ${returnType}:\n${docstring}    ...\n\n`;
    });

    typedDicts.forEach(definition => {
        output += "\n" + definition;
    });

    return output.trim();
}

export default function updateTSPyiFile(jsonPath: string, pyiFilePath: string) {
    if (!fs.existsSync(jsonPath)) {
        console.error("JSON file not found.");
        return;
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    const newContent = generatePyiContent(jsonData);

    if (fs.existsSync(pyiFilePath)) {
        fs.writeFileSync(pyiFilePath, newContent);
        console.log("Updated .pyi file with new functions.");
    } else {
        fs.writeFileSync(pyiFilePath, newContent);
        console.log("Created new .pyi file.");
    }
}
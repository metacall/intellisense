"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function extractFunctionInfo(filePath) {
    const program = typescript_1.default.createProgram([filePath], {});
    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) {
        console.error("File not found or could not be read.");
        return;
    }
    const typeChecker = program.getTypeChecker();
    const functionDetails = [];
    function getReturnTypeAsJson(type) {
        if (type.flags & typescript_1.default.TypeFlags.Object && type.symbol) {
            const properties = {};
            type.getProperties().forEach(prop => {
                const declaration = prop.valueDeclaration || (prop.declarations ? prop.declarations[0] : null);
                if (declaration) {
                    const propType = typeChecker.getTypeOfSymbolAtLocation(prop, declaration);
                    properties[prop.getName()] = typeChecker.typeToString(propType);
                }
            });
            return properties;
        }
        return typeChecker.typeToString(type);
    }
    sourceFile.forEachChild(node => {
        if (typescript_1.default.isFunctionDeclaration(node) && node.name) {
            const name = node.name.text;
            const signature = typeChecker.getSignatureFromDeclaration(node);
            if (!signature)
                return;
            const returnType = typeChecker.getReturnTypeOfSignature(signature);
            const returnTypeJson = getReturnTypeAsJson(returnType);
            const params = node.parameters.map(param => ({
                name: param.name.getText(),
                type: param.type ? param.type.getText() : "any"
            }));
            const symbol = typeChecker.getSymbolAtLocation(node.name);
            const jsDoc = symbol?.getDocumentationComment(typeChecker)
                .map(comment => comment.text)
                .join("\n") || null;
            functionDetails.push({ name, params, returnType: returnTypeJson, jsDoc });
        }
    });
    // Create the final JSON format
    const outputJson = {
        file: filePath,
        functions: functionDetails
    };
    console.log(JSON.stringify(outputJson, null, 2));
    // Optional: Save JSON to a file
    const outputPath = path_1.default.join(path_1.default.dirname(filePath), "astMetadata.json");
    fs_1.default.writeFileSync(outputPath, JSON.stringify(outputJson, null, 2));
}
// Example usage
extractFunctionInfo("myfile.ts");
//# sourceMappingURL=index.js.map
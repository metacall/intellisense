import ts from "typescript";
import fs from "fs";
import path from "path";

function extractFunctionInfo(filePath: string) {
    const program = ts.createProgram([filePath], {});
    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) {
        console.error("File not found or could not be read.");
        return;
    }

    const typeChecker = program.getTypeChecker();
    const functionDetails: any[] = [];

    function getReturnTypeAsJson(type: ts.Type): any {
        if (type.flags & ts.TypeFlags.Object && type.symbol) {
            const properties: any = {};
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
        if (ts.isFunctionDeclaration(node) && node.name) {
            const name = node.name.text;
            const signature = typeChecker.getSignatureFromDeclaration(node);
            if (!signature) return;

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
    const outputJson = {
        file: filePath,
        functions: functionDetails
    };

    console.log(JSON.stringify(outputJson, null, 2));

    const outputPath = path.join(path.dirname(filePath), "tsASTMetadata.json");
    fs.writeFileSync(outputPath, JSON.stringify(outputJson, null, 2));
}

// extractFunctionInfo("myfile.ts");

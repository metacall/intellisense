import ts from "typescript";

function extractFunctionInfo(filePath: string) {
    const program = ts.createProgram([filePath], {});
    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) {
        console.error("File not found or could not be read.");
        return;
    }

    const typeChecker = program.getTypeChecker();

    sourceFile.forEachChild(node => {
        if (ts.isFunctionDeclaration(node) && node.name) {
            const name = node.name.text;
            const signature = typeChecker.getSignatureFromDeclaration(node);
            if (!signature) return;

            // Extract return type
            const returnType = typeChecker.getReturnTypeOfSignature(signature);
            const returnTypeString = typeChecker.typeToString(returnType);

            // Extract function parameters
            const params = node.parameters.map(param => ({
                name: param.name.getText(),
                type: param.type ? param.type.getText() : "any"
            }));

            console.log({ name, params, returnType: returnTypeString });
        }
    });
}

// Example usage
extractFunctionInfo("myfile.ts");

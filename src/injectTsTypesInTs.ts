//// Can be used in typescript functions that are imported but its not working with .d.ts files

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

/**
 * Injects a .d.ts file globally into TypeScript's AST.
 */
export function injectMetaCallTypes(context: vscode.ExtensionContext) {
    const workspaceFolder = vscode.workspace.rootPath;
    if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace found.");
        return;
    }

    // Path to the global type definitions file
    const dtsFilePath = path.join(workspaceFolder, "metacall-types.d.ts");

    if (!fs.existsSync(dtsFilePath)) {
        vscode.window.showWarningMessage(`Type definition file not found: ${dtsFilePath}`);
        return;
    }

    // Register the .d.ts file globally in TypeScript LSP
    vscode.workspace.onDidOpenTextDocument((doc) => {
        if (doc.languageId === "typescript") {
            vscode.languages.setTextDocumentLanguage(doc, "typescript");
        }
    });

    // Tell TypeScript server about the new .d.ts file
    vscode.workspace.getConfiguration("typescript").update("include", ["metacall-types.d.ts"], vscode.ConfigurationTarget.Workspace);

    vscode.window.showInformationMessage("MetaCall TypeScript types injected!");
}
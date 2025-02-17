// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { activateHoverProvider } from './hoverProvider';
import { isMetacallInstalled } from './utils';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log("mc-int is now active!");

	if (!isMetacallInstalled("metacall")) {
		vscode.window.showWarningMessage("Metacall is not installed. Please install it to use this extension.");
	} else {
		vscode.window.showInformationMessage("Metacall is installed.");
	}

	activateHoverProvider(context);

}

export function deactivate() { }
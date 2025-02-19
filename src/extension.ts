import * as vscode from 'vscode';
import { activateHoverProvider, updatePythonSettings } from './pyHoverProvider';
import { isMetacallInstalled } from './utils';
import { runMetaCall } from './runMetaCall';
import { pythonTsWatcher } from './pyFileHandler';

export function activate(context: vscode.ExtensionContext) {
	console.log("mc-int is now active!");

	// if (!isMetacallInstalled("metacall")) {
	// 	vscode.window.showWarningMessage("Metacall is not installed. Please install it to use this extension.");
	// 	return;
	// } else {
	// 	vscode.window.showInformationMessage("Metacall is installed.");
	// }
	if (vscode.window.activeTextEditor?.document.languageId === "python") {
		updatePythonSettings();
		// activateHoverProvider(context);
	}
	pythonTsWatcher(context);
	vscode.window.showInformationMessage("Metacall is installed.");


	context.subscriptions.push(
		vscode.commands.registerCommand('extension.runMetaCall', runMetaCall)
	);
}

export function deactivate() { }

import * as vscode from 'vscode';
import { activateHoverProvider, updatePythonSettings } from './pyHoverProvider';
import { isMetacallInstalled } from './utils';
import { runMetaCall } from './runMetaCall';
import { pythonTsWatcher } from './pyFileHandler';
import { injectMetaCallTypes } from './injectTsTypesInTs';
import { registerPyDefinitionProvider } from './py-to-ts/pyToTsDefinitionProvider';

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
		activateHoverProvider(context);
	}
	pythonTsWatcher(context);
	vscode.window.showInformationMessage("Metacall is installed.");

	// if (vscode.window.activeTextEditor?.document.languageId === "typescript") {
		injectMetaCallTypes(context);
	// }

    registerPyDefinitionProvider(context);


	context.subscriptions.push(
		vscode.commands.registerCommand('extension.runMetaCall', runMetaCall)
	);
}

export function deactivate() { }

// import * as ts from 'typescript/lib/tsserverlibrary';

// const functionSignatures = [
//     {
//         "name": "tsSum",
//         "params": [
//             { "name": "a", "type": "number" },
//             { "name": "b", "type": "number" }
//         ],
//         "returnType": "number",
//         "jsDoc": "This function returns the sum of two numbers"
//     },
//     {
//         "name": "sum2",
//         "params": [
//             { "name": "a", "type": "number" },
//             { "name": "b", "type": "string" }
//         ],
//         "returnType": "number",
//         "jsDoc": "Adds a number and a string that is parsed to a number"
//     }
// ];

// export function create(info: ts.server.PluginCreateInfo) {
//     const proxy = Object.create(info.languageService);
    
//     proxy.getCompletionsAtPosition = (fileName, position, options) => {
//         const prior = info.languageService.getCompletionsAtPosition(fileName, position, options);
//         if (!prior) return;
//         functionSignatures.forEach(f => {
//             prior.entries.push({
//                 name: f.name,
//                 kind: ts.ScriptElementKind.functionElement,
//                 sortText: '0'
//             });
//         });
//         return prior;
//     };

//     proxy.getQuickInfoAtPosition = (fileName, position) => {
//         const prior = info.languageService.getQuickInfoAtPosition(fileName, position);
//         if (!prior) return;
//         const word = info.languageServiceHost.readFile(fileName)?.slice(position - 10, position + 10) || '';
//         const func = functionSignatures.find(f => word.includes(f.name));
//         if (!func) return prior;
//         return {
//             kind: ts.ScriptElementKind.functionElement,
//             kindModifiers: '',
//             textSpan: { start: position, length: func.name.length },
//             displayParts: [{ text: `${func.name}(${func.params.map(p => `${p.name}: ${p.type}`).join(', ')}): ${JSON.stringify(func.returnType)}` }],
//             documentation: func.jsDoc ? [{ text: func.jsDoc }] : undefined
//         };
//     };

//     return proxy;
// }
// export function deactivate() {}
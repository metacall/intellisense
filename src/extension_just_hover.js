const vscode = require('vscode');

function activate(context) {
	console.log('MetaCall Python Hover Extension Activated');

	let hoverProvider = vscode.languages.registerHoverProvider(
		{ scheme: 'file', language: 'python' },
		{
			provideHover(document, position, token) {
				const range = document.getWordRangeAtPosition(position);
				if (!range) return;
				
				const functionName = document.getText(range);
				console.log(`Hover detected on: ${functionName}`);

				// Fake type information (Replace with actual type extraction)
				const args = [
					{ name: "x", type: "int" },
					{ name: "y", type: "float" }
				];
				const returnType = "str";

				// Format hover to look native
				const markdownContent = new vscode.MarkdownString();
				markdownContent.isTrusted = true;
				markdownContent.supportThemeIcons = true; // Enables icons like 🐍

				// Code block for function signature (matches native Python hover)
				markdownContent.appendCodeblock(`${functionName}(${args.map(arg => `${arg.name}: ${arg.type}`).join(', ')}) -> ${returnType}`, 'python');

				// Inject extra details if needed
				markdownContent.appendMarkdown("\n\n*Injected by MetaCall Extension*");
				markdownContent.appendText('\nhellloooo');

				return new vscode.Hover(markdownContent);
			}
		}
	);

	context.subscriptions.push(hoverProvider);
}

function deactivate() {}

module.exports = { activate, deactivate };
import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';

export function runMetaCall() {
    const outputChannel = vscode.window.createOutputChannel('MetaCall Output');
    outputChannel.show(true);

    // Get the correct script path
    let scriptPath = path.join(__dirname, '..', 'src', 'get_signatures.py');

    // Ensure Windows paths are formatted correctly
    if (process.platform === 'win32') {
        scriptPath = scriptPath.replace(/\\/g, '/'); // Convert backslashes to forward slashes
    }

    outputChannel.appendLine(`Using script path: ${scriptPath}`);

    // Spawn MetaCall process
    const metacall = spawn('metacall', [], { shell: true });

    // Buffer to store CLI output
    let outputBuffer = '';

    // Listen for MetaCall stdout
    metacall.stdout.on('data', (data) => {
        outputBuffer += data.toString();
        outputChannel.appendLine(`Output: ${data.toString()}`);

        // Only send commands when MetaCall is ready
        if (outputBuffer.includes('λ')) {  // 'λ' appears in MetaCall CLI when ready
            metacall.stdin.write(`load py "${scriptPath}"\n`);
            metacall.stdin.write('call metacall_inspect_from_py()\n');
            metacall.stdin.end();
        }
    });

    // Listen for errors
    metacall.stderr.on('data', (data) => {
        outputChannel.appendLine(`Error: ${data.toString()}`);
    });

    // Process closure
    metacall.on('close', (code) => {
        outputChannel.appendLine(`Process exited with code ${code}`);
    });

    // Handle process error (spawn failures)
    metacall.on('error', (err) => {
        outputChannel.appendLine(`Failed to start process: ${err.message}`);
    });
}
import { execSync } from "child_process";

export function isMetacallInstalled(command: string): boolean {
    try {
        execSync(`${command} --version`, { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}
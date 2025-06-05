// src/commands/shared/functions.ts
// This file contains functions which are used across multiple commands in the extension.

import * as vscode from 'vscode';

export async function createFolder(uri: vscode.Uri) {
    try {
        await vscode.workspace.fs.createDirectory(uri);
        vscode.window.showInformationMessage(`Folder created at ${uri.fsPath}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to create folder: ${(error as Error).message}`);
    }
}

export async function validateNetSuiteProjectStructure(workspaceFolders: any): Promise<boolean> {
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder is open.');
        return false;
    }

    const rootUri = workspaceFolders[0].uri;

    const pathsToCheck = [
        vscode.Uri.joinPath(rootUri, 'suitecloud.config.js'),
        vscode.Uri.joinPath(rootUri, 'src'),
        vscode.Uri.joinPath(rootUri, 'src', 'deploy.xml'),
        vscode.Uri.joinPath(rootUri, 'src', 'manifest.xml'),
        vscode.Uri.joinPath(rootUri, 'src', 'Objects')
    ];

    try {
        for (const uri of pathsToCheck) {
            const stat = await vscode.workspace.fs.stat(uri);
            const isDir = uri.path.endsWith('/') || uri.path.endsWith('src') || uri.path.endsWith('Objects');
            if (isDir && stat.type !== vscode.FileType.Directory) {
                vscode.window.showErrorMessage(`Expected a folder: ${uri}`);
                return false;
            } else if (!isDir && stat.type !== vscode.FileType.File) {
                vscode.window.showErrorMessage(`Expected a file: ${uri}`);
                return false;
            }
        }

        return true;
    } catch (error) {
        vscode.window.showErrorMessage(`Error checking project structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return false;
    }
}
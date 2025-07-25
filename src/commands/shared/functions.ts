// src/commands/shared/functions.ts
// This file contains functions which are used across multiple commands in the extension.

import * as vscode from 'vscode';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import * as path from 'path';

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

export async function addObjectReferences(files: vscode.Uri[]): Promise<void> {
    try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage("No workspace folder found.");
            return;
        }

        const deployXmlUri = vscode.Uri.joinPath(workspaceFolders[0].uri, 'src/deploy.xml');
        console.log(`Deploy XML file URI: ${deployXmlUri.fsPath}`);

        // Read XML content
        const fileBuffer = await vscode.workspace.fs.readFile(deployXmlUri);
        const xmlContent = Buffer.from(fileBuffer).toString('utf8');

        // Parse XML
        const parser = new XMLParser({ ignoreAttributes: false });
        let xmlObj = parser.parse(xmlContent);

        // Ensure structure exists
        xmlObj.deploy = xmlObj.deploy || {};
        xmlObj.deploy.objects = xmlObj.deploy.objects || {};
        let paths = xmlObj.deploy.objects.path || [];

        // Normalize to array
        if (!Array.isArray(paths)) {
            paths = [paths];
        }

        // Add new object paths
        files.forEach(file => {
            const fullRelativePath = path.relative(workspaceFolders[0].uri.fsPath, file.fsPath).replace(/\\/g, '/');

            // Find the index of the 'Objects/' part
            const objectsIndex = fullRelativePath.indexOf('Objects/');
            if (objectsIndex === -1) {
                console.warn(`Skipped file not under an Objects folder: ${fullRelativePath}`);
                return;
            }

            // Extract path starting from Objects/ and convert to ~/Objects/...
            const relativeToObjects = fullRelativePath.slice(objectsIndex + 'Objects/'.length);
            const sdfPath = `~/Objects/${relativeToObjects}`;

            if (!paths.includes(sdfPath)) {
                paths.push(sdfPath);
            }
        });

        xmlObj.deploy.objects.path = paths;

        // Build XML
        const builder = new XMLBuilder({ ignoreAttributes: false, format: true, suppressEmptyNode: true });
        const updatedXml = builder.build(xmlObj);

        // Write back to file
        await vscode.workspace.fs.writeFile(deployXmlUri, Buffer.from(updatedXml, 'utf8'));

        vscode.window.showInformationMessage('Deploy file updated successfully.');
    } catch (error) {
        console.error("Error adding object references:", error);
        vscode.window.showErrorMessage("Failed to add object references. Check the console for details.");
    }
}

export async function refreshObjectReferences(): Promise<void> {
    try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage("No workspace folder found.");
            return;
        }

        const rootUri = workspaceFolders[0].uri;
        const deployXmlUri = vscode.Uri.joinPath(rootUri, 'src/deploy.xml');

        const fileBuffer = await vscode.workspace.fs.readFile(deployXmlUri);
        const xmlContent = Buffer.from(fileBuffer).toString('utf8');

        const parser = new XMLParser({ ignoreAttributes: false });
        let xmlObj = parser.parse(xmlContent);

        xmlObj.deploy = xmlObj.deploy || {};
        xmlObj.deploy.objects = xmlObj.deploy.objects || {};
        let paths: string[] = xmlObj.deploy.objects.path || [];

        if (!Array.isArray(paths)) {
            paths = [paths];
        }

        const updatedPaths: string[] = [];
        let changesMade = false;

        for (const pathEntry of paths) {
            const expectedFileName = path.basename(pathEntry);
            const foundFiles = await vscode.workspace.findFiles(`**/Objects/**/${expectedFileName}`);

            if (foundFiles.length === 0) {
                vscode.window.showWarningMessage(`Removed missing object reference: ${pathEntry}`);
                changesMade = true;
                continue; // don't include this in updatedPaths
            }

            // Check if file moved
            const foundFile = foundFiles[0]; // Take the first match
            const fullRelativePath = path.relative(rootUri.fsPath, foundFile.fsPath).replace(/\\/g, '/');
            const objectsIndex = fullRelativePath.indexOf('Objects/');
            const relativeToObjects = fullRelativePath.slice(objectsIndex + 'Objects/'.length);
            const correctSdfPath = `~/Objects/${relativeToObjects}`;

            if (correctSdfPath !== pathEntry) {
                vscode.window.showInformationMessage(`Updated object reference: ${pathEntry} → ${correctSdfPath}`);
                changesMade = true;
            }

            updatedPaths.push(correctSdfPath);
        }

        if (!changesMade) {
            vscode.window.showInformationMessage("No changes needed. All object references are up to date.");
            return;
        }

        // Write updated paths
        xmlObj.deploy.objects.path = updatedPaths;

        const builder = new XMLBuilder({ ignoreAttributes: false, format: true, suppressEmptyNode: true });
        const updatedXml = builder.build(xmlObj);

        await vscode.workspace.fs.writeFile(deployXmlUri, Buffer.from(updatedXml, 'utf8'));
        vscode.window.showInformationMessage("Deploy file refreshed successfully.");
    } catch (error) {
        console.error("Error refreshing object references:", error);
        vscode.window.showErrorMessage("Failed to refresh deploy file. Check console for details.");
    }
}
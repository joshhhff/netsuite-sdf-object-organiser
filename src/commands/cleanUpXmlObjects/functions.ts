// src/commands/cleanUpXmlObjects/functions.ts
// This file contains functions which are used for the "Clean Up XML Objects" command.

import * as vscode from 'vscode';
import { XMLParser } from 'fast-xml-parser';
import { ObjectTypes } from '../shared/enums';

export async function getAllXmlFilesInObjectsFolder(): Promise<vscode.Uri[]> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder found.");
        return [];
    }

    const pattern = new vscode.RelativePattern(workspaceFolder, 'src/Objects/**/*.xml');
    const files = await vscode.workspace.findFiles(pattern);

    console.log(`Found ${files.length} XML files in Objects folder.`);
    return files;
}

export async function getSubfolderUrisOfObjects(): Promise<vscode.Uri[]> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage("No workspace folder found.");
    return [];
  }

  const objectsFolderUri = vscode.Uri.joinPath(workspaceFolder.uri, 'src', 'Objects');

  try {
    const entries = await vscode.workspace.fs.readDirectory(objectsFolderUri);

    // Filter for directories and build full Uri for each
    const folderUris = entries
      .filter(([_, fileType]) => fileType === vscode.FileType.Directory)
      .map(([name]) => vscode.Uri.joinPath(objectsFolderUri, name));

    return folderUris;
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to read Objects folder: ${err}`);
    return [];
  }
}

/**
 * Organises XML files into an object type based on their file names.
 * 
 * @param xmlFiles - An array of XML file URIs.
 * @returns An object where keys are the base names of the files and values are the file URIs.
 * [
        {
            objectType: "Transaction Body Custom Field",
            files: [
                {
                    name: "name_of_file.xml",
                    uri: "path/to/name_of_file.xml"
                }
            ]
        }
    ]
 * 
 */
export async function organiseXMlFilesIntoObjectTypes(xmlFiles: vscode.Uri[]): Promise<any> {
    enum ObjectType {
        addressForm = 'Address Form',
        advancedpdftemplate = 'Advanced PDF HTML Template'
    }
    async function getFirstXmlTagName(fileUri: vscode.Uri): Promise<string | null> {
        const raw = await vscode.workspace.fs.readFile(fileUri);
        const xmlText = Buffer.from(raw).toString('utf8');

        const parser = new XMLParser();
        const parsed = parser.parse(xmlText);

        // Get the first key of the parsed object — this corresponds to the first tag
        const firstTag = parsed && typeof parsed === 'object'
            ? Object.keys(parsed)[0]
            : null;

        return firstTag || null;
    }

    let sortedFiles: { objectType: string; files: { name: string; uri: vscode.Uri; }[]; }[] = [];

    await Promise.all(xmlFiles.map(async (file) => {
        const objectType = await getFirstXmlTagName(file);
        if (!objectType) {
            console.warn(`No object type found for file: ${file.fsPath}`);
            return;
        }

        const xmlObjectType: string = ObjectTypes[objectType as keyof typeof ObjectTypes];
        console.log(`Mapped Object Type: ${xmlObjectType}`);

        const existingType = sortedFiles.find(item => item.objectType === xmlObjectType);
        if (existingType) {
            existingType.files.push({ name: file.path.split('/').pop() || '', uri: file });
        } else {
            sortedFiles.push({ objectType: xmlObjectType, files: [{ name: file.path.split('/').pop() || '', uri: file }] });
        }
    }));

    return sortedFiles;
}
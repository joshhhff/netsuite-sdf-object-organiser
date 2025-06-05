import * as vscode from 'vscode';
import * as path from 'path';
import { createFolder, validateNetSuiteProjectStructure } from './commands/shared/functions'
import { ObjectTypes } from './commands/shared/enums';
import { getAllXmlFilesInObjectsFolder, getSubfolderUrisOfObjects, organiseXMlFilesIntoObjectTypes } from './commands/cleanUpXmlObjects/functions';

export function activate(context: vscode.ExtensionContext) {
	// this code inside the 'activate' function is only run when the extension is activated

    // the commands are registered in package.json
	const disposable = vscode.commands.registerCommand('netsuite-sdf-object-organiser.createOrganisedStructure', async () => {
        const workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined = vscode.workspace.workspaceFolders;
        // check the workspace is a valid netsuite sdf project
        const isValidWorkspace: boolean = await validateNetSuiteProjectStructure(workspaceFolders);

        if (!isValidWorkspace) {
            vscode.window.showErrorMessage('The current workspace is not a valid NetSuite SDF project. Please ensure you are in the correct directory with the required setup provided through the NetSuite SuiteCloud Development Framework (SDF) tools.');
            return;
        } else if (isValidWorkspace && workspaceFolders && workspaceFolders.length > 0) {
            // ask the user for the folder name to go into the Objects folder
            const folderName = await vscode.window.showInputBox({
                placeHolder: 'Enter the folder name to create in the Objects folder',
                prompt: 'Folder Name',
                validateInput: async (input) => {
                    if (!input || input.trim() === '') {
                        return 'Folder name cannot be empty.';
                    }

                    const folderUri = vscode.Uri.joinPath(workspaceFolders[0].uri, 'src', 'Objects', input.trim());

                    try {
                        const stat = await vscode.workspace.fs.stat(folderUri);
                        if (stat.type === vscode.FileType.Directory) {
                            return 'Folder already exists.';
                        }
                    } catch (error) {
                        // folder doesn't exist
                        return undefined;
                    }

                    return undefined;
                }
            });

            if (folderName) {
                const objectTypesArray: string[] = Object.values(ObjectTypes)
    
                const objectTypes = await vscode.window.showQuickPick(objectTypesArray, {
                    placeHolder: 'Select at least one option',
                    canPickMany: true,
                });
    
                if (!objectTypes || objectTypes.length === 0) {
                    // user decided not to create sub object types
                    const rootUri = workspaceFolders[0].uri;
    
                    const newFolderUri: vscode.Uri = vscode.Uri.joinPath(rootUri, 'src', 'Objects', folderName);
                    await createFolder(newFolderUri);
                } else {
    
                    const rootUri = workspaceFolders[0].uri;
    
                    // create the main folder in the Objects folder
                    const newFolderUri: vscode.Uri = vscode.Uri.joinPath(rootUri, 'src', 'Objects', folderName);
                    await createFolder(newFolderUri);    // create the project folder underneath the Objects folder
    
                    // create subfolders in the project folder for each selected object type
                    objectTypes.forEach(async (type) => {
    
                        const typeFolderUri: vscode.Uri = vscode.Uri.joinPath(newFolderUri, type);
                        await createFolder(typeFolderUri);
                    })
                }
            }
        }
	});

	context.subscriptions.push(disposable);

    const disposable2 = vscode.commands.registerCommand('netsuite-sdf-object-organiser.cleanUpXmlObjects', async () => {
        try {
            const workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined = vscode.workspace.workspaceFolders;

            const isValidWorkspace: boolean = await validateNetSuiteProjectStructure(workspaceFolders);

            if (!isValidWorkspace) {
                vscode.window.showErrorMessage('The current workspace is not a valid NetSuite SDF project. Please ensure you are in the correct directory with the required setup provided through the NetSuite SuiteCloud Development Framework (SDF) tools.');
                return;
            } else if (isValidWorkspace && workspaceFolders && workspaceFolders.length > 0) {
                const allXmlObjectFiles: vscode.Uri[] = await getAllXmlFilesInObjectsFolder();

                // ask the user which xml files to organise
                const selectedFiles = await vscode.window.showQuickPick(allXmlObjectFiles.map(file => ({
                    label: path.basename(file.fsPath),
                    uri: file
                })), {
                    placeHolder: 'Select which SDF XML objects to organise',
                    canPickMany: true,
                });

                if (!selectedFiles || selectedFiles.length === 0) {
                    vscode.window.showWarningMessage('No SDF XML objects selected');
                    return;
                }

                const options: string[] = ['Create New Folder', 'Organise into Existing Folder'];

                const newOrCurrentFolder = await vscode.window.showQuickPick(options, {
                    placeHolder: 'Create a new folder or organise into an existing folder?',
                });

                if (!newOrCurrentFolder) {
                    vscode.window.showWarningMessage('No action selected');
                    return;
                }

                let projectFolderUri: vscode.Uri | null = null;
                
                if (newOrCurrentFolder === 'Create New Folder') {
                    const folderName = await vscode.window.showInputBox({
                        placeHolder: 'Enter the folder name to create in the Objects folder',
                        prompt: 'Folder Name',
                        validateInput: async (input) => {
                            if (!input || input.trim() === '') {
                                return 'Folder name cannot be empty.';
                            }
                            const folderUri = vscode.Uri.joinPath(workspaceFolders[0].uri, 'src', 'Objects', input.trim());

                            try {
                                const stat = await vscode.workspace.fs.stat(folderUri);
                                if (stat.type === vscode.FileType.Directory) {
                                    return 'Folder already exists.';
                                }
                            } catch (error) {
                                // folder doesn't exist
                                return undefined;
                            }

                            return undefined;
                        }
                    });

                    if (!folderName) return;    // should never trigger due to validateInput, but typescript demands undefined check

                    const rootUri: vscode.Uri = workspaceFolders[0].uri;
                    console.log('creating folder at', rootUri)
    
                    const newFolderUri: vscode.Uri = vscode.Uri.joinPath(rootUri, 'src', 'Objects', folderName);
                    await createFolder(newFolderUri);

                    projectFolderUri = newFolderUri; // set the project folder URI to the newly created folder
                    
                } else if (newOrCurrentFolder === 'Organise into Existing Folder') {
                    const subfoldersUris: vscode.Uri[] = await getSubfolderUrisOfObjects();

                    if (subfoldersUris.length === 0) {
                        vscode.window.showWarningMessage('No subfolders found in the Objects folder. Please create a folder first.');
                        return;
                    }
                    
                    const subfolders: { label: string, uri: vscode.Uri }[] = subfoldersUris.map(uri => ({
                        label: path.basename(uri.fsPath),
                        uri: uri
                    }));

                    const selectedFolder = await vscode.window.showQuickPick(subfolders, {
                        placeHolder: 'Select a folder to organise the files into',
                    });

                    if (!selectedFolder) {
                        vscode.window.showWarningMessage('No folder selected to organise files into');
                        return;
                    } else {
                        console.log(`Selected folder to organise files into: ${selectedFolder.label}`);
                    }

                    projectFolderUri = selectedFolder.uri; // set the project folder URI to the selected folder

                } else {
                    vscode.window.showErrorMessage('Invalid selection. Please try again.');
                }

                // if we have a project folder URI to work with, proceed to organsising the XML files
                if (projectFolderUri) {
                    const organisedFiles = await organiseXMlFilesIntoObjectTypes(selectedFiles.map(file => file.uri));
                    const rootUri = workspaceFolders[0].uri;

                    const folderToPlaceFilesInto: vscode.Uri = vscode.Uri.joinPath(rootUri, 'src', 'Objects', path.basename(projectFolderUri.fsPath));

                    organisedFiles.forEach(async (objectType: any) => {
                        const objectTypeFolderUri: vscode.Uri = vscode.Uri.joinPath(folderToPlaceFilesInto, objectType.objectType);
                        
                        // create the folder for the object type if it doesn't exist
                        await createFolder(objectTypeFolderUri);

                        // move each file into the corresponding object type folder
                        for (const file of objectType.files) {
                            const newFileUri: vscode.Uri = vscode.Uri.joinPath(objectTypeFolderUri, path.basename(file.uri.fsPath));
                            await vscode.workspace.fs.rename(file.uri, newFileUri, { overwrite: true });
                        }
                    });
                    vscode.window.showInformationMessage('XML files organised successfully!');
                }
            }
        } catch (error) {
            console.error('Error during XML cleanup command', error);
        }
    });

    context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() {}
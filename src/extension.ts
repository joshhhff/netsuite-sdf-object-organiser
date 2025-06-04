import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('netsuite-sdf-object-organiser.createOrganisedStructure', async () => {
		// Display a message box to the user
		//vscode.window.showInformationMessage('Hello World from NetSuite SDF Object Organiser!');
        const workspaceFolders = vscode.workspace.workspaceFolders;

        const isValidWorkspace: boolean = await validateNetSuiteProjectStructure(workspaceFolders);

        if (!isValidWorkspace) {
            vscode.window.showErrorMessage('The current workspace is not a valid NetSuite SDF project. Please ensure you are in the correct directory with the required setup provided through the NetSuite SuiteCloud Development Framework (SDF) tools.');
            return;
        } else if (isValidWorkspace && workspaceFolders && workspaceFolders.length > 0) {
            // ask the user for the folder name to go into the Objects folder
            const folderName = await vscode.window.showInputBox({
                placeHolder: 'Enter the folder name to create in the Objects folder',
                prompt: 'Folder Name',
                validateInput: (input) => {
                    if (!input || input.trim() === '') {
                        return 'Folder name cannot be empty.';
                    }}
            });

            if (folderName) {
                const objectTypesForSelection = [
                    'Address Form',
                    'Advanced PDF HTML Template',
                    'Bundle Installation Script',
                    'Center',
                    'Center Category',
                    'Center Link',
                    'Center Tab',
                    'Client Script',
                    'CRM Custom Field',
                    'Custom List',
                    'Custom Record Action Script',
                    'Custom Record Type',
                    'Custom Segment',
                    'Custom Transaction Type',
                    'Dataset',
                    'Email Template',
                    'Entity Custom Field',
                    'Entry Form',
                    'Integration',
                    'Item Custom Field',
                    'Item Number Custom Field',
                    'Item Option Custom Field',
                    'KPI Scorecard',
                    'Map Reduce Script',
                    'Mass Update Script',
                    'Other Custom Field',
                    'Portlet',
                    'RESTlet',
                    'Role',
                    'Saved CSV Import',
                    'Saved Search',
                    'Scheduled Script',
                    'SDF Installation Script',
                    'API Secrets',
                    'Sublist',
                    'Subtab',
                    'Suitelet',
                    'Transaction Form',
                    'Transaction Body Custom Field',
                    'Transaction Column Custom Field',
                    'User Event Script',
                    'Workflow',
                    'Workflow Action Script',
                ]
    
                const objectTypes = await vscode.window.showQuickPick(objectTypesForSelection, {
                    placeHolder: 'Select at least one option',
                    canPickMany: true,
                });
    
                console.log(`Creating organised structure in Objects folder with name: ${folderName}`);
    
                if (!objectTypes || objectTypes.length === 0) {
                    // user decided not to create sub object types
                    const rootUri = workspaceFolders[0].uri;
                    console.log('creating folder at', rootUri)
    
                    const newFolderUri = vscode.Uri.joinPath(rootUri, 'src', 'Objects', folderName);
                    await createFolder(newFolderUri);
                } else {
    
                    const rootUri = workspaceFolders[0].uri;
    
                    // create the main folder in the Objects folder
                    const newFolderUri = vscode.Uri.joinPath(rootUri, 'src', 'Objects', folderName);
                    await createFolder(newFolderUri);    // create the project folder underneath the Objects folder
    
                    // create subfolders in the project folder for each selected object type
                    objectTypes.forEach(async (type) => {
                        console.log(`Creating folder for object type: ${type}`);
    
                        const typeFolderUri = vscode.Uri.joinPath(newFolderUri, type);
                        await createFolder(typeFolderUri);
                    })
                }
            }
        }
	});

	context.subscriptions.push(disposable);
}

async function createFolder(uri: vscode.Uri) {
    try {
        await vscode.workspace.fs.createDirectory(uri);
        vscode.window.showInformationMessage(`Folder created at ${uri.fsPath}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to create folder: ${(error as Error).message}`);
    }
}

async function validateNetSuiteProjectStructure(workspaceFolders: any): Promise<boolean> {
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
                vscode.window.showErrorMessage(`Expected a folder: ${uri.fsPath}`);
                return false;
            } else if (!isDir && stat.type !== vscode.FileType.File) {
                vscode.window.showErrorMessage(`Expected a file: ${uri.fsPath}`);
                return false;
            }
        }

        return true;
    } catch (error) {
        vscode.window.showErrorMessage(`Error checking project structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return false;
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}

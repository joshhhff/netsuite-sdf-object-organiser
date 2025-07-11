# Changelog

## 1.2.0
- "Organise all" option is now available when cleaning up XML objects. This allows users to quickly and easily organise all objects that they have in their SDF project

## 1.1.2
- Bug Fixes

## 1.1.1
- When creating new folders, the extension now checks for existing folders with the same name to prevent duplicates/overwriting.

## 1.1.0 - Clean up command
- Users can now "clean up" their SDF XML objects
    - Users will select which files they want to "clean"
    - Users will then be prompted to create a new sub-folder under `src/Objects` or place them into an existing folder
    - Files will be automatically moved into the chosen sub-folder, and objects will be placed into meaningful folders
        - e.g: An object which represents a custom field for Sales Orders will be automatically placed into `Transaction Body Custom Fields` 

## 1.0.0 - Bug Fixes
- Bug Fixes

## 0.0.2 - Updated SDF Project Validation
- Validates that the workspace is a valid SDF project by checking for the existence of:
  - `suitecloud.config.js` at the root level.
  - A `src` directory containing:
    - `manifest.xml`
    - `deploy.xml`
    - an `Objects` subfolder.
- Icon for extension
- Tested on MacOS & Windows

## 0.0.1 - Release
- Allows users to create structured "projects" under the `src/Objects` directory of a NetSuite SDF customization project.
- Provides a multi-select interface for choosing which object types (e.g., custom records, workflows, scripts) to include under the created project folder.
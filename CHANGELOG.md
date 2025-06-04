# Changelog

## 0.0.1 - Beta
- Allows users to create structured "projects" under the `src/Objects` directory of a NetSuite SDF customization project.
- Provides a multi-select interface for choosing which object types (e.g., custom records, workflows, scripts) to include under the created project folder.

## 0.0.2 - Finalised Testing
- Validates that the workspace is a valid SDF project by checking for the existence of:
  - `suitecloud.config.js` at the root level.
  - A `src` directory containing:
    - `manifest.xml`
    - `deploy.xml`
    - an `Objects` subfolder.
- Icon for extension
- Tested on MacOS & Windows

## [1.0.0] - Release
- Initial release
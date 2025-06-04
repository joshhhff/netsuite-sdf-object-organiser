# Changelog

All notable changes to the **netsuite-sdf-object-organiser** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [1.0.0] - 2025-06-04
### Added
- Initial release of the NetSuite SDF Object Organiser VS Code extension.
- Validates that the workspace is a valid SDF project by checking for the existence of:
  - `suitecloud.config.js` at the root level.
  - A `src` directory containing:
    - `manifest.xml`
    - `deploy.xml`
    - an `Objects` subfolder.
- Allows users to create structured "projects" under the `src/Objects` directory of a NetSuite SDF customization project.
- Provides a multi-select interface for choosing which object types (e.g., custom records, workflows, scripts) to include under the created project folder.
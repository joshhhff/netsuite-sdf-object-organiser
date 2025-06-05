# NetSuite SDF Object Organiser

NetSuite SDF Object Organiser is a Visual Studio Code extension that helps you organise custom objects in your NetSuite SuiteCloud development projects. This extension allows you to group related objects into project folders, improving maintainability and structure when working with large customisation sets.

---

## 🚀 Features

- Detects if the current workspace is a valid NetSuite SDF project.
- Allows you to create a project folder within the `src/Objects` directory.
- Presents a multi-select list of available NetSuite object types.
- Group SDF XML files and move them into meaningful directories just by clicking a few buttons

---

## 📦 Requirements

To use this extension, you must have:

- A valid NetSuite SuiteCloud project with the following in place:
  - `suitecloud.config.js` in the workspace root.
  - A `src` folder containing:
    - `deploy.xml`
    - `manifest.xml`
    - `Objects/` directory

If these files and folders are not found, the extension will show an error and abort the operation.

---

## ⚙️ Extension Settings

This extension does not currently expose any configuration settings. Future versions may allow customizing object types, naming conventions, or output paths.

---

## 📝 Latest Release

### v1.1.0
- Users can now "clean up" their SDF XML objects
    - Users will select which files they want to "clean"
    - Users will then be prompted to create a new sub-folder under `src/Objects` or place them into an existing folder
    - Files will be automatically moved into the chosen sub-folder, and objects will be placed into meaningful folders
        - e.g: An object which represents a custom field for Sales Orders will be automatically placed into `Transaction Body Custom Fields` 

### v1.1.1
- Bug fixes
---

## ✅ Contributing

Issues, pull requests, and feedback are welcome!

---

## 📄 License

© [Josh Ford](https://joshford.co.uk)

---

Enjoy using **NetSuite SDF Object Organiser** and keep your customisation projects clean and organised!

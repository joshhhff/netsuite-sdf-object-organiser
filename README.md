# NetSuite SDF Object Organiser

NetSuite SDF Object Organiser is a Visual Studio Code extension that helps you organise custom objects in your NetSuite SuiteCloud development projects. This extension allows you to group related objects into project folders, improving maintainability and structure when working with large customisation sets.

---

## 🚀 Features

- Detects if the current workspace is a valid NetSuite SDF project.
- Allows you to create a project folder within the `src/Objects` directory.
- Presents a multi-select list of available NetSuite object types.
- Automatically organises selected object types under the newly created project folder.

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

## 🐞 Known Issues

- No validation for existing project folders (can result in overwriting manually).

---

## 📝 Release Notes

### 1.0.0

- Initial release
- Detects NetSuite SDF projects
- Allows users to quickly create sub-folders under the `src/Objects` directory, and select which object types to have sub-folders for

---

## 📚 Resources

- [SuiteCloud CLI Documentation](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_156851404491.html)
- [VS Code Extension API](https://code.visualstudio.com/api)

---

## ✅ Contributing

Issues, pull requests, and feedback are welcome! Please ensure contributions follow [VS Code extension guidelines](https://code.visualstudio.com/api/references/extension-guidelines).

---

## 📄 License

© [Josh Ford](htttps://joshford.co.uk)

---

Enjoy using **NetSuite SDF Object Organiser** and keep your customisation projects clean and organised!

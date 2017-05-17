# Sass Formatter

Sass formatter extension for Visual Studio Code built on top of **sass-convert**. Beautify *sass*, *scss* and *css* files. Currently, only complete documents can be formatted. Formatting selections is planned.

## Requirements

Requires [sass command line tools](http://sass-lang.com/install) to be installed. More details about [Sass Syntax](http://sass-lang.com/documentation/file.SASS_REFERENCE.html#syntax).

## Usage

Files can be formatted on-demand by right clicking in the document and selecting **Format Document** in the editor context menu, by using the associated keyboard shortcut, or by running command **Format Document** from the **Command Palette**.

Default keyboard shortcuts for **Format Document** command:
* macOS: **Shift+Alt+F**
* Linux: **Ctrl+Shift+I**
* Windows: **Shift+Alt+F**

To automatically format a file on save, add the following to your *settings.json* file: `"editor.formatOnSave": true`.

To automatically insert a final new line at the end of the file when saving it, add the following to your *settings.json* file: `"files.insertFinalNewline": false`.

## Sass Formatting Demo

![Sass Formatting Demo](images/sass-format-demo.gif)

## Sass Formatter Settings

This extension contributes the following settings:

* `sassFormat.dasherize`: Convert underscores to dashes.
* `sassFormat.indent`: How many spaces to use for each level of indentation. Defaults to 4. "t" means use hard tabs.
* `sassFormat.oldStyle`: Output the old-style ":prop val" property syntax. Only meaningful when formating Sass.
* `sassFormat.defaultEncoding`: Specify the default encoding for input files. **Important Note: This is not well tested, so use it carefully.**
* `sassFormat.unixNewlines`: Use Unix-style newlines in formatted files. Always true on Unix. **Important Note: This is not well tested, so use it carefully.**
* `sassFormat.sassPath`: Custom Sass PATH. Example: `"sassFormat.sassPath": "/custom/path/bin"`

## Coming Soon

* Format Selection
* Additional Settings and Formatting

## Release Notes

### 1.0.1
- Prevent text delete if `sass-convert` command is not installed and/or not found, and updated info message
- Updated `README.md` (added notes that `defaultEncoding` and `unixNewlines` settings are not well tested and fixed typo)
- Few small code improvements

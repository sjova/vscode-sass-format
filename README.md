# Sass Formatter

Sass formatter extension for VS Code built on top of **sass-convert**. Beautify *sass*, *scss* and *css* files.

## Requirements

Requires [sass command line tools](http://sass-lang.com/install) to be installed. Tested sass command line tools: **Sass 3.4.23 (Selective Steve)**.

More details about [Sass Syntax](http://sass-lang.com/documentation/file.SASS_REFERENCE.html#syntax) used in this formatter.

## Usage

Files can be formatted on-demand by right clicking in the document and selecting **Format Document** in the editor context menu, by using the associated keyboard shortcut, or by running command **Format Document** from the **Command Palette**.

Default keyboard shortcuts for **Format Document** command:
* macOS: **Shift+Alt+F**
* Linux: **Ctrl+Shift+I**
* Windows: **Shift+Alt+F**

Selection can be formatted on-demand by right clicking in the document and selecting **Format Selection** in the editor context menu, by using the associated keyboard shortcut, or by running command **Format Selection** from the **Command Palette**.

Default keyboard shortcuts for **Format Selection** command:
* macOS: **Cmd+K Cmd+F**
* Linux: **Ctrl+K Ctrl+F**
* Windows: **Ctrl+K Ctrl+F**

By default, formatter using **UTF-8** encoding to ensure proper encoding of all characters. This allow us to use Unicode characters directly in our styling files:

```scss
// UTF-8 example
.icon-prev {
    &:before {
        // Unicode Character 'SINGLE LEFT-POINTING ANGLE QUOTATION MARK' (U+2039)
        content: '‹';
    }
}

// ASCII example
.icon-prev {
    &:before {
        // Unicode Character 'SINGLE LEFT-POINTING ANGLE QUOTATION MARK' (U+2039)
        content: '\2039';
    }
}
```

To automatically format on paste, add the following to your *settings.json* file: `"editor.formatOnPaste": true`.

To automatically format a file on save, add the following to your *settings.json* file: `"editor.formatOnSave": true`.

To automatically insert a final new line at the end of the file when saving it, add the following to your *settings.json* file: `"files.insertFinalNewline": false`.

## Sass Formatting Demo

![Sass Formatting Demo](images/sass-format-demo.gif)

## Sass Formatter Settings

This extension contributes the following settings:

* `sassFormat.dasherize`: Convert underscores to dashes.
* `sassFormat.indent`: How many spaces to use for each level of indentation. Defaults to 4. "t" means use hard tabs.
* `sassFormat.oldStyle`: Output the old-style ":prop val" property syntax. Only meaningful when formatting Sass.
* `sassFormat.defaultEncoding`: Specify the default encoding for input files. Defaults to "UTF-8".
* `sassFormat.unixNewlines`: Use Unix-style newlines in formatted files. Always true on Unix. This setting is deprecated. Please use "End of Line" setting from VS Code.
* `sassFormat.useSingleQuotes`: Use single quotes. Double quotes in comments will remain untouched.
* `sassFormat.sassPath`: Custom Sass PATH. Example: `"sassFormat.sassPath": "/custom/path/bin"`

## Features Roadmap

* Format Files in Folder
* EditorConfig support
* Sass Lint configuration support
* Code Tests

## Known issues

If you're using [ZSH](http://www.zsh.org/), or if you installed Ruby and Sass via a version manager tool like [rbenv](https://github.com/rbenv/rbenv), [RVM](https://rvm.io/), then you are likely to encounter issues with running `sass-convert` command from VS Code. In this case, please try to use `sassFormat.sassPath` setting where you can define PATH to your sass command line tools.

Additionally, if you're using [Ruby Installer](https://rubyinstaller.org/) please check **Add Ruby executables to the PATH** setting during installation process.

Larger files need some time to be formatted. See below comparison table:

| Lines of Code |         Size |           Execution Time |
| -------------:| ------------:| ------------------------:|
|         1,000 |        19 KB |            0.349 seconds |
|        10,000 |       192 KB |            1.834 seconds |
|        30,000 |       554 KB |            4.945 seconds |
|        60,000 |       1.1 MB |            9.916 seconds |

Note: Above speed results depends on your hardware and operating system.

## Issues

This extension should work on Mac (tested on macOS Sierra 10.12.5), Linux (tested on Ubuntu 17.04) and Windows (tested on Windows 8.1) operating systems. On each operating system for testing purposes I used default setup, default shell and official procedure for installing VS Code and sass command line tools.

Please [create an issue](https://github.com/sjova/vscode-sass-format/issues) if you experience any issue on your setup. Also, I suggest to try always latest version of Sass Formatter extension before report any issue.

Following details will be useful for debugging:

```
Operating system version
VS Code version
Sass Formatter version

$ ruby --version
$ which ruby

$ gem --version
$ which gem

$ sass-convert --version
$ which sass-convert

$ echo $SHELL
$ echo $PATH
$ echo $GEM_PATH

$ cat ~/.bash_profile
$ cat ~/.bash_login
$ cat ~/.profile
```

Also paste me whole output from the Output panel (**View** > **Output** > **Sass Formatter** channel). And paste me whole output from the Developer Tools console (**Help** > **Toggle Developer Tools**).

## Release Notes

### 1.1.1
- Fixed formatting of CSS files
- Ignored `useSingleQuotes` setting for double quotes in comments
- Added `Sass Lint` configuration support in features roadmad
- Updated vscode engine to the latest version (`"vscode": "^1.14.0"`)
- Updated `README.md`

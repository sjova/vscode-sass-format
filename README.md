# Sass Formatter

Sass formatter extension for Visual Studio Code built on top of **sass-convert**. Beautify *sass*, *scss* and *css* files. Currently, only complete documents can be formatted. Formatting selections is planned.

## Requirements

Requires [sass command line tools](http://sass-lang.com/install) to be installed. Tested sass command line tools: **Sass 3.4.23 (Selective Steve)**.

More details about [Sass Syntax](http://sass-lang.com/documentation/file.SASS_REFERENCE.html#syntax) used in this formatter.

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
* `sassFormat.oldStyle`: Output the old-style ":prop val" property syntax. Only meaningful when formatting Sass.
* `sassFormat.defaultEncoding`: Specify the default encoding for input files. **Important Note: This is not well tested, so use it carefully.**
* `sassFormat.unixNewlines`: Use Unix-style newlines in formatted files. Always true on Unix. **Important Note: This is not well tested, so use it carefully.**
* `sassFormat.sassPath`: Custom Sass PATH. Example: `"sassFormat.sassPath": "/custom/path/bin"`

## Coming Soon

* Format Selection
* Additional Settings and Formatting

## Known issues

If you're using [ZSH](http://www.zsh.org/), or if you installed Ruby and Sass via a version manager tool like [rbenv](https://github.com/rbenv/rbenv), [RVM](https://rvm.io/), than you are likely to encounter issues with running `sass-convert` command from VS Code. In this case, please try to use `sassFormat.sassPath` setting where you can define PATH to your sass command line tools.

Additionally, if you're using [Ruby Installer](https://rubyinstaller.org/) please check **Add Ruby executables to the PATH** setting during installation process.

## Issues

This extension should work on Mac (tested on macOS Sierra 10.12.5), Linux (tested Ubuntu 17.04) and Windows (tested on Windows 8.1) operating systems. On each operating system for testing purposes I used default setup, default shell and official procedure for installing VS Code and sass command line tools.

Please [create an issue](https://github.com/sjova/vscode-sass-format/issues) if you experience any issue on your setup.

Following details will be useful for debugging:

```
Operating system version
VS Code version

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

Also paste me whole output from the developer tools console (**Help** > **Toggle Developer Tools**).

## Release Notes

### 1.0.3
- Fixed `Invalid CSS` error (defined `--from` option for each type of formatting)
- Updated `README.md` (updated `Requirements` section, added `Known issues` and `Issues` sections)

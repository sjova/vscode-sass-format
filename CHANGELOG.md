# Change Log
All notable changes to the "vscode-sass-format" extension will be documented in this file.

## [Unreleased]
- tested extension with `Sass 3.5.3`
- updated extension base setup (vscode engine: 1.17.0, build scripts, etc.)
- updated .editorconfig, tslint (matched with vscode setup), updated LICENSE

## [1.1.1] - 2017-07-16
- Fixed formatting of CSS files
- Ignored `useSingleQuotes` setting for double quotes in comments
- Added `Sass Lint` configuration support in features roadmad
- Updated vscode engine to the latest version (`"vscode": "^1.14.0"`)
- Updated `README.md`

## [1.1.0] - 2017-05-27
- Added `Format Selection` support
- Added `useSingleQuotes` setting
- Added support for Unicode characters
- Added output channel `Sass Formatter`
- Better handling errors
- Code refactoring
- Updated `README.md`

## [1.0.3] - 2017-05-22
- Fixed `Invalid CSS` error (defined `--from` option for each type of formatting)
- Updated `README.md` (updated `Requirements` section, added `Known issues` and `Issues` sections)

## [1.0.2] - 2017-05-17
- Added `sassFormat.sassPath` setting
- Fixed `formatOnSave` bug

## [1.0.1] - 2017-05-14
- Prevent text delete if `sass-convert` command is not installed and/or not found, and updated info message
- Updated `README.md` (added notes that `defaultEncoding` and `unixNewlines` settings are not well tested and fixed typo)
- Few small code improvements

## [1.0.0] - 2017-05-14
- Initial release

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sasa Jovanovic. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

"use strict";

import { execSync } from "child_process";
import { extname } from "path";

import {
	DocumentFormattingEditProvider,
	DocumentRangeFormattingEditProvider,
	OutputChannel,
	Position,
	Range,
	TextDocument,
	TextEdit,
	window,
	workspace
} from "vscode";

import { SassConvert, sassConvertErrorMessage } from "./sassConvertService";

/**
 * Sass Formatter Edit Provider
 * @constructor
 * @param {OutputChannel} _outputChannel - output channel
 * @param {SassConvert} _sassConvert - Sass Convert Service
 */
export class SassFormatterEditProvider
	implements
		DocumentFormattingEditProvider,
		DocumentRangeFormattingEditProvider {
	constructor(
		private _outputChannel: OutputChannel,
		private _sassConvert: SassConvert
	) {}

	/** Provide formatting edits for a whole document */
	public provideDocumentFormattingEdits(document: TextDocument): TextEdit[] {
		return this._getTextEdit(document);
	}

	/** Provide formatting edits for a range in a document */
	public provideDocumentRangeFormattingEdits(
		document: TextDocument,
		range: Range
	): TextEdit[] {
		return this._getTextEdit(document, range);
	}

	/**
	 * Get Text Edit
	 * @param {TextDocument} document
	 * @param {Range} range - optional
	 */
	private _getTextEdit(document: TextDocument, range?: Range): TextEdit[] {
		const optionFormatOnPaste = workspace
			.getConfiguration("editor", null)
			.get<boolean>("formatOnPaste");

		let result: TextEdit[] = [];
		let text: string;

		if (range === undefined || optionFormatOnPaste) {
			text = document.getText();

			let rangeStart: Position = document.lineAt(0).range.start;
			let rangeEnd: Position = document.lineAt(document.lineCount - 1)
				.range.end;

			range = new Range(rangeStart, rangeEnd);
		} else {
			text = document.getText(range);
		}

		let extName = extname(document.uri.fsPath);
		let newText: string = this._formatSass(text, extName);

		if (newText) {
			result.push(TextEdit.replace(range, newText));
		}

		return result;
	}

	/**
	 * Format Sass
	 * @param {string} text
	 * @param {string} extName
	 */
	private _formatSass(text: string, extName: string): string {
		const optionUseSingleQuotes = workspace
			.getConfiguration("sassFormat")
			.get<boolean>("useSingleQuotes");
		const optionInlineComments = workspace
			.getConfiguration("sassFormat")
			.get<boolean>("inlineComments");
		const optionNumberLeadingZero = workspace
			.getConfiguration("sassFormat")
			.get<boolean>("numberLeadingZero");

		let result: string | any;

		let sassConvertOptions = this._getSassConvertOptions(extName);

		let sassConvertFormatCommand = `${
			this._sassConvert.sassConvertCommand
		} ${sassConvertOptions}`;

		try {
			if (optionInlineComments) {
				// Inline CSS comment regex
				const inlineCSSCommentRegex = /([;{}]+[ \t]*)(\/\/|\/\*)(.*)$/gm;

				// Mark inline CSS comments, so we can move them back after sass-convert
				text = text.replace(
					inlineCSSCommentRegex,
					"$1$2---vscode-sass-format-end-of-inline-comment---$3"
				);
			}

			result = execSync(sassConvertFormatCommand, {
				encoding: "utf8",
				input: text
			});

			if (optionInlineComments) {
				// Marked inline CSS comment regex
				const markedInlineCSSCommentRegex = /(\s+)(\/\/|\/\*)(---vscode-sass-format-end-of-inline-comment---)(.*)/gm;

				// Restore inline CSS comments
				result = result.replace(markedInlineCSSCommentRegex, " $2$4");

				// Cleanup unmatched comments
				// Example // appeared inside of block comment
				result = result.replace(
					"//---vscode-sass-format-end-of-inline-comment---",
					"//"
				);
				result = result.replace(
					"/*---vscode-sass-format-end-of-inline-comment---",
					"/*"
				);
			}

			if (optionUseSingleQuotes) {
				// Default CSS comment regex
				// https://developer.mozilla.org/en-US/docs/Web/CSS/Comments
				// const defaultCSSCommentRegex = /\/\*[^\/\*]+\*\//g; // Log for testing
				const defaultCSSCommentRegex = /\/\*(\*(?!\/)|[^*])*\*\//g;

				// Sass single line comment regex
				// http://sass-lang.com/documentation/file.SCSS_FOR_SASS_USERS.html#Comments
				const sassSingleLineCommentRegex = /\/\/.+/g;
				// const sassSingleLineCommentRegex = /^\/\/.+/gm; // always match from the beginning (Log for testing)
				const doubleQuotePlaceholder =
					"VSCODE_SASS_FORMAT_DOUBLE_QUOTE_PLACEHOLDER";

				// Replace double quotes with placeholder in all default CSS/Sass comments
				result = result.replace(
					defaultCSSCommentRegex,
					(match: string) => {
						return match.replace(/"/g, doubleQuotePlaceholder);
					}
				);

				// Replace double quotes with placeholder in all Sass single line comments (Experimental Support)
				result = result.replace(
					sassSingleLineCommentRegex,
					(match: string) => {
						return match.replace(/"/g, doubleQuotePlaceholder);
					}
				);

				// Replace all double quotes with single quotes
				result = result.replace(/"/g, "'");

				// Revert all double quotes from comments
				result = result.replace(
					new RegExp(doubleQuotePlaceholder, "g"),
					'"'
				);
			}

			if (!optionNumberLeadingZero) {
				result = result.replace(/( 0\.)(\d)+/g, " .$2");
			}
		} catch (error) {
			window.showErrorMessage(sassConvertErrorMessage);

			this._outputChannel.append(this._sassConvert.formatError(error));
			this._outputChannel.show();

			console.error(
				`${this._sassConvert.sassConvertCommand}:`,
				error.toString("utf8").trim()
			);

			result = null;
		}

		return result;
	}

	/**
	 * Get Sass Convert Options
	 * @param {string} text
	 */
	private _getSassConvertOptions(extName: string): string {
		const optionDasherize = workspace
			.getConfiguration("sassFormat")
			.get<boolean>("dasherize");
		const optionIndent = workspace
			.getConfiguration("sassFormat")
			.get<number | string>("indent");
		// const optionOldStyle = workspace.getConfiguration('sassFormat').get<boolean>("oldStyle"); // deprecated
		const optionDefaultEncoding = workspace
			.getConfiguration("sassFormat")
			.get<string>("defaultEncoding");
		const optionUnixNewlines = workspace
			.getConfiguration("sassFormat")
			.get<boolean>("unixNewlines");

		let sassConvertOptions: string = "";

		// Common Options

		if (extName === ".scss") {
			sassConvertOptions += "--from scss --to scss";
		}

		if (extName === ".sass") {
			sassConvertOptions += "--from sass --to sass";
		}

		if (extName === ".css") {
			// sassConvertOptions += '--from css --to scss';
			sassConvertOptions += "--from scss --to scss";
		}

		// Style

		if (optionDasherize) {
			sassConvertOptions += " --dasherize";
		}

		sassConvertOptions += ` --indent ${optionIndent}`;

		// deprecated
		// if (optionOldStyle) {
		// 	sassConvertOptions += ' --old';
		// }

		// Input and Output

		sassConvertOptions += " --stdin";

		sassConvertOptions += ` --default-encoding ${optionDefaultEncoding}`;

		if (optionUnixNewlines) {
			// sassConvertOptions += ' --unix-newlines';
			window.showInformationMessage(
				'sassFormat.unixNewlines setting is deprecated. Please use "End of Line" setting from VS Code.'
			);
		}

		// Miscellaneous

		sassConvertOptions += " --no-cache --quiet";

		return sassConvertOptions;
	}
}

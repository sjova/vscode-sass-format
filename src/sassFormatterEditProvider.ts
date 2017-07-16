/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sasa Jovanovic. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { execSync } from 'child_process';
import { extname } from 'path';

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
} from 'vscode';

import { SassConvert, sassConvertErrorMessage } from './sassConvertService';

/**
 * Sass Formatter Edit Provider
 * @constructor
 * @param {OutputChannel} _outputChannel - output channel
 * @param {SassConvert} _sassConvert - Sass Convert Service
 */
export class SassFormatterEditProvider implements DocumentFormattingEditProvider, DocumentRangeFormattingEditProvider {

	constructor(private _outputChannel: OutputChannel, private _sassConvert: SassConvert) { }

	/** Provide formatting edits for a whole document */
	public provideDocumentFormattingEdits(document: TextDocument): TextEdit[] {
		return this._getTextEdit(document);
	}

	/** Provide formatting edits for a range in a document */
	public provideDocumentRangeFormattingEdits(document: TextDocument, range: Range): TextEdit[] {
		return this._getTextEdit(document, range);
	}

	/**
	 * Get Text Edit
	 * @param {TextDocument} document
	 * @param {Range} range - optional
	 */
	private _getTextEdit(document: TextDocument, range?: Range): TextEdit[] {
		let result: TextEdit[] = [];
		let text: string;

		if (range === undefined) {
			text = document.getText();

			let rangeStart: Position = document.lineAt(0).range.start;
			let rangeEnd: Position = document.lineAt(document.lineCount - 1).range.end;

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
		const optionUseSingleQuotes = workspace.getConfiguration('sassFormat').get<boolean>("useSingleQuotes");

		let result: string;

		let sassConvertOptions = this._getSassConvertOptions(extName);

		let sassConvertFormatCommand = `${this._sassConvert.sassConvertCommand} ${sassConvertOptions}`;

		try {
			result = execSync(sassConvertFormatCommand, { encoding: 'utf8', input: text });

			if (optionUseSingleQuotes) {
				result = result.replace(/"/g, '\'');
			}

		} catch (error) {
			window.showErrorMessage(sassConvertErrorMessage);

			this._outputChannel.append(this._sassConvert.formatError(error));
			this._outputChannel.show();

			console.error(`${this._sassConvert.sassConvertCommand}:`, error.toString('utf8').trim());

			result = null;
		}

		return result;
	}

	/**
	 * Get Sass Convert Options
	 * @param {string} text
	 */
	private _getSassConvertOptions(extName: string): string {
		const optionDasherize = workspace.getConfiguration('sassFormat').get<boolean>("dasherize");
		const optionIndent = workspace.getConfiguration('sassFormat').get<number | string>("indent");
		const optionOldStyle = workspace.getConfiguration('sassFormat').get<boolean>("oldStyle");
		const optionDefaultEncoding = workspace.getConfiguration('sassFormat').get<string>("defaultEncoding");
		const optionUnixNewlines = workspace.getConfiguration('sassFormat').get<boolean>("unixNewlines");

		let sassConvertOptions: string = '';

		// Common Options

		if (extName === '.scss') {
			sassConvertOptions += '--from scss --to scss';
		}

		if (extName === '.sass') {
			sassConvertOptions += '--from sass --to sass';
		}

		if (extName === '.css') {
			// sassConvertOptions += '--from css --to scss';
			sassConvertOptions += '--from scss --to scss';
		}

		// Style

		if (optionDasherize) {
			sassConvertOptions += ' --dasherize';
		}

		sassConvertOptions += ` --indent ${optionIndent}`;

		if (optionOldStyle) {
			sassConvertOptions += ' --old';
		}

		// Input and Output

		sassConvertOptions += ' --stdin';

		sassConvertOptions += ` --default-encoding ${optionDefaultEncoding}`;

		if (optionUnixNewlines) {
			// sassConvertOptions += ' --unix-newlines';
			window.showInformationMessage('sassFormat.unixNewlines setting is deprecated. Please use "End of Line" setting from VS Code.');
		}

		// Miscellaneous

		sassConvertOptions += ' --no-cache --quiet';

		return sassConvertOptions;
	}

}

'use strict';

import { execSync } from 'child_process';

import {
	ExtensionContext,
	Disposable,
	DocumentSelector,
	languages,
	window,
	DocumentFormattingEditProvider,
	TextDocument,
	TextEdit,
	Position,
	Range,
	workspace
} from 'vscode';

const sassConvertCommand: string = 'sass-convert'; // `Sass Formatter` dependency
const sassConvertMissingCommandMessage: string = 'Please install the sass command line tools from http://sass-lang.com/install if you want to use Sass Formatter extension.';

export function activate(context: ExtensionContext): void {
	// Sass Format
	context.subscriptions.push(registerSassFormat());
}

function registerSassFormat(): Disposable {
	checkDependencies();

	const sassSelectors: DocumentSelector = ['scss', 'sass', 'css'];

	return languages.registerDocumentFormattingEditProvider(sassSelectors, new SassFormatEditProvider);
}

function checkDependencies(): void {
	try {
		let sassConvertVersion: string = execSync(`${sassConvertCommand} --version`).toString();
		console.log(`${sassConvertCommand} version:`, sassConvertVersion);
	} catch (error) {
		console.log(`${sassConvertCommand} error:`, error);
		window.showInformationMessage(sassConvertMissingCommandMessage);
	}
}

class SassFormatEditProvider implements DocumentFormattingEditProvider {

	provideDocumentFormattingEdits(document: TextDocument): TextEdit[] {
		let result: TextEdit[] = [];

		let newText: string = this.formatSass(document);

		if (newText) {
			let rangeStart: Position = document.lineAt(0).range.start;
			let rangeEnd: Position = document.lineAt(document.lineCount - 1).range.end;
			let range: Range = new Range(rangeStart, rangeEnd);

			result.push(TextEdit.replace(range, newText));
		}

		return result;
	}

	formatSass(document: TextDocument): string {
		let result: string;

		let sassConvertOptions = this.getSassConvertOptions(document);

		let inputFile = document.uri.fsPath;

		let sassConvertFormatCommand = `${sassConvertCommand} ${sassConvertOptions} ${inputFile}`;

		// console.log('sassConvertFormatCommand:', sassConvertFormatCommand);

		try {
			result = execSync(sassConvertFormatCommand, { encoding: 'utf8' });
		} catch (error) {
			console.log(`${sassConvertCommand} error:`, error);
			window.showInformationMessage(sassConvertMissingCommandMessage);

			result = null;
		}

		// console.log('Formatted sass:', result);

		return result;
	}

	getSassConvertOptions(document: TextDocument): string {
		const optionDasherize = workspace.getConfiguration('sassFormat').get<boolean>("dasherize");
		const optionIndent = workspace.getConfiguration('sassFormat').get<number | string>("indent");
		const optionOldStyle = workspace.getConfiguration('sassFormat').get<boolean>("oldStyle");
		const optionDefaultEncoding = workspace.getConfiguration('sassFormat').get<string>("defaultEncoding");
		const optionUnixNewlines = workspace.getConfiguration('sassFormat').get<boolean>("unixNewlines");

		let sassConvertOptions: string = '';

		let fsPath = document.uri.fsPath;

		// Common Options

		if (fsPath.endsWith('.scss') || fsPath.endsWith('.css')) {
			sassConvertOptions += '--to scss';
		}

		if (fsPath.endsWith('.sass')) {
			sassConvertOptions += '--to sass';
		}

		// Style

		if (optionDasherize) {
			sassConvertOptions += ' --dasherize';
		}

		sassConvertOptions += ` --indent ${optionIndent}`;

		if (optionOldStyle) {
			sassConvertOptions += ' --old';
		}

		// Input and Output (TODO: revisit these two options)

		if (optionDefaultEncoding !== 'default') {
			sassConvertOptions += ` --default-encoding ${optionDefaultEncoding}`;
		}

		if (optionUnixNewlines) {
			sassConvertOptions += ' --unix-newlines';
		}

		// Miscellaneous

		sassConvertOptions += ' --no-cache --quiet';

		return sassConvertOptions;
	}

}

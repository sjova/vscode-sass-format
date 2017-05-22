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

const sassConvertCommandDefault: string = 'sass-convert'; // `Sass Formatter` dependency;
let sassConvertCommand: string = sassConvertCommandDefault;

const sassConvertMissingCommandMessage: string = 'Please install the sass command line tools from http://sass-lang.com/install if you want to use Sass Formatter extension.';
const sassConvertInvalidSassPathMessage: string = 'The sassPath setting is not valid.';

export function activate(context: ExtensionContext): void {
	updateSassPath();
	workspace.onDidChangeConfiguration(updateSassPath);

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
		showInformationMessage();
	}
}

function updateSassPath(): void {
	let optionSassPath = workspace.getConfiguration('sassFormat').get<string>("sassPath");

	if (optionSassPath) {
		if (optionSassPath.endsWith('/')) {
			optionSassPath = optionSassPath.slice(0, -1);
		}

		sassConvertCommand = optionSassPath + '/' + sassConvertCommandDefault;
	} else {
		sassConvertCommand = sassConvertCommandDefault;
	}
}

function showInformationMessage(): void {
	if (sassConvertCommand !== sassConvertCommandDefault) {
		window.showInformationMessage(sassConvertInvalidSassPathMessage);
	} else {
		window.showInformationMessage(sassConvertMissingCommandMessage);
	}
}

class SassFormatEditProvider implements DocumentFormattingEditProvider {

	provideDocumentFormattingEdits(document: TextDocument): TextEdit[] {
		let result: TextEdit[] = [];

		let text = document.getText();

		let newText: string = this.formatSass(text, document.uri.fsPath);

		if (newText) {
			let rangeStart: Position = document.lineAt(0).range.start;
			let rangeEnd: Position = document.lineAt(document.lineCount - 1).range.end;
			let range: Range = new Range(rangeStart, rangeEnd);

			result.push(TextEdit.replace(range, newText));
		}

		return result;
	}

	formatSass(text: string, fsPath: string): string {
		let result: string;

		let sassConvertOptions = this.getSassConvertOptions(fsPath);

		let sassConvertFormatCommand = `${sassConvertCommand} ${sassConvertOptions}`;

		// console.log('sassConvertFormatCommand:', sassConvertFormatCommand);

		try {
			result = execSync(sassConvertFormatCommand, { encoding: 'utf8', input: text });
		} catch (error) {
			console.log(`${sassConvertCommand} error:`, error);
			showInformationMessage();

			result = null;
		}

		// console.log('Formatted sass:', result);

		return result;
	}

	getSassConvertOptions(fsPath: string): string {
		const optionDasherize = workspace.getConfiguration('sassFormat').get<boolean>("dasherize");
		const optionIndent = workspace.getConfiguration('sassFormat').get<number | string>("indent");
		const optionOldStyle = workspace.getConfiguration('sassFormat').get<boolean>("oldStyle");
		const optionDefaultEncoding = workspace.getConfiguration('sassFormat').get<string>("defaultEncoding");
		const optionUnixNewlines = workspace.getConfiguration('sassFormat').get<boolean>("unixNewlines");

		let sassConvertOptions: string = '';

		// Common Options

		if (fsPath.endsWith('.scss') || fsPath.endsWith('.css')) {
			sassConvertOptions += '--from scss --to scss';
		}

		if (fsPath.endsWith('.sass')) {
			sassConvertOptions += '--from sass --to sass';
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

		// TODO: revisit this option
		if (optionDefaultEncoding !== 'default') {
			sassConvertOptions += ` --default-encoding ${optionDefaultEncoding}`;
		}

		// TODO: revisit this option
		if (optionUnixNewlines) {
			sassConvertOptions += ' --unix-newlines';
		}

		// Miscellaneous

		sassConvertOptions += ' --no-cache --quiet';

		return sassConvertOptions;
	}

}

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

export function activate(context: ExtensionContext): void {
	// Sass Format
	context.subscriptions.push(registerSassFormat());
}

function registerSassFormat(): Disposable {
	checkDependencies();

	const sassSelector: DocumentSelector = ['scss', 'sass', 'css'];

	return languages.registerDocumentFormattingEditProvider(sassSelector, new SassFormatEditProvider);
}

function checkDependencies(): void {
	try {
		execSync('sass-convert --version');
	} catch (error) {
		window.showInformationMessage('Please install the sass command line tool from http://sass-lang.com/install');
	}
}

class SassFormatEditProvider implements DocumentFormattingEditProvider {

	provideDocumentFormattingEdits(document: TextDocument): TextEdit[] {
		let result: TextEdit[] = [];

		let rangeStart: Position = document.lineAt(0).range.start;
		let rangeEnd: Position = document.lineAt(document.lineCount - 1).range.end;
		let range: Range = new Range(rangeStart, rangeEnd);

		let newText: string = this.formatSass(document);

		result.push(TextEdit.replace(range, newText));

		// window.showInformationMessage('Sass Format was successful!');

		return result;
	}

	formatSass(document: TextDocument): string {
		let result: string;

		let sassConvertOptions = this.getSassConvertOptions(document);

		let inputFile = document.uri.fsPath;

		let sassConvertCommand = `sass-convert ${sassConvertOptions} ${inputFile}`;

		// console.log(sassConvertCommand);

		try {
			result = execSync(sassConvertCommand, { encoding: 'utf8' });
		} catch (error) {
			result = null;
		}

		// console.log(result);

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

		// Input and Output

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

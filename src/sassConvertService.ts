/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sasa Jovanovic. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { execSync } from 'child_process';

import {
	OutputChannel,
	window,
	workspace
} from 'vscode';

const sassConvertCommandDefault: string = 'sass-convert';

export const sassConvertMissingCommandMessage: string = 'Please install the sass command line tools from http://sass-lang.com/install if you want to use Sass Formatter extension.';
export const sassConvertInvalidSassPathMessage: string = 'The sassPath setting is not valid.';
export const sassConvertErrorMessage: string = 'There was an error formatting your file. See Output panel for more details.';

export interface SassConvert {
	sassConvertCommand: string;
	setSassConvertCommand(): any;
	formatError(error: any): string;
}

/**
 * Sass Convert Service
 * @constructor
 * @param {OutputChannel} _outputChannel - output channel
 */
export class SassConvertService implements SassConvert {
	public sassConvertCommand: string;

	constructor(private _outputChannel: OutputChannel) {
		this.setSassConvertCommand();
		this._checkSassConvert();
	}

	/** Check Sass Convert */
	private _checkSassConvert(): void {
		try {
			let sassConvertVersion: string = execSync(`${this.sassConvertCommand} --version`).toString('utf8').trim();

			this._outputChannel.appendLine(sassConvertVersion);

			console.info(`${this.sassConvertCommand} version:`, sassConvertVersion);
		} catch (error) {
			if (this.sassConvertCommand !== sassConvertCommandDefault) {
				window.showWarningMessage(sassConvertInvalidSassPathMessage)
			} else {
				window.showWarningMessage(sassConvertMissingCommandMessage);
			}

			this._outputChannel.append(this.formatError(error));
			this._outputChannel.show();

			console.warn(`${this.sassConvertCommand} warn:`, error.toString('utf8').trim());
		}
	}

	/** Set Sass Convert Command */
	public setSassConvertCommand(): any {
		let configurationSassPath = workspace.getConfiguration('sassFormat').get<string>("sassPath");

		if (configurationSassPath) {
			if (configurationSassPath.endsWith('/')) {
				configurationSassPath = configurationSassPath.slice(0, -1);
			}

			this.sassConvertCommand = configurationSassPath + '/' + sassConvertCommandDefault;
		} else {
			this.sassConvertCommand = sassConvertCommandDefault;
		}
	}

	/**
	 * Format Error
	 * @param {any} error
	 */
	public formatError(error: any): string {
		let formattedError: string = error.toString('utf8').trim();

		formattedError = formattedError.split('\n').slice(1).join('\n');
		formattedError = formattedError.replace('Use --trace for backtrace.', '');
		formattedError = formattedError.replace('Use --trace for backtrace', '');
		formattedError = formattedError.trim();
		formattedError += '\n';

		return formattedError;
	}

}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sasa Jovanovic. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

"use strict";

import {
	Disposable,
	DocumentSelector,
	ExtensionContext,
	OutputChannel,
	languages,
	window,
	workspace
} from "vscode";

import { SassConvertService, SassConvert } from "./sassConvertService";
import { SassFormatterEditProvider } from "./sassFormatterEditProvider";

const sassSelector: DocumentSelector = ["scss", "sass", "css"];

/** Extension Activate */
export function activate(context: ExtensionContext): void {
	const outputChannel: OutputChannel = window.createOutputChannel(
		"Sass Formatter"
	);
	const sassConvert: SassConvert = new SassConvertService(outputChannel);
	const sassFormatEditProvider = new SassFormatterEditProvider(
		outputChannel,
		sassConvert
	);

	const disposables: Disposable[] = [
		languages.registerDocumentFormattingEditProvider(
			sassSelector,
			sassFormatEditProvider
		),
		languages.registerDocumentRangeFormattingEditProvider(
			sassSelector,
			sassFormatEditProvider
		),
		outputChannel
	];

	workspace.onDidChangeConfiguration(sassConvert.setSassConvertCommand);

	context.subscriptions.push(...disposables);
}

export function deactivate() {}

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import fetch from 'node-fetch';
import * as vscode from 'vscode';
import { MolecularSimulationVisualizerPanel } from "./panels/MolecularSimulationVisualizerPanel";
const path = require('node:path');

export async function activate(context: vscode.ExtensionContext) {

	const helloCommand = vscode.commands.registerCommand("msv.start", () => {
		showInputBox().then((accession) => {
			console.log(accession);
			MolecularSimulationVisualizerPanel.render(context.extensionUri, accession);
		});
	});

	const activateFromFiles = vscode.commands.registerCommand("msv.activateFromFiles", (file_uri: vscode.Uri, selectedFiles: vscode.Uri[]) => {
		console.log(file_uri);
		console.log(selectedFiles);
		MolecularSimulationVisualizerPanel.renderFromFiles(context.extensionUri, selectedFiles);
	});

	const activateFromFolder = vscode.commands.registerCommand("msv.activateFromFolder", (folder_uri: vscode.Uri) => {
		vscode.workspace.findFiles(`${vscode.workspace.asRelativePath(folder_uri)}/*.pdb`).then((files_uri) => {
			MolecularSimulationVisualizerPanel.renderFromFiles(context.extensionUri, files_uri)
		});
	});

	const ESMFold = vscode.commands.registerCommand("msv.ESMFold", () => {
		showSequenceInputBox().then((sequence) => {
			const uri = getfold(sequence).then((pdb) => {
				writeFoldToFile(pdb).then(
					async (file_uri) => {
						console.log(file_uri);
						MolecularSimulationVisualizerPanel.renderFromFiles(context.extensionUri, [vscode.Uri.file(file_uri)]);
					}
				)
			})

		});
	});
	//context.subscriptions.push(...[helloCommand, activateFromFile]);
	context.subscriptions.push(helloCommand);
	context.subscriptions.push(activateFromFiles);
	context.subscriptions.push(activateFromFolder);
	context.subscriptions.push(ESMFold);
}

// this method is called when your extension is deactivated
// export function deactivate() {}

async function showInputBox() {
	const accession = await vscode.window.showInputBox({
		value: '',
		placeHolder: 'Enter a PDB or AlphaFoldDB (UniProt) accession',
	});
	return accession;
}

async function showSequenceInputBox() {
	const sequence = await vscode.window.showInputBox({
		value: '',
		placeHolder: 'Enter a protein sequence for ESMFold',
	});
	return sequence;
}

async function writeFoldToFile(file_contents: string) {
	const time = new Date().getTime();
	const fname = "/esmfold_" + time.toString() + ".pdb";

	const setting: vscode.Uri = vscode.Uri.parse("untitled:" + vscode.workspace.rootPath + fname);
	await vscode.workspace.openTextDocument(setting).then((a: vscode.TextDocument) => {
		vscode.window.showTextDocument(a, 1, false).then(e => {
			e.edit(edit => {
				edit.insert(new vscode.Position(0, 0), file_contents);
				a.save();
			});
		});
	});

	console.log("wrote to test file.");
	console.log(setting);
	return setting.fsPath;
}


async function getfold(sequence: string | undefined) {
	const url = "https://api.esmatlas.com/foldSequence/v1/pdb/";

	console.log(sequence);
	const response = await fetch(url, {
		method: 'POST',
		body: sequence,
	})

	const body = await response.text();
	return body
}

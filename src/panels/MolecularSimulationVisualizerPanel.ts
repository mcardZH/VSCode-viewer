import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class MolecularSimulationVisualizerPanel {
  public static currentPanel: MolecularSimulationVisualizerPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private _disposed: boolean = false;

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, loadCommand: string | undefined, clickedFiles: vscode.Uri[] | undefined) {
    this._panel = panel;
    this._panel.onDidDispose(this.dispose, null, this._disposables);
    if (loadCommand != undefined) {
      this._panel.webview.html = this._getWebviewContent(panel.webview, extensionUri, loadCommand);
    };

    if (clickedFiles != undefined) {
      this._panel.webview.html = this._getWebviewContentForFiles(panel.webview, extensionUri, clickedFiles);
    };

  }

  public static render(extensionUri: vscode.Uri, accession: string | undefined) {
    const windowName = "Molecular Simulation Visualizer - " + accession;
    const panel = vscode.window.createWebviewPanel("msv", windowName, vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true
    });
    if (accession?.length === 4) {
      var loadCommand = `
        plugin.builders.data.download({ url: 'https://www.ebi.ac.uk/pdbe/static/entry/${accession}_updated.cif', isBinary: false })
          .then(data => plugin.builders.structure.parseTrajectory(data, 'mmcif'))
          .then(trajectory => plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default'));
      `;
    } else {
      var loadCommand = `
        plugin.builders.data.download({ url: 'https://alphafold.ebi.ac.uk/files/AF-${accession}-F1-model_v4.cif', isBinary: false })
          .then(data => plugin.builders.structure.parseTrajectory(data, 'mmcif'))
          .then(trajectory => plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default'));
      `;
    }
    MolecularSimulationVisualizerPanel.currentPanel = new MolecularSimulationVisualizerPanel(panel, extensionUri, loadCommand, undefined);
  }

  public static renderFromFiles(extensionUri: vscode.Uri, clickedFiles: vscode.Uri[]) {
    const fnames = clickedFiles.map((clickedFile) => clickedFile.path.split('/').pop());
    const windowName = "Molecular Simulation Visualizer - " + fnames.join(" - ");
    const panel = vscode.window.createWebviewPanel("msv", windowName, vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true
    });

    MolecularSimulationVisualizerPanel.currentPanel = new MolecularSimulationVisualizerPanel(panel, extensionUri, undefined, clickedFiles);
  }

  public dispose() {
    // 防止重复销毁
    if (this._disposed) {
      return;
    }
    this._disposed = true;

    MolecularSimulationVisualizerPanel.currentPanel = undefined;

    // 只有在 panel 存在且未被销毁时才调用 dispose
    if (this._panel) {
      try {
        this._panel.dispose();
      } catch (error) {
        console.warn('Error disposing panel:', error);
      }
    }

    // 清理所有可销毁的资源
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        try {
          disposable.dispose();
        } catch (error) {
          console.warn('Error disposing resource:', error);
        }
      }
    }
  }

  private _loadTemplate(extensionUri: vscode.Uri, templateName: string, replacements: Record<string, string>): string {
    const templatePath = path.join(extensionUri.fsPath, 'src', 'templates', templateName);
    let template = fs.readFileSync(templatePath, 'utf-8');
    
    // 替换模板中的占位符
    for (const [key, value] of Object.entries(replacements)) {
      const placeholder = `{{${key}}}`;
      template = template.replace(new RegExp(placeholder, 'g'), value);
    }
    
    return template;
  }

  private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri, loadCommand: string | undefined) {
    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', 'molstar', 'build/viewer', 'molstar.css'));
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', 'molstar', 'build/viewer', 'molstar.js'));
    const pluginUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'mol-plugin', 'dist', 'index.js'));
    
    const replacements = {
      'CSS_URI': cssUri.toString(),
      'JS_URI': jsUri.toString(),
      'PLUGIN_URI': pluginUri.toString(),
      'LOAD_COMMAND': loadCommand || ''
    };

    return this._loadTemplate(extensionUri, 'webview-template.html', replacements);
  }

  private _getWebviewContentForFiles(webview: vscode.Webview, extensionUri: vscode.Uri, clickedFiles: vscode.Uri[]) {
    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', 'molstar', 'build/viewer', 'molstar.css'));
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', 'molstar', 'build/viewer', 'molstar.js'));
    const pluginUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'mol-plugin', 'dist', 'index.js'));
    const pdbContents = clickedFiles.map((clickedFile) => webview.asWebviewUri(clickedFile));
    const extensions = clickedFiles.map((clickedFile) => clickedFile.path.split('.').pop()?.toLocaleLowerCase());
    let loadCommands: String[] = [];
    
    for (let i = 0; i < pdbContents.length; i++) {
      const pdbContent = pdbContents[i];
      var extension = extensions[i];
      console.log(extension);
      if (extension === 'cif' || extension === 'mmCIF' || extension === 'CIF' || extension === 'MMCIF' || extension == '.mCIF' || extension == '.mcif') {
        extension = 'mmcif';
      }
      console.log(extension);
      loadCommands.push(`
        plugin.builders.data.download({ url: '${pdbContent}', isBinary: false })
          .then(data => plugin.builders.structure.parseTrajectory(data, '${extension}'))
          .then(trajectory => plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default'));
      `);
    }

    const replacements = {
      'CSS_URI': cssUri.toString(),
      'JS_URI': jsUri.toString(),
      'PLUGIN_URI': pluginUri.toString(),
      'LOAD_COMMANDS': loadCommands.join("")
    };

    return this._loadTemplate(extensionUri, 'webview-files-template.html', replacements);
  }
}

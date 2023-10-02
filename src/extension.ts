import * as vscode from "vscode";
import { FILE_IDENTIFY } from "./constants";
import { AST } from "./utils/ast";
import { V2AST } from "./utils/V2ast";

const handleFileSave = (textDocument: vscode.TextDocument) => {
  const { languageId, uri } = textDocument;
  if (FILE_IDENTIFY.includes(languageId)) {
    const edit = new vscode.WorkspaceEdit();
    const document = textDocument.getText();
    const ast = new AST(document);
    const code = ast.run();
    if (code) {
      edit.replace(
        uri,
        new vscode.Range(
          0,
          0,
          textDocument.lineCount - 1,
          textDocument.lineAt(textDocument.lineCount - 1).text.length
        ),
        code
      );
      vscode.workspace.applyEdit(edit);
      // setTimeout(() => {
      //   vscode.window.activeTextEditor?.document.save();
      //   vscode.window.showWarningMessage("success。");
      // }, 300);
    }
  }
};

const V2handleFileSave = (textDocument: vscode.TextDocument) => {
  const { languageId, uri } = textDocument;
  if (FILE_IDENTIFY.includes(languageId)) {
    const edit = new vscode.WorkspaceEdit();
    const document = textDocument.getText();
    const ast = new V2AST(document);
    const code = ast.run();
    // debugger;
    if (code) {
      edit.replace(
        uri,
        new vscode.Range(
          0,
          0,
          textDocument.lineCount - 1,
          textDocument.lineAt(textDocument.lineCount - 1).text.length
        ),
        code
      );
      vscode.workspace.applyEdit(edit);
      // setTimeout(() => {
      //   vscode.window.activeTextEditor?.document.save();
      //   vscode.window.showWarningMessage("success。");
      // }, 300);
    }
  }
};

export function activate(context: vscode.ExtensionContext) {
  // vscode.workspace.onDidSaveTextDocument(handleFileSave);
  vscode.workspace.onDidSaveTextDocument(V2handleFileSave);
}

export function deactivate() {}

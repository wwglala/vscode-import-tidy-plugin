import { ImportDeclaration, Project, SourceFile } from "ts-morph";

export class V2AST {
  public content: string;
  private ast: SourceFile;

  constructor(content: string) {
    this.content = content;
    const project = new Project();
    this.ast = project.createSourceFile("example.ts", content);
  }

  setPriority(node: ImportDeclaration) {
    const fromValue = node.getModuleSpecifierValue();
    if (fromValue === "react") {
      node.setOrder(0);
      return;
    }
    if (!node.getDefaultImport() && node.getNamedImports().length !== 0) {
      node.setOrder(1);
      return;
    }
    if (node.getDefaultImport() && node.getNamedImports().length !== 0) {
      node.setOrder(2);
      return;
    }

    if (node.getDefaultImport() && node.getNamedImports().length === 0) {
      node.setOrder(3);
      return;
    }
    node.setOrder(4);
  }

  traverse() {
    const imports = this.ast.getImportDeclarations();

    imports.forEach((node) => {
      this.setPriority(node);
    });
  }

  run() {
    this.traverse();

    return this.ast.getText();
  }
}

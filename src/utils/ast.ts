import { ParseResult, parse } from "@babel/parser";
import * as types from "@babel/types";
import traverse, { NodePath } from "@babel/traverse";
import generate from "@babel/generator";

export class AST {
  public content: string;
  private ast: ParseResult<types.File>;

  private allImports: NodePath<types.ImportDeclaration>[] = [];
  private body: types.Statement[] = [];
  constructor(content: string) {
    this.content = content;
    this.ast = parse(content, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
      tokens: true,
    });
  }

  traverse(ast: ParseResult<types.File>) {
    traverse(ast, {
      Program: (path) => {
        // debugger;

        this.body = path.node.body;
      },
      ImportDeclaration: (path) => {
        this.allImports.push(path);
      },
    });
  }

  marking(n: types.ImportDeclaration) {
    const utils = [
      (node: types.ImportDeclaration) => node.source.value === "react",
      (node: types.ImportDeclaration) =>
        Boolean(node.specifiers.length) &&
        node.specifiers.every((n) => n.type === "ImportSpecifier"),
      (node: types.ImportDeclaration) =>
        Boolean(node.specifiers.length) &&
        node.specifiers.some((n) => n.type === "ImportSpecifier"),
      (node: types.ImportDeclaration) =>
        Boolean(node.specifiers.length) &&
        node.specifiers.every((n) => n.type === "ImportDefaultSpecifier"),
      (node: types.ImportDeclaration) => Boolean(node.specifiers.length === 0),
    ];

    for (let i = 0; i < utils.length; i++) {
      const boolean = utils[i](n);
      if (boolean === true) {
        return i;
      }
    }

    return Infinity;
  }

  validSort(index: number[]) {
    if (index.length === 0 || index.length === 1) {
      return true;
    }
    for (let i = 1; i < index.length; i++) {
      if (index[i] < index[i - 1]) {
        return false;
      }
    }

    return true;
  }

  run() {
    this.traverse(this.ast);
    const nodesMark = this.allImports.map((n) => ({
      index: this.marking(n.node),
      path: n,
    }));

    const orderly = this.validSort(nodesMark.map((item) => item.index));
    if (!orderly) {
      const sortNode = nodesMark.sort((a, b) => a.index - b.index);
      let line = 1;
      for (let i = 0; i < this.body.length; i++) {
        if (types.isImportDeclaration(this.body[i])) {
          // debugger;
          // if (sortNode[i].path.node.loc) {
          //   const top = sortNode[i].path.node.loc!.start.line - line;
          //   line = sortNode[i].path.node.loc!.end.line - top;
          //   if (!top) {
          //     continue;
          //   }
          //   sortNode[i].path.node.loc!.start.line -= top;
          //   sortNode[i].path.node.loc!.end.line -= top;
          //   sortNode[i].path.node.specifiers.forEach((n) => {
          //     n.loc!.start.line -= top;
          //     n.loc!.end.line -= top;
          //   });
          // }
          this.body[i] = sortNode[i].path.node;
        } else {
          break;
        }
      }

      return generate(this.ast, {
        sourceMaps: true,
        // retainLines: true,
        retainFunctionParens: true,
      }).code;
    }
    return undefined;
  }
}

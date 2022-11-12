import * as vscode from "vscode";
import { Calculator } from "./calculator";

function getExpressionRegex(): RegExp {
  // Binary regex
  const binaryRegex = /\b0b([01_]+)/;

  // Octal regex
  const octalRegex = /\b0o([0-7_]+)/;

  // Hex regex
  const hexRegex = /\b0x([0-9a-fA-F_]+)/;

  // Floating point regex
  const floatingPointRegex = /\b([\d_]+)(\.([\d_]+))?e(\+|-)?([\d_]+)/;

  // Fixed point regex
  const fixedPointRegex = /\b([\d_]+)(\.([\d_]+))?/;

  // Number regex
  const numberRegex = new RegExp(
    `(${binaryRegex.source})|(${octalRegex.source})|(${hexRegex.source})|(${floatingPointRegex.source})|(${fixedPointRegex.source})`
  );

  // Operator regex
  const operatorRegex = /(\+|-|\*|\/|\*\*|\(|\)|,|\||\&|\^)/;

  // equation regex
  const equationRegex = new RegExp(
    `((${numberRegex.source}|${operatorRegex.source}|\\s)+)\\s*\=\\s*$`
  );
  return equationRegex;
}

export function activate(context: vscode.ExtensionContext) {
  const calculator = new Calculator();
  const calcCompletionProvider =
    vscode.languages.registerCompletionItemProvider(
      "*",
      {
        provideCompletionItems(document, position) {
          const linePrefix = document
            .lineAt(position)
            .text.substring(0, position.character);

          const match = linePrefix.match(getExpressionRegex());

          if (!match) {
            return undefined;
          }

          let equation = match[1];

          const result = calculator.evaluate(equation);
          if (!result.success) {
            return undefined;
          }

          const completionItem = new vscode.CompletionItem(
            result.toString(),
            vscode.CompletionItemKind.Value
          );
          completionItem.detail = `${equation} = ${result.toString()}`;

          return [completionItem];
        },
      },
      "=",
      " "
    );

  context.subscriptions.push(calcCompletionProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}

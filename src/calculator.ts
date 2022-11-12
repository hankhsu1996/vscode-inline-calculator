import * as jsep from "jsep";
import * as jsepNumbers from "@jsep-plugin/numbers";
import { BigNumber } from "bignumber.js";

export interface IResult {
  success: boolean;
  value: BigNumber;
  separator: Separator;
  base: Base;
}

export class Result implements IResult {
  constructor(
    public success: boolean,
    public value: BigNumber,
    public separator: Separator,
    public base: Base
  ) {}

  public toString(): string {
    const prefix = this.base.prefix;
    const str = this.value.toString(this.base.value);
    // TODO: handle string with separator
    return prefix + str;
  }
}

export enum BaseType {
  undefined = 0,
  binary = 2,
  octal = 8,
  decimal = 10,
  hexadecimal = 16,
}

export class Base {
  constructor(public baseType: BaseType) {}

  public get prefix(): string {
    switch (this.baseType) {
      case BaseType.binary:
        return "0b";
      case BaseType.octal:
        return "0o";
      case BaseType.hexadecimal:
        return "0x";
      default:
        return "";
    }
  }

  public get value(): number {
    return this.baseType || 10;
  }

  public merge(other: Base): Base {
    if (
      this.baseType === BaseType.decimal ||
      other.baseType === BaseType.decimal
    ) {
      return new Base(BaseType.decimal);
    } else if (
      this.baseType === BaseType.hexadecimal ||
      other.baseType === BaseType.hexadecimal
    ) {
      return new Base(BaseType.hexadecimal);
    } else if (
      this.baseType === BaseType.octal ||
      other.baseType === BaseType.octal
    ) {
      return new Base(BaseType.octal);
    } else if (
      this.baseType === BaseType.binary ||
      other.baseType === BaseType.binary
    ) {
      return new Base(BaseType.binary);
    } else {
      return new Base(BaseType.undefined);
    }
  }
}

export enum SeparatorType {
  underscore = "_",
  comma = ",",
  none = "",
}

export class Separator {
  constructor(public separatorType: SeparatorType) {}

  public merge(other: Separator): Separator {
    if (this.separatorType === SeparatorType.none) {
      return other;
    } else if (other.separatorType === SeparatorType.none) {
      return this;
    } else {
      return new Separator(SeparatorType.none);
    }
  }
}

export class Calculator {
  private cache: Map<string, Result> = new Map();

  constructor() {
    jsep.plugins.register(jsepNumbers);
    jsep.addBinaryOp("**", 20);
  }

  public createResult(
    success: boolean,
    value = BigNumber(0),
    separator = new Separator(SeparatorType.none),
    base = new Base(BaseType.undefined)
  ): Result {
    return new Result(success, value, separator, base);
  }

  public evaluate(expression: string): Result {
    const cacheKey = expression;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) || this.createResult(false);
    }

    const ast = this.parse(expression);
    const result = this.internalEvaluate(ast);
    this.cache.set(cacheKey, result);
    return result;
  }

  private parse(expression: string): jsep.Expression {
    const ast = jsep(expression);
    return ast;
  }

  private internalEvaluate(ast: jsep.Expression): Result {
    switch (ast.type) {
      case "BinaryExpression":
        return this.evaluateBinaryExpression(ast as jsep.BinaryExpression);
      case "Literal":
        return this.evaluateLiteral(ast as jsep.Literal);
      case "Identifier":
        return this.createResult(false);
      case "UnaryExpression":
        return this.evaluateUnaryExpression(ast as jsep.UnaryExpression);
      case "CallExpression":
        return this.createResult(false);
      case "Compound":
        return this.createResult(false);
      default:
        return this.createResult(false);
    }
  }

  private evaluateBinaryExpression(ast: jsep.BinaryExpression): Result {
    const left = this.internalEvaluate(ast.left);
    const right = this.internalEvaluate(ast.right);

    const separator = left.separator.merge(right.separator);
    const base = left.base.merge(right.base);

    switch (ast.operator) {
      case "+":
        return this.createResult(
          true,
          left.value.plus(right.value),
          separator,
          base
        );

      case "-":
        return this.createResult(
          true,
          left.value.minus(right.value),
          separator,
          base
        );

      case "*":
        return this.createResult(
          true,
          left.value.times(right.value),
          separator,
          base
        );

      case "/":
        return this.createResult(
          true,
          left.value.dividedBy(right.value),
          separator,
          base
        );

      case "**":
        if (!right.value.isInteger()) {
          return this.createResult(false);
        }
        return this.createResult(
          true,
          left.value.pow(right.value),
          separator,
          base
        );

      case "%":
        return this.createResult(
          true,
          left.value.modulo(right.value),
          separator,
          base
        );

      // TODO: Add bitwise operators

      default:
        return this.createResult(false);
    }
  }

  private evaluateLiteral(ast: jsep.Literal): Result {
    const separator = this.getSeparator(ast.raw);
    const base = this.createBase(ast.raw);
    const raw = ast.raw.replace(/_/g, "");
    return this.createResult(true, BigNumber(raw), separator, base);
  }

  private evaluateUnaryExpression(ast: jsep.UnaryExpression): Result {
    const argument = this.internalEvaluate(ast.argument);
    switch (ast.operator) {
      case "-":
        return this.createResult(
          true,
          // get negative value of bugnumber
          argument.value.negated(),
          argument.separator,
          argument.base
        );
      default:
        return this.createResult(false);
    }
  }

  private getSeparator(raw: string): Separator {
    const hexMatch = raw.match(/^0x[0-9a-fA-F_]+$/);
    const octMatch = raw.match(/^0o[0-7_]+$/);
    const binMatch = raw.match(/^0b[01_]+$/);
    const intMatch = raw.match(/^-?[\d_]+$/);
    if (hexMatch || octMatch || binMatch || intMatch) {
      if (raw.includes("_")) {
        return new Separator(SeparatorType.underscore);
      }
      return new Separator(SeparatorType.none);
    }
    return new Separator(SeparatorType.none);
  }

  private createBase(raw: string): Base {
    const hexMatch = raw.match(/^0x[0-9a-fA-F_]+$/);
    const octMatch = raw.match(/^0o[0-7_]+$/);
    const binMatch = raw.match(/^0b[01_]+$/);
    const intMatch = raw.match(/^-?[\d_]+$/);
    if (hexMatch) {
      return new Base(BaseType.hexadecimal);
    } else if (octMatch) {
      return new Base(BaseType.octal);
    } else if (binMatch) {
      return new Base(BaseType.binary);
    } else if (intMatch) {
      return new Base(BaseType.undefined);
    } else {
      // For other cases including fixed point numbers and floating point numbers,
      // return BaseType.decimal so that the result is not displayed in any base.
      return new Base(BaseType.decimal);
    }
  }
}

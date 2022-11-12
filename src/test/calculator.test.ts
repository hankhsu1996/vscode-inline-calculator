import { BaseType, Calculator, SeparatorType } from "../calculator";

describe("Calculator", () => {
  const calculator = new Calculator();

  test("should not parse empty string", () => {
    const result = calculator.evaluate("");
    expect(result.success).toBe(false);
  });

  test("should not parse identifier", () => {
    const result = calculator.evaluate("abc");
    expect(result.success).toBe(false);
  });

  test("should not parse empty parenthesis", () => {
    const result = calculator.evaluate("()");
    expect(result.success).toBe(false);
  });

  test("should parse 1+2", () => {
    const result = calculator.evaluate("1+2");
    expect(result.success).toBe(true);
    expect(result.separator.separatorType).toBe(SeparatorType.none);
    expect(result.base.baseType).toBe(BaseType.undefined);
    expect(result.toString()).toBe("3");
  });

  test("should parse 1.1+2.2", () => {
    const result = calculator.evaluate("1.1+2.2");
    expect(result.success).toBe(true);
    expect(result.separator.separatorType).toBe(SeparatorType.none);
    expect(result.base.baseType).toBe(BaseType.decimal);
    expect(result.toString()).toBe("3.3");
  });

  test("should parse 1.11+2.2", () => {
    const result = calculator.evaluate("1.11+2.2");
    expect(result.success).toBe(true);
    expect(result.separator.separatorType).toBe(SeparatorType.none);
    expect(result.base.baseType).toBe(BaseType.decimal);
    expect(result.toString()).toBe("3.31");
  });

  test("should parse 1.11-2.2", () => {
    const result = calculator.evaluate("1.11-2.2");
    expect(result.success).toBe(true);
    expect(result.separator.separatorType).toBe(SeparatorType.none);
    expect(result.base.baseType).toBe(BaseType.decimal);
    expect(result.toString()).toBe("-1.09");
  });

  test("should parse 1e0 + 1e-1", () => {
    const result = calculator.evaluate("1e0 + 1e-1");
    expect(result.success).toBe(true);
    expect(result.separator.separatorType).toBe(SeparatorType.none);
    expect(result.base.baseType).toBe(BaseType.decimal);
    expect(result.toString()).toBe("1.1");
  });

  test("should parse 0xabcd + 123", () => {
    const result = calculator.evaluate("0xabcd + 123");
    expect(result.success).toBe(true);
    expect(result.separator.separatorType).toBe(SeparatorType.none);
    expect(result.base.baseType).toBe(BaseType.hexadecimal);
    expect(result.toString()).toBe("0xac48");
  });

  test("should parse 0xbeef_1234 + 123", () => {
    const result = calculator.evaluate("0xbeef_1234 + 123");
    expect(result.success).toBe(true);
    expect(result.separator.separatorType).toBe(SeparatorType.underscore);
    expect(result.base.baseType).toBe(BaseType.hexadecimal);
    expect(result.toString()).toBe("0xbeef12af");
  });

  test("should parse 0o1000 + 1", () => {
    const result = calculator.evaluate("0o1000 + 1");
    expect(result.success).toBe(true);
    expect(result.separator.separatorType).toBe(SeparatorType.none);
    expect(result.base.baseType).toBe(BaseType.octal);
    expect(result.toString()).toBe("0o1001");
  });

  test("should parse 0b1000 + 1", () => {
    const result = calculator.evaluate("0b1000 + 1");
    expect(result.success).toBe(true);
    expect(result.separator.separatorType).toBe(SeparatorType.none);
    expect(result.base.baseType).toBe(BaseType.binary);
    expect(result.toString()).toBe("0b1001");
  });

  test("should parse 1.1*2.2", () => {
    const result = calculator.evaluate("1.1*2.2");
    expect(result.success).toBe(true);
    expect(result.separator.separatorType).toBe(SeparatorType.none);
    expect(result.base.baseType).toBe(BaseType.decimal);
    expect(result.toString()).toBe("2.42");
  });

  test("should parse 1*2.22", () => {
    const result = calculator.evaluate("1*2.22");
    expect(result.success).toBe(true);
    expect(result.separator.separatorType).toBe(SeparatorType.none);
    expect(result.base.baseType).toBe(BaseType.decimal);
    expect(result.toString()).toBe("2.22");
  });

  test("should parse 1.1/2.2", () => {
    const result = calculator.evaluate("1.1/2.2");
    expect(result.success).toBe(true);
    expect(result.separator.separatorType).toBe(SeparatorType.none);
    expect(result.base.baseType).toBe(BaseType.decimal);
    expect(result.toString()).toBe("0.5");
  });

  test("should not parse 1.1**2.2", () => {
    const result = calculator.evaluate("1.1**2.2");
    expect(result.success).toBe(false);
  });

  test("should parse 1.1**4", () => {
    const result = calculator.evaluate("1.1**4");
    expect(result.success).toBe(true);
    expect(result.separator.separatorType).toBe(SeparatorType.none);
    expect(result.base.baseType).toBe(BaseType.decimal);
    expect(result.toString()).toBe("1.4641");
  });

  test("should parse 1_432+889", () => {
    const result = calculator.evaluate("1_432+889");
    expect(result.success).toBe(true);
    expect(result.separator.separatorType).toBe(SeparatorType.underscore);
    expect(result.base.baseType).toBe(BaseType.undefined);
    expect(result.toString()).toBe("2321");
  });

  test("should parse 200*5", () => {
    const result = calculator.evaluate("200*5");
    expect(result.success).toBe(true);
    expect(result.separator.separatorType).toBe(SeparatorType.none);
    expect(result.base.baseType).toBe(BaseType.undefined);
    expect(result.toString()).toBe("1000");
  });

  test("should parse 123**9", () => {
    const result = calculator.evaluate("123**9");
    expect(result.success).toBe(true);
    expect(result.separator.separatorType).toBe(SeparatorType.none);
    expect(result.base.baseType).toBe(BaseType.undefined);
    expect(result.toString()).toBe("6443858614676334363");
  });
});

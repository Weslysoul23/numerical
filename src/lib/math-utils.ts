import { evaluate, derivative as mathDerivative, compile } from 'mathjs';

export interface IterationResult {
  iteration: number;
  approximation: number;
  relativeError: number | null;
}

export interface DerivativeResult {
  forward: number;
  backward: number;
  centered: number;
  forwardError: number | null;
  backwardError: number | null;
  centeredError: number | null;
  symbolic: number | null;
}

// ✅ Fixed-Point Iteration using user-defined g(x)
export const fixedPointIteration = (
  gExpression: string,
  initialGuess: number,
  iterations: number,
  precision: number
): IterationResult[] => {
  const results: IterationResult[] = [];
  let x = initialGuess;
  let prevX: number | null = null;

  const g = (val: number) => evaluate(gExpression, { x: val });

  for (let i = 1; i <= iterations; i++) {
    const nextX = g(x);
    const relativeError = prevX !== null ? Math.abs((nextX - x) / nextX) * 100 : null;

    results.push({
      iteration: i,
      approximation: parseFloat(nextX.toFixed(precision)),
      relativeError: relativeError !== null ? parseFloat(relativeError.toFixed(precision)) : null,
    });

    prevX = x;
    x = nextX;
  }

  return results;
};

// Newton-Raphson Method
export const newtonRaphson = (
  expression: string,
  initialGuess: number,
  iterations: number,
  precision: number
): IterationResult[] => {
  const results: IterationResult[] = [];
  let x = initialGuess;

  const f = (val: number) => evaluate(expression, { x: val });
  const fPrime = (val: number) => {
    const symbolicDerivativeNode = mathDerivative(expression, 'x');
    return evaluate(symbolicDerivativeNode.toString(), { x: val });
  };

  for (let i = 1; i <= iterations; i++) {
    const fx = f(x);
    const fpx = fPrime(x);

    if (Math.abs(fpx) < 1e-10) break;

    const nextX = x - fx / fpx;
    const relativeError = Math.abs((nextX - x) / nextX) * 100;

    results.push({
      iteration: i,
      approximation: parseFloat(nextX.toFixed(precision)),
      relativeError: parseFloat(relativeError.toFixed(precision)),
    });

    x = nextX;
  }

  return results;
};

// Secant Method
export const secantMethod = (
  expression: string,
  guess1: number,
  guess2: number,
  iterations: number,
  precision: number
): IterationResult[] => {
  const results: IterationResult[] = [];
  let x0 = guess1;
  let x1 = guess2;

  const f = (val: number) => evaluate(expression, { x: val });

  for (let i = 1; i <= iterations; i++) {
    const fx0 = f(x0);
    const fx1 = f(x1);

    if (Math.abs(fx1 - fx0) < 1e-10) break;

    const nextX = x1 - fx1 * (x1 - x0) / (fx1 - fx0);
    const relativeError = Math.abs((nextX - x1) / nextX) * 100;

    results.push({
      iteration: i,
      approximation: parseFloat(nextX.toFixed(precision)),
      relativeError: parseFloat(relativeError.toFixed(precision)),
    });

    x0 = x1;
    x1 = nextX;
  }

  return results;
};

// Derivative approximation
export const approximateDerivative = (
  expression: string,
  guessValue: number,
  h: number,
  precision: number
): DerivativeResult | { error: string } => {
  try {
    const compiledExpr = compile(expression);
    const scopeX = { x: guessValue };
    const f_x = compiledExpr.evaluate(scopeX);
    const f_x_plus_h = compiledExpr.evaluate({ x: guessValue + h });
    const f_x_minus_h = compiledExpr.evaluate({ x: guessValue - h });

    const forwardDiff = (f_x_plus_h - f_x) / h;
    const backwardDiff = (f_x - f_x_minus_h) / h;
    const centeredDiff = (f_x_plus_h - f_x_minus_h) / (2 * h);

    const symbolicDerivativeNode = mathDerivative(expression, 'x');
    const symbolicDerivativeValue = evaluate(symbolicDerivativeNode.toString(), scopeX);

    const calcError = (approx: number, exact: number | null): number | null => {
      if (exact === null || Math.abs(exact) < 1e-10) return null;
      return Math.abs((approx - exact) / exact) * 100;
    };

    return {
      forward: parseFloat(forwardDiff.toFixed(precision)),
      backward: parseFloat(backwardDiff.toFixed(precision)),
      centered: parseFloat(centeredDiff.toFixed(precision)),
      forwardError: calcError(forwardDiff, symbolicDerivativeValue),
      backwardError: calcError(backwardDiff, symbolicDerivativeValue),
      centeredError: calcError(centeredDiff, symbolicDerivativeValue),
      symbolic: parseFloat(symbolicDerivativeValue.toFixed(precision)),
    };

  } catch (error: any) {
    return { error: "An error occurred during derivative calculation." };
  }
};

export const getErrorColor = (error: number | null): string => {
  if (error === null) return 'text-muted-foreground';
  if (error < 1) return 'text-green-600';
  if (error < 10) return 'text-yellow-600';
  return 'text-red-600';
};

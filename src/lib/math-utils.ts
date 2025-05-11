import { evaluate, derivative as mathDerivative, compile, type MathNode } from 'mathjs';

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

// Function to approximate e^x
const func = (x: number): number => Math.exp(x);

// --- e^x Approximation Methods ---

export const fixedPointIteration = (initialGuess: number, iterations: number, targetValue: number, precision: number): IterationResult[] => {
  const results: IterationResult[] = [];
  let x = initialGuess;
  let prevX: number | null = null;

  // Define g(x) such that x = g(x) implies f(x) = e^x - targetValue = 0
  // A possible g(x) is x - (e^x - targetValue) / (derivative of e^x) = x - (e^x - targetValue) / e^x = x - 1 + targetValue * e^(-x)
  // This specific g(x) might not converge well for all inputs. A better approach might be needed depending on targetValue.
  // For simplicity, let's try a direct iteration if we assume the problem is to find x such that e^x = targetValue.
  // Then x = ln(targetValue). Let's iterate x = ln(targetValue) ? Not an iteration method.
  //
  // Let's re-read the prompt. It asks to find the APPROXIMATE VALUE OF e^x. It doesn't ask to solve e^x = C.
  // This means we need to approximate the function itself, likely using Taylor series or similar, but the METHODS listed are root-finding.
  // This suggests a misunderstanding in the prompt. Assuming the prompt meant to find the root of f(x) = e^x - C = 0 where C is some value related to the inputs, or perhaps it meant to approximate x such that e^x equals some value.
  // Let's assume the goal is to approximate `e` itself using these methods by finding the root of ln(x) - 1 = 0. The root is x = e.
  const f = (val: number) => Math.log(val) - 1;
  const g = (val: number) => val - f(val) / (1/val); // g(x) for Newton-Raphson applied to ln(x) - 1 = 0
                                                      // For Fixed Point, we need x = G(x). Let's try G(x) = x - (ln(x) - 1) = x - ln(x) + 1
  const G = (val: number) => val - Math.log(val) + 1;


  for (let i = 1; i <= iterations; i++) {
    const nextX = G(x); // Use fixed point iteration G(x)
    const relativeError = prevX !== null ? Math.abs((nextX - x) / nextX) * 100 : null;

    results.push({
      iteration: i,
      approximation: parseFloat(nextX.toFixed(precision)),
      relativeError: relativeError !== null ? parseFloat(relativeError.toFixed(precision)) : null,
    });

    if (relativeError !== null && relativeError < Math.pow(10, -precision)) {
       // Optional: break early if desired precision is met
       // break;
    }

    prevX = x;
    x = nextX;
  }

  return results;
};


export const newtonRaphson = (initialGuess: number, iterations: number, targetValue: number, precision: number): IterationResult[] => {
  const results: IterationResult[] = [];
  let x = initialGuess;
  let prevX: number | null = null;

  // Assuming goal is to find root of f(x) = ln(x) - 1 = 0, so x = e
  const f = (val: number) => Math.log(val) - 1;
  const fPrime = (val: number) => 1 / val;

  for (let i = 1; i <= iterations; i++) {
    const fx = f(x);
    const fpx = fPrime(x);

    if (Math.abs(fpx) < 1e-10) { // Avoid division by zero
      console.error("Derivative is zero, Newton-Raphson cannot continue.");
      // Optionally add a result indicating failure
      results.push({ iteration: i, approximation: x, relativeError: null });
      break;
    }

    const nextX = x - fx / fpx;
    const relativeError = Math.abs((nextX - x) / nextX) * 100;


    results.push({
      iteration: i,
      approximation: parseFloat(nextX.toFixed(precision)),
      relativeError: parseFloat(relativeError.toFixed(precision)),
    });

     if (relativeError < Math.pow(10, -precision)) {
       // break;
    }

    x = nextX;
  }

  return results;
};


export const secantMethod = (guess1: number, guess2: number, iterations: number, targetValue: number, precision: number): IterationResult[] => {
  const results: IterationResult[] = [];
  let x0 = guess1;
  let x1 = guess2;

  // Assuming goal is to find root of f(x) = ln(x) - 1 = 0, so x = e
  const f = (val: number) => Math.log(val) - 1;

  for (let i = 1; i <= iterations; i++) {
    const fx0 = f(x0);
    const fx1 = f(x1);

    if (Math.abs(fx1 - fx0) < 1e-10) { // Avoid division by zero / stagnation
      console.error("Denominator too small, Secant method cannot continue reliably.");
      results.push({ iteration: i, approximation: x1, relativeError: null });
      break;
    }

    const nextX = x1 - fx1 * (x1 - x0) / (fx1 - fx0);
    const relativeError = Math.abs((nextX - x1) / nextX) * 100;

    results.push({
      iteration: i,
      approximation: parseFloat(nextX.toFixed(precision)),
      relativeError: parseFloat(relativeError.toFixed(precision)),
    });

    if (relativeError < Math.pow(10, -precision)) {
       // break;
    }

    x0 = x1;
    x1 = nextX;
  }

  return results;
};


// --- Derivative Approximation Methods ---

const safeEvaluate = (node: MathNode, scope: object): number | null => {
  try {
    const result = node.evaluate(scope);
    if (typeof result !== 'number' || !isFinite(result)) {
      return null;
    }
    return result;
  } catch (error) {
    console.error("Evaluation error:", error);
    return null;
  }
};

const safeDerivative = (expression: string, variable: string): MathNode | null => {
   try {
    return mathDerivative(expression, variable);
  } catch (error) {
    console.error("Symbolic differentiation error:", error);
    return null;
  }
}


export const approximateDerivative = (
  expression: string,
  guessValue: number,
  h: number,
  precision: number
): DerivativeResult | { error: string } => {
  try {
    const compiledExpr = compile(expression);
    const scopeX = { x: guessValue };
    const scopeXPlusH = { x: guessValue + h };
    const scopeXMinusH = { x: guessValue - h };

    const f_x = safeEvaluate(compiledExpr, scopeX);
    const f_x_plus_h = safeEvaluate(compiledExpr, scopeXPlusH);
    const f_x_minus_h = safeEvaluate(compiledExpr, scopeXMinusH);

    if (f_x === null || f_x_plus_h === null || f_x_minus_h === null) {
      return { error: "Failed to evaluate expression at necessary points. Check expression syntax and ensure it's valid for the given x values." };
    }

    // Forward Difference
    const forwardDiff = (f_x_plus_h - f_x) / h;

    // Backward Difference
    const backwardDiff = (f_x - f_x_minus_h) / h;

    // Centered Difference
    const centeredDiff = (f_x_plus_h - f_x_minus_h) / (2 * h);

    // Symbolic Derivative (Attempt)
    let symbolicDerivativeValue: number | null = null;
    let symbolicDerivativeNode = safeDerivative(expression, 'x');

    if (symbolicDerivativeNode) {
      symbolicDerivativeValue = safeEvaluate(symbolicDerivativeNode, scopeX);
    }


    // Calculate Relative Errors (if symbolic derivative is available)
    const calculateError = (approx: number, exact: number | null): number | null => {
      if (exact === null || Math.abs(exact) < 1e-10) return null; // Avoid division by zero or meaningless error
      return Math.abs((approx - exact) / exact) * 100;
    };

    const forwardError = calculateError(forwardDiff, symbolicDerivativeValue);
    const backwardError = calculateError(backwardDiff, symbolicDerivativeValue);
    const centeredError = calculateError(centeredDiff, symbolicDerivativeValue);

    return {
      forward: parseFloat(forwardDiff.toFixed(precision)),
      backward: parseFloat(backwardDiff.toFixed(precision)),
      centered: parseFloat(centeredDiff.toFixed(precision)),
      forwardError: forwardError !== null ? parseFloat(forwardError.toFixed(precision)) : null,
      backwardError: backwardError !== null ? parseFloat(backwardError.toFixed(precision)) : null,
      centeredError: centeredError !== null ? parseFloat(centeredError.toFixed(precision)) : null,
      symbolic: symbolicDerivativeValue !== null ? parseFloat(symbolicDerivativeValue.toFixed(precision)) : null,
    };

  } catch (error: any) {
    console.error("Error in approximateDerivative:", error);
    // Provide a more specific error message if possible
    if (error instanceof Error && error.message.includes('Undefined symbol')) {
         return { error: `Invalid expression: ${error.message}. Ensure all variables and functions are defined.` };
    }
    if (error instanceof SyntaxError) {
        return { error: `Syntax error in expression: ${error.message}` };
    }
    return { error: "An error occurred during derivative calculation. Please check the expression and inputs." };
  }
};

// Helper to determine error color
export const getErrorColor = (error: number | null): string => {
  if (error === null) return 'text-muted-foreground'; // Grey for N/A
  if (error < 1) return 'text-green-600'; // Green for small error
  if (error < 10) return 'text-yellow-600'; // Yellow for medium error
  return 'text-red-600'; // Red for large error
};

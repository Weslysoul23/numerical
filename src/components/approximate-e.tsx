"use client";

import { evaluate, derivative as mathDerivative, compile, type MathNode } from 'mathjs';
import type { ChangeEvent, FormEvent } from 'react';
import React, { useState, useMemo } from 'react'; // This uses React hooks
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, RotateCcw, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getErrorColor, type IterationResult } from '@/lib/math-utils';

import { fixedPointIteration, newtonRaphson, secantMethod } from '@/lib/math-utils';

// The rest of your code continues here...

// Form validation schema
const formSchema = z.object({
  method: z.enum(['fixed_point', 'newton_raphson', 'secant']),
  functionExpression: z.string().min(1, "Expression is required"),
  initialGuess1: z.coerce.number().finite(),
  initialGuess2: z.coerce.number().finite().optional(),
  iterations: z.coerce.number().int().positive().min(1).max(1000),
  precision: z.coerce.number().int().min(1).max(15),
}).refine(data => data.method !== 'secant' || data.initialGuess2 !== undefined, {
  message: "Second initial guess is required for Secant method",
  path: ["initialGuess2"],
});

type FormData = z.infer<typeof formSchema>;

export function ApproximateE() {
  const [results, setResults] = useState<IterationResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      method: 'newton_raphson',
      functionExpression: 'x^2-3x+2',
      initialGuess1: 2,
      iterations: 10,
      precision: 6,
    },
  });

  const selectedMethod = form.watch('method');

  const onSubmit = (values: FormData) => {
    setResults(null);
    setError(null);
    try {
      const expr = values.functionExpression;

      // Ensure expression is a valid string and compile
      const compiledExpr = compile(expr);
      if (!compiledExpr) {
        throw new Error("Invalid function expression.");
      }

      // Define f(x) and f'(x) for Newton-Raphson
      const f = (x: number) => evaluate(expr, { x });

      let df;
      if (values.method === 'newton_raphson') {
        df = (x: number) => {
          try {
            const symbolicDerivativeNode = mathDerivative(expr, 'x');
            return evaluate(symbolicDerivativeNode.toString(), { x });
          } catch (e) {
            throw new Error("Failed to compute the derivative for Newton-Raphson.");
          }
        };
      }

      let calculatedResults: IterationResult[];

      switch (values.method) {
        case 'fixed_point':
          calculatedResults = fixedPointIteration(expr, values.initialGuess1, values.iterations, values.precision);
          break;
        case 'newton_raphson':
          if (!df) throw new Error('Derivative function is required for Newton-Raphson method');
          calculatedResults = newtonRaphson(expr, values.initialGuess1, values.iterations, values.precision);
          break;
        case 'secant':
          if (values.initialGuess2 === undefined) {
            throw new Error('Second initial guess (x1) is required for Secant method');
          }
          calculatedResults = secantMethod(expr, values.initialGuess1, values.initialGuess2, values.iterations, values.precision);
          break;
        default:
          throw new Error("Unsupported method");
      }

      setResults(calculatedResults);
    } catch (e: any) {
      console.error("Calculation Error:", e);
      setError(`Calculation failed: ${e.message || "Unknown error"}`);
      toast({
        variant: "destructive",
        title: "Calculation Error",
        description: `Failed to calculate approximation: ${e.message || "Unknown error"}`,
      });
    }
  };

  const downloadCSV = () => {
    if (!results || results.length === 0) {
      toast({
        variant: "destructive",
        title: "No Results",
        description: "Cannot download CSV, no results available.",
      });
      return;
    }

    const headers = ['Iteration', 'Approximation', 'Relative Error (%)'];
    const rows = results.map(r => [r.iteration, r.approximation, r.relativeError ?? 'N/A']);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\r\n";
    rows.forEach(rowArray => {
      let row = rowArray.join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `e_approximation_${form.getValues('method')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Download Started",
      description: "Your results CSV file is downloading.",
    });
  };

  const resetForm = () => {
    form.reset();
    setResults(null);
    setError(null);
  };

  const finalApproximation = useMemo(() => {
    return results && results.length > 0 ? results[results.length - 1].approximation : null;
  }, [results]);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Approximate Root (e.g. 'e')</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Function Expression Input */}
            <FormField
              control={form.control}
              name="functionExpression"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Function Expression</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. ln(x) - 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Method Selection */}
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fixed_point">Fixed Point Iteration</SelectItem>
                      <SelectItem value="newton_raphson">Newton-Raphson</SelectItem>
                      <SelectItem value="secant">Secant Method</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="initialGuess1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Guess {selectedMethod === 'secant' ? ' (x0)' : ''}</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedMethod === 'secant' && (
                <FormField
                  control={form.control}
                  name="initialGuess2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Guess (x1)</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="iterations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Iterations</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={1000} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="precision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precision</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={15} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit and Reset Buttons */}
            <div className="flex justify-between mt-4">
              <Button type="submit" className="w-1/2">Submit</Button>
              <Button variant="outline" type="button" onClick={resetForm} className="w-1/2">Reset</Button>
            </div>
          </form>
        </Form>
      </CardContent>

      {/* Calculation Results Table */}
      {results && (
        <CardFooter>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Iteration</TableHead>
                <TableHead>Approximation</TableHead>
                <TableHead>Relative Error (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={index}>
                  <TableCell>{result.iteration}</TableCell>
                  <TableCell>{result.approximation}</TableCell>
                  <TableCell>{result.relativeError?.toFixed(6)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardFooter>
      )}

      {/* Error and Download Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <CardFooter className="space-x-2">
        <Button onClick={downloadCSV} disabled={!results || results.length === 0}>
          <Download className="mr-2" /> Download CSV
        </Button>
      </CardFooter>
    </Card>
  );
}

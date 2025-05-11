"use client";

import type { FormEvent } from 'react';
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, RotateCcw, AlertCircle } from 'lucide-react';
import { approximateDerivative, getErrorColor, type DerivativeResult } from '@/lib/math-utils';
import { useToast } from "@/hooks/use-toast";
import * as math from 'mathjs'; // Import mathjs

// Custom validation for math expression
const mathExpressionSchema = z.string().min(1, "Expression cannot be empty").refine(
    (expr) => {
        try {
            math.parse(expr); // Try parsing the expression
            // Optionally, check for specific allowed variables/functions
            // const allowedNodes = ['SymbolNode', 'ConstantNode', 'OperatorNode', 'FunctionNode', 'ParenthesisNode'];
            // const node = math.parse(expr);
            // let valid = true;
            // node.traverse(n => {
            //     if (!allowedNodes.includes(n.type)) valid = false;
            //     if (n.type === 'SymbolNode' && n.name !== 'x' && n.name !== 'e' && n.name !== 'pi') valid = false;
            //     // Add more checks if needed for functions like sin, cos, tan, exp
            // });
            // return valid;
             return true; // Keep it simple for now
        } catch (e) {
            return false; // Parsing failed
        }
    },
    { message: "Invalid mathematical expression. Use 'x' as the variable. Supported functions: sin, cos, tan, exp, log, sqrt, etc. Supported constants: e, pi." }
);


const formSchema = z.object({
  expression: mathExpressionSchema,
  guessValue: z.coerce.number().finite("Must be a valid number"),
  h: z.coerce.number().finite("Must be a valid number").positive("Step size 'h' must be positive").gt(1e-10, "Step size 'h' is too small"), // Add minimum value for h
  precision: z.coerce.number().int().min(1).max(15),
});

type FormData = z.infer<typeof formSchema>;

export function ApproximateDerivative() {
  const [results, setResults] = useState<DerivativeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expression: 'x^2 + 3*x + 2',
      guessValue: 1,
      h: 0.01,
      precision: 6,
    },
  });

   const onSubmit = (values: FormData) => {
    setResults(null); // Clear previous results
    setError(null); // Clear previous errors
    try {
      const calculationResult = approximateDerivative(
        values.expression,
        values.guessValue,
        values.h,
        values.precision
      );

      if ('error' in calculationResult) {
        setError(calculationResult.error);
        toast({
          variant: "destructive",
          title: "Calculation Error",
          description: calculationResult.error,
        });
      } else {
        setResults(calculationResult);
      }

    } catch (e: any) {
        console.error("Calculation Error:", e);
        const errorMessage = `Calculation failed: ${e.message || "Unknown error"}`;
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Calculation Error",
          description: errorMessage,
        });
    }
  };

  const downloadCSV = () => {
    if (!results) {
      toast({
        variant: "destructive",
        title: "No Results",
        description: "Cannot download CSV, no results available.",
      });
      return;
    }

    const headers = ['Method', 'Approximation', 'Relative Error (%)', 'Symbolic Value'];
    const data = [
        ['Forward Difference', results.forward, results.forwardError ?? 'N/A', results.symbolic ?? 'N/A'],
        ['Backward Difference', results.backward, results.backwardError ?? 'N/A', results.symbolic ?? 'N/A'],
        ['Centered Difference', results.centered, results.centeredError ?? 'N/A', results.symbolic ?? 'N/A'],
    ];


    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\r\n";
    data.forEach(rowArray => {
      let row = rowArray.join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `derivative_approximation_${form.getValues('guessValue')}.csv`);
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


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Approximate Derivative</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="expression"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Algebraic Expression (use 'x')</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="e.g., x^3 + sin(x)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="guessValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value of x</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="h"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Step Size (h)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
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
                    <FormLabel>Decimal Places</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="15" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>


            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                <RotateCcw className="mr-2 h-4 w-4" /> Reset
              </Button>
              <Button type="submit">Calculate</Button>
            </div>
          </form>
        </Form>

         {error && (
           <Alert variant="destructive" className="mt-6">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Error</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
           </Alert>
         )}

        {results && !error && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Results</h3>
             <div className="mb-4 p-3 bg-accent rounded-md text-sm">
                <span className="font-medium">Symbolic Derivative Value: </span>
                <span className="font-bold text-primary">
                    {results.symbolic !== null ? results.symbolic : 'N/A (Could not compute symbolically)'}
                 </span>
            </div>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead>Approximation</TableHead>
                    <TableHead>Relative Error (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="transition-colors duration-200 hover:bg-accent/50">
                    <TableCell>Forward Difference</TableCell>
                    <TableCell>{results.forward}</TableCell>
                    <TableCell className={getErrorColor(results.forwardError)}>
                        {results.forwardError !== null ? results.forwardError : 'N/A'}
                    </TableCell>
                  </TableRow>
                   <TableRow className="transition-colors duration-200 hover:bg-accent/50">
                    <TableCell>Backward Difference</TableCell>
                    <TableCell>{results.backward}</TableCell>
                    <TableCell className={getErrorColor(results.backwardError)}>
                         {results.backwardError !== null ? results.backwardError : 'N/A'}
                    </TableCell>
                  </TableRow>
                   <TableRow className="transition-colors duration-200 hover:bg-accent/50">
                    <TableCell>Centered Difference</TableCell>
                    <TableCell>{results.centered}</TableCell>
                    <TableCell className={getErrorColor(results.centeredError)}>
                         {results.centeredError !== null ? results.centeredError : 'N/A'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
      {results && !error && (
         <CardFooter className="flex justify-end mt-4">
             <Button onClick={downloadCSV} variant="outline">
               <Download className="mr-2 h-4 w-4" /> Download CSV
             </Button>
         </CardFooter>
      )}
    </Card>
  );
}

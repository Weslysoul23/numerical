"use client";

import type { ChangeEvent, FormEvent } from 'react';
import React, { useState, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { fixedPointIteration, newtonRaphson, secantMethod, getErrorColor, type IterationResult } from '@/lib/math-utils';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  method: z.enum(['fixed_point', 'newton_raphson', 'secant']),
  initialGuess1: z.coerce.number().finite(),
  initialGuess2: z.coerce.number().finite().optional(),
  iterations: z.coerce.number().int().positive().min(1).max(1000), // Limit iterations
  precision: z.coerce.number().int().min(1).max(15),
}).refine(data => data.method !== 'secant' || (data.initialGuess2 !== undefined && data.initialGuess2 !== null), {
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
      initialGuess1: 2, // Starting guess closer to e
      iterations: 10,
      precision: 6,
    },
  });

  const selectedMethod = form.watch('method');

   const onSubmit = (values: FormData) => {
    setResults(null); // Clear previous results
    setError(null);   // Clear previous errors
    try {
      let calculatedResults: IterationResult[];
      // The prompt is slightly ambiguous about approximating e^x vs approximating 'e'.
      // Based on the methods (root-finding), it's likely intended to approximate 'e'
      // by finding the root of ln(x) - 1 = 0. The targetValue is not directly used here.
      const targetValue = 0; // Not directly used in the current interpretation

      if (values.method === 'fixed_point') {
        calculatedResults = fixedPointIteration(values.initialGuess1, values.iterations, targetValue, values.precision);
      } else if (values.method === 'newton_raphson') {
        calculatedResults = newtonRaphson(values.initialGuess1, values.iterations, targetValue, values.precision);
      } else if (values.method === 'secant' && values.initialGuess2 !== undefined) {
        calculatedResults = secantMethod(values.initialGuess1, values.initialGuess2, values.iterations, targetValue, values.precision);
      } else {
        setError("Invalid method or missing input for Secant method.");
        return;
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
        <CardTitle className="text-2xl font-semibold">Approximate Value of 'e'</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <Input type="number" min="1" max="1000" {...field} />
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

        {results && results.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2">Results</h3>
             <div className="mb-4 p-4 bg-accent rounded-md">
                <span className="font-medium">Final Approximation of 'e': </span>
                <span className="font-bold text-primary">{finalApproximation}</span>
            </div>
            <div className="max-h-80 overflow-y-auto border rounded-md">
              <Table>
                <TableHeader className="sticky top-0 bg-muted">
                  <TableRow>
                    <TableHead className="w-[100px]">Iteration</TableHead>
                    <TableHead>Approximation</TableHead>
                    <TableHead>Relative Error (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.iteration} className="transition-colors duration-200 hover:bg-accent/50">
                      <TableCell>{result.iteration}</TableCell>
                      <TableCell>{result.approximation}</TableCell>
                      <TableCell className={getErrorColor(result.relativeError)}>
                        {result.relativeError !== null ? result.relativeError : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
        {results && results.length > 0 && (
            <CardFooter className="flex justify-end mt-4">
                 <Button onClick={downloadCSV} variant="outline">
                   <Download className="mr-2 h-4 w-4" /> Download CSV
                 </Button>
            </CardFooter>
        )}
    </Card>
  );
}

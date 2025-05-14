import { ApproximateE } from '@/components/approximate-e';
import { ApproximateDerivative } from '@/components/approximate-derivative';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Sigma } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 md:p-12 lg:p-24 bg-gradient-to-b from-background to-muted/30">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-extrabold text-primary mb-4 drop-shadow-sm">
          ApproximateMath
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Tools for Numerical Approximation
        </p>
      </div>

      <Tabs defaultValue="approximate-e" className="w-full max-w-4xl animate-fade-in">
        <TabsList className="grid w-full grid-cols-2 mb-8 rounded-xl border border-border shadow-sm bg-secondary">
          <TabsTrigger value="approximate-e">
            <Sigma className="mr-2 h-4 w-4" /> Approximate <code>e</code>
          </TabsTrigger>
          <TabsTrigger value="approximate-derivative">
            <Calculator className="mr-2 h-4 w-4" /> Derivative
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approximate-e">
          <Card className="rounded-2xl shadow-md border bg-card">
            <CardHeader>
              <CardTitle>Approximate Euler’s Number (<code>e</code>)</CardTitle>
              <CardDescription>
                Estimate <code>e</code> using root-finding methods on <code>ln(x) - 1 = 0</code>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApproximateE />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approximate-derivative">
          <Card className="rounded-2xl shadow-md border bg-card">
            <CardHeader>
              <CardTitle>Approximate Derivative</CardTitle>
              <CardDescription>
                Use finite differences to estimate the slope at a given point.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApproximateDerivative />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <footer className="mt-20 text-center text-sm text-muted-foreground">
        <hr className="my-6 border-muted w-32 mx-auto" />
        <p>Built with <strong>Next.js</strong> & <strong>Shadcn/UI</strong>. All calculations are client-side.</p>
      </footer>
    </main>
  );
}

import { ApproximateE } from '@/components/approximate-e';
import { ApproximateDerivative } from '@/components/approximate-derivative';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Sigma } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 md:p-12 lg:p-24 bg-gradient-to-b from-background to-muted/30">
       <div className="text-center mb-12">
         <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">ApproximateMath</h1>
         <p className="text-lg md:text-xl text-foreground/80">Tools for Numerical Approximation</p>
       </div>

      <Tabs defaultValue="approximate-e" className="w-full max-w-4xl">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="approximate-e">
            <Sigma className="mr-2 h-4 w-4"/> Approximate 'e'
            </TabsTrigger>
          <TabsTrigger value="approximate-derivative">
             <Calculator className="mr-2 h-4 w-4"/> Approximate Derivative
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approximate-e">
           <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-0 pb-2">
                <CardTitle>Approximate the Value of 'e'</CardTitle>
                <CardDescription>
                  Use numerical methods to find an approximation for the mathematical constant 'e' (Euler's number).
                  These methods find the root of ln(x) - 1 = 0, which is x = e.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                 <ApproximateE />
              </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="approximate-derivative">
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-0 pb-2">
                <CardTitle>Approximate the Derivative</CardTitle>
                <CardDescription>
                  Calculate the approximate derivative of a function at a given point using numerical methods.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                 <ApproximateDerivative />
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
            Built with Next.js and Shadcn/ui. All calculations are done client-side.
        </footer>
    </main>
  );
}

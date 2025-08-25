
"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Terminal } from "lucide-react";

import { registerUser } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Logo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerUser, undefined);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (state?.success) {
      toast({
        title: "Registration Successful",
        description: "You can now log in with your credentials.",
      });
      router.push('/login');
    }
  }, [state, router, toast]);

  return (
     <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
            <Logo />
        </div>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>Enter your details below to create your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
            <div className="grid gap-4">
                 <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" type="text" placeholder="John Doe" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required />
                </div>
                 {state?.error && (
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Registration Failed</AlertTitle>
                        <AlertDescription>{state.error}</AlertDescription>
                    </Alert>
                )}
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create account
            </Button>
        </form>
      </CardContent>
       <CardFooter className="flex justify-center text-sm">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
                Log in
            </Link>
          </p>
      </CardFooter>
    </Card>
  );
}

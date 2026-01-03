"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Chrome, Github } from "lucide-react";
import { handleSignIn } from "../actions";

const SignInFormClient = () => {
  const handleGoogleSignIn = async () => {
    await handleSignIn("google");
  };

  const handleGithubSignIn = async () => {
    await handleSignIn("github");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>Choose your preferred sign-in method.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGithubSignIn}
        >
          <Github className="w-5 h-5" />
          Sign in with GitHub
        </Button>
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleSignIn}
        >
          <Chrome className="w-5 h-5" />
          Sign in with Google
        </Button>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground text-center w-full">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignInFormClient;


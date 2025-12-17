"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { registerSchema, type RegisterFormData, getPasswordStrength } from "@/lib/utils/validators";
import { showErrorToast } from "@/lib/utils/error-handler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { PublicRoute } from "@/components/auth/PublicRoute";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");

  // Update password strength as user types
  useState(() => {
    if (password) {
      const strength = getPasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      // Redirect is handled by AuthContext
    } catch (error) {
      showErrorToast(error, "Registration Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 40) return "bg-destructive";
    if (passwordStrength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (passwordStrength < 40) return "Weak";
    if (passwordStrength < 70) return "Medium";
    return "Strong";
  };

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Create an Account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your information to get started
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...register("name")}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  disabled={isLoading}
                  onChange={(e) => {
                    register("password").onChange(e);
                    setPasswordStrength(getPasswordStrength(e.target.value));
                  }}
                />
                {password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Password strength:
                      </span>
                      <span className={`font-medium ${
                        passwordStrength < 40 ? "text-destructive" :
                        passwordStrength < 70 ? "text-yellow-600" : "text-green-600"
                      }`}>
                        {getStrengthLabel()}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href={ROUTES.LOGIN}
                  className="text-primary hover:underline font-medium"
                >
                  Login
                </Link>
              </p>
              <Link
                href={ROUTES.HOME}
                className="text-sm text-center text-muted-foreground hover:underline"
              >
                ← Back to Home
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PublicRoute>
  );
}


import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield } from "lucide-react";
import { useLocation } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleLogin = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/admin/login", data);
      if (response.ok) {
        const result = await response.json();
        localStorage.setItem("adminToken", result.token);
        toast({
          title: "Login Successful",
          description: "Welcome to the admin dashboard!",
        });
        setLocation("/admin");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      toast({
        title: "Login Failed", 
        description: error instanceof Error ? error.message : "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-600 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img 
              src="/@assets/logo_1756065815534.png" 
              alt="Alpha Security Bureau Logo" 
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="font-heading text-2xl tracking-wide text-black">
            ADMIN LOGIN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                {...form.register("username")}
                placeholder="Enter admin username"
                data-testid="input-username"
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                placeholder="Enter password"
                data-testid="input-password"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Logging in..." : "Login to Admin Panel"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
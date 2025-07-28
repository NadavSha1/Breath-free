import React, { useState } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, Heart, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Clear any old authentication data and login
      await User.login(email, password);
      
      toast({
        title: "Welcome to BreatheFree!",
        description: "You're now logged in. Let's start your smoke-free journey!",
      });

      // Navigate to onboarding or home based on completion status
      const user = await User.me();
      if (!user.onboarding_completed) {
        navigate(createPageUrl("Onboarding"));
      } else {
        navigate(createPageUrl("Home"));
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "There was an issue logging you in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await User.login("demo@breathefree.app", "demo");
      
      toast({
        title: "Welcome to BreatheFree Demo!",
        description: "You're now logged in with demo credentials.",
      });

      navigate(createPageUrl("Onboarding"));
    } catch (error) {
      console.error('Demo login error:', error);
      toast({
        title: "Demo Login Error",
        description: "There was an issue with demo login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">BreatheFree</h1>
          <p className="text-gray-600 mt-2">Your journey to a smoke-free life starts here</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to continue your smoke-free journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Try Demo Version
            </Button>

            <div className="text-center text-sm text-gray-600">
              <p>
                This is a standalone version of BreatheFree.
                <br />
                All your data stays private on your device.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-gray-900">Why BreatheFree?</h3>
          <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
            <div className="flex items-center justify-center">
              <Heart className="w-4 h-4 mr-2 text-red-500" />
              Track your progress
            </div>
            <div className="flex items-center justify-center">
              <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
              Beat cravings with support
            </div>
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 mr-2 bg-green-500 rounded-full" />
              100% private & offline
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
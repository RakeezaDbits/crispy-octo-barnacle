import { useState } from "react";
import { useLocation } from "wouter";
import { Shield } from "lucide-react";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { useAuth } from "@/lib/auth-context";

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [, setLocation] = useLocation();
  const { login, register } = useAuth();

  const handleAuthSuccess = (data: { token: string; customer: any }) => {
    // Redirect to dashboard after successful auth
    setLocation('/dashboard');
  };

  const handleLogin = async (data: { token: string; customer: any }) => {
    handleAuthSuccess(data);
  };

  const handleRegister = async (data: { token: string; customer: any }) => {
    handleAuthSuccess(data);
  };

  const handleForgotPassword = () => {
    setMode('forgot');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Alpha Security Bureau</h1>
          <p className="text-gray-600 mt-2">Professional Security Services</p>
        </div>

        {/* Forms */}
        {mode === 'login' && (
          <LoginForm
            onSuccess={handleLogin}
            onSwitchToRegister={() => setMode('register')}
            onForgotPassword={handleForgotPassword}
          />
        )}

        {mode === 'register' && (
          <RegisterForm
            onSuccess={handleRegister}
            onSwitchToLogin={() => setMode('login')}
          />
        )}

        {mode === 'forgot' && (
          <div className="text-center">
            <p>Password reset functionality coming soon...</p>
            <button
              onClick={() => setMode('login')}
              className="text-primary hover:underline mt-4"
            >
              Back to login
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Secure • Professional • Trusted</p>
        </div>
      </div>
    </div>
  );
}
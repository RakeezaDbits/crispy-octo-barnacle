import { Shield, Phone, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { customer, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleAuthAction = () => {
    if (customer) {
      setLocation('/dashboard');
    } else {
      setLocation('/auth');
    }
  };

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => setLocation('/')}>
            <div className="flex-shrink-0 flex items-center">
              <Shield className="h-8 w-8 text-primary mr-2" />
              <span className="font-bold text-xl text-gray-900">Alpha Security Bureau</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a
                href="#services"
                className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Services
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                About
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Contact
              </a>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {customer ? (
              <>
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-primary"
                  onClick={handleAuthAction}
                >
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-primary"
                  onClick={handleAuthAction}
                >
                  Login
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleAuthAction}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <a
              href="#services"
              className="text-gray-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Services
            </a>
            <a
              href="#about"
              className="text-gray-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              About
            </a>
            <a
              href="#contact"
              className="text-gray-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </a>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              {customer ? (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:text-primary"
                    onClick={() => {
                      handleAuthAction();
                      setIsOpen(false);
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:text-primary"
                    onClick={() => {
                      handleAuthAction();
                      setIsOpen(false);
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => {
                      handleAuthAction();
                      setIsOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

import { Shield, Phone, Menu, X, User, Home, Info, Phone as PhoneIcon, Settings } from "lucide-react";
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

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Services', href: '#services', icon: Shield },
    { name: 'About', href: '#about', icon: Info },
    { name: 'Contact', href: '#contact', icon: PhoneIcon },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center cursor-pointer" onClick={() => setLocation('/')}>
            <div className="flex-shrink-0 flex items-center">
              <div className="relative">
                <Shield className="h-10 w-10 text-primary mr-3" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-black">A</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-gray-900 leading-tight">Alpha Security</span>
                <span className="text-sm text-primary font-medium leading-tight">Bureau</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center text-gray-700 hover:text-primary px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-primary/5 group"
                >
                  <Icon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  {item.name}
                </a>
              );
            })}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {customer ? (
              <>
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-primary hover:bg-primary/10"
                  onClick={handleAuthAction}
                >
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-primary hover:bg-primary/10"
                  onClick={handleAuthAction}
                >
                  Login
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={handleAuthAction}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-700">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-6">
                  {/* Mobile Logo */}
                  <div className="flex items-center mb-6">
                    <Shield className="h-8 w-8 text-primary mr-2" />
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-gray-900">Alpha Security</span>
                      <span className="text-sm text-primary font-medium">Bureau</span>
                    </div>
                  </div>

                  {/* Mobile Navigation Items */}
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        className="flex items-center text-gray-700 hover:text-primary px-4 py-3 rounded-lg text-base font-medium transition-colors hover:bg-primary/5"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </a>
                    );
                  })}

                  {/* Mobile Auth Buttons */}
                  <div className="pt-6 border-t border-gray-200 space-y-3">
                    {customer ? (
                      <>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-gray-700 hover:text-primary hover:bg-primary/10"
                          onClick={() => {
                            handleAuthAction();
                            setIsOpen(false);
                          }}
                        >
                          <User className="w-5 h-5 mr-3" />
                          Dashboard
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-primary text-primary hover:bg-primary hover:text-white"
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
                          className="w-full justify-start text-gray-700 hover:text-primary hover:bg-primary/10"
                          onClick={() => {
                            handleAuthAction();
                            setIsOpen(false);
                          }}
                        >
                          Login
                        </Button>
                        <Button
                          className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg"
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

                  {/* User Info (if logged in) */}
                  {customer && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{customer.fullName}</p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

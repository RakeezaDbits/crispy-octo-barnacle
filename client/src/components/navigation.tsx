import { Shield, Phone, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "wouter";

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
                <Shield className="text-primary-700 text-2xl h-8 w-8" />
                <span className="font-bold text-xl text-primary-900">SecureHome Audit</span>
              </Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#services" className="text-gray-600 hover:text-primary-700 transition-colors" data-testid="link-services">
              Services
            </a>
            <a href="#about" className="text-gray-600 hover:text-primary-700 transition-colors" data-testid="link-about">
              About
            </a>
            <a href="#contact" className="text-gray-600 hover:text-primary-700 transition-colors" data-testid="link-contact">
              Contact
            </a>
            <Link href="/admin" className="text-gray-600 hover:text-primary-700 transition-colors" data-testid="link-admin">
              Admin
            </Link>
            <span className="text-primary-700 font-semibold" data-testid="text-phone">
              <Phone className="h-4 w-4 mr-2 inline" />
              (555) 123-4567
            </span>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-8">
                <a href="#services" className="text-lg font-medium">Services</a>
                <a href="#about" className="text-lg font-medium">About</a>
                <a href="#contact" className="text-lg font-medium">Contact</a>
                <Link href="/admin" className="text-lg font-medium">Admin</Link>
                <div className="pt-4 border-t">
                  <span className="text-primary-700 font-semibold">
                    <Phone className="h-4 w-4 mr-2 inline" />
                    (555) 123-4567
                  </span>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

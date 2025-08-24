import { Calendar, Tag, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingModal from "@/components/booking-modal";
import { useState } from "react";

export default function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="relative bg-primary-gradient text-white">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-normal leading-tight mb-6 tracking-wide" data-testid="text-hero-title">
              PROTECT YOUR HOME'S <span className="text-yellow-400">ASSETS & TITLE</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-200 mb-8 leading-relaxed" data-testid="text-hero-subtitle">
              Professional home security audit and title protection services. Safeguard your most valuable investment with our comprehensive assessment and monitoring solutions.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 mb-12">
              <div className="flex items-center text-gray-200" data-testid="trust-indicator-licensed">
                <Tag className="text-yellow-400 mr-2 h-5 w-5" />
                <span className="text-sm font-medium">Licensed & Insured</span>
              </div>
              <div className="flex items-center text-gray-200" data-testid="trust-indicator-monitoring">
                <Clock className="text-yellow-400 mr-2 h-5 w-5" />
                <span className="text-sm font-medium">24/7 Monitoring</span>
              </div>
              <div className="flex items-center text-gray-200" data-testid="trust-indicator-customers">
                <Users className="text-yellow-400 mr-2 h-5 w-5" />
                <span className="text-sm font-medium">5000+ Homes Protected</span>
              </div>
            </div>

            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-success-500 hover:bg-success-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              data-testid="button-schedule-audit"
            >
              <Calendar className="mr-3 h-5 w-5" />
              Schedule Your Free Audit Now
            </Button>
            
            <p className="text-sm text-gray-300 mt-4" data-testid="text-no-commitment">
              <span className="inline-flex items-center">
                <span className="w-2 h-2 bg-success-500 rounded-full mr-2"></span>
                No commitment required • Free consultation • Same-week availability
              </span>
            </p>
          </div>
        </div>
      </section>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}

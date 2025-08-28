
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BookingModal from "@/components/booking-modal";
import Navigation from "@/components/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { 
  Shield, 
  CheckCircle, 
  Users, 
  Clock, 
  Award, 
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Zap,
  Lock,
  Eye,
  Target,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  Globe,
  FileText,
  Calendar
} from "lucide-react";

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const { customer } = useAuth();
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    if (customer) {
      setLocation('/dashboard');
    } else {
      setIsBookingOpen(true);
    }
  };

  const services = [
    {
      icon: Shield,
      title: "Armed and Unarmed Security Officers",
      price: "Contact for Quote",
      description: "Trained personnel offering visible deterrence and responsive protection tailored to your specific security needs.",
      features: ["Licensed security guards", "24/7 availability", "Visible deterrence", "Professional uniforms", "Detailed reporting"],
      duration: "24/7",
      popular: false
    },
    {
      icon: Eye,
      title: "Fire Watch & Security Services",
      price: "Contact for Quote",
      description: "Professional Fire Watch and Security Services ensuring 24/7 protection and compliance.",
      features: [
        "Fire safety monitoring", 
        "Emergency response", 
        "Compliance documentation", 
        "Professional reporting",
        "24/7 coverage",
        "Trained fire watch personnel"
      ],
      duration: "24/7",
      popular: true
    },
    {
      icon: Target,
      title: "Active Shooter Prevention",
      price: "Contact for Quote",
      description: "Professional active shooter prevention, swift response, and crisis management for high-risk scenarios.",
      features: [
        "Threat assessment",
        "Emergency response planning", 
        "Crisis management",
        "Staff training",
        "Security protocols",
        "Rapid response team",
        "Risk mitigation"
      ],
      duration: "As needed",
      popular: false
    }
  ];

  const stats = [
    { icon: Users, number: "8,859,613+", label: "Total Visitors" },
    { icon: Award, number: "50+", label: "Years Experience" },
    { icon: Star, number: "4.9/5", label: "Customer Rating" },
    { icon: CheckCircle, number: "24/7", label: "Security Available" }
  ];

  const features = [
    {
      icon: Target,
      title: "Elite Security Officers",
      description: "Licensed and trained security personnel for your business or event with professional uniforms."
    },
    {
      icon: TrendingUp,
      title: "Manpower and Technology",
      description: "Advanced security solutions combining skilled personnel with cutting-edge technology."
    },
    {
      icon: UserCheck,
      title: "Licensed & Insured",
      description: "Fully licensed, insured, and bonded security professionals ready for deployment."
    },
    {
      icon: Zap,
      title: "24/7/365 Availability",
      description: "Round-the-clock security services available every day of the year when you need us."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Homeowner",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      content: "Alpha Security Bureau transformed our home security. Their comprehensive audit revealed vulnerabilities we never knew existed.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Property Manager",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "Professional, thorough, and incredibly knowledgeable. They provided actionable recommendations that improved our security posture significantly.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Business Owner",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content: "The title protection service gave us peace of mind. Their monitoring detected fraudulent activity early, saving us thousands.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {/* Hero Section */}
      <section className="relative min-h-[90vh] bg-gradient-to-br from-slate-900 via-blue-900 to-black text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Security Badge */}
        <div className="absolute top-8 right-8 hidden lg:block">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <div>
                <div className="text-sm font-semibold text-yellow-400">Licensed & Certified</div>
                <div className="text-xs text-gray-300">Professional Security</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold border border-yellow-500/30">
                  ✓ Licensed Guards
                </div>
                <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold border border-blue-500/30">
                  ✓ Free Consultation
                </div>
                <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-semibold border border-green-500/30">
                  ✓ 50+ Years Experience
                </div>
              </div>
              
              <div>
                <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                  We Supply
                  <br />
                  <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                    Protection
                  </span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
                  Professional Armed & Unarmed Security Officers. 
                  <span className="text-yellow-400 font-semibold"> Get your FREE security consultation today!</span>
                </p>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-8 py-4 text-lg rounded-xl transition-all duration-300 shadow-2xl hover:shadow-yellow-500/25 hover:scale-105 group"
                  onClick={handleGetStarted}
                >
                  <Calendar className="w-6 h-6 mr-3" />
                  {customer ? 'Go to Dashboard' : 'Book FREE Consultation'}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-xl backdrop-blur-sm hover:border-yellow-400/50 transition-all duration-300"
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now: 1-817-383-9098
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-6 pt-8">
                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-bold text-yellow-400">24/7</div>
                  <div className="text-sm text-gray-400">Security Available</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-400">50+</div>
                  <div className="text-sm text-gray-400">States Covered</div>
                </div>
              </div>
            </div>

            {/* Right Visual Element */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Main Image Container */}
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                  <img 
                    src="https://images.unsplash.com/photo-1556157382-97eda2d62296?w=600&h=400&fit=crop"
                    alt="Professional Security Team"
                    className="w-full h-80 object-cover rounded-2xl shadow-2xl"
                  />
                  
                  {/* Floating Cards */}
                  <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">Licensed</div>
                        <div className="text-xs text-gray-600">Certified Guards</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-4 -left-4 bg-yellow-500 rounded-2xl p-4 shadow-2xl">
                    <div className="text-center">
                      <div className="text-lg font-bold text-black">FREE</div>
                      <div className="text-sm text-black">Quote</div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-8 left-8 w-4 h-4 bg-yellow-500 rounded-full animate-ping"></div>
                <div className="absolute bottom-8 right-8 w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="rgb(249, 250, 251)" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-gray-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What We Offer
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Providing you protection is our only business. We uphold our reputation of being an industry leader.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Complete Security Guard Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Alpha Security Bureau provides top-tier Armed and Unarmed Security Guard services tailored for every environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className={`relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 ${service.popular ? 'border-yellow-500 shadow-lg' : 'border-gray-200'}`}>
                {service.popular && (
                  <div className="absolute top-0 right-0 bg-yellow-500 text-black px-3 py-1 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                      <service.icon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{service.price}</div>
                      <div className="text-sm text-gray-500">{service.duration}</div>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{service.title}</CardTitle>
                  <CardDescription className="text-gray-600">{service.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${service.popular ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}
                    onClick={() => setIsBookingOpen(true)}
                  >
                    Book This Service
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Team Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Get 3 Security Companies at the Price of One
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                We can start as soon as possible and our prices are the most competitive ones in the entire nation. 
                Let us help you with a free price quote and beat the current security price that you're paying.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <AlertTriangle className="w-8 h-8 text-yellow-400 mb-2" />
                  <h3 className="font-semibold mb-1">Elite Security Officers</h3>
                  <p className="text-sm text-gray-300">Professional guards for your business or event</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <Globe className="w-8 h-8 text-blue-400 mb-2" />
                  <h3 className="font-semibold mb-1">Security Available 24/7/365</h3>
                  <p className="text-sm text-gray-300">Round-the-clock protection when you need it</p>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                onClick={() => setIsBookingOpen(true)}
              >
                Get Free Quote
              </Button>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1556157382-97eda2d62296?w=600&h=400&fit=crop"
                alt="Professional Security Team"
                className="rounded-lg shadow-2xl w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600">
              Trusted by homeowners and businesses across the region
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                  
                  <div className="flex items-center">
                    <img 
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 object-cover"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Secure Your Business?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Contact us today for a free quote and find out how we can help secure your site, property, or event with reliable and professional security solutions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg"
              onClick={() => setIsBookingOpen(true)}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Get Free Consultation
            </Button>
            
            <div className="flex items-center text-gray-300">
              <Phone className="w-5 h-5 mr-2" />
              <span>Call: (555) 123-SAFE</span>
            </div>
          </div>
        </div>
      </section>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
      />
    </div>
  );
}

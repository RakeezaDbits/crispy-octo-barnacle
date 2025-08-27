import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BookingModal from "@/components/booking-modal";
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
      title: "Basic Security Audit",
      price: "$50",
      description: "Essential home security assessment covering entry points, locks, and basic vulnerabilities.",
      features: ["Entry point assessment", "Lock evaluation", "Basic security recommendations", "Written report"],
      duration: "60 min",
      popular: false
    },
    {
      icon: Lock,
      title: "Comprehensive Security & Title Protection",
      price: "$150",
      description: "Complete security audit plus title monitoring and protection services for maximum peace of mind.",
      features: [
        "Complete security audit", 
        "Title deed verification", 
        "Property ownership monitoring", 
        "Legal document review",
        "6-month monitoring service",
        "Detailed report with action plan"
      ],
      duration: "120 min",
      popular: true
    },
    {
      icon: Eye,
      title: "Premium Executive Protection Package",
      price: "$300",
      description: "Advanced security assessment with ongoing monitoring, emergency response planning, and VIP consultation.",
      features: [
        "Advanced threat assessment",
        "Emergency response planning", 
        "Smart home security integration",
        "24/7 monitoring setup",
        "Personal security consultation",
        "Quarterly follow-up assessments",
        "Priority emergency response"
      ],
      duration: "180 min",
      popular: false
    }
  ];

  const stats = [
    { icon: Users, number: "2,500+", label: "Homes Protected" },
    { icon: Award, number: "15+", label: "Years Experience" },
    { icon: Star, number: "4.9/5", label: "Customer Rating" },
    { icon: CheckCircle, number: "99%", label: "Success Rate" }
  ];

  const features = [
    {
      icon: Target,
      title: "Precision Assessment",
      description: "Our certified experts conduct thorough security evaluations using industry-leading methodologies."
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Comprehensive reporting with actionable insights and priority-based recommendations."
    },
    {
      icon: UserCheck,
      title: "Certified Professionals",
      description: "Licensed security specialists with extensive training and background verification."
    },
    {
      icon: Zap,
      title: "Rapid Response",
      description: "Quick deployment and immediate assessment with detailed reporting within 24 hours."
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
      {/* Header Section */}
      <header className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>

        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/30">
              <Shield className="w-4 h-4 mr-2" />
              Trusted Security Professionals
            </Badge>

            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Protect Your Home & Assets with 
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"> Professional Security</span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Comprehensive security audits, title protection, and asset monitoring services by certified professionals. 
              Safeguard what matters most with industry-leading security solutions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl group"
                onClick={handleGetStarted}
              >
                {customer ? 'Go to Dashboard' : 'Schedule Security Audit'}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button 
                variant="outline" 
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-lg backdrop-blur-sm"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Eye className="w-5 h-5 mr-2" />
                View Services
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20"></div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Alpha Security Bureau
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Premier Security Services • Professional Guards • 24/7 Protection
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center space-x-2 text-blue-200">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">24/7 Available</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-200">
                <Award className="w-5 h-5" />
                <span className="text-sm font-medium">Licensed & Insured</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-200">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Trained Professionals</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={handleGetStarted}
              >
                <Shield className="w-5 h-5 mr-2" />
                Get Security Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button 
                variant="outline" 
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-semibold px-8 py-4 text-lg"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Phone className="w-5 h-5 mr-2" />
                Call: (555) 123-4567
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-12" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-gray-50"></path>
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
              Why Choose Alpha Security Bureau
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive approach to security combines cutting-edge technology with decades of expertise
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
              Professional Security Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our comprehensive security packages designed to protect your home and assets
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
                Certified Security Professionals
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Our team consists of licensed security experts, former law enforcement professionals, 
                and certified safety specialists with extensive training and background verification.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <AlertTriangle className="w-8 h-8 text-yellow-400 mb-2" />
                  <h3 className="font-semibold mb-1">Risk Assessment</h3>
                  <p className="text-sm text-gray-300">Comprehensive vulnerability analysis</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <Globe className="w-8 h-8 text-blue-400 mb-2" />
                  <h3 className="font-semibold mb-1">24/7 Monitoring</h3>
                  <p className="text-sm text-gray-300">Round-the-clock security surveillance</p>
                </div>
              </div>

              <Button 
                size="lg" 
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                onClick={() => setIsBookingOpen(true)}
              >
                Meet Our Team
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
            Ready to Secure Your Property?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Get started with a comprehensive security audit today. Our experts are standing by to protect what matters most to you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg"
              onClick={() => setIsBookingOpen(true)}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Assessment
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

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
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
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
            <div className="mb-6 text-center">
              <div className="text-yellow-400 font-semibold mb-2">Licensed and Trained Security Guards</div>
              <div className="text-yellow-400 font-semibold mb-2">Free Consultations</div>
              <div className="text-yellow-400 font-semibold">50 Years of Combined Experience</div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              We Supply 
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Protection</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Armed and Unarmed Security Officers, Free Security Consulting and Counseling, Free Price Quote
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl group"
                onClick={handleGetStarted}
              >
                {customer ? 'Go to Dashboard' : 'Book A Free Consultation'}
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

import { Search, File, Shield } from "lucide-react";

export default function BenefitsSection() {
  const benefits = [
    {
      icon: Search,
      title: "Professional Asset Audit",
      description: "Comprehensive documentation of all valuable items in your home with detailed photography and descriptions"
    },
    {
      icon: File,
      title: "Title Protection",
      description: "24/7 monitoring of your property title to detect any unauthorized changes or fraudulent activity"
    },
    {
      icon: Shield,
      title: "Insurance Support",
      description: "Complete documentation package ready for insurance claims with proper valuation and proof of ownership"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" data-testid="text-benefits-title">
            Comprehensive Home Protection
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-benefits-subtitle">
            Our expert team provides thorough asset documentation and title monitoring to protect your home investment
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div 
                key={index}
                className="text-center p-8 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors duration-300"
                data-testid={`card-benefit-${index}`}
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IconComponent className="text-primary-700 h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4" data-testid={`text-benefit-title-${index}`}>
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed" data-testid={`text-benefit-description-${index}`}>
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

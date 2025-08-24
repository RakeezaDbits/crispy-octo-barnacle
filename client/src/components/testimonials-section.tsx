import { Star } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Michael Johnson",
      location: "Denver, CO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150&face",
      text: "Professional service from start to finish. The audit was thorough and the documentation was exactly what I needed for my insurance."
    },
    {
      name: "Sarah Williams",
      location: "Austin, TX",
      image: "https://images.unsplash.com/photo-1494790108755-2616b412e2bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150&face",
      text: "The title monitoring caught an issue that could have been very costly. Excellent service and peace of mind."
    },
    {
      name: "David Chen",
      location: "Seattle, WA",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150&face",
      text: "Quick, professional, and thorough. The online booking was easy and the follow-up communication was excellent."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" data-testid="text-testimonials-title">
            Trusted by Homeowners
          </h2>
          <p className="text-xl text-gray-600" data-testid="text-testimonials-subtitle">
            See what our customers say about our service
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-8" data-testid={`card-testimonial-${index}`}>
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed" data-testid={`text-testimonial-quote-${index}`}>
                "{testimonial.text}"
              </p>
              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={`${testimonial.name} testimonial`}
                  className="w-12 h-12 rounded-full mr-4"
                  data-testid={`img-testimonial-avatar-${index}`}
                />
                <div>
                  <p className="font-semibold text-gray-900" data-testid={`text-testimonial-name-${index}`}>
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-600" data-testid={`text-testimonial-location-${index}`}>
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

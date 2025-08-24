export default function ProcessSection() {
  const steps = [
    {
      number: 1,
      title: "Schedule Online",
      description: "Book your free audit appointment through our simple online form. Choose a convenient time within the next 7 days."
    },
    {
      number: 2,
      title: "Professional Audit",
      description: "Our certified officer visits your home to conduct a comprehensive audit and documentation of your valuable assets."
    },
    {
      number: 3,
      title: "Complete Protection",
      description: "Receive your comprehensive report and optional ongoing title monitoring for complete peace of mind."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" data-testid="text-process-title">
            Simple 3-Step Process
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-process-subtitle">
            Professional home protection made easy with our streamlined process
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative" data-testid={`card-step-${step.number}`}>
              <div className="text-center">
                <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4" data-testid={`text-step-title-${step.number}`}>
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed" data-testid={`text-step-description-${step.number}`}>
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-8 h-px bg-primary-300 transform translate-x-1/2"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

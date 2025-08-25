import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, User, Mail, Phone, MapPin, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { initializeSquare } from "@/lib/square";
import { apiRequest } from "@/lib/queryClient";

const bookingSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter your full address"),
  servicePackage: z.string().min(1, "Please select a service package"),
  preferredDate: z.string().min(1, "Please select a preferred date"),
  preferredTime: z.string().min(1, "Please select a preferred time"),
  specialRequests: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  servicePackages: Array<{
    id: number;
    name: string;
    price: number;
    features: string[];
    duration: number;
  }>;
}

export default function BookingModal({ isOpen, onClose, servicePackages }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'square' | 'cash'>('square');
  const { toast } = useToast();

  // Add proper refs
  const squareCardRef = useRef<any>(null);
  const paymentFormRef = useRef<HTMLDivElement>(null);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      servicePackage: "",
      preferredDate: "",
      preferredTime: "",
      specialRequests: "",
    },
  });

  // Initialize Square payment form
  useEffect(() => {
    let isComponentMounted = true;

    const initPaymentForm = async () => {
      if (step === 3 && paymentMethod === 'square' && paymentFormRef.current && !squareCardRef.current) {
        try {
          const payments = await initializeSquare();
          if (isComponentMounted && payments) {
            const card = await payments.card();
            if (card && isComponentMounted) {
              await card.attach('#card-container');
              squareCardRef.current = card;
            }
          }
        } catch (error) {
          console.error('Failed to initialize Square:', error);
          if (isComponentMounted) {
            toast({
              title: "Payment Error",
              description: "Failed to load payment form. Please try again.",
              variant: "destructive",
            });
          }
        }
      }
    };

    initPaymentForm();

    return () => {
      isComponentMounted = false;
      // Cleanup Square card safely
      if (squareCardRef.current) {
        try {
          squareCardRef.current.destroy();
        } catch (error) {
          console.warn('Error cleaning up Square card:', error);
        } finally {
          squareCardRef.current = null;
        }
      }
    };
  }, [step, paymentMethod, toast]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedPackage(null);
      setPaymentMethod('square');
      form.reset();

      // Cleanup Square card when modal closes
      if (squareCardRef.current) {
        try {
          squareCardRef.current.destroy();
        } catch (error) {
          console.warn('Error cleaning up Square card on close:', error);
        } finally {
          squareCardRef.current = null;
        }
      }
    }
  }, [isOpen, form]);

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (data: BookingFormData) => {
    setIsLoading(true);

    try {
      let paymentToken = null;

      if (paymentMethod === 'square' && squareCardRef.current) {
        const result = await squareCardRef.current.tokenize();
        if (result.status === 'OK') {
          paymentToken = result.token;
        } else {
          throw new Error('Payment processing failed');
        }
      }

      const selectedPkg = servicePackages.find(pkg => pkg.id === selectedPackage);

      const appointmentData = {
        ...data,
        servicePackageId: selectedPackage,
        paymentMethod,
        paymentToken,
        totalAmount: selectedPkg?.price || 0,
      };

      const response = await apiRequest('POST', '/api/appointments', appointmentData);

      if (response.ok) {
        toast({
          title: "Booking Confirmed!",
          description: "Your security audit has been scheduled. You'll receive a confirmation email shortly.",
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Your Security Audit</DialogTitle>
          <DialogDescription>
            Complete the booking process to schedule your professional home security audit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step >= stepNumber
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                      placeholder="John"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                      placeholder="Doe"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="john.doe@email.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register("phone")}
                    placeholder="(555) 123-4567"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">Property Address</Label>
                  <Textarea
                    id="address"
                    {...form.register("address")}
                    placeholder="123 Main St, City, State 12345"
                    rows={2}
                  />
                  {form.formState.errors.address && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <Button type="button" onClick={handleNext} className="w-full">
                  Next: Select Service
                </Button>
              </div>
            )}

            {/* Step 2: Service Selection & Scheduling */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Service & Schedule</h3>

                <div>
                  <Label>Select Service Package</Label>
                  <div className="space-y-3 mt-2">
                    {servicePackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedPackage === pkg.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => {
                          setSelectedPackage(pkg.id);
                          form.setValue("servicePackage", pkg.name);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{pkg.name}</h4>
                            <p className="text-sm text-gray-600">
                              Duration: {pkg.duration} minutes
                            </p>
                          </div>
                          <span className="font-bold text-primary">
                            ${pkg.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {form.formState.errors.servicePackage && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.servicePackage.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredDate">Preferred Date</Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      {...form.register("preferredDate")}
                      min={getMinDate()}
                      max={getMaxDate()}
                    />
                    {form.formState.errors.preferredDate && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.preferredDate.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="preferredTime">Preferred Time</Label>
                    <Select onValueChange={(value) => form.setValue("preferredTime", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.preferredTime && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.preferredTime.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                  <Textarea
                    id="specialRequests"
                    {...form.register("specialRequests")}
                    placeholder="Any specific areas of concern or special requirements..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                    Back
                  </Button>
                  <Button type="button" onClick={handleNext} className="flex-1">
                    Next: Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label>Payment Method</Label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="square"
                          checked={paymentMethod === 'square'}
                          onChange={(e) => setPaymentMethod(e.target.value as 'square' | 'cash')}
                        />
                        <span>Credit/Debit Card</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          checked={paymentMethod === 'cash'}
                          onChange={(e) => setPaymentMethod(e.target.value as 'square' | 'cash')}
                        />
                        <span>Pay at Service</span>
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'square' && (
                    <div>
                      <Label>Card Information</Label>
                      <div 
                        ref={paymentFormRef}
                        id="card-container" 
                        className="mt-2"
                      />
                    </div>
                  )}

                  {paymentMethod === 'cash' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        You will pay ${servicePackages.find(pkg => pkg.id === selectedPackage)?.price || 0} 
                        in cash when our security officer arrives for your audit.
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span>${servicePackages.find(pkg => pkg.id === selectedPackage)?.price || 0}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Processing..." : "Confirm Booking"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
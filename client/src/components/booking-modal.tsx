import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Clock, Shield, Phone, Mail, User, DollarSign, CheckCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";
// Assuming SquarePaymentForm is a component that handles Square payments
// import SquarePaymentForm from './SquarePaymentForm'; 

// Placeholder for SquarePaymentForm if it's not defined elsewhere
const SquarePaymentForm = ({ amount, onPaymentSuccess, onPaymentError, disabled, appointmentId }: any) => {
  return (
    <div className="text-center py-4">
      <p className="text-muted-foreground mb-4">Simulating Square Payment for ${amount.toFixed(2)}</p>
      <Button onClick={() => onPaymentSuccess({ nonce: 'mock-nonce-from-square' })} disabled={disabled}>
        {disabled ? "Processing..." : `Pay with Square ($${amount.toFixed(2)})`}
      </Button>
      <Button variant="outline" onClick={() => onPaymentError(new Error("Payment cancelled"))} disabled={disabled} className="ml-2">
        Cancel Payment
      </Button>
    </div>
  );
};


interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage?: {
    id: string;
    name: string;
    price: string;
    description: string;
    features: string[];
    duration?: number;
  } | null;
}

export default function BookingModal({ isOpen, onClose, selectedPackage }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    preferredDate: undefined as Date | undefined,
    preferredTime: "",
    notes: "",
    titleProtection: false,
  });

  const [, setLocation] = useLocation();
  const { customer, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Replaced mutation to use fetch directly with auth token
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || 'Failed to create appointment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
  });

  const resetForm = () => {
    setFormData({
      fullName: customer?.fullName || '',
      email: customer?.email || '',
      phone: '',
      address: '',
      preferredDate: undefined,
      preferredTime: '',
      notes: '',
      titleProtection: false,
    });
    setCurrentStep(1); // Reset to the first step
  };

  const handlePaymentError = (error: Error) => {
    console.error("Payment processing error:", error);
    toast({
      title: "Payment Failed",
      description: error.message || "An unexpected error occurred during payment.",
      variant: "destructive",
    });
    setIsProcessing(false); // Ensure processing state is reset
  };

  // Updated handlePaymentSuccess to match the new mutation structure and include all necessary fields
  const handlePaymentSuccess = async (result: any) => {
    setIsProcessing(true);

    try {
      const appointmentData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        address: formData.address,
        // Assuming these fields might be relevant, though not explicitly in initial formData
        // city: formData.city,
        // state: formData.state,
        // zipCode: formData.zipCode,
        // specialRequests: formData.notes, // Mapping notes to specialRequests
        servicePackageId: selectedPackage?.id,
        amount: totalAmount,
        nonce: result.nonce || result.token, // Payment token from Square
        titleProtection: formData.titleProtection || false,
        status: 'pending',
        paymentStatus: 'pending'
      };

      console.log('Creating appointment with data:', appointmentData);

      const response = await createAppointmentMutation.mutateAsync(appointmentData);

      toast({
        title: "Payment Successful! 🎉",
        description: "Your appointment has been booked. You'll receive a confirmation email shortly.",
      });

      setCurrentStep(3); // Move to confirmation step
    } catch (error) {
      console.error('Appointment creation failed:', error);
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to create appointment after payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customer) {
      toast({
        title: "Authentication Required",
        description: "Please login or register to book an appointment.",
        variant: "destructive",
      });
      setLocation("/auth");
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.preferredDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Move to payment step
    setCurrentStep(2);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!customer) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Please Login or Register</h3>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to book an appointment with our security experts.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => setLocation("/auth")}
                className="w-full"
              >
                Login / Register
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const baseAmount = selectedPackage ? parseFloat(selectedPackage.price) : 150.00;
  const titleProtectionFee = formData.titleProtection ? 25.00 : 0;
  const totalAmount = baseAmount + titleProtectionFee;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <Shield className="h-6 w-6 mr-2 text-primary" />
            Book Your Security Audit
          </DialogTitle>
        </DialogHeader>

        {selectedPackage && (
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-lg mb-2">{selectedPackage.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{selectedPackage.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">${selectedPackage.price}</span>
              {selectedPackage.duration && (
                <span className="text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {selectedPackage.duration} minutes
                </span>
              )}
            </div>
          </div>
        )}

        {/* Step Indicator (Optional) */}
        <div className="flex justify-center mb-4">
          <div className={cn("step-indicator", currentStep === 1 && "active")}>Details</div>
          <div className={cn("step-indicator", currentStep === 2 && "active")}>Payment</div>
          <div className={cn("step-indicator", currentStep === 3 && "active")}>Confirm</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Customer Information & Scheduling */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Property Address *
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter the complete address where the security audit will be conducted"
                    required
                    rows={3}
                  />
                </div>
              </div>

              {/* Scheduling */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Preferred Schedule</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Preferred Date *
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.preferredDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.preferredDate ? format(formData.preferredDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.preferredDate}
                          onSelect={(date) => handleInputChange("preferredDate", date)}
                          disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredTime" className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Preferred Time
                    </Label>
                    <Input
                      id="preferredTime"
                      type="time"
                      value={formData.preferredTime}
                      onChange={(e) => handleInputChange("preferredTime", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Any specific concerns, access instructions, or special requirements?"
                    rows={3}
                  />
                </div>
              </div>

              {/* Additional Services */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Additional Services</h3>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="titleProtection"
                    checked={formData.titleProtection}
                    onCheckedChange={(checked) => handleInputChange("titleProtection", checked)}
                  />
                  <Label htmlFor="titleProtection" className="flex items-center cursor-pointer">
                    <Shield className="h-4 w-4 mr-1 text-primary" />
                    Add Title Protection Service (+$25.00)
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  Protect your property title from fraud and unauthorized transfers
                </p>
              </div>

              {/* Price Summary */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Price Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Security Audit Service</span>
                    <span>${baseAmount.toFixed(2)}</span>
                  </div>
                  {formData.titleProtection && (
                    <div className="flex justify-between">
                      <span>Title Protection Service</span>
                      <span>+${titleProtectionFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 font-semibold flex justify-between">
                    <span>Total Amount</span>
                    <span className="text-primary">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button for Step 1 */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                >
                  Proceed to Payment
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
                <p className="text-muted-foreground">
                  Complete your payment to confirm your appointment
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span>Security Audit Service</span>
                  <span>${selectedPackage?.price || '150.00'}</span>
                </div>
                {formData.titleProtection && (
                  <div className="flex justify-between items-center mb-2">
                    <span>Title Protection Add-on</span>
                    <span>$25.00</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Amount</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <SquarePaymentForm
                appointmentId="temp-id" // This might need to be generated or passed differently
                amount={totalAmount}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                disabled={isProcessing}
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Back to Details
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Appointment Confirmed! 🎉</h3>
                <p className="text-muted-foreground mb-4">
                  Your home security audit has been successfully scheduled.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-green-800">What happens next:</h4>
                <ul className="space-y-2 text-sm text-green-700">
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Confirmation email sent to {formData.email}
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    DocuSign agreement will be sent within 1 hour
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Our officer will call 24 hours before your appointment
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Appointment: {formData.preferredDate ? new Date(formData.preferredDate).toLocaleDateString() : 'N/A'}
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Important Reminders:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Have all valuable items accessible during the visit</li>
                  <li>• Gather receipts, warranties, and certificates</li>
                  <li>• Someone 18+ must be present during entire audit</li>
                </ul>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                This dialog will close automatically in a few seconds...
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
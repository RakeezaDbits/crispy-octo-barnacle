import React, { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  CreditCard,
  X,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
} from "lucide-react";
import {
  insertAppointmentSchema,
  type InsertAppointment,
  type ServicePackage,
} from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { authenticatedRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { SquarePaymentForm } from "@/components/square-payment-form";
import { useAuth } from "@/lib/auth-context";

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

type FormData = InsertAppointment & {
  readinessCheck: boolean;
  servicePackageId?: number;
};

// Define the schema for the booking form
const bookingSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter your full address"),
  preferredDate: z.string().min(1, "Please select a preferred date"),
  preferredTime: z.enum(["morning", "afternoon", "evening"]),
  amount: z.string().default("225.00"),
  titleProtection: z.boolean().default(false),
  readinessCheck: z.boolean().default(false),
});

export default function BookingModal({ isOpen, onClose, selectedPackage }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [appointmentId, setAppointmentId] = useState<string>("");
  const [confirmedAppointment, setConfirmedAppointment] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { customer, token } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(
      insertAppointmentSchema.extend({
        readinessCheck: z
          .boolean()
          .refine(
            (val: boolean) => val === true,
            "You must confirm readiness for the audit",
          ),
      }),
    ),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      preferredDate: "",
      preferredTime: "",
      amount: "225.00",
      titleProtection: false,
      readinessCheck: false,
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      const response = await fetch("/api/auth/appointments", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create appointment');
      }
      
      return response.json();
    },
    onSuccess: (appointment) => {
      setAppointmentId(appointment.id);
      setCurrentStep(2);
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create appointment",
        variant: "destructive",
      });
    },
  });

  const processPaymentMutation = useMutation({
    mutationFn: async ({
      sourceId,
      amount,
    }: {
      sourceId: string;
      amount: number;
    }) => {
      const response = await apiRequest("POST", "/api/payments", {
        appointmentId,
        sourceId,
        amount,
      });
      return response.json();
    },
    onSuccess: () => {
      setCurrentStep(3);
      setConfirmedAppointment({
        ...form.getValues(),
        id: appointmentId,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description:
          error instanceof Error ? error.message : "Payment processing failed",
        variant: "destructive",
      });
    },
  });

  // Reset modal state
  const resetModal = useCallback(() => {
    setCurrentStep(1);
    setAppointmentId("");
    setConfirmedAppointment(null);
    form.reset();
  }, [form]);

  const handleStep1Submit = async (data: FormData) => {
    console.log("Form submitted with data:", data);
    console.log("Readiness check value:", data.readinessCheck);

    if (!data.readinessCheck) {
      console.log("Readiness check failed!");
      toast({
        title: "Confirmation Required",
        description:
          "Please confirm that you will have all necessary items ready for the audit.",
        variant: "destructive",
      });
      return;
    }

    // Calculate total amount based on title protection
    const calculatedAmount = data.titleProtection ? "250.00" : "225.00";

    console.log("Creating appointment...");
    const { readinessCheck, ...appointmentData } = data;
    appointmentData.amount = calculatedAmount;
    createAppointmentMutation.mutate(appointmentData);
  };

  const handlePaymentSuccess = async (paymentRequest: any) => {
    setIsProcessingPayment(true);
    try {
      await processPaymentMutation.mutateAsync({
        sourceId: paymentRequest.nonce,
        amount: paymentRequest.amount,
      });
    } catch (error) {
      toast({
        title: "Payment Error",
        description:
          error instanceof Error ? error.message : "Payment processing failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Error",
      description: error,
      variant: "destructive",
    });
  };

  const handleClose = useCallback(() => {
    resetModal();
    onClose();
  }, [resetModal, onClose]);

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    return maxDate.toISOString().split("T")[0];
  };

  const baseAmount = selectedPackage ? parseFloat(selectedPackage.price) : 225.00;
  const titleProtectionFee = form.watch("titleProtection") ? 25.00 : 0;
  const totalAmount = baseAmount + titleProtectionFee;

  // Don't render anything if not open
  if (!isOpen) return null;

  // If user is not logged in, show a message and close the modal or redirect
  if (!customer || !token) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent
          className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
          aria-describedby="booking-dialog-description"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-600" />
              Authentication Required
            </DialogTitle>
          </DialogHeader>
          <DialogDescription id="booking-dialog-description">
            Please log in to book an appointment.
          </DialogDescription>
          <Button onClick={handleClose} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        aria-describedby="booking-dialog-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            {currentStep === 1 && "Schedule Your Audit"}
            {currentStep === 2 && "Payment Information"}
            {currentStep === 3 && "Booking Confirmed"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription id="booking-dialog-description" className="sr-only">
          {currentStep === 1 &&
            "Fill out your information to schedule an audit"}
          {currentStep === 2 && "Complete your payment to confirm the booking"}
          {currentStep === 3 && "Your audit has been successfully booked"}
        </DialogDescription>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 -mx-6 -mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 1
                    ? "bg-primary text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                1
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  currentStep >= 1 ? "text-primary" : "text-gray-600"
                }`}
              >
                Contact Info
              </span>
            </div>
            <div className="h-px bg-gray-300 flex-1 mx-4"></div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 2
                    ? "bg-primary text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                2
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  currentStep >= 2 ? "text-primary" : "text-gray-600"
                }`}
              >
                Payment
              </span>
            </div>
            <div className="h-px bg-gray-300 flex-1 mx-4"></div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 3
                    ? "bg-primary text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                3
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  currentStep >= 3 ? "text-primary" : "text-gray-600"
                }`}
              >
                Confirmation
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Contact Information */}
        {currentStep === 1 && (
          <form
            onSubmit={form.handleSubmit(handleStep1Submit)}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  {...form.register("fullName")}
                  placeholder="John Smith"
                  data-testid="input-full-name"
                  defaultValue={customer?.fullName || ""} // Pre-fill if user data is available
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.fullName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="john@example.com"
                  data-testid="input-email"
                  defaultValue={customer?.email || ""} // Pre-fill if user data is available
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...form.register("phone")}
                  placeholder="(555) 123-4567"
                  data-testid="input-phone"
                  defaultValue={customer?.phone || ""} // Pre-fill if user data is available
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="preferredDate">Preferred Date *</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  {...form.register("preferredDate")}
                  min={getMinDate()}
                  max={getMaxDate()}
                  data-testid="input-preferred-date"
                />
                {form.formState.errors.preferredDate && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.preferredDate.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Home Address *</Label>
              <Input
                id="address"
                {...form.register("address")}
                placeholder="123 Main Street, City, State 12345"
                data-testid="input-address"
                defaultValue={customer?.address || ""} // Pre-fill if user data is available
              />
              {form.formState.errors.address && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="preferredTime">Preferred Time</Label>
              <Select
                onValueChange={(value) => form.setValue("preferredTime", value as any)}
                value={form.watch("preferredTime")}
              >
                <SelectTrigger data-testid="select-preferred-time">
                  <SelectValue placeholder="Select preferred time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                  <SelectItem value="evening">Evening (5 PM - 8 PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="titleProtection"
                checked={!!form.watch("titleProtection")}
                onCheckedChange={(checked) => form.setValue("titleProtection", !!checked)}
                data-testid="checkbox-title-protection"
              />
              <Label htmlFor="titleProtection" className="text-sm">
                Add Title Protection Service (+$25.00)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="readinessCheck"
                checked={!!form.watch("readinessCheck")}
                onCheckedChange={(checked) => form.setValue("readinessCheck", !!checked)}
                data-testid="checkbox-readiness"
              />
              <Label htmlFor="readinessCheck" className="text-sm">
                I confirm that I will have all necessary items ready for the audit *
              </Label>
            </div>
            {form.formState.errors.readinessCheck && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.readinessCheck.message}
              </p>
            )}

            {/* Price Summary */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Price Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Security Audit Service</span>
                    <span>${baseAmount.toFixed(2)}</span>
                  </div>
                  {form.watch("titleProtection") && (
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
              </CardContent>
            </Card>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={createAppointmentMutation.isPending}
                data-testid="button-proceed-payment"
                onClick={() => {
                  console.log("Button clicked!");
                  console.log("Form errors:", form.formState.errors);
                  console.log("Form is valid:", form.formState.isValid);
                  form.handleSubmit(handleStep1Submit)();
                }}
              >
                {createAppointmentMutation.isPending ? "Processing..." : "Proceed to Payment"}
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Payment */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
              <p className="text-muted-foreground mb-4">
                Complete your payment to confirm your appointment
              </p>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Security Audit Service</span>
                    <span>${baseAmount.toFixed(2)}</span>
                  </div>
                  {form.watch("titleProtection") && (
                    <div className="flex justify-between">
                      <span>Title Protection Add-on</span>
                      <span>$25.00</span>
                    </div>
                  )}
                  <div className="border-t pt-2 font-semibold flex justify-between">
                    <span>Total Amount</span>
                    <span className="text-primary">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <SquarePaymentForm
              appointmentId={appointmentId}
              amount={totalAmount}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              disabled={isProcessingPayment}
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                disabled={isProcessingPayment}
                className="flex-1"
              >
                Back to Details
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">
                Booking Confirmed!
              </h3>
              <p className="text-muted-foreground mb-4">
                Your security audit appointment has been successfully booked.
              </p>
            </div>

            {confirmedAppointment && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Appointment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Name:</span>
                      <span>{confirmedAppointment.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span>{confirmedAppointment.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span>{confirmedAppointment.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{confirmedAppointment.preferredDate}</span>
                    </div>
                    {confirmedAppointment.preferredTime && (
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span>{confirmedAppointment.preferredTime}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold">
                      <span>Total Paid:</span>
                      <span className="text-green-600">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-sm text-muted-foreground">
              <p>You will receive a confirmation email shortly with all the details.</p>
              <p>Our team will contact you within 24 hours to finalize the appointment.</p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
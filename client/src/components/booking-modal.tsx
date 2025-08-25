import { useState, useEffect, useRef, useCallback } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { initializeSquare } from "@/lib/square";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormData = InsertAppointment & {
  readinessCheck: boolean;
  servicePackageId: number;
};

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [appointmentId, setAppointmentId] = useState<string>("");
  const [confirmedAppointment, setConfirmedAppointment] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [squareReady, setSquareReady] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(
    null,
  );
  const [cardInstance, setCardInstance] = useState<any>(null);

  // Use refs for cleanup tracking
  const isCleaningUpRef = useRef(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch service packages
  const { data: servicePackages, isLoading: packagesLoading } = useQuery<
    ServicePackage[]
  >({
    queryKey: ["/api/service-packages"],
  });

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
      titleProtection: false,
      readinessCheck: false,
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      const response = await apiRequest("POST", "/api/appointments", data);
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

  // Cleanup function
  const cleanupCard = useCallback(() => {
    if (isCleaningUpRef.current) return;

    isCleaningUpRef.current = true;

    if (cardInstance) {
      try {
        cardInstance.destroy();
      } catch (error) {
        // Silently ignore cleanup errors
      }
    }

    setCardInstance(null);
    setSquareReady(false);

    // Reset cleanup flag after a brief delay
    setTimeout(() => {
      isCleaningUpRef.current = false;
    }, 100);
  }, [cardInstance]);

  // Initialize Square when reaching step 2
  useEffect(() => {
    let mounted = true;
    let initializationTimer: NodeJS.Timeout;

    if (currentStep === 2 && !cardInstance && !isCleaningUpRef.current) {
      const initializeCard = async () => {
        try {
          console.log("Initializing Square payment form...");
          const payments = await initializeSquare();
          const card = await payments.card();

          // Wait for DOM to be ready and modal animation to complete
          initializationTimer = setTimeout(async () => {
            if (!mounted || isCleaningUpRef.current) {
              console.log(
                "Component unmounted during initialization, cleaning up...",
              );
              return;
            }

            try {
              console.log("Attaching card to container...");
              await card.attach("#card-container");

              if (mounted && !isCleaningUpRef.current) {
                setCardInstance(card);
                setSquareReady(true);
                console.log("Square payment form ready!");
              } else {
                // Clean up if component unmounted during attachment
                try {
                  card.destroy();
                } catch (error) {
                  // Ignore cleanup errors
                }
              }
            } catch (attachError) {
              console.error("Failed to attach card:", attachError);
              if (mounted && !isCleaningUpRef.current) {
                toast({
                  title: "Payment System Error",
                  description: "Failed to load payment form. Please try again.",
                  variant: "destructive",
                });
              }
            }
          }, 300); // Wait for modal animation
        } catch (error) {
          console.error("Failed to initialize Square:", error);
          if (mounted && !isCleaningUpRef.current) {
            toast({
              title: "Payment System Error",
              description:
                "Payment system temporarily unavailable. Please try again.",
              variant: "destructive",
            });
          }
        }
      };

      initializeCard();
    }

    return () => {
      mounted = false;
      if (initializationTimer) {
        clearTimeout(initializationTimer);
      }
      if (currentStep !== 2) {
        cleanupCard();
      }
    };
  }, [currentStep, cardInstance, cleanupCard, toast]);

  // Cleanup on unmount or modal close
  useEffect(() => {
    return () => {
      cleanupCard();
    };
  }, [cleanupCard]);

  const handleStep1Submit = async (data: FormData) => {
    if (!data.readinessCheck) {
      toast({
        title: "Confirmation Required",
        description:
          "Please confirm that you will have all necessary items ready for the audit.",
        variant: "destructive",
      });
      return;
    }

    const { readinessCheck, ...appointmentData } = data;
    createAppointmentMutation.mutate(appointmentData);
  };

  const handlePayment = async () => {
    if (!cardInstance || !squareReady) {
      toast({
        title: "Payment System Loading",
        description: "Please wait for the payment system to load.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);
    try {
      const result = await cardInstance.tokenize();
      if (result.status === "OK") {
        await processPaymentMutation.mutateAsync({
          sourceId: result.token!,
          amount: 50,
        });
      } else {
        throw new Error("Payment tokenization failed");
      }
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

  const resetModal = useCallback(() => {
    cleanupCard();
    setCurrentStep(1);
    setAppointmentId("");
    setConfirmedAppointment(null);
    form.reset();
  }, [cleanupCard, form]);

  const handleClose = useCallback(() => {
    cleanupCard();
    resetModal();
    onClose();
  }, [cleanupCard, resetModal, onClose]);

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

  // Don't render anything if not open
  if (!isOpen) return null;

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
                    ? "bg-primary-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                1
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  currentStep >= 1 ? "text-primary-600" : "text-gray-600"
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
                    ? "bg-primary-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                2
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  currentStep >= 2 ? "text-primary-600" : "text-gray-600"
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
                    ? "bg-primary-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                3
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  currentStep >= 3 ? "text-primary-600" : "text-gray-600"
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
                onValueChange={(value) => form.setValue("preferredTime", value)}
              >
                <SelectTrigger data-testid="select-preferred-time">
                  <SelectValue placeholder="Select preferred time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">
                    Morning (9 AM - 12 PM)
                  </SelectItem>
                  <SelectItem value="afternoon">
                    Afternoon (12 PM - 5 PM)
                  </SelectItem>
                  <SelectItem value="evening">Evening (5 PM - 7 PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="readinessCheck"
                checked={form.watch("readinessCheck")}
                onCheckedChange={(checked) =>
                  form.setValue("readinessCheck", checked as boolean)
                }
                data-testid="checkbox-readiness"
              />
              <Label htmlFor="readinessCheck" className="text-sm leading-5">
                I confirm that I will have all valuable items, receipts, and
                warranty papers ready for the audit appointment
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700"
              disabled={createAppointmentMutation.isPending}
              data-testid="button-proceed-payment"
            >
              {createAppointmentMutation.isPending
                ? "Creating..."
                : "Proceed to Payment"}
            </Button>
          </form>
        )}

        {/* Step 2: Payment */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <Card className="bg-gray-50">
              <CardContent className="p-6">
                <h4
                  className="font-semibold text-gray-900 mb-2"
                  data-testid="text-service-fee"
                >
                  Service Fee
                </h4>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Professional Home Audit</span>
                  <span
                    className="font-bold text-xl text-gray-900"
                    data-testid="text-amount"
                  >
                    $50.00
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  One-time audit fee • Includes comprehensive documentation
                </p>
              </CardContent>
            </Card>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Payment Information
              </Label>
              <div
                id="card-container"
                ref={cardContainerRef}
                className="border border-gray-300 rounded-lg p-4 min-h-[200px]"
                data-testid="square-card-container"
              >
                {!squareReady && (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <CreditCard className="h-8 w-8 mr-3" />
                    <span>Loading secure payment form...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  cleanupCard();
                  setCurrentStep(1);
                }}
                className="flex-1"
                data-testid="button-back-step1"
              >
                Back
              </Button>
              <Button
                onClick={handlePayment}
                disabled={
                  !squareReady ||
                  isProcessingPayment ||
                  processPaymentMutation.isPending
                }
                className="flex-1 bg-success-500 hover:bg-success-600"
                data-testid="button-complete-booking"
              >
                {isProcessingPayment || processPaymentMutation.isPending
                  ? "Processing..."
                  : "Complete Booking"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && confirmedAppointment && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-success-500 bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-success-500 h-8 w-8" />
              </div>
              <h4
                className="text-2xl font-bold text-gray-900 mb-2"
                data-testid="text-booking-confirmed"
              >
                Booking Confirmed!
              </h4>
              <p className="text-gray-600">
                Your audit has been successfully scheduled
              </p>
            </div>

            <Card className="bg-gray-50">
              <CardContent className="p-6">
                <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Appointment Details
                </h5>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Date:
                    </span>
                    <span
                      className="font-medium"
                      data-testid="text-confirmed-date"
                    >
                      {new Date(
                        confirmedAppointment.preferredDate,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Time:
                    </span>
                    <span
                      className="font-medium"
                      data-testid="text-confirmed-time"
                    >
                      {confirmedAppointment.preferredTime
                        ? confirmedAppointment.preferredTime === "morning"
                          ? "Morning (9 AM - 12 PM)"
                          : confirmedAppointment.preferredTime === "afternoon"
                            ? "Afternoon (12 PM - 5 PM)"
                            : confirmedAppointment.preferredTime === "evening"
                              ? "Evening (5 PM - 7 PM)"
                              : confirmedAppointment.preferredTime
                        : "To be confirmed"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Address:
                    </span>
                    <span
                      className="font-medium text-right max-w-xs"
                      data-testid="text-confirmed-address"
                    >
                      {confirmedAppointment.address}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Amount Paid:
                    </span>
                    <span
                      className="font-medium"
                      data-testid="text-confirmed-amount"
                    >
                      $50.00
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preparation Checklist */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-6">
                <h5 className="font-semibold text-yellow-800 mb-4">
                  📋 Preparation Checklist
                </h5>
                <ul className="space-y-2 text-sm text-yellow-700">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-yellow-600 mr-2" />
                    Gather all receipts for valuable items
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-yellow-600 mr-2" />
                    Collect warranty papers and documentation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-yellow-600 mr-2" />
                    Ensure access to all rooms and storage areas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-yellow-600 mr-2" />
                    Have jewelry and small valuables readily available
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Optional Upsell */}
            <Card className="border-primary-200 bg-primary-50">
              <CardContent className="p-6">
                <h5 className="font-semibold text-primary-900 mb-2 flex items-center">
                  <Badge className="bg-primary-100 text-primary-800 mr-2">
                    Optional
                  </Badge>
                  Add Title Protection Service
                </h5>
                <p className="text-primary-700 text-sm mb-4">
                  Monitor your property title 24/7 for unauthorized changes or
                  fraud attempts
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-primary-900 font-semibold">
                    $50/month
                  </span>
                  <Button
                    size="sm"
                    className="bg-primary-600 hover:bg-primary-700"
                    data-testid="button-add-protection"
                  >
                    Add Protection
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleClose}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700"
              data-testid="button-close-confirmation"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

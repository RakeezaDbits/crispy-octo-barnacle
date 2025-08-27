import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Clock, Shield, Phone, Mail, User, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";

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

  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = customer ? "/api/auth/appointments" : "/api/appointments";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (customer && token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create appointment");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Appointment Booked!",
        description: "Your security audit has been scheduled. You'll receive a confirmation email shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      onClose();
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      preferredDate: undefined,
      preferredTime: "",
      notes: "",
      titleProtection: false,
    });
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

    const baseAmount = selectedPackage ? parseFloat(selectedPackage.price) : 150.00;
    const titleProtectionFee = formData.titleProtection ? 25.00 : 0;
    const totalAmount = baseAmount + titleProtectionFee;

    const appointmentData = {
      ...formData,
      preferredDate: formData.preferredDate.toISOString(),
      packageId: selectedPackage?.id,
      packageName: selectedPackage?.name || "Comprehensive Security & Title Protection",
      amount: totalAmount.toFixed(2),
      status: "pending",
      paymentStatus: "pending",
    };

    bookingMutation.mutate(appointmentData);
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

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Submit Buttons */}
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
              disabled={bookingMutation.isPending}
              className="flex-1"
            >
              {bookingMutation.isPending ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
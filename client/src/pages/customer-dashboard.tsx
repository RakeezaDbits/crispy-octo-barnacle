import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, DollarSign, FileText, User, Phone, Mail, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { authenticatedRequest } from "@/lib/auth";
import { useLocation } from "wouter";
import type { Appointment } from "@shared/schema";

export default function CustomerDashboard() {
  const { customer, logout, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !customer) {
      setLocation('/auth');
    }
  }, [authLoading, customer, setLocation]);

  const { data: appointments, isLoading, refetch } = useQuery<Appointment[]>({
    queryKey: ["/api/auth/appointments"],
    queryFn: async () => {
      const response = await authenticatedRequest('GET', '/api/auth/appointments');
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      return response.json();
    },
    enabled: !!customer,
  });

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-primary animate-spin" />
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, will redirect via useEffect
  if (!customer) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return "✅";
      case "in_progress": return "🔄";
      case "completed": return "✅";
      case "cancelled": return "❌";
      default: return "⏳";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/@assets/logo_1756065815534.png" 
                alt="Alpha Security Bureau Logo" 
                className="h-16 w-auto"
              />
              <div>
                <h1 className="font-heading text-4xl text-primary-900 tracking-wide">
                  CUSTOMER PORTAL
                </h1>
                <p className="text-gray-600">Welcome, {customer.fullName}</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Account Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Account Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm">{customer.email}</span>
                </div>
                {customer.isEmailVerified && (
                  <Badge className="mt-2 bg-green-100 text-green-800">Verified</Badge>
                )}
              </div>
              {customer.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Phone:</span>
                  <span className="text-sm">{customer.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Service Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Service Plan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Your Alpha Security Service</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>$100/month:</strong> Ongoing security monitoring and support</p>
                <p>• <strong>$125 audit fee:</strong> Professional guard conducts thorough security assessment</p>
                <p>• <strong>Total Protection:</strong> On-site audit + monthly monitoring for complete security</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Your Appointments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your appointments...</p>
              </div>
            )}

            {/* No Appointments */}
            {!isLoading && (!appointments || appointments.length === 0) && (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Appointments Yet</h3>
                <p className="text-gray-500 mb-6">You haven't scheduled any security audits yet.</p>
                <Button 
                  onClick={() => setLocation('/')}
                  className="bg-primary hover:bg-primary/90"
                >
                  Book Your First Audit
                </Button>
              </div>
            )}

            {/* Appointments List */}
            {!isLoading && appointments && appointments.length > 0 && (
              <div className="space-y-6">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-6 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Security Audit #{appointment.id}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusIcon(appointment.status)} {appointment.status.toUpperCase()}
                          </Badge>
                          {appointment.paymentStatus && (
                            <Badge className={getPaymentStatusColor(appointment.paymentStatus)}>
                              Payment: {appointment.paymentStatus}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          ${appointment.amount}
                        </div>
                        <div className="text-sm text-gray-500">Total Service Fee</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Date:</span>
                          <span className="text-sm">
                            {new Date(appointment.preferredDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Time:</span>
                          <span className="text-sm">
                            {appointment.preferredTime || 'To be confirmed'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Location:</span>
                          <span className="text-sm">{appointment.address}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Phone:</span>
                          <span className="text-sm">{appointment.phone}</span>
                        </div>
                        {appointment.specialRequests && (
                          <div className="flex items-start space-x-2">
                            <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <span className="text-sm font-medium">Special Requests:</span>
                              <p className="text-sm text-gray-600 mt-1">
                                {appointment.specialRequests}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
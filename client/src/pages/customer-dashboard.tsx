import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, DollarSign, FileText, User, Phone, Mail } from "lucide-react";
import type { Appointment } from "@shared/schema";

export default function CustomerDashboard() {
  const [customerEmail, setCustomerEmail] = useState("");
  const [searchAttempted, setSearchAttempted] = useState(false);
  const { toast } = useToast();

  const { data: appointments, isLoading, refetch } = useQuery<Appointment[]>({
    queryKey: ["/api/customer/appointments", customerEmail],
    enabled: !!customerEmail && searchAttempted,
  });

  const handleSearch = () => {
    if (!customerEmail.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    setSearchAttempted(true);
    refetch();
  };

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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/@assets/logo_1756065815534.png" 
              alt="Alpha Security Bureau Logo" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="font-heading text-4xl text-primary-900 tracking-wide mb-2">
            CUSTOMER PORTAL
          </h1>
          <p className="text-gray-600">Track your security audit appointments and status</p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Access Your Appointments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="customer-email">Email Address</Label>
                <Input
                  id="customer-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  data-testid="input-customer-email"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch} 
                  className="bg-primary hover:bg-primary/90"
                  data-testid="button-search-appointments"
                >
                  Search Appointments
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for your appointments...</p>
          </div>
        )}

        {/* No Results */}
        {searchAttempted && !isLoading && (!appointments || appointments.length === 0) && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Appointments Found</h3>
              <p className="text-gray-600">
                No appointments found for <strong>{customerEmail}</strong>
                <br />
                Please check your email address or contact support if you believe this is an error.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Appointments Grid */}
        {appointments && appointments.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Your Appointments ({appointments.length})
            </h2>

            <div className="grid gap-6">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          Security Audit - {appointment.fullName}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Appointment ID: {appointment.id.slice(0, 8)}...
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusIcon(appointment.status)} {appointment.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge className={getPaymentStatusColor(appointment.paymentStatus || 'pending')}>
                          💳 {(appointment.paymentStatus || 'pending').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Contact Information */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{appointment.email}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{appointment.phone}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{appointment.address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Appointment Details */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Appointment Details</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              {new Date(appointment.preferredDate).toLocaleDateString()}
                            </span>
                          </div>
                          {appointment.preferredTime && (
                            <div className="flex items-center space-x-3">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{appointment.preferredTime}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-3">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">
                              ${appointment.amount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* DocuSign Status */}
                    {appointment.docusignStatus && appointment.docusignStatus !== 'not_sent' && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-blue-900">Service Agreement</p>
                              <p className="text-sm text-blue-700">
                                Status: {appointment.docusignStatus.includes('completed') ? 'SIGNED ✓' : 
                                        appointment.docusignStatus.includes('sent') ? 'PENDING SIGNATURE' : 
                                        appointment.docusignStatus.replace('_', ' ').toUpperCase()}
                              </p>
                            </div>
                          </div>
                          {appointment.docusignStatus.includes('sent') && !appointment.docusignStatus.includes('completed') && (
                            <button 
                              onClick={async () => {
                                // Check if this is a mock DocuSign status
                                const isMockSigningUrl = appointment.docusignStatus.includes('mock_env_') || 
                                                       appointment.docusignStatus.includes('#mock-signing-');
                                
                                if (isMockSigningUrl) {
                                  // For demo purposes, simulate the signing process
                                  const confirmed = window.confirm(
                                    '📝 DocuSign Demo Signing Process\n\n' +
                                    'In a real environment, this would open DocuSign for digital signing.\n\n' +
                                    'For this demo, would you like to simulate signing the agreement?'
                                  );

                                  if (confirmed) {
                                    try {
                                      // Simulate signing completion
                                      const response = await fetch(`/api/appointments/${appointment.id}`, {
                                        method: 'PATCH',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                          docusignStatus: 'completed'
                                        }),
                                      });

                                      if (response.ok) {
                                        alert('✅ Document signed successfully!\n\nYour service agreement has been completed.');
                                        window.location.reload(); // Refresh to show updated status
                                      } else {
                                        throw new Error('Failed to update signing status');
                                      }
                                    } catch (error) {
                                      console.error('Failed to update signing status:', error);
                                      alert('❌ Error updating signature status. Please contact support.');
                                    }
                                  }
                                } else {
                                  // For real DocuSign URLs or other cases, show an info message
                                  alert('📝 DocuSign Integration\n\nThis would normally open the DocuSign signing interface. For this demo, please use the demo signing button instead.');
                                }
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                            >
                              📝 Sign Agreement
                            </button>
                          )}
                        </div>
                        {appointment.docusignStatus.includes('sent') && !appointment.docusignStatus.includes('completed') && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                            <p className="text-sm text-yellow-800">
                              ⚠️ Your appointment requires a signed agreement. Please click "Sign Agreement" above or check your email for DocuSign instructions.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Appointment Timeline */}
                    <div className="mt-6 border-t pt-4">
                      <h5 className="font-medium text-gray-900 mb-3">Appointment Timeline</h5>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>📅 <strong>Created:</strong> {new Date(appointment.createdAt!).toLocaleString()}</div>
                        {appointment.scheduledDateTime && (
                          <div>🗓️ <strong>Scheduled:</strong> {new Date(appointment.scheduledDateTime).toLocaleString()}</div>
                        )}
                        {appointment.completedAt && (
                          <div>✅ <strong>Completed:</strong> {new Date(appointment.completedAt).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
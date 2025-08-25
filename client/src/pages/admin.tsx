import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Calendar, DollarSign, Users, CheckCircle, LogOut, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { isAdminAuthenticated, logout } from "@/lib/auth";
import type { Appointment } from "@shared/schema";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    enabled: isAuthenticated, // Only run query when authenticated
  });

  useEffect(() => {
    const authenticated = isAdminAuthenticated();
    if (!authenticated) {
      setLocation("/admin/login");
      return;
    }
    setIsAuthenticated(true);
  }, [setLocation]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-600 flex items-center justify-center">
        <div className="text-center text-white">
          <Shield className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stats = appointments ? {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    pending: appointments.filter(a => a.status === "pending").length,
    revenue: appointments
      .filter(a => a.paymentStatus === "completed")
      .reduce((sum, a) => sum + Number(a.amount), 0)
  } : { total: 0, confirmed: 0, pending: 0, revenue: 0 };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <img 
              src="/@assets/logo_1756065815534.png" 
              alt="Alpha Security Bureau Logo" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="font-heading text-3xl text-primary-900 tracking-wide">ADMIN DASHBOARD</h1>
              <p className="text-gray-600 mt-2">Advanced Security Operations Center</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={logout}
              className="text-red-600 border-red-600 hover:bg-red-50"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-appointments">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-confirmed-appointments">{stats.confirmed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" data-testid="text-pending-appointments">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-600" data-testid="text-total-revenue">${stats.revenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : appointments && appointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Address</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment.id} className="border-b border-gray-100" data-testid={`row-appointment-${appointment.id}`}>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900" data-testid={`text-customer-name-${appointment.id}`}>
                              {appointment.fullName}
                            </div>
                            <div className="text-sm text-gray-500" data-testid={`text-customer-email-${appointment.id}`}>
                              {appointment.email}
                            </div>
                            <div className="text-sm text-gray-500" data-testid={`text-customer-phone-${appointment.id}`}>
                              {appointment.phone}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm" data-testid={`text-appointment-date-${appointment.id}`}>
                            {new Date(appointment.preferredDate).toLocaleDateString()}
                          </div>
                          {appointment.preferredTime && (
                            <div className="text-xs text-gray-500" data-testid={`text-appointment-time-${appointment.id}`}>
                              {appointment.preferredTime}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-900" data-testid={`text-appointment-address-${appointment.id}`}>
                            {appointment.address}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium" data-testid={`text-appointment-amount-${appointment.id}`}>
                            ${appointment.amount}
                          </div>
                          {appointment.titleProtection && (
                            <div className="text-xs text-blue-600" data-testid={`text-title-protection-${appointment.id}`}>
                              + Title Protection
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={getStatusColor(appointment.status)} data-testid={`badge-status-${appointment.id}`}>
                            {appointment.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge 
                            className={appointment.paymentStatus === "completed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                            data-testid={`badge-payment-${appointment.id}`}
                          >
                            {appointment.paymentStatus}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500" data-testid="text-no-appointments">
                No appointments found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

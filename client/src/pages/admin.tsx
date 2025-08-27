
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Users, 
  CheckCircle, 
  LogOut, 
  Shield,
  Download,
  TrendingUp,
  Clock,
  UserCheck,
  Activity,
  Eye,
  FileText,
  BarChart3
} from "lucide-react";
import { useEffect, useState } from "react";
import { isAdminAuthenticated, adminLogout } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Appointment, Customer } from "@shared/schema";
import * as XLSX from 'xlsx';
import { format, subDays, isAfter, startOfDay, endOfDay } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export default function Admin() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7');
  const { toast } = useToast();

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    enabled: isAuthenticated,
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    enabled: isAuthenticated,
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

  // Calculate analytics
  const analytics = appointments ? {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    pending: appointments.filter(a => a.status === "pending").length,
    completed: appointments.filter(a => a.status === "completed").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
    revenue: appointments
      .filter(a => a.paymentStatus === "completed")
      .reduce((sum, a) => sum + Number(a.amount), 0),
    todayAppointments: appointments.filter(a => 
      format(new Date(a.preferredDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    ).length,
    thisWeekRevenue: appointments
      .filter(a => 
        a.paymentStatus === "completed" && 
        isAfter(new Date(a.createdAt), subDays(new Date(), 7))
      )
      .reduce((sum, a) => sum + Number(a.amount), 0),
  } : { total: 0, confirmed: 0, pending: 0, completed: 0, cancelled: 0, revenue: 0, todayAppointments: 0, thisWeekRevenue: 0 };

  // Customer analytics
  const customerAnalytics = customers ? {
    total: customers.length,
    verified: customers.filter(c => c.isEmailVerified).length,
    active: customers.filter(c => c.isActive).length,
    recentRegistrations: customers.filter(c => 
      isAfter(new Date(c.createdAt), subDays(new Date(), parseInt(selectedPeriod)))
    ).length,
  } : { total: 0, verified: 0, active: 0, recentRegistrations: 0 };

  // Chart data preparation
  const appointmentStatusData = [
    { name: 'Confirmed', value: analytics.confirmed, color: '#22c55e' },
    { name: 'Pending', value: analytics.pending, color: '#f59e0b' },
    { name: 'Completed', value: analytics.completed, color: '#3b82f6' },
    { name: 'Cancelled', value: analytics.cancelled, color: '#ef4444' },
  ];

  // Daily appointments chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayAppointments = appointments?.filter(a => 
      format(new Date(a.createdAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    ) || [];
    
    return {
      date: format(date, 'MMM dd'),
      appointments: dayAppointments.length,
      revenue: dayAppointments
        .filter(a => a.paymentStatus === "completed")
        .reduce((sum, a) => sum + Number(a.amount), 0)
    };
  });

  // Monthly revenue data
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subDays(new Date(), i * 30);
    const monthAppointments = appointments?.filter(a => {
      const appointmentDate = new Date(a.createdAt);
      return appointmentDate.getMonth() === date.getMonth() && 
             appointmentDate.getFullYear() === date.getFullYear();
    }) || [];
    
    return {
      month: format(date, 'MMM yyyy'),
      revenue: monthAppointments
        .filter(a => a.paymentStatus === "completed")
        .reduce((sum, a) => sum + Number(a.amount), 0),
      appointments: monthAppointments.length
    };
  }).reverse();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Export functions
  const exportToExcel = () => {
    if (!appointments) return;
    
    const exportData = appointments.map(appointment => ({
      'ID': appointment.id,
      'Customer Name': appointment.fullName,
      'Email': appointment.email,
      'Phone': appointment.phone,
      'Address': appointment.address,
      'Date': appointment.preferredDate,
      'Time': appointment.preferredTime || 'Not specified',
      'Status': appointment.status,
      'Payment Status': appointment.paymentStatus,
      'Amount': `$${appointment.amount}`,
      'Title Protection': appointment.titleProtection ? 'Yes' : 'No',
      'DocuSign Status': appointment.docusignStatus || 'Not sent',
      'Created At': format(new Date(appointment.createdAt), 'yyyy-MM-dd HH:mm:ss'),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Appointments');
    XLSX.writeFile(wb, `appointments-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    
    toast({
      title: "Export Successful",
      description: "Appointments data has been exported to Excel file.",
    });
  };

  const exportCustomersToExcel = () => {
    if (!customers) return;
    
    const exportData = customers.map(customer => ({
      'ID': customer.id,
      'Full Name': customer.fullName,
      'Email': customer.email,
      'Phone': customer.phone,
      'Email Verified': customer.isEmailVerified ? 'Yes' : 'No',
      'Active': customer.isActive ? 'Yes' : 'No',
      'Registered Date': format(new Date(customer.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      'Last Login': customer.lastLoginAt ? format(new Date(customer.lastLoginAt), 'yyyy-MM-dd HH:mm:ss') : 'Never',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    XLSX.writeFile(wb, `customers-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    
    toast({
      title: "Export Successful",
      description: "Customers data has been exported to Excel file.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <img 
              src="/@assets/logo_1756065815534.png" 
              alt="Alpha Security Bureau Logo" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="font-heading text-3xl text-primary-900 tracking-wide">ADVANCED ADMIN DASHBOARD</h1>
              <p className="text-gray-600 mt-2">Advanced Security Operations Control Center</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={adminLogout}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.total}</div>
                  <p className="text-xs text-muted-foreground">Today: {analytics.todayAppointments}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{customerAnalytics.total}</div>
                  <p className="text-xs text-muted-foreground">Active: {customerAnalytics.active}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics.revenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">This week: ${analytics.thisWeekRevenue.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verified Customers</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{customerAnalytics.verified}</div>
                  <p className="text-xs text-muted-foreground">
                    {((customerAnalytics.verified / customerAnalytics.total) * 100).toFixed(1)}% verified
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Appointment Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={appointmentStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {appointmentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Daily Appointments (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={last7Days}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="appointments" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            {/* Export Buttons */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Appointments Management</h2>
              <Button onClick={exportToExcel} className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
            </div>

            {/* Appointments Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Appointments</CardTitle>
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
                          <tr key={appointment.id} className="border-b border-gray-100">
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-medium text-gray-900">{appointment.fullName}</div>
                                <div className="text-sm text-gray-500">{appointment.email}</div>
                                <div className="text-sm text-gray-500">{appointment.phone}</div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm">{new Date(appointment.preferredDate).toLocaleDateString()}</div>
                              {appointment.preferredTime && (
                                <div className="text-xs text-gray-500">{appointment.preferredTime}</div>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm text-gray-900">{appointment.address}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-medium">${appointment.amount}</div>
                              {appointment.titleProtection && (
                                <div className="text-xs text-blue-600">+ Title Protection</div>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <Badge 
                                className={appointment.paymentStatus === "completed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
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
                  <div className="text-center py-8 text-gray-500">No appointments found.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            {/* Customer Analytics */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Customer Management</h2>
              <div className="flex space-x-2">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={exportCustomersToExcel} className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Export Customers
                </Button>
              </div>
            </div>

            {/* Customer Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{customerAnalytics.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{customerAnalytics.active}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verified Emails</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{customerAnalytics.verified}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New Registrations</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{customerAnalytics.recentRegistrations}</div>
                  <p className="text-xs text-muted-foreground">Last {selectedPeriod} days</p>
                </CardContent>
              </Card>
            </div>

            {/* Customers Table */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Directory</CardTitle>
              </CardHeader>
              <CardContent>
                {customers && customers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Registration</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Last Login</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Verification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((customer) => (
                          <tr key={customer.id} className="border-b border-gray-100">
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-medium text-gray-900">{customer.fullName}</div>
                                <div className="text-sm text-gray-500">{customer.email}</div>
                                <div className="text-sm text-gray-500">{customer.phone}</div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge className={customer.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {customer.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm">
                                {format(new Date(customer.createdAt), 'MMM dd, yyyy')}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm">
                                {customer.lastLoginAt ? format(new Date(customer.lastLoginAt), 'MMM dd, yyyy') : 'Never'}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge className={customer.isEmailVerified ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}>
                                {customer.isEmailVerified ? "Verified" : "Pending"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No customers found.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Advanced Analytics</h2>
            
            {/* Revenue Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Daily Revenue vs Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={last7Days}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="appointments" fill="#8884d8" name="Appointments" />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue ($)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {((analytics.confirmed / analytics.total) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Confirmation Rate</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      ${(analytics.revenue / analytics.total).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Average Order Value</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">
                      {((customerAnalytics.verified / customerAnalytics.total) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Email Verification Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

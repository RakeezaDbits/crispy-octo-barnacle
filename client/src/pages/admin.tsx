
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { 
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
  BarChart3,
  Settings,
  User,
  Home,
  Bell,
  Database,
  Palette,
  Globe,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Send,
  MessageSquare,
  AlertTriangle,
  Info,
  CheckSquare,
  X
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface AdminState {
  sidebarCollapsed: boolean;
  currentTheme: 'light' | 'dark' | 'system';
  notifications: boolean;
  autoRefresh: boolean;
  companyName: string;
  companyLogo: string;
  primaryColor: string;
  language: 'en' | 'ur' | 'es';
  timezone: string;
}

// Menu items for sidebar
const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    id: "overview",
    description: "Main overview and statistics"
  },
  {
    title: "Appointments",
    icon: Calendar,
    id: "appointments",
    description: "Manage customer appointments"
  },
  {
    title: "Customers",
    icon: Users,
    id: "customers",
    description: "Customer management"
  },
  {
    title: "Analytics",
    icon: BarChart3,
    id: "analytics",
    description: "Advanced analytics and insights"
  },
  {
    title: "Reports",
    icon: FileText,
    id: "reports",
    description: "Generate and download reports"
  },
  {
    title: "Communications",
    icon: MessageSquare,
    id: "communications",
    description: "Email templates and messaging"
  },
  {
    title: "Notifications",
    icon: Bell,
    id: "notifications",
    description: "System notifications"
  },
  {
    title: "Theme Manager",
    icon: Palette,
    id: "theme-manager",
    description: "Customize app appearance and themes"
  }
];

export default function Admin() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('7');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [adminState, setAdminState] = useState<AdminState>({
    sidebarCollapsed: false,
    currentTheme: 'light',
    notifications: true,
    autoRefresh: false,
    companyName: 'Alpha Security Bureau',
    companyLogo: '/attached_assets/logo_1756065815534.png',
    primaryColor: '#3b82f6',
    language: 'en',
    timezone: 'UTC'
  });
  const { toast } = useToast();

  const { data: appointments, isLoading, refetch } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    enabled: isAuthenticated,
    refetchInterval: adminState.autoRefresh ? 30000 : false,
  });

  const { data: customers, refetch: refetchCustomers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    enabled: isAuthenticated,
    refetchInterval: adminState.autoRefresh ? 30000 : false,
  });

  useEffect(() => {
    const authenticated = isAdminAuthenticated();
    if (!authenticated) {
      setLocation("/admin/login");
      return;
    }
    setIsAuthenticated(true);
  }, [setLocation]);

  useEffect(() => {
    // Apply theme changes
    document.documentElement.setAttribute('data-theme', adminState.currentTheme);
    document.documentElement.style.setProperty('--primary-color', adminState.primaryColor);
  }, [adminState.currentTheme, adminState.primaryColor]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-600 flex items-center justify-center">
        <div className="text-center text-white">
          <Shield className="h-16 w-16 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p>Redirecting to admin login...</p>
        </div>
      </div>
    );
  }

  // Calculate comprehensive analytics
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
    conversionRate: appointments.length > 0 ? 
      (appointments.filter(a => a.paymentStatus === "completed").length / appointments.length * 100) : 0,
    averageTicketSize: appointments.filter(a => a.paymentStatus === "completed").length > 0 ?
      appointments.filter(a => a.paymentStatus === "completed")
        .reduce((sum, a) => sum + Number(a.amount), 0) / 
        appointments.filter(a => a.paymentStatus === "completed").length : 0
  } : { 
    total: 0, confirmed: 0, pending: 0, completed: 0, cancelled: 0, 
    revenue: 0, todayAppointments: 0, thisWeekRevenue: 0, conversionRate: 0, averageTicketSize: 0 
  };

  // Customer analytics
  const customerAnalytics = customers ? {
    total: customers.length,
    verified: customers.filter(c => c.isEmailVerified).length,
    active: customers.filter(c => c.isActive).length,
    recentRegistrations: customers.filter(c => 
      isAfter(new Date(c.createdAt), subDays(new Date(), parseInt(selectedPeriod)))
    ).length,
  } : { total: 0, verified: 0, active: 0, recentRegistrations: 0 };

  // Filter appointments based on search and status
  const filteredAppointments = appointments?.filter(appointment => {
    const matchesSearch = appointment.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  // Chart data preparation
  const appointmentStatusData = [
    { name: 'Confirmed', value: analytics.confirmed, color: COLORS[0] },
    { name: 'Pending', value: analytics.pending, color: COLORS[2] },
    { name: 'Completed', value: analytics.completed, color: COLORS[1] },
    { name: 'Cancelled', value: analytics.cancelled, color: COLORS[3] },
  ];

  // Revenue trend data (last 30 days)
  const revenueTrendData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dayAppointments = appointments?.filter(a => 
      format(new Date(a.createdAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    ) || [];
    
    return {
      date: format(date, 'MMM dd'),
      appointments: dayAppointments.length,
      revenue: dayAppointments
        .filter(a => a.paymentStatus === "completed")
        .reduce((sum, a) => sum + Number(a.amount), 0),
      customers: dayAppointments.length
    };
  });

  const handleLogout = () => {
    adminLogout();
    toast({
      title: "Logged Out",
      description: "Successfully logged out from admin panel",
    });
    setLocation("/admin/login");
  };

  const handleRefresh = () => {
    refetch();
    refetchCustomers();
    toast({
      title: "Data Refreshed",
      description: "All data has been refreshed successfully",
    });
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'confirmed' }),
      });

      if (response.ok) {
        refetch(); // Refresh the appointments list
        toast({
          title: "Appointment Confirmed",
          description: "Customer will receive reminder email before appointment date",
        });
      } else {
        throw new Error('Failed to confirm appointment');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm appointment",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "completed": return <CheckSquare className="h-4 w-4" />;
      case "cancelled": return <X className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
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

  const sendBulkEmail = async (template: string, recipients: string[]) => {
    try {
      const response = await fetch('/api/admin/send-bulk-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ template, recipients }),
      });

      if (response.ok) {
        toast({
          title: "Emails Sent",
          description: `Successfully sent ${recipients.length} emails`,
        });
      }
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Failed to send bulk emails",
        variant: "destructive",
      });
    }
  };

  const renderSidebar = () => (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50 ${
      adminState.sidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!adminState.sidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <img 
                src={adminState.companyLogo}
                alt="Company Logo" 
                className="h-8 w-auto"
              />
              <div>
                <h2 className="font-bold text-lg text-gray-900">{adminState.companyName}</h2>
                <p className="text-xs text-gray-500">Admin Control Panel</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAdminState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }))}
          >
            {adminState.sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-2 space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "default" : "ghost"}
            className={`w-full justify-start h-12 ${adminState.sidebarCollapsed ? 'px-3' : 'px-4'}`}
            onClick={() => setActiveSection(item.id)}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!adminState.sidebarCollapsed && (
              <div className="ml-3 text-left">
                <div className="font-medium">{item.title}</div>
                <div className="text-xs opacity-60">{item.description}</div>
              </div>
            )}
          </Button>
        ))}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className={`w-full justify-start ${adminState.sidebarCollapsed ? 'px-3' : 'px-4'}`}
            onClick={() => setActiveSection('settings')}
          >
            <Settings className="h-5 w-5" />
            {!adminState.sidebarCollapsed && <span className="ml-3">Settings</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start ${adminState.sidebarCollapsed ? 'px-3' : 'px-4'}`}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {!adminState.sidebarCollapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
        {!adminState.sidebarCollapsed && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            Version 2.1.0
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome back to your admin control center</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={exportToExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Total Appointments</CardTitle>
                  <Calendar className="h-4 w-4 opacity-80" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.total}</div>
                  <p className="text-xs opacity-80">Today: {analytics.todayAppointments}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 opacity-80" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics.revenue.toFixed(2)}</div>
                  <p className="text-xs opacity-80">This week: ${analytics.thisWeekRevenue.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Total Customers</CardTitle>
                  <Users className="h-4 w-4 opacity-80" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{customerAnalytics.total}</div>
                  <p className="text-xs opacity-80">Active: {customerAnalytics.active}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 opacity-80" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
                  <p className="text-xs opacity-80">Avg: ${analytics.averageTicketSize.toFixed(2)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
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
                    Revenue Trend (Last 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments?.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(appointment.status)}
                        <div>
                          <p className="font-medium">{appointment.fullName}</p>
                          <p className="text-sm text-gray-500">{appointment.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${appointment.amount}</p>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'appointments':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Appointments Management</h2>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={exportToExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search appointments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-refresh"
                      checked={adminState.autoRefresh}
                      onCheckedChange={(checked) => 
                        setAdminState(prev => ({ ...prev, autoRefresh: checked }))
                      }
                    />
                    <Label htmlFor="auto-refresh">Auto-refresh</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appointments Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Appointments ({filteredAppointments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredAppointments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Date & Time</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Address</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAppointments.map((appointment) => (
                          <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                                {getStatusIcon(appointment.status)}
                                <span className="ml-1">{appointment.status}</span>
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {appointment.status === 'pending' && (
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    onClick={() => handleConfirmAppointment(appointment.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No appointments found matching your criteria.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'customers':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Customer Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>

            {/* Customer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{customerAnalytics.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{customerAnalytics.active}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Verified Emails</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{customerAnalytics.verified}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">New This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{customerAnalytics.recentRegistrations}</div>
                </CardContent>
              </Card>
            </div>

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
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Verification</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((customer) => (
                          <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {customer.fullName.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-gray-900">{customer.fullName}</div>
                                  <div className="text-sm text-gray-500">{customer.email}</div>
                                  <div className="text-sm text-gray-500">{customer.phone}</div>
                                </div>
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
                              <Badge className={customer.isEmailVerified ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}>
                                {customer.isEmailVerified ? "Verified" : "Pending"}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Mail className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
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
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Advanced Analytics</h2>
            
            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
                  <p className="text-xs opacity-80">Leads to customers</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Avg Ticket Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${analytics.averageTicketSize.toFixed(2)}</div>
                  <p className="text-xs opacity-80">Per appointment</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Email Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {((customerAnalytics.verified / customerAnalytics.total) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs opacity-80">Verified customers</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Growth Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">+24.5%</div>
                  <p className="text-xs opacity-80">Month over month</p>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue vs Appointments Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={revenueTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="appointments" fill="#3b82f6" name="Appointments" />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Revenue ($)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Acquisition</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={revenueTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="customers" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">System Settings</h2>
            
            <Tabs defaultValue="appearance" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="appearance">Appearance & Theme</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="appearance" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Theme Foundation */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Palette className="h-5 w-5 mr-2" />
                        Theme Foundation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Background Color</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            value="#ffffff"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#ffffff"
                            value="#ffffff"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Text Color</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            value="#0f1419"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#0f1419"
                            value="#0f1419"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Muted Background Color</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            value="#e5e5e6"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#e5e5e6"
                            value="#e5e5e6"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Muted Text Color</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            value="#0f1419"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#0f1419"
                            value="#0f1419"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions Theme */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Actions & Components</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Primary Background</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            value="#e7b008"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#e7b008"
                            value="#e7b008"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Primary Text</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            value="#000000"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#000000"
                            value="#000000"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Secondary Background</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            value="#0f1419"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#0f1419"
                            value="#0f1419"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Secondary Text</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            value="#ffffff"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#ffffff"
                            value="#ffffff"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Accent Background</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            value="#e3ecf6"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#e3ecf6"
                            value="#e3ecf6"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Accent Text</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            value="#1e9df1"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#1e9df1"
                            value="#1e9df1"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Destructive Background</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            value="#f4212e"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#f4212e"
                            value="#f4212e"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Destructive Text</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            value="#ffffff"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#ffffff"
                            value="#ffffff"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Forms & Containers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Forms</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Input Background</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            value="#f7f9fa"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#f7f9fa"
                            value="#f7f9fa"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Border Color</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            value="#e1eaef"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#e1eaef"
                            value="#e1eaef"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Focus Border</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            value="#1da1f2"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#1da1f2"
                            value="#1da1f2"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Containers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Card Background</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            value="#f7f8f8"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#f7f8f8"
                            value="#f7f8f8"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Card Text</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            value="#0f1419"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#0f1419"
                            value="#0f1419"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Popover Background</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            value="#ffffff"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#ffffff"
                            value="#ffffff"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Popover Text</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            value="#0f1419"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#0f1419"
                            value="#0f1419"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Charts & Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Label>Chart 1</Label>
                        <div className="flex items-center space-x-2">
                          <Input 
                            type="color"
                            value="#1e9df1"
                            className="w-10 h-8 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#1e9df1"
                            value="#1e9df1"
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Chart 2</Label>
                        <div className="flex items-center space-x-2">
                          <Input 
                            type="color"
                            value="#00b87a"
                            className="w-10 h-8 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#00b87a"
                            value="#00b87a"
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Chart 3</Label>
                        <div className="flex items-center space-x-2">
                          <Input 
                            type="color"
                            value="#f7b928"
                            className="w-10 h-8 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#f7b928"
                            value="#f7b928"
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Chart 4</Label>
                        <div className="flex items-center space-x-2">
                          <Input 
                            type="color"
                            value="#17bf63"
                            className="w-10 h-8 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#17bf63"
                            value="#17bf63"
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Chart 5</Label>
                        <div className="flex items-center space-x-2">
                          <Input 
                            type="color"
                            value="#e0245e"
                            className="w-10 h-8 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#e0245e"
                            value="#e0245e"
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Typography */}
                <Card>
                  <CardHeader>
                    <CardTitle>Typography</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Sans-serif Font</Label>
                        <Select defaultValue="poppins">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="poppins">Poppins</SelectItem>
                            <SelectItem value="inter">Inter</SelectItem>
                            <SelectItem value="roboto">Roboto</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Serif Font</Label>
                        <Select defaultValue="georgia">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="georgia">Georgia</SelectItem>
                            <SelectItem value="times">Times New Roman</SelectItem>
                            <SelectItem value="merriweather">Merriweather</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Monospace Font</Label>
                        <Select defaultValue="menlo">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="menlo">Menlo</SelectItem>
                            <SelectItem value="monaco">Monaco</SelectItem>
                            <SelectItem value="consolas">Consolas</SelectItem>
                            <SelectItem value="courier">Courier New</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Border Radius</Label>
                      <div className="flex items-center space-x-4">
                        <Input 
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          defaultValue="1.3"
                          className="flex-1"
                        />
                        <span className="text-sm font-mono">1.3 rem</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline">
                    Reset to Default
                  </Button>
                  <Button variant="outline">
                    Export Theme
                  </Button>
                  <Button>
                    Save Changes for this app
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="branding" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Palette className="h-5 w-5 mr-2" />
                        Company Branding
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="company-name">Company Name</Label>
                        <Input 
                          id="company-name" 
                          value={adminState.companyName}
                          onChange={(e) => setAdminState(prev => ({ ...prev, companyName: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company-logo">Company Logo URL</Label>
                        <Input 
                          id="company-logo" 
                          value={adminState.companyLogo}
                          onChange={(e) => setAdminState(prev => ({ ...prev, companyLogo: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="primary-color">Primary Brand Color</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            id="primary-color" 
                            type="color"
                            value={adminState.primaryColor}
                            onChange={(e) => setAdminState(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            value={adminState.primaryColor}
                            onChange={(e) => setAdminState(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Logo Preview</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <img 
                            src={adminState.companyLogo} 
                            alt="Company Logo"
                            className="h-16 w-auto mx-auto"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <p className="text-sm text-gray-500 mt-2">Logo Preview</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Globe className="h-5 w-5 mr-2" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Business Address</Label>
                        <Textarea 
                          placeholder="Enter your business address"
                          className="min-h-[80px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input placeholder="+1 (555) 123-4567" />
                      </div>

                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input placeholder="contact@company.com" />
                      </div>

                      <div className="space-y-2">
                        <Label>Website URL</Label>
                        <Input placeholder="https://www.company.com" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="system" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="h-5 w-5 mr-2" />
                      System Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select 
                          value={adminState.language} 
                          onValueChange={(value: 'en' | 'ur' | 'es') => 
                            setAdminState(prev => ({ ...prev, language: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="ur">اردو (Urdu)</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select 
                          value={adminState.timezone} 
                          onValueChange={(value) => setAdminState(prev => ({ ...prev, timezone: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="EST">EST</SelectItem>
                            <SelectItem value="PST">PST</SelectItem>
                            <SelectItem value="GMT">GMT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifications">Enable Notifications</Label>
                      <Switch 
                        id="notifications" 
                        checked={adminState.notifications} 
                        onCheckedChange={(checked) => setAdminState(prev => ({ ...prev, notifications: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-refresh">Auto-refresh Data</Label>
                      <Switch 
                        id="auto-refresh" 
                        checked={adminState.autoRefresh} 
                        onCheckedChange={(checked) => setAdminState(prev => ({ ...prev, autoRefresh: checked }))}
                      />
                    </div>

                    <Button className="w-full">
                      Save Configuration
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      Advanced Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                        <p className="text-sm text-yellow-800">
                          Advanced settings can affect system functionality. Please proceed with caution.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Debug Mode</Label>
                          <p className="text-sm text-gray-500">Enable detailed logging and error reporting</p>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Performance Monitoring</Label>
                          <p className="text-sm text-gray-500">Track system performance metrics</p>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Analytics Collection</Label>
                          <p className="text-sm text-gray-500">Collect usage analytics for optimization</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <Label>Data Management</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Button variant="outline" className="justify-start">
                            <Download className="h-4 w-4 mr-2" />
                            Export All Data
                          </Button>
                          <Button variant="outline" className="justify-start">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Clear Cache
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <Label className="text-red-600">Danger Zone</Label>
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Reset All Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'theme-manager':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Theme Manager</h2>
                <p className="text-gray-600">Complete control over your app's appearance and branding</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Theme
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Theme
                </Button>
              </div>
            </div>

            {/* Live Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                  <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Sample Interface</h3>
                      <Button size="sm" style={{ backgroundColor: adminState.primaryColor }}>
                        Primary Button
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <div className="flex items-center mb-2">
                          <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium">Card Title</span>
                        </div>
                        <p className="text-xs text-gray-600">Sample card content with theme colors applied</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded border border-green-200">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm font-medium">Success State</span>
                        </div>
                        <p className="text-xs text-gray-600">Shows positive actions and confirmations</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded border border-red-200">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                          <span className="text-sm font-medium">Error State</span>
                        </div>
                        <p className="text-xs text-gray-600">Displays warnings and error messages</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Same content as settings tab but dedicated to theme */}
            <Tabs defaultValue="foundation" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="foundation">Foundation</TabsTrigger>
                <TabsTrigger value="components">Components</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                <TabsTrigger value="export">Export/Import</TabsTrigger>
              </TabsList>

              <TabsContent value="foundation" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Core Colors</CardTitle>
                      <CardDescription>Define the fundamental colors for your application</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Background Color</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            defaultValue="#ffffff"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#ffffff"
                            defaultValue="#ffffff"
                            className="flex-1"
                          />
                        </div>
                        <p className="text-xs text-gray-500">Main background color for the entire application</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Text Color</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            defaultValue="#0f1419"
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder="#0f1419"
                            defaultValue="#0f1419"
                            className="flex-1"
                          />
                        </div>
                        <p className="text-xs text-gray-500">Primary text color for readability</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Brand Primary</Label>
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="color"
                            value={adminState.primaryColor}
                            onChange={(e) => setAdminState(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input 
                            placeholder={adminState.primaryColor}
                            value={adminState.primaryColor}
                            onChange={(e) => setAdminState(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
                        <p className="text-xs text-gray-500">Your main brand color for buttons and highlights</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Typography</CardTitle>
                      <CardDescription>Configure fonts and text styling</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Primary Font Family</Label>
                        <Select defaultValue="inter">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inter">Inter</SelectItem>
                            <SelectItem value="roboto">Roboto</SelectItem>
                            <SelectItem value="poppins">Poppins</SelectItem>
                            <SelectItem value="openSans">Open Sans</SelectItem>
                            <SelectItem value="system">System Default</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Heading Font</Label>
                        <Select defaultValue="bebasNeue">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bebasNeue">Bebas Neue</SelectItem>
                            <SelectItem value="montserrat">Montserrat</SelectItem>
                            <SelectItem value="oswald">Oswald</SelectItem>
                            <SelectItem value="robotoCondensed">Roboto Condensed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Base Font Size</Label>
                        <div className="flex items-center space-x-4">
                          <Input 
                            type="range"
                            min="12"
                            max="18"
                            defaultValue="14"
                            className="flex-1"
                          />
                          <span className="text-sm font-mono w-12">14px</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="components" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Buttons & Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span>Primary Button</span>
                          <Button style={{ backgroundColor: adminState.primaryColor }}>Sample</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span>Secondary Button</span>
                          <Button variant="outline">Sample</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span>Destructive Button</span>
                          <Button variant="destructive">Sample</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Forms & Inputs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Sample Input</Label>
                        <Input placeholder="Type something..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Sample Textarea</Label>
                        <Textarea placeholder="Type a longer message..." rows={3} />
                      </div>
                      <div className="space-y-2">
                        <Label>Sample Select</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="option1">Option 1</SelectItem>
                            <SelectItem value="option2">Option 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Customization</CardTitle>
                    <CardDescription>Fine-tune detailed aspects of your theme</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Border Radius</Label>
                        <div className="flex items-center space-x-4">
                          <Input 
                            type="range"
                            min="0"
                            max="20"
                            defaultValue="6"
                            className="flex-1"
                          />
                          <span className="text-sm font-mono w-12">6px</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Shadow Intensity</Label>
                        <div className="flex items-center space-x-4">
                          <Input 
                            type="range"
                            min="0"
                            max="10"
                            defaultValue="3"
                            className="flex-1"
                          />
                          <span className="text-sm font-mono w-12">3</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <Label>Custom CSS</Label>
                      <Textarea 
                        placeholder="Add custom CSS rules..."
                        className="min-h-[100px] font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500">Advanced users can add custom CSS to override default styles</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="export" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Export Theme</CardTitle>
                      <CardDescription>Save your current theme configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Theme Name</Label>
                        <Input placeholder="My Custom Theme" />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea placeholder="Describe your theme..." rows={3} />
                      </div>
                      <Button className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Export Theme
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Import Theme</CardTitle>
                      <CardDescription>Load a previously saved theme</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <div className="space-y-2">
                          <FileText className="h-8 w-8 text-gray-400 mx-auto" />
                          <p className="text-sm text-gray-600">Drag and drop theme file here</p>
                          <Button variant="outline" size="sm">
                            Choose File
                          </Button>
                        </div>
                      </div>
                      <Button className="w-full" variant="outline">
                        Load From Library
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">Section Under Development</h3>
            <p className="text-gray-600">This feature is coming soon!</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderSidebar()}
      
      <div className={`transition-all duration-300 ${
        adminState.sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {menuItems.find(item => item.id === activeSection)?.title || 'Dashboard'}
              </h1>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Live
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Avatar>
                <AvatarFallback className="bg-blue-600 text-white">AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

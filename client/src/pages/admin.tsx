
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
    companyLogo: '/@assets/logo_1756065815534.png',
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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appearance Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="h-5 w-5 mr-2" />
                    Appearance & Branding
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme Mode</Label>
                    <Select 
                      value={adminState.currentTheme} 
                      onValueChange={(value: 'light' | 'dark' | 'system') => 
                        setAdminState(prev => ({ ...prev, currentTheme: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center">
                            <Sun className="h-4 w-4 mr-2" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center">
                            <Moon className="h-4 w-4 mr-2" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center">
                            <Monitor className="h-4 w-4 mr-2" />
                            System
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input 
                      id="company-name" 
                      value={adminState.companyName}
                      onChange={(e) => setAdminState(prev => ({ ...prev, companyName: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <Input 
                      id="primary-color" 
                      type="color"
                      value={adminState.primaryColor}
                      onChange={(e) => setAdminState(prev => ({ ...prev, primaryColor: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Enable Notifications</Label>
                    <Switch 
                      id="notifications" 
                      checked={adminState.notifications} 
                      onCheckedChange={(checked) => setAdminState(prev => ({ ...prev, notifications: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* System Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    System Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
            </div>
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

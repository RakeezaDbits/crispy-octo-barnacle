
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
  Monitor
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
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
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

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

// Menu items for sidebar
const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    id: "overview"
  },
  {
    title: "Appointments",
    icon: Calendar,
    id: "appointments"
  },
  {
    title: "Customers",
    icon: Users,
    id: "customers"
  },
  {
    title: "Analytics",
    icon: BarChart3,
    id: "analytics"
  },
  {
    title: "Reports",
    icon: FileText,
    id: "reports"
  },
  {
    title: "Notifications",
    icon: Bell,
    id: "notifications"
  }
];

// Admin sidebar component
function AdminSidebar({ activeSection, setActiveSection }: { activeSection: string, setActiveSection: (section: string) => void }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [themeMode, setThemeMode] = useState('light');
  const [notifications, setNotifications] = useState(true);
  const { toast } = useToast();

  const handleThemeChange = (theme: string) => {
    setThemeMode(theme);
    document.documentElement.className = theme;
    toast({
      title: "Theme Updated",
      description: `Switched to ${theme} mode`,
    });
  };

  const handleLogout = () => {
    adminLogout();
    toast({
      title: "Logged Out",
      description: "Successfully logged out from admin panel",
    });
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center space-x-3 px-4 py-2">
          <img 
            src="/@assets/logo_1756065815534.png" 
            alt="Alpha Security Logo" 
            className="h-8 w-auto"
          />
          <div>
            <h2 className="font-bold text-lg">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">Security Control</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-4" />

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                  <DialogTrigger asChild>
                    <SidebarMenuButton>
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>System Settings</DialogTitle>
                      <DialogDescription>
                        Configure your admin panel preferences and system settings.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Appearance</h4>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="theme">Theme Mode</Label>
                          <Select value={themeMode} onValueChange={handleThemeChange}>
                            <SelectTrigger className="w-32">
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
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="notifications">Enable Notifications</Label>
                          <Switch 
                            id="notifications" 
                            checked={notifications} 
                            onCheckedChange={setNotifications}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Logo & Branding</h4>
                        <div className="space-y-2">
                          <Label htmlFor="logo">Company Logo</Label>
                          <Input id="logo" type="file" accept="image/*" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company-name">Company Name</Label>
                          <Input id="company-name" defaultValue="Alpha Security Bureau" />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">System Configuration</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="est">EST</SelectItem>
                                <SelectItem value="pst">PST</SelectItem>
                                <SelectItem value="gmt">GMT</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>
                            <Select defaultValue="en">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="ur">Urdu</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setSettingsOpen(false)}>
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
                  <DialogTrigger asChild>
                    <SidebarMenuButton>
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </SidebarMenuButton>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Admin Profile</DialogTitle>
                      <DialogDescription>
                        Manage your admin account settings and personal information.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src="/placeholder-avatar.jpg" />
                          <AvatarFallback className="text-lg">AD</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <Button variant="outline" size="sm">
                            Change Photo
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            JPG, PNG, max 2MB
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">First Name</Label>
                          <Input id="first-name" defaultValue="Admin" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name">Last Name</Label>
                          <Input id="last-name" defaultValue="User" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="admin@alphasecurity.com" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" defaultValue="+1 (555) 123-4567" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" defaultValue="System Administrator" disabled />
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Security</h4>
                        <Button variant="outline" className="w-full">
                          Change Password
                        </Button>
                        <Button variant="outline" className="w-full">
                          Enable Two-Factor Authentication
                        </Button>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setProfileOpen(false)}>
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-4 py-2 text-xs text-muted-foreground">
          Version 2.0.1
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
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

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Dashboard Overview</h1>
                <p className="text-muted-foreground">Welcome back to your admin control center</p>
              </div>
              <Button onClick={exportToExcel}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>

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
          </div>
        );

      case 'appointments':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Appointments Management</h2>
              <Button onClick={exportToExcel}>
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
            </div>

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
          </div>
        );

      case 'customers':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Customer Management</h2>
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
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Advanced Analytics</h2>
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
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Reports & Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate comprehensive monthly performance report
                  </p>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Customer Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Detailed customer behavior and engagement metrics
                  </p>
                  <Button className="w-full">View Analytics</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Revenue and payment processing summary
                  </p>
                  <Button className="w-full">Download Summary</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Notification Center</h2>
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">New appointment scheduled</p>
                      <p className="text-sm text-muted-foreground">John Doe scheduled an appointment for tomorrow</p>
                    </div>
                    <div className="text-sm text-muted-foreground">2 min ago</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Payment received</p>
                      <p className="text-sm text-muted-foreground">Payment of $150 received from Jane Smith</p>
                    </div>
                    <div className="text-sm text-muted-foreground">1 hour ago</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">System maintenance</p>
                      <p className="text-sm text-muted-foreground">Scheduled maintenance tonight at 2 AM</p>
                    </div>
                    <div className="text-sm text-muted-foreground">3 hours ago</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">
                {menuItems.find(item => item.id === activeSection)?.title || 'Dashboard'}
              </h1>
            </div>
            <div className="ml-auto flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

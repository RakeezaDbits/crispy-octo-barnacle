import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, insertUserSchema, insertCustomerSchema, customerLoginSchema, passwordResetSchema, passwordResetConfirmSchema } from "@shared/schema";
import { emailService } from "./services/emailService";
import { squareService } from "./services/squareService";
import { docuSignService } from "./services/docusignService";
import { AuthService } from "./services/authService";
import { authenticateCustomer, optionalAuthentication, getCustomerId } from "./middleware/authMiddleware";
import { authRequired } from "./middleware/authMiddleware";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create appointment
  app.post("/api/appointments", authRequired, async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);

      console.log('Processing appointment for customer:', req.user?.email);

      // Process payment first
      const paymentResult = await squareService.processPayment(
        appointmentData.nonce,
        appointmentData.amount,
        appointmentData
      );

      console.log('Payment processed successfully:', paymentResult);

      // Create appointment record
      const appointmentToInsert = {
        ...appointmentData,
        customerId: req.user!.id,
        paymentStatus: 'paid',
        status: 'confirmed',
        squarePaymentId: paymentResult.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [appointment] = await db
        .insert(appointments)
        .values(appointmentToInsert)
        .returning();

      console.log('Appointment created with ID:', appointment.id);

      // Send confirmation email immediately
      try {
        await emailService.sendConfirmationEmail(appointment);
        console.log('✅ Confirmation email sent successfully to:', appointment.email);
      } catch (emailError) {
        console.error('❌ Failed to send confirmation email:', emailError);
      }

      // Send DocuSign agreement
      try {
        console.log('📝 Sending DocuSign agreement...');
        const docuSignResult = await docuSignService.sendDocuSignAgreement(appointment);
        console.log('✅ DocuSign sent successfully:', docuSignResult);

        // Update appointment with DocuSign info
        await db
          .update(appointments)
          .set({
            docusignEnvelopeId: docuSignResult.envelopeId,
            docusignStatus: docuSignResult.status,
            updatedAt: new Date(),
          })
          .where(eq(appointments.id, appointment.id));

        // Send DocuSign notification email
        await emailService.sendDocuSignNotification(appointment, docuSignResult.recipientUrl);
        console.log('✅ DocuSign notification email sent successfully');
      } catch (docuSignError) {
        console.error('❌ Failed to send DocuSign agreement:', docuSignError);
      }

      // Send a follow-up reminder email after 1 hour (in production, use a job queue)
      setTimeout(async () => {
        try {
          await emailService.sendReminderEmail(appointment);
          console.log('✅ Reminder email sent after 1 hour');
        } catch (reminderError) {
          console.error('❌ Failed to send reminder email:', reminderError);
        }
      }, 60 * 60 * 1000); // 1 hour in milliseconds

      res.json({
        success: true,
        message: 'Appointment created successfully! Confirmation email sent.',
        appointment: {
          ...appointment,
          paymentId: paymentResult.id
        }
      });
    } catch (error) {
      console.error("❌ Error creating appointment:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create appointment'
      });
    }
  });

  // Process payment
  app.post("/api/payments", async (req, res) => {
    try {
      const { appointmentId, sourceId, amount } = req.body;

      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      const payment = await squareService.processPayment(sourceId, amount, appointment);

      // Update appointment with payment info
      await storage.updateAppointment(appointmentId, {
        paymentId: payment.id,
        paymentStatus: payment.status === "COMPLETED" ? "completed" : "failed",
        status: payment.status === "COMPLETED" ? "confirmed" : "pending"
      });

      res.json({ success: true, payment });
    } catch (error) {
      console.error("Payment processing failed:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Payment processing failed" });
    }
  });

  // Get all appointments (admin)
  app.get("/api/appointments", async (req, res) => {
    try {
      const appointments = await storage.getAllAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Get all customers (admin)
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  // Get single appointment
  app.get("/api/appointments/:id", async (req, res) => {
    try {
      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      console.error("Failed to fetch appointment:", error);
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });

  // Update appointment status
  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const { status, docusignStatus } = req.body;
      const updates: any = {};

      if (status) updates.status = status;
      if (docusignStatus) updates.docusignStatus = docusignStatus;

      const appointment = await storage.updateAppointment(req.params.id, updates);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      res.json(appointment);
    } catch (error) {
      console.error("Failed to update appointment:", error);
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  // Customer appointments endpoint - get appointments by email
  app.get("/api/customer/appointments", async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ error: "Email parameter is required" });
      }

      const appointments = await storage.getAppointmentsByEmail(email as string);
      res.json(appointments);
    } catch (error) {
      console.error("Failed to get customer appointments:", error);
      res.status(500).json({ error: "Failed to get appointments" });
    }
  });

  // Service packages endpoint
  app.get("/api/service-packages", async (req, res) => {
    try {
      let packages = await storage.getServicePackages();

      // If no packages exist, create default ones
      if (packages.length === 0) {
        const defaultPackages = [
          {
            name: "Basic Security Audit",
            description: "Essential home security assessment covering entry points, locks, and basic vulnerabilities.",
            price: "50.00",
            features: ["Entry point assessment", "Lock evaluation", "Basic security recommendations", "Written report"],
            duration: 60,
            priority: 1
          },
          {
            name: "Comprehensive Security & Title Protection",
            description: "Complete security audit plus title monitoring and protection services for maximum peace of mind.",
            price: "150.00",
            features: [
              "Complete security audit",
              "Title deed verification",
              "Property ownership monitoring",
              "Legal document review",
              "6-month monitoring service",
              "Detailed report with action plan"
            ],
            duration: 120,
            priority: 2
          },
          {
            name: "Premium Executive Protection Package",
            description: "Advanced security assessment with ongoing monitoring, emergency response planning, and VIP consultation.",
            price: "300.00",
            features: [
              "Advanced threat assessment",
              "Emergency response planning",
              "Smart home security integration",
              "24/7 monitoring setup",
              "Personal security consultation",
              "Quarterly follow-up assessments",
              "Priority emergency response"
            ],
            duration: 180,
            priority: 3
          }
        ];

        for (const pkg of defaultPackages) {
          await storage.createServicePackage(pkg);
        }

        packages = await storage.getServicePackages();
      }

      res.json(packages);
    } catch (error) {
      console.error("Failed to get service packages:", error);
      res.status(500).json({ error: "Failed to get service packages" });
    }
  });

  // DocuSign webhook endpoint
  app.post("/api/docusign/webhook", async (req, res) => {
    try {
      const { event, data } = req.body;

      if (event === 'envelope-completed' || event === 'envelope-signed') {
        const envelopeId = data?.envelopeId;
        const status = event === 'envelope-completed' ? 'completed' : 'signed';

        if (envelopeId) {
          // Find appointment by envelope ID and update DocuSign status
          const appointments = await storage.getAllAppointments();
          const appointment = appointments.find(apt =>
            apt.docusignStatus && apt.docusignStatus.includes(envelopeId)
          );

          if (appointment) {
            await storage.updateAppointment(appointment.id, {
              docusignStatus: status
            });
            console.log(`Updated appointment ${appointment.id} DocuSign status to ${status}`);
          }
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("DocuSign webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Send reminder emails (can be called manually or via cron)
  app.post("/api/send-reminders", async (req, res) => {
    try {
      const appointments = await storage.getAllAppointments();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find appointments scheduled for tomorrow
      const appointmentsForTomorrow = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.preferredDate);
        return appointmentDate.toDateString() === tomorrow.toDateString() &&
               appointment.status === 'confirmed';
      });

      let emailsSent = 0;
      for (const appointment of appointmentsForTomorrow) {
        try {
          await emailService.sendReminderEmail(appointment);
          emailsSent++;
          console.log(`Reminder email sent to ${appointment.email}`);
        } catch (error) {
          console.error(`Failed to send reminder to ${appointment.email}:`, error);
        }
      }

      res.json({
        message: `Processed ${appointmentsForTomorrow.length} appointments, sent ${emailsSent} reminders`
      });
    } catch (error) {
      console.error("Failed to send reminder emails:", error);
      res.status(500).json({ error: "Failed to send reminder emails" });
    }
  });

  // Customer authentication routes
  // Register customer
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const { customer, token } = await AuthService.registerCustomer(validatedData);

      // Send verification email
      try {
        await emailService.sendWelcomeEmail(customer.email, customer.fullName, customer.emailVerificationToken!);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
      }

      res.status(201).json({
        message: "Registration successful. Please check your email to verify your account.",
        token,
        customer: {
          id: customer.id,
          email: customer.email,
          fullName: customer.fullName,
          phone: customer.phone,
          isEmailVerified: customer.isEmailVerified,
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Registration failed" });
    }
  });

  // Login customer
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = customerLoginSchema.parse(req.body);
      const result = await AuthService.loginCustomer(validatedData);

      if (!result) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const { customer, token } = result;
      res.json({
        message: "Login successful",
        token,
        customer: {
          id: customer.id,
          email: customer.email,
          fullName: customer.fullName,
          phone: customer.phone,
          isEmailVerified: customer.isEmailVerified,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Login failed" });
    }
  });

  // Logout customer
  app.post("/api/auth/logout", authenticateCustomer, async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';

      if (token) {
        await AuthService.logout(token);
      }

      res.json({ message: "Logout successful" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Verify email
  app.get("/api/auth/verify-email/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const success = await AuthService.verifyEmail(token);

      if (success) {
        res.json({ message: "Email verified successfully" });
      } else {
        res.status(400).json({ message: "Invalid or expired verification token" });
      }
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Email verification failed" });
    }
  });

  // Request password reset
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const validatedData = passwordResetSchema.parse(req.body);
      const resetToken = await AuthService.generatePasswordResetToken(validatedData.email);

      if (resetToken) {
        // Send password reset email
        try {
          await emailService.sendPasswordResetEmail(validatedData.email, resetToken);
        } catch (emailError) {
          console.error("Failed to send password reset email:", emailError);
        }
      }

      // Always return success for security reasons
      res.json({ message: "If the email exists, a password reset link has been sent" });
    } catch (error) {
      console.error("Password reset request error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Password reset failed" });
    }
  });

  // Reset password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const validatedData = passwordResetConfirmSchema.parse(req.body);
      const success = await AuthService.resetPassword(validatedData.token, validatedData.newPassword);

      if (success) {
        res.json({ message: "Password reset successful. Please login with your new password." });
      } else {
        res.status(400).json({ message: "Invalid or expired reset token" });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Password reset failed" });
    }
  });

  // Get current customer profile
  app.get("/api/auth/profile", authenticateCustomer, async (req, res) => {
    try {
      const customer = req.customer!;
      res.json({
        id: customer.id,
        email: customer.email,
        fullName: customer.fullName,
        phone: customer.phone,
        isEmailVerified: customer.isEmailVerified,
        createdAt: customer.createdAt,
        lastLoginAt: customer.lastLoginAt,
      });
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Get customer's appointments
  app.get("/api/auth/appointments", authenticateCustomer, async (req, res) => {
    try {
      const customerId = getCustomerId(req);
      const appointments = await storage.getAppointmentsByCustomerId(customerId);
      res.json(appointments);
    } catch (error) {
      console.error("Failed to get customer appointments:", error);
      res.status(500).json({ message: "Failed to get appointments" });
    }
  });

  // Create appointment for authenticated customer
  app.post("/api/auth/appointments", authenticateCustomer, async (req, res) => {
    try {
      const customerId = getCustomerId(req);
      const appointmentData = {
        ...req.body,
        customerId, // Link appointment to authenticated customer
        status: "pending",
        paymentStatus: "pending",
        amount: 225, // Fixed service fee ($100 monthly + $125 audit)
      };

      const appointment = await storage.createAppointment(appointmentData);

      // Send confirmation email
      try {
        await emailService.sendConfirmationEmail(appointment);
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the appointment creation if email fails
      }

      res.status(201).json(appointment);
    } catch (error) {
      console.error("Failed to create appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  // Admin authentication route
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      // Demo authentication - in production, use proper password hashing
      if (username === "admin" && password === "admin123") {
        const token = generateAuthToken(1, username);
        res.json({ token, message: "Login successful" });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Generate authentication token
function generateAuthToken(userId: number, username: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    userId,
    username,
    role: "admin",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  const headerB64 = btoa(JSON.stringify(header));
  const payloadB64 = btoa(JSON.stringify(payload));
  const signature = btoa(`secret_${userId}_${payload.exp}`);

  return `${headerB64}.${payloadB64}.${signature}`;
}
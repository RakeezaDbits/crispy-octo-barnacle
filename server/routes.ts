import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, insertUserSchema } from "@shared/schema";
import { emailService } from "./services/emailService";
import { squareService } from "./services/squareService";
import { docuSignService } from "./services/docusignService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create appointment
  app.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      
      // Send confirmation email and DocuSign agreement
      try {
        await emailService.sendConfirmationEmail(appointment);
        const docuSignResult = await docuSignService.sendDocuSignAgreement(appointment);
        
        // Update appointment status to include DocuSign sent with envelope ID
        await storage.updateAppointment(appointment.id, {
          docusignStatus: `sent:${docuSignResult.envelopeId}`
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email or DocuSign:", emailError);
        // Don't fail the appointment creation if email fails
      }

      res.json(appointment);
    } catch (error) {
      console.error("Failed to create appointment:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid appointment data" });
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

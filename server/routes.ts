import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema } from "@shared/schema";
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
        await docuSignService.sendDocuSignAgreement(appointment);
        
        // Update appointment status to include DocuSign sent
        await storage.updateAppointment(appointment.id, {
          docusignStatus: "sent"
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

  const httpServer = createServer(app);
  return httpServer;
}

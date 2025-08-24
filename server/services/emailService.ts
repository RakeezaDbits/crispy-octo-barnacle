import nodemailer from "nodemailer";
import type { Appointment } from "@shared/schema";

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendConfirmationEmail(appointment: Appointment) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email credentials not configured, skipping email send");
      return;
    }

    const formattedDate = new Date(appointment.preferredDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const timeSlot = appointment.preferredTime ? 
      (appointment.preferredTime === 'morning' ? 'Morning (9 AM - 12 PM)' :
       appointment.preferredTime === 'afternoon' ? 'Afternoon (12 PM - 5 PM)' :
       appointment.preferredTime === 'evening' ? 'Evening (5 PM - 7 PM)' :
       appointment.preferredTime) : 'To be confirmed';

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🛡️ SecureHome Audit</h1>
          <p style="margin: 10px 0 0; font-size: 16px;">Professional Asset & Title Protection</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1e3a8a; margin-bottom: 20px;">Appointment Confirmed!</h2>
          
          <p>Dear ${appointment.fullName},</p>
          
          <p>Thank you for scheduling your free home security audit with SecureHome Audit. Your appointment has been confirmed with the following details:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="color: #1e3a8a; margin-top: 0;">Appointment Details</h3>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${timeSlot}</p>
            <p><strong>Address:</strong> ${appointment.address}</p>
            <p><strong>Service Fee:</strong> $${appointment.amount}</p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">📋 Preparation Checklist</h3>
            <ul style="color: #92400e; margin: 0;">
              <li>Gather all receipts for valuable items</li>
              <li>Collect warranty papers and documentation</li>
              <li>Ensure access to all rooms and storage areas</li>
              <li>Have jewelry and small valuables readily available</li>
            </ul>
          </div>
          
          <p>Our certified security officer will contact you 24 hours before your appointment to confirm the visit and answer any questions you may have.</p>
          
          <p style="margin-top: 30px;">Best regards,<br><strong>The SecureHome Audit Team</strong></p>
        </div>
        
        <div style="background: #1e3a8a; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 14px;">
            Questions? Contact us at (555) 123-4567 or info@securehome.com
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"SecureHome Audit" <${process.env.EMAIL_USER}>`,
      to: appointment.email,
      subject: "Appointment Confirmed - SecureHome Audit",
      html: emailContent,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendReminderEmail(appointment: Appointment) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email credentials not configured, skipping email send");
      return;
    }

    const formattedDate = new Date(appointment.preferredDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🛡️ SecureHome Audit</h1>
          <p style="margin: 10px 0 0; font-size: 16px;">Appointment Reminder</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1e3a8a; margin-bottom: 20px;">Reminder: Your Audit is Tomorrow!</h2>
          
          <p>Dear ${appointment.fullName},</p>
          
          <p>This is a friendly reminder that your home security audit is scheduled for tomorrow, ${formattedDate}.</p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">📋 Final Preparation Checklist</h3>
            <ul style="color: #92400e; margin: 0;">
              <li>✓ Gather all receipts for valuable items</li>
              <li>✓ Collect warranty papers and documentation</li>
              <li>✓ Ensure access to all rooms and storage areas</li>
              <li>✓ Have jewelry and small valuables readily available</li>
            </ul>
          </div>
          
          <p>Our certified officer will arrive during your scheduled time window. Please ensure someone is available to let them in and assist with the audit process.</p>
          
          <p style="margin-top: 30px;">Looking forward to serving you tomorrow!</p>
          
          <p>Best regards,<br><strong>The SecureHome Audit Team</strong></p>
        </div>
        
        <div style="background: #1e3a8a; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 14px;">
            Questions? Contact us at (555) 123-4567 or info@securehome.com
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"SecureHome Audit" <${process.env.EMAIL_USER}>`,
      to: appointment.email,
      subject: "Reminder: Your Home Audit is Tomorrow - SecureHome Audit",
      html: emailContent,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export const emailService = new EmailService();

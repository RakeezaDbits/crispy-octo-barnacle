
import nodemailer from "nodemailer";
import type { Appointment } from "@shared/schema";

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  private getEmailTemplate(type: string, data: any) {
    const baseStyles = `
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 0; 
          padding: 0; 
          background-color: #f8fafc; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1d4ed8 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          position: relative;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        }
        .header h1 { 
          margin: 0; 
          font-size: 32px; 
          font-weight: 700; 
          position: relative; 
          z-index: 1;
        }
        .header p { 
          margin: 10px 0 0; 
          font-size: 16px; 
          opacity: 0.9; 
          position: relative; 
          z-index: 1;
        }
        .content { 
          padding: 40px 30px; 
          line-height: 1.6; 
        }
        .content h2 { 
          color: #1e3a8a; 
          margin-bottom: 20px; 
          font-size: 24px; 
          font-weight: 600;
        }
        .appointment-card { 
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
          padding: 25px; 
          border-radius: 12px; 
          margin: 25px 0; 
          border-left: 6px solid #3b82f6; 
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .appointment-card h3 { 
          color: #1e3a8a; 
          margin-top: 0; 
          font-size: 20px; 
          font-weight: 600;
        }
        .appointment-details { 
          display: grid; 
          gap: 8px; 
        }
        .detail-row { 
          display: flex; 
          align-items: center; 
        }
        .detail-icon { 
          width: 20px; 
          height: 20px; 
          margin-right: 12px; 
          color: #3b82f6; 
        }
        .checklist { 
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
          padding: 25px; 
          border-radius: 12px; 
          margin: 25px 0; 
          border-left: 6px solid #f59e0b;
        }
        .checklist h3 { 
          color: #92400e; 
          margin-top: 0; 
          font-size: 18px; 
          font-weight: 600;
        }
        .checklist ul { 
          color: #92400e; 
          margin: 15px 0; 
          padding-left: 20px;
        }
        .checklist li { 
          margin: 8px 0; 
          position: relative;
        }
        .checklist li::marker { 
          content: '✓ '; 
          color: #059669; 
          font-weight: bold;
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600; 
          text-align: center; 
          margin: 20px 0; 
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
          transition: all 0.3s ease;
        }
        .cta-button:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
        .alert-box { 
          background: linear-gradient(135deg, #fef3cd 0%, #fde68a 100%); 
          border: 2px solid #f59e0b; 
          padding: 20px; 
          border-radius: 12px; 
          margin: 20px 0;
        }
        .alert-box h3 { 
          color: #92400e; 
          margin-bottom: 15px; 
          font-size: 18px; 
          font-weight: 600;
        }
        .alert-box p { 
          color: #92400e; 
          margin: 10px 0;
        }
        .footer { 
          background: #1e3a8a; 
          color: white; 
          padding: 30px; 
          text-align: center;
        }
        .footer p { 
          margin: 0; 
          font-size: 14px; 
          opacity: 0.9;
        }
        .social-links { 
          margin: 20px 0; 
        }
        .social-links a { 
          color: white; 
          text-decoration: none; 
          margin: 0 10px; 
          opacity: 0.8;
        }
        .contact-info { 
          background: #e0f2fe; 
          padding: 20px; 
          border-radius: 12px; 
          margin: 20px 0; 
          border-left: 6px solid #0284c7;
        }
        .contact-info h3 { 
          color: #0c4a6e; 
          margin-top: 0; 
          font-size: 18px; 
          font-weight: 600;
        }
        .contact-info ul { 
          color: #0c4a6e; 
          list-style: none; 
          padding: 0; 
          margin: 15px 0;
        }
        .contact-info li { 
          margin: 8px 0; 
          display: flex; 
          align-items: center;
        }
        .status-badge { 
          display: inline-block; 
          padding: 6px 12px; 
          border-radius: 20px; 
          font-size: 12px; 
          font-weight: 600; 
          text-transform: uppercase; 
          letter-spacing: 0.5px;
        }
        .status-confirmed { 
          background: #dcfce7; 
          color: #166534;
        }
        .status-pending { 
          background: #fef3c7; 
          color: #92400e;
        }
        .progress-bar { 
          background: #e5e7eb; 
          height: 8px; 
          border-radius: 4px; 
          overflow: hidden; 
          margin: 15px 0;
        }
        .progress-fill { 
          background: linear-gradient(90deg, #3b82f6, #1d4ed8); 
          height: 100%; 
          border-radius: 4px; 
          transition: width 0.3s ease;
        }
      </style>
    `;

    switch (type) {
      case 'confirmation':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Appointment Confirmed - Alpha Security Bureau</title>
            ${baseStyles}
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🛡️ Alpha Security Bureau</h1>
                <p>Professional Asset & Title Protection Services</p>
              </div>

              <div class="content">
                <h2>Appointment Confirmed! 🎉</h2>
                
                <p>Dear <strong>${data.fullName}</strong>,</p>
                
                <p>Thank you for choosing Alpha Security Bureau for your home security audit. Your appointment has been successfully confirmed and our team is excited to protect your valuable assets.</p>

                <div class="appointment-card">
                  <h3>📅 Your Appointment Details</h3>
                  <div class="appointment-details">
                    <div class="detail-row">
                      <span class="detail-icon">📅</span>
                      <strong>Date:</strong> ${new Date(data.preferredDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </div>
                    <div class="detail-row">
                      <span class="detail-icon">⏰</span>
                      <strong>Time:</strong> ${data.preferredTime || 'To be confirmed within 24 hours'}
                    </div>
                    <div class="detail-row">
                      <span class="detail-icon">📍</span>
                      <strong>Location:</strong> ${data.address}
                    </div>
                    <div class="detail-row">
                      <span class="detail-icon">💰</span>
                      <strong>Service Fee:</strong> $${data.amount}
                    </div>
                    <div class="detail-row">
                      <span class="detail-icon">🆔</span>
                      <strong>Appointment ID:</strong> ${data.id}
                    </div>
                  </div>
                  <span class="status-badge status-confirmed">✅ Confirmed</span>
                </div>

                <div class="checklist">
                  <h3>📋 Pre-Visit Preparation Checklist</h3>
                  <p>To ensure the most comprehensive audit, please prepare the following:</p>
                  <ul>
                    <li>Gather all receipts and purchase documents for valuable items</li>
                    <li>Collect warranty papers, certificates, and appraisals</li>
                    <li>Ensure access to all rooms, safes, and storage areas</li>
                    <li>Have jewelry, electronics, and collectibles readily available</li>
                    <li>Prepare a list of any specific concerns or high-value items</li>
                    <li>Clear pathways for our security officer to move safely</li>
                  </ul>
                </div>

                <div class="contact-info">
                  <h3>📞 What Happens Next?</h3>
                  <ul>
                    <li>📱 Our certified security officer will contact you 24 hours before your appointment</li>
                    <li>🔒 You'll receive a text with our officer's photo and credentials for verification</li>
                    <li>📋 We'll confirm the appointment time and answer any questions</li>
                    <li>📧 A detailed report will be emailed within 48 hours after the audit</li>
                  </ul>
                </div>

                <div class="alert-box">
                  <h3>🔐 Security & Privacy Guarantee</h3>
                  <p>All information collected during your audit is encrypted and stored securely. Our officers are bonded, insured, and undergo comprehensive background checks.</p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="tel:+15551234567" class="cta-button">📞 Call Us: (555) 123-4567</a>
                </div>

                <p>Thank you for trusting Alpha Security Bureau with your home protection needs. We look forward to providing you with exceptional service.</p>

                <p style="margin-top: 30px;">
                  Best regards,<br>
                  <strong>The Alpha Security Bureau Team</strong><br>
                  <em>Protecting What Matters Most</em>
                </p>
              </div>

              <div class="footer">
                <div class="social-links">
                  <a href="#">Facebook</a> | <a href="#">Twitter</a> | <a href="#">LinkedIn</a>
                </div>
                <p>Alpha Security Bureau | Professional Asset Protection Services</p>
                <p>📧 info@alphasecurity.com | 📞 (555) 123-4567 | 🌐 www.alphasecurity.com</p>
                <p style="font-size: 12px; margin-top: 15px;">
                  © ${new Date().getFullYear()} Alpha Security Bureau. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

      case 'docusign':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Service Agreement Signature Required - Alpha Security Bureau</title>
            ${baseStyles}
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🛡️ Alpha Security Bureau</h1>
                <p>Service Agreement - Digital Signature Required</p>
              </div>

              <div class="content">
                <h2>📝 Please Sign Your Service Agreement</h2>

                <p>Dear <strong>${data.fullName}</strong>,</p>

                <p>To finalize your appointment scheduled for <strong>${new Date(data.preferredDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</strong>, we need your digital signature on our service agreement.</p>

                <div class="alert-box">
                  <h3>⚡ Action Required - Sign Your Agreement</h3>
                  <p>Your appointment cannot proceed without a signed service agreement. This protects both you and our team during the audit process.</p>
                  
                  <div style="text-align: center; margin: 20px 0;">
                    <a href="${process.env.NODE_ENV === 'production' 
                      ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
                      : `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
                    }/dashboard?email=${encodeURIComponent(data.email)}" class="cta-button">
                      ✍️ Sign Agreement Now
                    </a>
                  </div>
                  
                  <p style="font-size: 12px; text-align: center; color: #666;">
                    Or copy this link: ${process.env.NODE_ENV === 'production' 
                      ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
                      : `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
                    }/dashboard
                  </p>
                </div>

                <div class="appointment-card">
                  <h3>📅 Your Appointment Summary</h3>
                  <div class="appointment-details">
                    <div class="detail-row">
                      <span class="detail-icon">📅</span>
                      <strong>Date:</strong> ${new Date(data.preferredDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div class="detail-row">
                      <span class="detail-icon">📍</span>
                      <strong>Address:</strong> ${data.address}
                    </div>
                    <div class="detail-row">
                      <span class="detail-icon">💰</span>
                      <strong>Service Fee:</strong> $${data.amount}
                    </div>
                  </div>
                  <span class="status-badge status-pending">⏳ Pending Signature</span>
                </div>

                <div class="progress-bar">
                  <div class="progress-fill" style="width: 75%;"></div>
                </div>
                <p style="text-align: center; font-size: 14px; color: #666;">
                  75% Complete - Only signature needed to finalize
                </p>

                <div class="contact-info">
                  <h3>📋 What's Included in the Agreement?</h3>
                  <ul>
                    <li>🔒 Service scope and security protocols</li>
                    <li>📊 Data collection and privacy terms</li>
                    <li>💼 Insurance and liability coverage</li>
                    <li>📧 Report delivery and follow-up services</li>
                  </ul>
                </div>

                <p><strong>⏰ Important:</strong> Please sign within 48 hours to maintain your scheduled appointment slot. Our calendar fills up quickly!</p>

                <p style="margin-top: 30px;">
                  Best regards,<br>
                  <strong>The Alpha Security Bureau Team</strong>
                </p>
              </div>

              <div class="footer">
                <div class="social-links">
                  <a href="#">Facebook</a> | <a href="#">Twitter</a> | <a href="#">LinkedIn</a>
                </div>
                <p>Questions about the agreement? Call us at (555) 123-4567</p>
                <p>📧 legal@alphasecurity.com | 🌐 www.alphasecurity.com</p>
              </div>
            </div>
          </body>
          </html>
        `;

      case 'reminder':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Appointment Reminder - Tomorrow! - Alpha Security Bureau</title>
            ${baseStyles}
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🛡️ Alpha Security Bureau</h1>
                <p>Appointment Reminder - Your Audit is Tomorrow!</p>
              </div>

              <div class="content">
                <h2>🔔 Reminder: Your Security Audit is Tomorrow!</h2>

                <p>Dear <strong>${data.fullName}</strong>,</p>

                <p>This is a friendly reminder that your comprehensive home security audit is scheduled for tomorrow, <strong>${new Date(data.preferredDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}</strong>.</p>

                <div class="appointment-card">
                  <h3>📅 Tomorrow's Appointment</h3>
                  <div class="appointment-details">
                    <div class="detail-row">
                      <span class="detail-icon">⏰</span>
                      <strong>Time:</strong> ${data.preferredTime || 'Our officer will call 2 hours before arrival'}
                    </div>
                    <div class="detail-row">
                      <span class="detail-icon">📍</span>
                      <strong>Location:</strong> ${data.address}
                    </div>
                    <div class="detail-row">
                      <span class="detail-icon">⏱️</span>
                      <strong>Duration:</strong> Approximately 90-120 minutes
                    </div>
                  </div>
                </div>

                <div class="checklist">
                  <h3>📋 Final 24-Hour Checklist</h3>
                  <p>Please ensure you have everything ready:</p>
                  <ul>
                    <li>All valuable items are accessible and organized</li>
                    <li>Receipts, warranties, and certificates are gathered</li>
                    <li>Someone 18+ will be present during the entire visit</li>
                    <li>Pets are secured (if applicable)</li>
                    <li>Clear pathways to all rooms and storage areas</li>
                    <li>Any security systems are temporarily disabled for access</li>
                  </ul>
                </div>

                <div class="contact-info">
                  <h3>👤 Your Security Officer Information</h3>
                  <ul>
                    <li>📱 Will call you 2 hours before arrival with exact time</li>
                    <li>🆔 Carries official Alpha Security Bureau identification</li>
                    <li>📋 Has your service agreement and appointment details</li>
                    <li>🚗 Arrives in a marked company vehicle</li>
                  </ul>
                </div>

                <div class="alert-box">
                  <h3>🚨 Security Verification</h3>
                  <p>For your safety, always verify our officer's credentials before allowing entry. They will provide:</p>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Photo ID with Alpha Security Bureau logo</li>
                    <li>Your appointment confirmation number</li>
                    <li>Signed service agreement copy</li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="tel:+15551234567" class="cta-button">📞 Questions? Call (555) 123-4567</a>
                </div>

                <p>We're excited to help protect your valuable assets tomorrow. Our team is committed to providing you with the most thorough and professional service possible.</p>

                <p style="margin-top: 30px;">
                  Looking forward to serving you tomorrow!<br>
                  <strong>The Alpha Security Bureau Team</strong>
                </p>
              </div>

              <div class="footer">
                <div class="social-links">
                  <a href="#">Facebook</a> | <a href="#">Twitter</a> | <a href="#">LinkedIn</a>
                </div>
                <p>Need to reschedule? Call us at (555) 123-4567 before 6 PM today</p>
                <p>📧 support@alphasecurity.com | 🌐 www.alphasecurity.com</p>
              </div>
            </div>
          </body>
          </html>
        `;

      case 'welcome':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Alpha Security Bureau</title>
            ${baseStyles}
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🛡️ Alpha Security Bureau</h1>
                <p>Welcome to Professional Security Services</p>
              </div>

              <div class="content">
                <h2>Welcome ${data.fullName}! 🎉</h2>

                <p>Thank you for creating an account with Alpha Security Bureau. You've taken the first step towards comprehensive protection of your valuable assets and property title.</p>

                <div class="alert-box">
                  <h3>📧 Verify Your Email Address</h3>
                  <p>To activate your account and start booking security audits, please verify your email address by clicking the button below:</p>
                  
                  <div style="text-align: center; margin: 20px 0;">
                    <a href="${data.verificationUrl}" class="cta-button">
                      ✅ Verify Email Address
                    </a>
                  </div>
                  
                  <p style="font-size: 12px; color: #666;">
                    If the button doesn't work, copy and paste this link: ${data.verificationUrl}
                  </p>
                </div>

                <div class="contact-info">
                  <h3>🚀 What's Next After Verification?</h3>
                  <ul>
                    <li>✅ Complete your profile with contact information</li>
                    <li>📅 Book your first comprehensive security audit</li>
                    <li>📊 Access your personalized security dashboard</li>
                    <li>📧 Receive exclusive security tips and recommendations</li>
                    <li>🔔 Get notified about important security updates</li>
                  </ul>
                </div>

                <div class="checklist">
                  <h3>🏆 Why Choose Alpha Security Bureau?</h3>
                  <ul>
                    <li>Licensed and bonded security professionals</li>
                    <li>Comprehensive asset documentation and photography</li>
                    <li>24/7 title monitoring and fraud protection</li>
                    <li>Insurance-ready reports and valuations</li>
                    <li>Advanced security recommendations</li>
                    <li>100% satisfaction guarantee</li>
                  </ul>
                </div>

                <div style="background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 6px solid #0284c7;">
                  <h3 style="color: #0c4a6e; margin-top: 0;">🎁 New Customer Special Offer</h3>
                  <p style="color: #0c4a6e; margin: 0;">
                    <strong>Save $50 on your first security audit!</strong><br>
                    Use code: <strong>WELCOME50</strong> when booking your appointment.
                  </p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="tel:+15551234567" class="cta-button">📞 Questions? Call (555) 123-4567</a>
                </div>

                <p>We're excited to help protect what matters most to you. Our team of security experts is ready to provide you with unparalleled service and peace of mind.</p>

                <p style="margin-top: 30px;">
                  Welcome to the Alpha Security Bureau family!<br>
                  <strong>The Alpha Security Bureau Team</strong><br>
                  <em>Protecting What Matters Most Since 2020</em>
                </p>
              </div>

              <div class="footer">
                <div class="social-links">
                  <a href="#">Facebook</a> | <a href="#">Twitter</a> | <a href="#">LinkedIn</a> | <a href="#">Instagram</a>
                </div>
                <p>Alpha Security Bureau | Your Trusted Security Partner</p>
                <p>📧 welcome@alphasecurity.com | 📞 (555) 123-4567 | 🌐 www.alphasecurity.com</p>
                <p style="font-size: 12px; margin-top: 15px;">
                  © ${new Date().getFullYear()} Alpha Security Bureau. All rights reserved. | Privacy Policy | Terms of Service
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

      default:
        return '';
    }
  }

  async sendConfirmationEmail(appointment: Appointment) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email credentials not configured, skipping email send");
      return;
    }

    const emailContent = this.getEmailTemplate('confirmation', appointment);

    const mailOptions = {
      from: `"Alpha Security Bureau" <${process.env.EMAIL_USER}>`,
      to: appointment.email,
      subject: "🛡️ Appointment Confirmed - Alpha Security Bureau",
      html: emailContent,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendDocuSignNotification(appointment: Appointment, signingUrl?: string) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email credentials not configured, skipping email send");
      return;
    }

    const emailContent = this.getEmailTemplate('docusign', appointment);

    const mailOptions = {
      from: `"Alpha Security Bureau" <${process.env.EMAIL_USER}>`,
      to: appointment.email,
      subject: "📝 Please Sign Your Service Agreement - Alpha Security Bureau",
      html: emailContent,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendReminderEmail(appointment: Appointment) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email credentials not configured, skipping email send");
      return;
    }

    const emailContent = this.getEmailTemplate('reminder', appointment);

    const mailOptions = {
      from: `"Alpha Security Bureau" <${process.env.EMAIL_USER}>`,
      to: appointment.email,
      subject: "🔔 Reminder: Your Security Audit is Tomorrow! - Alpha Security Bureau",
      html: emailContent,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(email: string, fullName: string, verificationToken: string) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email credentials not configured, skipping email send");
      return;
    }

    const domainUrl = process.env.NODE_ENV === 'production' 
      ? `https://${process.env.REPL_SLUG || 'your-repl'}.${process.env.REPL_OWNER || 'your-username'}.repl.co`
      : `https://${process.env.REPL_SLUG || 'your-repl'}.${process.env.REPL_OWNER || 'your-username'}.repl.co`;

    const verificationUrl = `${domainUrl}/api/auth/verify-email/${verificationToken}`;

    const emailContent = this.getEmailTemplate('welcome', {
      fullName,
      verificationUrl
    });

    const mailOptions = {
      from: `"Alpha Security Bureau" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎉 Welcome to Alpha Security Bureau - Verify Your Email",
      html: emailContent,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email credentials not configured, skipping email send");
      return;
    }

    const domainUrl = process.env.NODE_ENV === 'production' 
      ? `https://${process.env.REPL_SLUG || 'your-repl'}.${process.env.REPL_OWNER || 'your-username'}.repl.co`
      : `https://${process.env.REPL_SLUG || 'your-repl'}.${process.env.REPL_OWNER || 'your-username'}.repl.co`;

    const resetUrl = `${domainUrl}/reset-password?token=${resetToken}`;

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Alpha Security Bureau</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #dc2626 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 32px; font-weight: 700; }
          .header p { margin: 10px 0 0; font-size: 16px; opacity: 0.9; }
          .content { padding: 40px 30px; line-height: 1.6; }
          .content h2 { color: #dc2626; margin-bottom: 20px; font-size: 24px; font-weight: 600; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; text-align: center; margin: 20px 0; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.3); }
          .alert-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; padding: 20px; border-radius: 12px; margin: 20px 0; }
          .alert-box h3 { color: #92400e; margin-bottom: 15px; font-size: 18px; font-weight: 600; }
          .alert-box p { color: #92400e; margin: 10px 0; }
          .footer { background: #1e3a8a; color: white; padding: 30px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛡️ Alpha Security Bureau</h1>
            <p>Password Reset Request</p>
          </div>

          <div class="content">
            <h2>🔐 Reset Your Password</h2>

            <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="cta-button">
                🔑 Reset Password
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link: ${resetUrl}</p>

            <div class="alert-box">
              <h3>⚠️ Security Notice</h3>
              <p><strong>This reset link will expire in 1 hour</strong> for your security. If you need another reset link, please visit our website again.</p>
            </div>

            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>The Alpha Security Bureau Team</strong>
            </p>
          </div>

          <div class="footer">
            <p>Questions? Contact us at (555) 123-4567 or security@alphasecurity.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Alpha Security Bureau" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Password Reset - Alpha Security Bureau",
      html: emailContent,
    };

    await this.transporter.sendMail(mailOptions);
  }

  // New method for bulk email sending
  async sendBulkEmail(template: string, recipients: string[], customData?: any) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email credentials not configured, skipping bulk email send");
      return;
    }

    const promises = recipients.map(async (email) => {
      const emailContent = this.getEmailTemplate(template, { 
        email, 
        fullName: email.split('@')[0],
        ...customData 
      });

      const mailOptions = {
        from: `"Alpha Security Bureau" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: this.getSubjectForTemplate(template),
        html: emailContent,
      };

      return this.transporter.sendMail(mailOptions);
    });

    await Promise.all(promises);
  }

  private getSubjectForTemplate(template: string): string {
    switch (template) {
      case 'confirmation': return "🛡️ Appointment Confirmed - Alpha Security Bureau";
      case 'reminder': return "🔔 Reminder: Your Security Audit is Tomorrow!";
      case 'welcome': return "🎉 Welcome to Alpha Security Bureau";
      case 'docusign': return "📝 Please Sign Your Service Agreement";
      default: return "Alpha Security Bureau - Important Update";
    }
  }

  // Marketing email templates
  async sendMarketingEmail(type: 'newsletter' | 'promotion' | 'update', recipients: string[], data: any) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email credentials not configured, skipping marketing email send");
      return;
    }

    let subject = "";
    let template = "";

    switch (type) {
      case 'newsletter':
        subject = "🛡️ Alpha Security Bureau Monthly Newsletter";
        template = "newsletter";
        break;
      case 'promotion':
        subject = "🎉 Special Offer - Save on Your Security Audit!";
        template = "promotion";
        break;
      case 'update':
        subject = "📢 Important Security Updates from Alpha Security Bureau";
        template = "update";
        break;
    }

    await this.sendBulkEmail(template, recipients, data);
  }
}

export const emailService = new EmailService();

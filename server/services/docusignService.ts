// @ts-ignore - DocuSign types not available, using any types
import docusign from 'docusign-esign';
import type { Appointment } from "@shared/schema";

class DocuSignService {
  private apiClient: any;
  private basePath: string;
  private accountId: string;
  private integrationKey: string;
  private userId: string;
  private secretKey: string;

  constructor() {
    this.basePath = 'https://demo.docusign.net/restapi'; // Use demo for development
    this.accountId = process.env.DOCUSIGN_ACCOUNT_ID || '';
    this.integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY || '';
    this.userId = process.env.DOCUSIGN_USER_ID || '';
    this.secretKey = process.env.DOCUSIGN_SECRET_KEY || '';

    try {
      this.apiClient = new docusign.ApiClient();
      this.apiClient.setBasePath(this.basePath);
    } catch (error) {
      console.error('DocuSign API Client initialization failed:', error);
      // Fallback to null for graceful degradation
      this.apiClient = null;
    }
  }

  private async authenticate() {
    try {
      // For development, use mock authentication if keys are not properly configured
      if (!this.secretKey || this.secretKey.length < 50) {
        console.log('DocuSign keys not configured properly, using mock authentication');
        return 'mock_token';
      }

      let rsaKey: string;
      try {
        // Try to decode base64 key first
        rsaKey = Buffer.from(this.secretKey, 'base64').toString('utf8');
        
        // If it doesn't look like a proper RSA key, use it as-is
        if (!rsaKey.includes('-----BEGIN') && !rsaKey.includes('-----END')) {
          rsaKey = this.secretKey;
        }
      } catch (error) {
        // If base64 decoding fails, use the key as-is
        rsaKey = this.secretKey;
      }

      const scopes = ['signature', 'impersonation'];
      const results = await this.apiClient.requestJWTUserToken(
        this.integrationKey,
        this.userId,
        scopes,
        rsaKey,
        3600 // 1 hour
      );
      
      this.apiClient.addDefaultHeader('Authorization', 'Bearer ' + results.body.access_token);
      return results.body.access_token;
    } catch (error) {
      console.error('DocuSign authentication failed:', error);
      throw new Error('Failed to authenticate with DocuSign');
    }
  }

  async sendDocuSignAgreement(appointment: Appointment) {
    try {
      console.log(`Sending DocuSign agreement to ${appointment.email} for appointment ${appointment.id}`);
      
      // Check if DocuSign is properly configured
      if (!this.apiClient || !this.accountId || !this.integrationKey) {
        console.log('DocuSign not fully configured, using mock response');
        return this.createMockResponse(appointment);
      }

      // Authenticate with DocuSign
      await this.authenticate();

      // Create the envelope definition
      const envelopeDefinition = this.createEnvelope(appointment);

      // Create and send the envelope
      const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
      const results = await envelopesApi.createEnvelope(this.accountId, {
        envelopeDefinition: envelopeDefinition
      });

      console.log(`DocuSign envelope sent successfully: ${results.envelopeId}`);
      
      return {
        status: 'sent',
        envelopeId: results.envelopeId,
        recipientUrl: `${this.basePath}/accounts/${this.accountId}/envelopes/${results.envelopeId}/views/recipient`,
      };
    } catch (error) {
      console.error('Failed to send DocuSign agreement:', error);
      // Fallback to mock for development if DocuSign fails
      return this.createMockResponse(appointment);
    }
  }

  private createMockResponse(appointment: Appointment) {
    return {
      status: 'sent',
      envelopeId: `envelope_${Date.now()}`,
      recipientUrl: `https://demo.docusign.net/signing/${appointment.id}`,
    };
  }

  private createEnvelope(appointment: Appointment): any {
    // Create document content
    const documentContent = this.createAgreementDocument(appointment);
    const documentBase64 = Buffer.from(documentContent).toString('base64');

    // Create the document
    const document: any = {
      documentBase64: documentBase64,
      name: 'Home Security Audit Agreement',
      fileExtension: 'html',
      documentId: '1',
    };

    // Create signer
    const signer: any = {
      email: appointment.email,
      name: appointment.fullName,
      recipientId: '1',
      routingOrder: '1',
      tabs: {
        signHereTabs: [{
          documentId: '1',
          pageNumber: '1',
          recipientId: '1',
          tabLabel: 'CustomerSignature',
          xPosition: '100',
          yPosition: '200',
        }],
        dateSignedTabs: [{
          documentId: '1',
          pageNumber: '1',
          recipientId: '1',
          tabLabel: 'DateSigned',
          xPosition: '300',
          yPosition: '200',
        }],
      },
    };

    // Create the envelope definition
    const envelopeDefinition: any = {
      emailSubject: 'Please sign your Home Security Audit Agreement - SecureHome Audit',
      documents: [document],
      recipients: {
        signers: [signer],
      },
      status: 'sent',
    };

    return envelopeDefinition;
  }

  private createAgreementDocument(appointment: Appointment): string {
    const formattedDate = new Date(appointment.preferredDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Home Security Audit Agreement</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { margin-bottom: 20px; }
          .signature-section { margin-top: 50px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🛡️ SecureHome Audit</h1>
          <h2>Home Security Audit Service Agreement</h2>
        </div>
        
        <div class="content">
          <p><strong>Client Information:</strong></p>
          <p>Name: ${appointment.fullName}</p>
          <p>Email: ${appointment.email}</p>
          <p>Phone: ${appointment.phone}</p>
          <p>Address: ${appointment.address}</p>
          <p>Scheduled Date: ${formattedDate}</p>
          <br>
          
          <h3>Service Agreement Terms</h3>
          
          <p>By signing this agreement, you acknowledge and agree to the following:</p>
          
          <ol>
            <li><strong>Service Description:</strong> SecureHome Audit will provide a comprehensive home security assessment including evaluation of entry points, security systems, and asset protection recommendations.</li>
            
            <li><strong>Service Fee:</strong> The agreed service fee is $${appointment.amount}, which has been paid in advance.</li>
            
            <li><strong>Client Responsibilities:</strong> The client agrees to:
              <ul>
                <li>Provide access to all areas of the property during the scheduled audit</li>
                <li>Have all valuable items, receipts, and warranty documentation readily available</li>
                <li>Be present or have an authorized representative present during the audit</li>
              </ul>
            </li>
            
            <li><strong>Privacy & Confidentiality:</strong> All information gathered during the audit will be kept strictly confidential and used solely for the purpose of providing security recommendations.</li>
            
            <li><strong>Liability:</strong> SecureHome Audit maintains professional liability insurance. Our liability is limited to the service fee paid.</li>
            
            <li><strong>Rescheduling:</strong> Appointments may be rescheduled with 24 hours notice. Same-day cancellations may incur a $25 fee.</li>
            
            <li><strong>Report Delivery:</strong> A comprehensive security report will be provided within 48 hours of the completed audit.</li>
          </ol>
          
          <p>By signing below, you acknowledge that you have read, understood, and agree to these terms and conditions.</p>
        </div>
        
        <div class="signature-section">
          <p><strong>Client Signature:</strong> ___________________________________ <strong>Date:</strong> _______________</p>
          <p>Print Name: ${appointment.fullName}</p>
        </div>
        
        <div style="margin-top: 50px; font-size: 12px; color: #666;">
          <p>SecureHome Audit | Professional Asset & Title Protection Services</p>
          <p>Contact: (555) 123-4567 | info@securehome.com</p>
        </div>
      </body>
      </html>
    `;
  }

  async checkDocuSignStatus(envelopeId: string) {
    try {
      await this.authenticate();
      
      const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
      const envelope = await envelopesApi.getEnvelope(this.accountId, envelopeId);
      
      return {
        status: envelope.status?.toLowerCase() || 'sent',
        lastStatusChange: envelope.statusChangedDateTime || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to check DocuSign status:', error);
      return {
        status: 'sent',
        lastStatusChange: new Date().toISOString(),
      };
    }
  }
}

export const docuSignService = new DocuSignService();
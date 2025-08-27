import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { db } from '../db';
import { customers, customerSessions } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import type { Customer, InsertCustomer, CustomerLogin } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 12;
const SESSION_EXPIRY_DAYS = 30;

export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  static generateJWT(customerId: string): string {
    return jwt.sign({ customerId }, JWT_SECRET, { expiresIn: '30d' });
  }

  // Verify JWT token
  static verifyJWT(token: string): { customerId: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { customerId: string };
    } catch {
      return null;
    }
  }

  // Generate random token for email verification and password reset
  static generateRandomToken(): string {
    return randomUUID().replace(/-/g, '');
  }

  // Register new customer
  static async registerCustomer(customerData: InsertCustomer): Promise<{ customer: Customer; token: string }> {
    const hashedPassword = await this.hashPassword(customerData.password);
    const emailVerificationToken = this.generateRandomToken();

    const [customer] = await db.insert(customers).values({
      ...customerData,
      password: hashedPassword,
      emailVerificationToken,
      isEmailVerified: false,
    }).returning();

    const token = this.generateJWT(customer.id);
    await this.createSession(customer.id, token);

    return { customer, token };
  }

  // Login customer
  static async loginCustomer(loginData: CustomerLogin): Promise<{ customer: Customer; token: string } | null> {
    const [customer] = await db.select().from(customers).where(
      and(
        eq(customers.email, loginData.email),
        eq(customers.isActive, true)
      )
    );

    if (!customer || !await this.verifyPassword(loginData.password, customer.password)) {
      return null;
    }

    // Update last login
    await db.update(customers)
      .set({ lastLoginAt: new Date() })
      .where(eq(customers.id, customer.id));

    const token = this.generateJWT(customer.id);
    await this.createSession(customer.id, token);

    return { customer, token };
  }

  // Create session
  static async createSession(customerId: string, token: string, userAgent?: string, ipAddress?: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

    await db.insert(customerSessions).values({
      customerId,
      token,
      expiresAt,
      userAgent,
      ipAddress,
    });
  }

  // Verify session
  static async verifySession(token: string): Promise<Customer | null> {
    const [session] = await db.select({
      customer: customers,
      session: customerSessions,
    })
    .from(customerSessions)
    .innerJoin(customers, eq(customers.id, customerSessions.customerId))
    .where(
      and(
        eq(customerSessions.token, token),
        gt(customerSessions.expiresAt, new Date()),
        eq(customers.isActive, true)
      )
    );

    return session?.customer || null;
  }

  // Logout (invalidate session)
  static async logout(token: string): Promise<void> {
    await db.delete(customerSessions).where(eq(customerSessions.token, token));
  }

  // Verify email
  static async verifyEmail(token: string): Promise<boolean> {
    const [customer] = await db.select().from(customers).where(
      eq(customers.emailVerificationToken, token)
    );

    if (!customer) return false;

    await db.update(customers)
      .set({ 
        isEmailVerified: true, 
        emailVerificationToken: null 
      })
      .where(eq(customers.id, customer.id));

    return true;
  }

  // Generate password reset token
  static async generatePasswordResetToken(email: string): Promise<string | null> {
    const [customer] = await db.select().from(customers).where(
      eq(customers.email, email)
    );

    if (!customer) return null;

    const resetToken = this.generateRandomToken();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // 1 hour expiry

    await db.update(customers)
      .set({
        passwordResetToken: resetToken,
        passwordResetTokenExpiry: tokenExpiry,
      })
      .where(eq(customers.id, customer.id));

    return resetToken;
  }

  // Reset password
  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const [customer] = await db.select().from(customers).where(
      and(
        eq(customers.passwordResetToken, token),
        gt(customers.passwordResetTokenExpiry, new Date())
      )
    );

    if (!customer) return false;

    const hashedPassword = await this.hashPassword(newPassword);

    await db.update(customers)
      .set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
      })
      .where(eq(customers.id, customer.id));

    // Invalidate all sessions for this customer
    await db.delete(customerSessions).where(eq(customerSessions.customerId, customer.id));

    return true;
  }

  // Get customer by ID
  static async getCustomerById(customerId: string): Promise<Customer | null> {
    const [customer] = await db.select().from(customers).where(
      and(
        eq(customers.id, customerId),
        eq(customers.isActive, true)
      )
    );

    return customer || null;
  }

  // Clean expired sessions
  static async cleanExpiredSessions(): Promise<void> {
    await db.delete(customerSessions).where(
      gt(customerSessions.expiresAt, new Date())
    );
  }
}
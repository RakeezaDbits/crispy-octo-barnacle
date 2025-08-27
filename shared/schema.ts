import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, boolean, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
});

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  isEmailVerified: boolean("is_email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetTokenExpiry: timestamp("password_reset_token_expiry"),
  lastLoginAt: timestamp("last_login_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customerSessions = pgTable("customer_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id, { onDelete: 'cascade' }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id, { onDelete: 'cascade' }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  preferredDate: text("preferred_date").notNull(),
  preferredTime: text("preferred_time"),
  status: text("status").notNull().default("pending"), // pending, confirmed, in_progress, completed, cancelled
  paymentId: text("payment_id"),
  paymentStatus: text("payment_status").default("pending"), // pending, completed, failed
  amount: decimal("amount", { precision: 10, scale: 2 }).default("225.00"),
  titleProtection: boolean("title_protection").default(false),
  docusignStatus: text("docusign_status").default("not_sent"), // not_sent, sent, signed
  servicePackageId: integer("service_package_id"),
  officerId: integer("officer_id"),
  scheduledDateTime: timestamp("scheduled_date_time"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const officers = pgTable("officers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  badgeNumber: text("badge_number").unique().notNull(),
  specializations: text("specializations").array(),
  status: text("status").notNull().default("available"), // available, busy, offline
  location: text("location"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const servicePackages = pgTable("service_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  features: text("features").array(),
  duration: integer("duration").notNull(), // in minutes
  isActive: boolean("is_active").notNull().default(true),
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  email: true,
  password: true,
  fullName: true,
  phone: true,
}).extend({
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().optional(),
});

export const customerLoginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const passwordResetSchema = z.object({
  email: z.string().email("Valid email is required"),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  customerId: true,
  createdAt: true,
  updatedAt: true,
  paymentId: true,
  paymentStatus: true,
  status: true,
  docusignStatus: true,
}).extend({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(10, "Complete address is required"),
  preferredDate: z.string().min(1, "Preferred date is required"),
});

export const insertOfficerSchema = createInsertSchema(officers).omit({
  id: true,
  createdAt: true,
});

export const insertServicePackageSchema = createInsertSchema(servicePackages).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type CustomerLogin = z.infer<typeof customerLoginSchema>;
export type PasswordReset = z.infer<typeof passwordResetSchema>;
export type PasswordResetConfirm = z.infer<typeof passwordResetConfirmSchema>;
export type CustomerSession = typeof customerSessions.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type Officer = typeof officers.$inferSelect;
export type InsertOfficer = z.infer<typeof insertOfficerSchema>;
export type ServicePackage = typeof servicePackages.$inferSelect;
export type InsertServicePackage = z.infer<typeof insertServicePackageSchema>;

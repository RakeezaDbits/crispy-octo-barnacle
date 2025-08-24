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

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  preferredDate: text("preferred_date").notNull(),
  preferredTime: text("preferred_time"),
  status: text("status").notNull().default("pending"), // pending, confirmed, in_progress, completed, cancelled
  paymentId: text("payment_id"),
  paymentStatus: text("payment_status").default("pending"), // pending, completed, failed
  amount: decimal("amount", { precision: 10, scale: 2 }).default("50.00"),
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

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
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
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type Officer = typeof officers.$inferSelect;
export type InsertOfficer = z.infer<typeof insertOfficerSchema>;
export type ServicePackage = typeof servicePackages.$inferSelect;
export type InsertServicePackage = z.infer<typeof insertServicePackageSchema>;

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  preferredDate: text("preferred_date").notNull(),
  preferredTime: text("preferred_time"),
  status: text("status").notNull().default("pending"), // pending, confirmed, completed, cancelled
  paymentId: text("payment_id"),
  paymentStatus: text("payment_status").default("pending"), // pending, completed, failed
  amount: decimal("amount", { precision: 10, scale: 2 }).default("50.00"),
  titleProtection: boolean("title_protection").default(false),
  docusignStatus: text("docusign_status").default("not_sent"), // not_sent, sent, signed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

import { appointments, users, servicePackages, type User, type InsertUser, type Appointment, type InsertAppointment, type ServicePackage, type InsertServicePackage } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined>;
  getAllAppointments(): Promise<Appointment[]>;
  getAppointmentsByEmail(email: string): Promise<Appointment[]>;
  getAppointmentsByCustomerId(customerId: string): Promise<Appointment[]>;
  getServicePackages(): Promise<ServicePackage[]>;
  createServicePackage(servicePackage: InsertServicePackage): Promise<ServicePackage>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db
      .insert(appointments)
      .values(appointment)
      .returning();
    return newAppointment;
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || undefined;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment || undefined;
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments).orderBy(desc(appointments.createdAt));
  }

  async getAppointmentsByEmail(email: string): Promise<Appointment[]> {
    return await db.select()
      .from(appointments)
      .where(eq(appointments.email, email))
      .orderBy(desc(appointments.createdAt));
  }

  async getAppointmentsByCustomerId(customerId: string): Promise<Appointment[]> {
    return await db.select()
      .from(appointments)
      .where(eq(appointments.customerId, customerId))
      .orderBy(desc(appointments.createdAt));
  }

  async getServicePackages(): Promise<ServicePackage[]> {
    return await db.select()
      .from(servicePackages)
      .where(eq(servicePackages.isActive, true))
      .orderBy(servicePackages.priority);
  }

  async createServicePackage(servicePackage: InsertServicePackage): Promise<ServicePackage> {
    const [newPackage] = await db
      .insert(servicePackages)
      .values(servicePackage)
      .returning();
    return newPackage;
  }
}

export const storage = new DatabaseStorage();

import { z } from "zod";

// User/Auth Schemas
export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['agent', 'admin']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Client Schemas
export const createClientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  address: z.string().min(1, "Address is required"),
  lat: z.number().min(-90).max(90, "Invalid latitude"),
  lng: z.number().min(-180).max(180, "Invalid longitude"),
  region: z.string().min(1, "Region is required"),
  hasComplaint: z.boolean().optional(),
  complaintNote: z.string().optional(),
  requestedVisit: z.boolean().optional(),
});

export const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  region: z.string().min(1).optional(),
  hasComplaint: z.boolean().optional(),
  complaintNote: z.string().optional(),
  requestedVisit: z.boolean().optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

// Visit Schemas
export const checkInSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
});

export const checkOutSchema = z.object({
  visitId: z.string().min(1, "Visit ID is required"),
});

export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;

// Depot Schemas
export const createDepotSchema = z.object({
  name: z.string().min(1, "Depot name is required"),
  lat: z.number().min(-90).max(90, "Invalid latitude"),
  lng: z.number().min(-180).max(180, "Invalid longitude"),
  inspection: z.object({
    done: z.boolean().optional(),
    hsFile: z.boolean().optional(),
    housekeeping: z.number().min(1).max(5).optional(),
    hazLicense: z.boolean().optional(),
    stockCounted: z.boolean().optional(),
    notes: z.string().optional(),
  }).optional(),
});

export const updateDepotSchema = z.object({
  name: z.string().min(1).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  inspection: z.object({
    done: z.boolean().optional(),
    hsFile: z.boolean().optional(),
    housekeeping: z.number().min(1).max(5).optional(),
    hazLicense: z.boolean().optional(),
    stockCounted: z.boolean().optional(),
    notes: z.string().optional(),
  }).optional(),
});

export type CreateDepotInput = z.infer<typeof createDepotSchema>;
export type UpdateDepotInput = z.infer<typeof updateDepotSchema>;

// Missed Order Schemas
export const createMissedOrderSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  product: z.string().min(1, "Product name is required"),
  reason: z.string().min(1, "Reason is required"),
  date: z.string().optional(),
});

export type CreateMissedOrderInput = z.infer<typeof createMissedOrderSchema>;

// Training Log Schemas
export const createTrainingLogSchema = z.object({
  agentId: z.string().min(1, "Agent ID is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().optional(),
});

export type CreateTrainingLogInput = z.infer<typeof createTrainingLogSchema>;

// Product Complaint Schemas
export const createProductComplaintSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  product: z.string().min(1, "Product name is required"),
  comment: z.string().min(1, "Comment is required"),
  date: z.string().optional(),
});

export const updateProductComplaintSchema = z.object({
  product: z.string().min(1).optional(),
  comment: z.string().min(1).optional(),
});

export type CreateProductComplaintInput = z.infer<typeof createProductComplaintSchema>;
export type UpdateProductComplaintInput = z.infer<typeof updateProductComplaintSchema>;

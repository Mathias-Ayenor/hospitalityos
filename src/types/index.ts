/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  HOTEL_OWNER = "hotel_owner",
  MANAGER = "manager",
  RECEPTIONIST = "receptionist",
  ACCOUNTANT = "accountant",
  HOUSEKEEPING = "housekeeping",
  RESTAURANT = "restaurant",
  MAINTENANCE = "maintenance",
  SECURITY = "security",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hotel_id: string;
  branch_id: string | null;
  created_at: string;
}

export interface Hotel {
  id: string;
  name: string;
  tagline?: string;
  logo_url?: string;
  address: string;
  phone: string;
  created_at: string;
}

export interface Branch {
  id: string;
  hotel_id: string;
  name: string;
  address: string;
  phone: string;
  created_at: string;
}

export enum RoomStatus {
  AVAILABLE = "available",
  OCCUPIED = "occupied",
  DIRTY = "dirty",
  MAINTENANCE = "maintenance",
}

export enum RoomType {
  SINGLE = "single",
  DOUBLE = "double",
  SUITE = "suite",
  DELUXE = "deluxe",
  FAMILY = "family",
}

export interface Room {
  id: string;
  hotel_id: string;
  branch_id: string;
  room_number: string;
  type: RoomType;
  status: RoomStatus;
  price_per_night: number; // Will represent numeric money
  amenities: string[];
  created_at: string;
  updated_at: string;
}

export interface Guest {
  id: string;
  hotel_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  document_url?: string;
  created_at: string;
}

export enum BookingStatus {
  CONFIRMED = "confirmed",
  CHECKED_IN = "checked_in",
  CHECKED_OUT = "checked_out",
  CANCELLED = "cancelled",
}

export interface Booking {
  id: string;
  hotel_id: string;
  branch_id: string;
  guest_id: string;
  room_id: string;
  check_in: string; // ISO date string (YYYY-MM-DD)
  check_out: string; // ISO date string (YYYY-MM-DD)
  total_amount: number;
  status: BookingStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export interface Payment {
  id: string;
  hotel_id: string;
  booking_id: string;
  amount: number;
  payment_method: string; // e.g., "Paystack", "Cash", "Card"
  status: PaymentStatus;
  created_at: string;
}

export enum MaintenancePriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum MaintenanceStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
}

export interface MaintenanceRequest {
  id: string;
  hotel_id: string;
  branch_id: string;
  room_id: string;
  issue: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  description: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

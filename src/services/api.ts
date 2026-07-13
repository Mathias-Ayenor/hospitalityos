/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Hotel, Branch, Room, Guest, Booking, Payment, MaintenanceRequest, RoomStatus } from "../types";

// State wrapper for current active tenant
let activeHotelId = "hotel-1"; // Default to Grand Horizon Resort

export function getActiveHotelId(): string {
  return activeHotelId;
}

export function setActiveHotelId(id: string) {
  activeHotelId = id;
}

// Generate headers for RLS tenant isolation
function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-hotel-id": activeHotelId,
  };
}

export const HospitalityAPI = {
  // Hotels & Branches
  async getHotels(): Promise<Hotel[]> {
    const res = await fetch("/api/hotels");
    if (!res.ok) throw new Error("Failed to fetch hotels");
    return res.json();
  },

  async getBranches(): Promise<Branch[]> {
    const res = await fetch("/api/branches", { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch branches");
    return res.json();
  },

  // Rooms
  async getRooms(): Promise<Room[]> {
    const res = await fetch("/api/rooms", { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch rooms");
    return res.json();
  },

  async updateRoomStatus(roomId: string, status: RoomStatus): Promise<Room> {
    const res = await fetch("/api/rooms/status", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ room_id: roomId, status }),
    });
    if (!res.ok) throw new Error("Failed to update room status");
    return res.json();
  },

  // Guests
  async getGuests(): Promise<Guest[]> {
    const res = await fetch("/api/guests", { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch guests");
    return res.json();
  },

  async createGuest(guest: Omit<Guest, "id" | "hotel_id" | "created_at">): Promise<Guest> {
    const res = await fetch("/api/guests", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(guest),
    });
    if (!res.ok) throw new Error("Failed to create guest");
    return res.json();
  },

  // Bookings
  async getBookings(): Promise<Booking[]> {
    const res = await fetch("/api/bookings", { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch bookings");
    return res.json();
  },

  async createBooking(booking: {
    branch_id: string;
    guest_id: string;
    room_id: string;
    check_in: string;
    check_out: string;
    total_amount: number;
    notes?: string;
  }): Promise<{ booking: Booking; payment: Payment }> {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(booking),
    });
    if (!res.ok) throw new Error("Failed to create booking");
    return res.json();
  },

  async updateBookingStatus(bookingId: string, status: string): Promise<Booking> {
    const res = await fetch(`/api/bookings/${bookingId}/status`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update booking status");
    return res.json();
  },

  // Payments
  async getPayments(): Promise<Payment[]> {
    const res = await fetch("/api/payments", { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch payments");
    return res.json();
  },

  async completePayment(paymentId: string): Promise<Payment> {
    const res = await fetch(`/api/payments/${paymentId}/complete`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to finalize payment");
    return res.json();
  },

  // Maintenance
  async getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    const res = await fetch("/api/maintenance", { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch maintenance requests");
    return res.json();
  },

  async createMaintenanceRequest(req: {
    room_id: string;
    issue: string;
    priority: string;
    description?: string;
  }): Promise<MaintenanceRequest> {
    const res = await fetch("/api/maintenance", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error("Failed to file maintenance request");
    return res.json();
  },

  async resolveMaintenanceRequest(requestId: string): Promise<MaintenanceRequest> {
    const res = await fetch(`/api/maintenance/${requestId}/resolve`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to resolve maintenance request");
    return res.json();
  },

  // AI Co-pilot
  async askCopilot(prompt: string, context: "reception" | "finance" | "operations" | "executive", state: any): Promise<string> {
    const res = await fetch("/api/ai/copilot", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ prompt, context, state }),
    });
    if (!res.ok) throw new Error("AI copilot request failed");
    const data = await res.json();
    return data.text;
  }
};

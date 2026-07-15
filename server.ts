/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import onboardingRouter from "./server/routes/onboarding";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({
  path: ".env.local",
  override: true,
});
console.log("Supabase URL loaded:", !!process.env.VITE_SUPABASE_URL);
console.log(
  "Service Role loaded:",
  !!process.env.SUPABASE_SERVICE_ROLE_KEY
);
// Initialize Express
const app = express();
app.use(express.json());
app.use("/api/onboarding", onboardingRouter);
const PORT = 3000;

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini API:", err);
  }
} else {
  console.warn("GEMINI_API_KEY environment variable is missing. Running in AI simulation mode.");
}

// Ensure data directory exists for our local file-based persistence
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Core seed data
const DEFAULT_DB = {
  hotels: [
    {
      id: "hotel-1",
      name: "Grand Horizon Resort",
      tagline: "Elegance and luxury by the sea",
      address: "100 Ocean Front Walk, Miami, FL 33139",
      phone: "+1 (305) 555-0100",
      logo_url: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=120&q=80",
      created_at: new Date("2026-01-01").toISOString()
    },
    {
      id: "hotel-2",
      name: "Urban Green Boutique",
      tagline: "Sustainable design in the heart of the city",
      address: "456 Eco Avenue, Austin, TX 78701",
      phone: "+1 (512) 555-0200",
      logo_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=120&q=80",
      created_at: new Date("2026-02-15").toISOString()
    }
  ],
  branches: [
    {
      id: "branch-1-1",
      hotel_id: "hotel-1",
      name: "Miami South Beach",
      address: "100 Ocean Front Walk, Miami, FL 33139",
      phone: "+1 (305) 555-0101",
      created_at: new Date("2026-01-01").toISOString()
    },
    {
      id: "branch-1-2",
      hotel_id: "hotel-1",
      name: "Key West Marina",
      address: "500 Marina Boulevard, Key West, FL 33040",
      phone: "+1 (305) 555-0102",
      created_at: new Date("2026-03-10").toISOString()
    },
    {
      id: "branch-2-1",
      hotel_id: "hotel-2",
      name: "Downtown Austin",
      address: "456 Eco Avenue, Austin, TX 78701",
      phone: "+1 (512) 555-0201",
      created_at: new Date("2026-02-15").toISOString()
    }
  ],
  rooms: [
    // Hotel 1 - South Beach
    { id: "room-101", hotel_id: "hotel-1", branch_id: "branch-1-1", room_number: "101", type: "single", status: "available", price_per_night: 120.00, amenities: ["Wi-Fi", "Mini Bar", "AC", "Smart TV"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "room-102", hotel_id: "hotel-1", branch_id: "branch-1-1", room_number: "102", type: "double", status: "occupied", price_per_night: 180.00, amenities: ["Wi-Fi", "AC", "Balcony", "Smart TV"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "room-103", hotel_id: "hotel-1", branch_id: "branch-1-1", room_number: "103", type: "suite", status: "dirty", price_per_night: 350.00, amenities: ["Ocean View", "Kitchenette", "Jacuzzi", "Wi-Fi"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "room-104", hotel_id: "hotel-1", branch_id: "branch-1-1", room_number: "104", type: "deluxe", status: "available", price_per_night: 220.00, amenities: ["Wi-Fi", "Sea View", "AC", "Espresso Machine"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "room-105", hotel_id: "hotel-1", branch_id: "branch-1-1", room_number: "105", type: "family", status: "maintenance", price_per_night: 260.00, amenities: ["2 Bedrooms", "Kitchen", "Wi-Fi", "AC"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    
    // Hotel 1 - Key West
    { id: "room-201", hotel_id: "hotel-1", branch_id: "branch-1-2", room_number: "201", type: "double", status: "available", price_per_night: 195.00, amenities: ["Wi-Fi", "Marina View", "AC"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "room-202", hotel_id: "hotel-1", branch_id: "branch-1-2", room_number: "202", type: "suite", status: "occupied", price_per_night: 400.00, amenities: ["Private Dock", "Jacuzzi", "Wi-Fi", "Espresso Machine"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    
    // Hotel 2 - Downtown Austin
    { id: "room-301", hotel_id: "hotel-2", branch_id: "branch-2-1", room_number: "301", type: "single", status: "available", price_per_night: 95.00, amenities: ["High-speed Wi-Fi", "Solar AC", "Eco Linens"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "room-302", hotel_id: "hotel-2", branch_id: "branch-2-1", room_number: "302", type: "double", status: "occupied", price_per_night: 140.00, amenities: ["High-speed Wi-Fi", "City View", "Organic Soap"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "room-303", hotel_id: "hotel-2", branch_id: "branch-2-1", room_number: "303", type: "suite", status: "dirty", price_per_night: 250.00, amenities: ["Greenhouse Balcony", "Smart Control Panel", "Eco Tub"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  guests: [
    { id: "guest-1", hotel_id: "hotel-1", first_name: "Alice", last_name: "Johnson", email: "alice@example.com", phone: "+1 (555) 019-2834", created_at: new Date().toISOString() },
    { id: "guest-2", hotel_id: "hotel-1", first_name: "Bob", last_name: "Smith", email: "bob.smith@example.com", phone: "+1 (555) 014-9988", created_at: new Date().toISOString() },
    { id: "guest-3", hotel_id: "hotel-2", first_name: "Diana", last_name: "Prince", email: "diana@themyscira.io", phone: "+1 (555) 012-3456", created_at: new Date().toISOString() }
  ],
  bookings: [
    {
      id: "booking-1",
      hotel_id: "hotel-1",
      branch_id: "branch-1-1",
      guest_id: "guest-1",
      room_id: "room-102",
      check_in: "2026-07-10",
      check_out: "2026-07-15",
      total_amount: 900.00,
      status: "checked_in",
      notes: "Requires late checkout at 1 PM if possible.",
      created_at: new Date("2026-06-20").toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "booking-2",
      hotel_id: "hotel-2",
      branch_id: "branch-2-1",
      guest_id: "guest-3",
      room_id: "room-302",
      check_in: "2026-07-11",
      check_out: "2026-07-14",
      total_amount: 420.00,
      status: "checked_in",
      notes: "Prefers soft eco pillows.",
      created_at: new Date("2026-06-25").toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  payments: [
    { id: "payment-1", hotel_id: "hotel-1", booking_id: "booking-1", amount: 900.00, payment_method: "Paystack", status: "completed", created_at: new Date("2026-07-10T14:22:00Z").toISOString() },
    { id: "payment-2", hotel_id: "hotel-2", booking_id: "booking-2", amount: 200.00, payment_method: "Card", status: "completed", created_at: new Date("2026-07-11T16:05:00Z").toISOString() },
    { id: "payment-3", hotel_id: "hotel-2", booking_id: "booking-2", amount: 220.00, payment_method: "Cash", status: "pending", created_at: new Date("2026-07-11T16:05:00Z").toISOString() }
  ],
  maintenance: [
    {
      id: "maint-1",
      hotel_id: "hotel-1",
      branch_id: "branch-1-1",
      room_id: "room-105",
      issue: "AC fan making heavy rattling noise",
      priority: "high",
      status: "pending",
      description: "Housekeeping reported high-frequency mechanical vibration from unit during check-out prep.",
      created_at: new Date("2026-07-11").toISOString(),
      updated_at: new Date("2026-07-11").toISOString()
    }
  ]
};

// Database state management
let db = { ...DEFAULT_DB };

function readDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(content);
    } else {
      writeDB(DEFAULT_DB);
    }
  } catch (err) {
    console.error("Error reading database file, using fallback:", err);
    db = DEFAULT_DB;
  }
}

function writeDB(data: typeof DEFAULT_DB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// Read database initially
readDB();

// RLS simulation helper (filters queries by hotel_id, enforcing strict multi-tenancy)
function enforceRLS(req: express.Request, res: express.Response, next: express.NextFunction) {
  const hotelId = req.headers["x-hotel-id"] as string;
  if (!hotelId) {
    return res.status(401).json({ error: "Unauthorized: Missing x-hotel-id tenant header" });
  }
  req.hotel_id = hotelId;
  next();
}

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      hotel_id?: string;
    }
  }
}

// API: Hotels & Branches
app.get("/api/hotels", (req, res) => {
  res.json(db.hotels);
});

// API: Supabase Service Role Admin Placeholder Route (Server-Side Only)
// Demonstrates safe handling of SUPABASE_SERVICE_ROLE_KEY using placeholders on the backend.
app.post("/api/admin/supabase-sync", enforceRLS, (req, res) => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey || serviceRoleKey.includes("placeholder")) {
    return res.status(200).json({
      success: true,
      message: "Supabase background synchronization initialized using placeholder Service Role key.",
      mode: "development_sandbox",
    });
  }
  
  // Real service role integration placeholder:
  // const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, serviceRoleKey);
  res.json({
    success: true,
    message: "Admin synchronization successfully processed with server-side credentials.",
    mode: "secure_server_production"
  });
});

app.get("/api/branches", (req, res) => {
  const hotelId = req.headers["x-hotel-id"] as string;
  if (hotelId) {
    res.json(db.branches.filter(b => b.hotel_id === hotelId));
  } else {
    res.json(db.branches);
  }
});

// API: Rooms (With Tenant RLS Isolation)
app.get("/api/rooms", enforceRLS, (req, res) => {
  const filtered = db.rooms.filter(r => r.hotel_id === req.hotel_id);
  res.json(filtered);
});

app.post("/api/rooms/status", enforceRLS, (req, res) => {
  const { room_id, status } = req.body;
  const room = db.rooms.find(r => r.id === room_id && r.hotel_id === req.hotel_id);
  if (!room) {
    return res.status(404).json({ error: "Room not found or unauthorized" });
  }
  room.status = status;
  room.updated_at = new Date().toISOString();
  writeDB(db);
  res.json(room);
});

// API: Guests (With Tenant RLS Isolation)
app.get("/api/guests", enforceRLS, (req, res) => {
  const filtered = db.guests.filter(g => g.hotel_id === req.hotel_id);
  res.json(filtered);
});

app.post("/api/guests", enforceRLS, (req, res) => {
  const { first_name, last_name, email, phone } = req.body;
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: "Missing required guest fields" });
  }
  const newGuest = {
    id: `guest-${Date.now()}`,
    hotel_id: req.hotel_id!,
    first_name,
    last_name,
    email,
    phone: phone || "",
    created_at: new Date().toISOString()
  };
  db.guests.push(newGuest);
  writeDB(db);
  res.status(201).json(newGuest);
});

// API: Bookings (With Tenant RLS Isolation)
app.get("/api/bookings", enforceRLS, (req, res) => {
  const filtered = db.bookings.filter(b => b.hotel_id === req.hotel_id);
  res.json(filtered);
});

app.post("/api/bookings", enforceRLS, (req, res) => {
  const { branch_id, guest_id, room_id, check_in, check_out, total_amount, notes } = req.body;
  if (!guest_id || !room_id || !check_in || !check_out || !total_amount) {
    return res.status(400).json({ error: "Missing booking criteria" });
  }

  const room = db.rooms.find(r => r.id === room_id && r.hotel_id === req.hotel_id);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  const newBooking = {
    id: `booking-${Date.now()}`,
    hotel_id: req.hotel_id!,
    branch_id: branch_id || room.branch_id,
    guest_id,
    room_id,
    check_in,
    check_out,
    total_amount: Number(total_amount),
    status: "confirmed" as any,
    notes: notes || "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  room.status = "occupied" as any;
  room.updated_at = new Date().toISOString();

  // Auto-generate a pending payment record
  const newPayment = {
    id: `payment-${Date.now()}`,
    hotel_id: req.hotel_id!,
    booking_id: newBooking.id,
    amount: Number(total_amount),
    payment_method: "Card",
    status: "pending" as any,
    created_at: new Date().toISOString()
  };

  db.bookings.push(newBooking);
  db.payments.push(newPayment);
  writeDB(db);

  res.status(201).json({ booking: newBooking, payment: newPayment });
});

// API: Check-in / Check-out
app.post("/api/bookings/:id/status", enforceRLS, (req, res) => {
  const { status } = req.body;
  const booking = db.bookings.find(b => b.id === req.params.id && b.hotel_id === req.hotel_id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  booking.status = status;
  booking.updated_at = new Date().toISOString();

  // Adjust Room status accordingly
  const room = db.rooms.find(r => r.id === booking.room_id);
  if (room) {
    if (status === "checked_in") {
      room.status = "occupied" as any;
    } else if (status === "checked_out") {
      room.status = "dirty" as any; // Sent to Housekeeping immediately
    } else if (status === "cancelled") {
      room.status = "available" as any;
    }
    room.updated_at = new Date().toISOString();
  }

  writeDB(db);
  res.json(booking);
});

// API: Payments (With Tenant RLS Isolation)
app.get("/api/payments", enforceRLS, (req, res) => {
  const filtered = db.payments.filter(p => p.hotel_id === req.hotel_id);
  res.json(filtered);
});

app.post("/api/payments/:id/complete", enforceRLS, (req, res) => {
  const payment = db.payments.find(p => p.id === req.params.id && p.hotel_id === req.hotel_id);
  if (!payment) {
    return res.status(404).json({ error: "Payment not found" });
  }
  payment.status = "completed" as any;
  writeDB(db);
  res.json(payment);
});

// API: Maintenance Requests
app.get("/api/maintenance", enforceRLS, (req, res) => {
  const filtered = db.maintenance.filter(m => m.hotel_id === req.hotel_id);
  res.json(filtered);
});

app.post("/api/maintenance", enforceRLS, (req, res) => {
  const { room_id, issue, priority, description } = req.body;
  if (!room_id || !issue) {
    return res.status(400).json({ error: "Room and issue details required" });
  }

  const room = db.rooms.find(r => r.id === room_id && r.hotel_id === req.hotel_id);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  const newRequest = {
    id: `maint-${Date.now()}`,
    hotel_id: req.hotel_id!,
    branch_id: room.branch_id,
    room_id,
    issue,
    priority: priority || "medium",
    status: "pending" as any,
    description: description || "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  room.status = "maintenance" as any;
  room.updated_at = new Date().toISOString();

  db.maintenance.push(newRequest);
  writeDB(db);

  res.status(201).json(newRequest);
});

app.post("/api/maintenance/:id/resolve", enforceRLS, (req, res) => {
  const reqId = req.params.id;
  const maintenance = db.maintenance.find(m => m.id === reqId && m.hotel_id === req.hotel_id);
  if (!maintenance) {
    return res.status(404).json({ error: "Maintenance request not found" });
  }
  maintenance.status = "resolved" as any;
  maintenance.updated_at = new Date().toISOString();

  // Release Room back to available (or dirty first, but let's release to available)
  const room = db.rooms.find(r => r.id === maintenance.room_id);
  if (room && room.status === "maintenance") {
    room.status = "dirty" as any; // Goes to housekeeping
    room.updated_at = new Date().toISOString();
  }

  writeDB(db);
  res.json(maintenance);
});

// API: server-side Gemini AI Co-pilot Endpoint
app.post("/api/ai/copilot", enforceRLS, async (req, res) => {
  const { prompt, context, state } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  // Active hotel context
  const hotel = db.hotels.find(h => h.id === req.hotel_id);
  const branches = db.branches.filter(b => b.hotel_id === req.hotel_id);

  // Fallback if AI not initialized
  if (!ai) {
    // Generate helpful, simulated SaaS copilot response if GEMINI_API_KEY is not defined
    const simulatedAnswers: Record<string, string> = {
      reception: `[SaaS Copilot Simulation - Configure GEMINI_API_KEY for Real-time AI]
Hello! I can assist you with Reception tasks. Here is a summary based on current data for ${hotel?.name}:
- Total Rooms: ${state?.roomsCount || 0}
- Current Guests: ${state?.guestsCount || 0}
- I recommend drafting a quick email check-in confirmation for new guests or matching them with Rooms 101/104 which are currently Available.`,
      finance: `[SaaS Copilot Simulation - Configure GEMINI_API_KEY for Real-time AI]
Financial analysis for ${hotel?.name}:
- Simulated Revenue Summary: Your Total Revenue is \$${state?.revenue || 0}.
- Outstanding Balance Alerts: Keep an eye on pending payments which total \$${state?.pendingPayments || 0}. 
- Recommendation: Consider high-occupancy weekend surcharges (+10%) to increase RevPAR.`,
      operations: `[SaaS Copilot Simulation - Configure GEMINI_API_KEY for Real-time AI]
Operations Priorities for Housekeeping & Maintenance:
- Clean Rooms: Room 103 and 303 are currently Dirty and should be prioritized before 3 PM check-ins.
- Active Maintenance Issue: ${db.maintenance.filter(m => m.hotel_id === req.hotel_id && m.status !== "resolved").length} unresolved issues require immediate attention.`,
      executive: `[SaaS Copilot Simulation - Configure GEMINI_API_KEY for Real-time AI]
Executive Strategic Insights for ${hotel?.name}:
- Occupancy Rate: ${state?.occupancyRate || 45}%.
- RevPAR Strategy: Improve ADR by adding localized experiential packages (e.g., local tour partnerships).
- Recommendation: Focus digital marketing campaigns towards Austin and Miami beach travelers for summer seasonal boosts.`
    };

    const reply = simulatedAnswers[context] || `[SaaS Copilot Simulation - Configure GEMINI_API_KEY]
Hello! I am your HospitalityOS AI assistant. I am currently running in offline mock mode because your GEMINI_API_KEY is not defined in the project secrets.

To enable real Gemini generative responses, please head over to Settings > Secrets in AI Studio and add GEMINI_API_KEY.`;
    
    return res.json({ text: reply });
  }

  try {
    const formattedState = JSON.stringify(state, null, 2);
    const systemInstructions: Record<string, string> = {
      reception: `You are the RECEPTION AI for HospitalityOS. You assist hotel receptionists and owners.
Hotel Details: ${hotel?.name}, Location: ${hotel?.address}. Branches: ${JSON.stringify(branches)}.
Current Hotel Occupancy & State:
${formattedState}

Provide extremely accurate, professional, and rapid answers to guest questions, draft email check-in templates, recommend available rooms to match guest preferences, and offer helpful reception ideas. Speak like a premium hospitality desk expert. Always remain grounded in the provided hotel data. Keep answers clear and scannable.`,
      
      finance: `You are the FINANCE AI for HospitalityOS. You analyze hospitality revenues, cash flows, and room rates.
Hotel Details: ${hotel?.name}.
Current Hotel Financial State & Transactions:
${formattedState}

Summarize total revenues, pending balances, highlight guests with outstanding bills, and calculate metrics like ADR (Average Daily Rate) or occupancy impacts if requested. Suggest pricing adjustments and yield management strategies (e.g. dynamic weekend rates). Keep responses organized with concise financial bullet points.`,

      operations: `You are the OPERATIONS AI for HospitalityOS. You organize cleaning priorities, maintenance tasks, and guest comfort schedules.
Hotel Details: ${hotel?.name}.
Current Operational State (Rooms, Dirty rooms, Maintenance requests):
${formattedState}

Identify which rooms require immediate cleaning to accommodate upcoming bookings. Prioritize maintenance tickets based on severity (e.g. leak vs lightbulb) and assign virtual urgency scores. Keep answers highly actionable for cleaners and handymen.`,

      executive: `You are the EXECUTIVE AI for HospitalityOS. You provide strategic growth advice, competitive analytics, occupancy predictions, and business insights to the general manager and owners.
Hotel Details: ${hotel?.name}, Address: ${hotel?.address}.
Current Strategic Dashboard Metrics:
${formattedState}

Formulate marketing, development, and high-level rate tactics. Focus on improving RevPAR (Revenue Per Available Room), customer lifetime value, and branch expansions. Make recommendations precise, commercial, and professional.`
    };

    const systemInstruction = systemInstructions[context] || "You are HospitalityOS AI, a multi-tenant hospitality management platform co-pilot.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Failed to generate AI insights: " + error.message });
  }
});

// Mount Vite middleware for asset serving or fallback in production
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HospitalityOS Master Server is running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Critical: Failed to boot HospitalityOS backend server", err);
});

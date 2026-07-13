/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserRole, Hotel, Branch, Room, Guest, Booking, Payment, MaintenanceRequest, RoomStatus } from "./types";
import { HospitalityAPI, getActiveHotelId, setActiveHotelId } from "./services/api";
import RoleSelector from "./features/auth/RoleSelector";
import DashboardOverview from "./features/dashboard/DashboardOverview";
import BookingTimeline from "./features/reception/BookingTimeline";
import BookingWizard from "./features/reception/BookingWizard";
import RoomGrid from "./features/rooms/RoomGrid";
import FinanceOverview from "./features/finance/FinanceOverview";
import AICopilot from "./features/ai/AICopilot";
import { LayoutDashboard, Users, DoorOpen, DollarSign, Sparkles, AlertTriangle, CheckCircle, Hammer, RefreshCw } from "lucide-react";

export default function App() {
  // Tenant and RBAC Auth State
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.RECEPTIONIST);
  const [activeHotel, setActiveHotel] = useState<Hotel | null>(null);
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);

  // Core Data logs
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);

  // Navigation and UI
  const [activeTab, setActiveTab] = useState<"dashboard" | "reception" | "rooms" | "finance">("dashboard");
  const [showWizard, setShowWizard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pull operational logs from backend
  const fetchLogs = async () => {
    if (!activeHotel) return;
    setLoading(true);
    setError(null);
    try {
      // Set the active tenant header state
      setActiveHotelId(activeHotel.id);

      const [rLogs, bLogs, gLogs, pLogs, mLogs] = await Promise.all([
        HospitalityAPI.getRooms(),
        HospitalityAPI.getBookings(),
        HospitalityAPI.getGuests(),
        HospitalityAPI.getPayments(),
        HospitalityAPI.getMaintenanceRequests(),
      ]);

      setRooms(rLogs);
      setBookings(bLogs);
      setGuests(gLogs);
      setPayments(pLogs);
      setMaintenance(mLogs);
    } catch (err: any) {
      console.error(err);
      setError("Failed to coordinate database logs. Confirm Express server is running.");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when active hotel tenant changes
  useEffect(() => {
    if (activeHotel) {
      fetchLogs();
    }
  }, [activeHotel]);

  // Handle Room Housekeeping status changes
  const handleUpdateRoomStatus = async (roomId: string, status: RoomStatus) => {
    try {
      const updated = await HospitalityAPI.updateRoomStatus(roomId, status);
      setRooms((prev) => prev.map((r) => (r.id === roomId ? updated : r)));
    } catch (err) {
      console.error(err);
      alert("Unauthorized to transition room states.");
    }
  };

  // Handle Booking checks and cancellations
  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await HospitalityAPI.updateBookingStatus(bookingId, status);
      // Refresh rooms and bookings
      fetchLogs();
    } catch (err) {
      console.error(err);
      alert("Filing transaction error.");
    }
  };

  // Handle paystack invoice settlements
  const handlePayInvoice = async (paymentId: string) => {
    try {
      await HospitalityAPI.completePayment(paymentId);
      fetchLogs();
    } catch (err) {
      console.error(err);
      alert("Paystack transaction declined.");
    }
  };

  // Handle lodging new repairs
  const handleCreateMaintenance = async (room_id: string, issue: string, priority: string, description?: string) => {
    try {
      await HospitalityAPI.createMaintenanceRequest({ room_id, issue, priority, description });
      fetchLogs();
    } catch (err) {
      console.error(err);
      alert("Failed to lodge repair logs.");
    }
  };

  // Handle resolving active repair tasks
  const handleResolveMaintenance = async (requestId: string) => {
    try {
      await HospitalityAPI.resolveMaintenanceRequest(requestId);
      fetchLogs();
    } catch (err) {
      console.error(err);
      alert("Failed to sign-off repair task.");
    }
  };

  // Generate a structured context payload for our AI grounding
  const getAICopilotState = () => {
    const completedPayments = payments.filter((p) => p.status === "completed");
    const pendingPayments = payments.filter((p) => p.status === "pending");
    const totalRev = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPend = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      roomsCount: rooms.length,
      occupiedCount: rooms.filter((r) => r.status === "occupied").length,
      dirtyCount: rooms.filter((r) => r.status === "dirty").length,
      maintCount: rooms.filter((r) => r.status === "maintenance").length,
      guestsCount: guests.length,
      bookingsCount: bookings.length,
      revenue: totalRev,
      pendingPayments: totalPend,
      occupancyRate: rooms.length > 0 ? Math.round((rooms.filter((r) => r.status === "occupied").length / rooms.length) * 100) : 0,
      activeBranch: activeBranch?.name || "None",
      maintenanceRequests: maintenance.filter((m) => m.status !== "resolved"),
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* 1. Tenant Hotel Switcher & RBAC bar */}
      <RoleSelector
        currentRole={currentRole}
        onChangeRole={setCurrentRole}
        activeHotel={activeHotel}
        onChangeHotel={setActiveHotel}
        activeBranch={activeBranch}
        onChangeBranch={setActiveBranch}
      />

      {/* Main SaaS Interface Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Navigation Sidebar */}
        <div id="sidebar-navigation" className="bg-white border-r border-slate-200 lg:w-64 flex flex-row lg:flex-col justify-between lg:justify-start gap-1 p-4 shadow-sm select-none shrink-0 overflow-x-auto lg:overflow-x-visible">
          {/* Main menu item list */}
          <div className="flex flex-row lg:flex-col gap-1 w-full">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setShowWizard(false);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg cursor-pointer transition w-full whitespace-nowrap ${
                activeTab === "dashboard" && !showWizard
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("reception");
                setShowWizard(false);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg cursor-pointer transition w-full whitespace-nowrap ${
                activeTab === "reception" && !showWizard
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Front Desk Timeline</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("rooms");
                setShowWizard(false);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg cursor-pointer transition w-full whitespace-nowrap ${
                activeTab === "rooms" && !showWizard
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <DoorOpen className="w-4 h-4 shrink-0" />
              <span>Housekeeping & Rooms</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("finance");
                setShowWizard(false);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg cursor-pointer transition w-full whitespace-nowrap ${
                activeTab === "finance" && !showWizard
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <DollarSign className="w-4 h-4 shrink-0" />
              <span>Financial Ledger</span>
            </button>
          </div>

          <hr className="hidden lg:block border-slate-100 my-4" />

          {/* Quick Desk Action shortcuts */}
          <div className="hidden lg:block space-y-4 pt-1 w-full">
            <div className="px-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reception shortcuts</span>
            </div>
            <button
              onClick={() => {
                setActiveTab("reception");
                setShowWizard(true);
              }}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer transition"
            >
              <Sparkles className="w-3.5 h-3.5" /> Book New Stay
            </button>
          </div>
        </div>

        {/* Center Screen Stage Area */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-68px)]">
          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-start gap-3 text-xs font-medium leading-relaxed">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Database Logs Out of Sync</p>
                <p className="mt-0.5 text-rose-600 font-sans">{error}</p>
                <button
                  onClick={fetchLogs}
                  className="mt-2.5 px-3 py-1 bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-md shadow-sm text-[10px] font-bold cursor-pointer transition"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          )}

          {/* Show Multi-step Lodging wizard or default screen tabs */}
          {showWizard ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Front Desk Stay Registration</h2>
                  <p className="text-xs text-slate-500">Coordinate room lodging details and secure pre-payments.</p>
                </div>
                <button
                  onClick={() => setShowWizard(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition"
                >
                  Exit Wizard
                </button>
              </div>
              <BookingWizard
                rooms={rooms}
                branchId={activeBranch?.id || "branch-1-1"}
                onBookingCreated={() => {
                  fetchLogs();
                }}
              />
            </div>
          ) : (
            <>
              {/* Main Tab Stage Renders */}
              {activeTab === "dashboard" && (
                <DashboardOverview
                  rooms={rooms}
                  bookings={bookings}
                  guests={guests}
                  payments={payments}
                  onRefresh={fetchLogs}
                  loading={loading}
                />
              )}

              {activeTab === "reception" && (
                <BookingTimeline
                  bookings={bookings}
                  guests={guests}
                  rooms={rooms}
                  payments={payments}
                  onUpdateStatus={handleUpdateBookingStatus}
                  onPayInvoice={handlePayInvoice}
                  onRefresh={fetchLogs}
                />
              )}

              {activeTab === "rooms" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Housekeeping & Operations</h2>
                    <p className="text-xs text-slate-500">Track vacating rooms, clean dirty suites, and file maintenance orders.</p>
                  </div>

                  {/* Rooms Status Grid */}
                  <RoomGrid
                    rooms={rooms}
                    currentRole={currentRole}
                    onUpdateRoomStatus={handleUpdateRoomStatus}
                    onCreateMaintenance={handleCreateMaintenance}
                  />

                  {/* Active Maintenance requests ledger logs */}
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-1.5">
                        <Hammer className="w-4 h-4 text-rose-500" /> Active Maintenance Repairs
                      </h3>
                      <p className="text-xs text-slate-400">Unresolved repair orders logged at this hotel branch.</p>
                    </div>

                    {maintenance.filter(m => m.status !== "resolved").length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-400">No active maintenance issues on file.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider pb-2">
                              <th className="py-2">Room</th>
                              <th>Reported Issue</th>
                              <th>Priority</th>
                              <th>Log Date</th>
                              <th className="text-right py-2">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-slate-600">
                            {maintenance.filter(m => m.status !== "resolved").map((m) => {
                              const roomObj = rooms.find((r) => r.id === m.room_id);
                              return (
                                <tr key={m.id} className="hover:bg-slate-50/50 transition">
                                  <td className="py-2.5 font-bold text-slate-800">Room {roomObj?.room_number || "N/A"}</td>
                                  <td>
                                    <div className="font-semibold text-slate-800">{m.issue}</div>
                                    <div className="text-[10px] text-slate-400">{m.description}</div>
                                  </td>
                                  <td>
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                      m.priority === "critical" ? "bg-rose-50 text-rose-700 border-rose-100 animate-pulse" :
                                      m.priority === "high" ? "bg-rose-50 text-rose-700 border-rose-100" :
                                      m.priority === "medium" ? "bg-amber-50 text-amber-700 border-amber-100" :
                                      "bg-slate-50 text-slate-600 border-slate-100"
                                    }`}>
                                      {m.priority}
                                    </span>
                                  </td>
                                  <td className="text-slate-400 font-mono">{m.created_at.slice(0, 10)}</td>
                                  <td className="text-right py-2.5">
                                    {(currentRole === UserRole.MAINTENANCE || currentRole === UserRole.HOTEL_OWNER || currentRole === UserRole.MANAGER) && (
                                      <button
                                        onClick={() => handleResolveMaintenance(m.id)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-emerald-700 text-[10px] font-bold rounded-lg cursor-pointer transition shadow-sm"
                                      >
                                        Mark Resolved
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "finance" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Financial Ledger Audit</h2>
                    <p className="text-xs text-slate-500">Track and approve completed payment transfers, card settlements, and invoices.</p>
                  </div>
                  <FinanceOverview
                    payments={payments}
                    bookings={bookings}
                    guests={guests}
                    onCompletePayment={handlePayInvoice}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Right-Hand Sidebar Column: HospitalityOS AI Copilot */}
        <div id="ai-sidebar" className="lg:w-80 border-t lg:border-t-0 border-slate-100 flex-none bg-slate-900 min-h-[400px] lg:min-h-0 h-auto lg:h-[calc(100vh-68px)]">
          <AICopilot
            activeTab={activeTab}
            hotelState={getAICopilotState()}
          />
        </div>
      </div>
    </div>
  );
}

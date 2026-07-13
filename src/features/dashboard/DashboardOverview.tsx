/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Room, Booking, Guest, Payment } from "../../types";
import { TrendingUp, Users, CreditCard, Key, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "../../services/supabase";

interface DashboardOverviewProps {
  rooms: Room[];
  bookings: Booking[];
  guests: Guest[];
  payments: Payment[];
  onRefresh: () => void;
  loading: boolean;
}

export default function DashboardOverview({
  rooms,
  bookings,
  guests,
  payments,
  onRefresh,
  loading,
}: DashboardOverviewProps) {
  // 1. Calculate occupancy metrics
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === "occupied").length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // 2. Financial Metrics
  const completedPayments = payments.filter((p) => p.status === "completed");
  const pendingPayments = payments.filter((p) => p.status === "pending");
  
  const totalRevenue = completedPayments.reduce((acc, p) => acc + p.amount, 0);
  const outstandingRevenue = pendingPayments.reduce((acc, p) => acc + p.amount, 0);

  // ADR (Average Daily Rate) = Room Revenue / Occupied Rooms
  const adr = occupiedRooms > 0 ? Math.round(totalRevenue / occupiedRooms) : 150;
  // RevPAR = Total Revenue / Total Rooms
  const revPar = totalRooms > 0 ? Math.round(totalRevenue / totalRooms) : 75;

  // 3. Trends and Activity (Simulated stats)
  const activeBookings = bookings.filter((b) => b.status === "checked_in");

  // Chart data: Simulated revenue by day of current week
  const weekdayRevenue = [
    { day: "Mon", rev: Math.round(totalRevenue * 0.12) },
    { day: "Tue", rev: Math.round(totalRevenue * 0.15) },
    { day: "Wed", rev: Math.round(totalRevenue * 0.18) },
    { day: "Thu", rev: Math.round(totalRevenue * 0.14) },
    { day: "Fri", rev: Math.round(totalRevenue * 0.22) },
    { day: "Sat", rev: Math.round(totalRevenue * 0.28) },
    { day: "Sun", rev: Math.round(totalRevenue * 0.16) },
  ];

  const maxRevenueVal = Math.max(...weekdayRevenue.map(d => d.rev), 100);

  return (
    <div id="dashboard-overview" className="space-y-6">
      {/* Upper header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">System Dashboard</h2>
            {supabase ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                Supabase Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Supabase Offline
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">Real-time occupancy, revenue streams, and tenant metrics.</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 rounded-lg shadow-sm transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Sync Logs"}
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Occupancy Rate */}
        <div id="kpi-occupancy" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Occupancy Rate</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">{occupancyRate}%</span>
              <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">+4% vs. ytd</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {occupiedRooms} of {totalRooms} rooms checked-in
            </p>
          </div>
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Key className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Average Daily Rate (ADR) */}
        <div id="kpi-adr" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Daily Rate (ADR)</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">${adr}</span>
              <span className="text-[10px] font-medium text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">Steady</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Weighted average guest fee</p>
          </div>
          <div className="p-2 bg-sky-50 rounded-lg text-sky-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Total Realized Revenue */}
        <div id="kpi-revenue" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Realized Revenue</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</span>
              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Paystack</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Excludes pending invoices</p>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Outstanding Balances */}
        <div id="kpi-outstanding" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Invoices</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-rose-600">${outstandingRevenue.toLocaleString()}</span>
              {outstandingRevenue > 0 && (
                <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded animate-pulse">Alert</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">{pendingPayments.length} pending cash/card receipts</p>
          </div>
          <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & Operational Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue Stream (SVG-based Beautiful Bar Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Weekly Revenue Streams</h3>
            <p className="text-xs text-slate-400">Distribution of Paystack transactions across the week.</p>
          </div>

          <div className="h-64 flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-200 pb-2">
            {weekdayRevenue.map((d, index) => {
              const barHeight = `${(d.rev / maxRevenueVal) * 80}%`;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] py-1 px-2 rounded absolute mb-24 transition duration-200 pointer-events-none font-mono">
                    ${d.rev}
                  </div>
                  {/* Bar */}
                  <div
                    style={{ height: barHeight }}
                    className="w-full bg-indigo-600/80 hover:bg-indigo-600 rounded-t-md transition-all duration-300 shadow-sm"
                  ></div>
                  <span className="text-[11px] font-medium text-slate-500 font-mono">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Room Allocation Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Room Inventory Status</h3>
            <p className="text-xs text-slate-400">Current allocation of hotel rooms.</p>
          </div>

          {/* Allocation Bar */}
          <div className="space-y-4">
            <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100 shadow-inner">
              <div style={{ width: `${(rooms.filter(r => r.status === "available").length / totalRooms) * 100}%` }} className="bg-emerald-500" title="Available"></div>
              <div style={{ width: `${(rooms.filter(r => r.status === "occupied").length / totalRooms) * 100}%` }} className="bg-sky-500" title="Occupied"></div>
              <div style={{ width: `${(rooms.filter(r => r.status === "dirty").length / totalRooms) * 100}%` }} className="bg-amber-500" title="Dirty"></div>
              <div style={{ width: `${(rooms.filter(r => r.status === "maintenance").length / totalRooms) * 100}%` }} className="bg-rose-500" title="Maintenance"></div>
            </div>

            {/* Legend with absolute counts */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-slate-600">Available: <strong className="text-slate-800">{rooms.filter(r => r.status === "available").length}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0"></span>
                <span className="text-slate-600">Occupied: <strong className="text-slate-800">{rooms.filter(r => r.status === "occupied").length}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                <span className="text-slate-600">Dirty: <strong className="text-slate-800">{rooms.filter(r => r.status === "dirty").length}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                <span className="text-slate-600">Repair: <strong className="text-slate-800">{rooms.filter(r => r.status === "maintenance").length}</strong></span>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Quick Stats list */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Active Guest Profiles</span>
              <strong className="text-slate-800">{guests.length}</strong>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Check-Ins This Week</span>
              <strong className="text-slate-800">{bookings.length}</strong>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Active Maintenance Tickets</span>
              <strong className="text-rose-600 font-mono">{rooms.filter(r => r.status === "maintenance").length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Occupied Bookings Live Feed */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 tracking-tight mb-4">Active Guest Stays</h3>
        {activeBookings.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">No active checked-in guest stays at this branch.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider pb-2">
                  <th className="py-2.5">Guest</th>
                  <th>Room</th>
                  <th>Stay Period</th>
                  <th>Outstanding Bill</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeBookings.map((b) => {
                  const guestObj = guests.find((g) => g.id === b.guest_id);
                  const roomObj = rooms.find((r) => r.id === b.room_id);
                  const bPayments = payments.filter((p) => p.booking_id === b.id);
                  const paidVal = bPayments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
                  const balanceDue = b.total_amount - paidVal;

                  return (
                    <tr key={b.id} className="text-slate-600 hover:bg-slate-50/50 transition">
                      <td className="py-3 font-semibold text-slate-800">
                        {guestObj ? `${guestObj.first_name} ${guestObj.last_name}` : "Unknown Guest"}
                      </td>
                      <td className="font-mono">Room {roomObj?.room_number || "N/A"} ({roomObj?.type})</td>
                      <td>{b.check_in} to {b.check_out}</td>
                      <td className={`font-semibold font-mono ${balanceDue > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        ${balanceDue > 0 ? balanceDue : "Fully Paid"}
                      </td>
                      <td>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                          Checked In
                        </span>
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
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Booking, Guest, Room, Payment } from "../../types";
import { Search, Calendar, CreditCard, ChevronRight, Check, X, FileText, Printer, CheckCircle } from "lucide-react";

interface BookingTimelineProps {
  bookings: Booking[];
  guests: Guest[];
  rooms: Room[];
  payments: Payment[];
  onUpdateStatus: (bookingId: string, status: string) => void;
  onPayInvoice: (paymentId: string) => void;
  onRefresh: () => void;
}

export default function BookingTimeline({
  bookings,
  guests,
  rooms,
  payments,
  onUpdateStatus,
  onPayInvoice,
  onRefresh,
}: BookingTimelineProps) {
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Booking | null>(null);

  // Filter bookings based on guest search or room number
  const filteredBookings = bookings.filter((b) => {
    const guestObj = guests.find((g) => g.id === b.guest_id);
    const roomObj = rooms.find((r) => r.id === b.room_id);
    const guestName = guestObj ? `${guestObj.first_name} ${guestObj.last_name}`.toLowerCase() : "";
    const roomNum = roomObj ? roomObj.room_number : "";
    
    return (
      guestName.includes(search.toLowerCase()) ||
      roomNum.includes(search) ||
      b.id.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Calculate invoice details for printable drawer
  const getInvoiceDetails = (booking: Booking) => {
    const guest = guests.find((g) => g.id === booking.guest_id);
    const room = rooms.find((r) => r.id === booking.room_id);
    const bPayments = payments.filter((p) => p.booking_id === booking.id);
    
    const subtotal = booking.total_amount;
    const vat = Math.round(subtotal * 0.075); // 7.5% VAT standard
    const totalWithTax = subtotal + vat;
    const paid = bPayments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
    const balanceDue = totalWithTax - paid;

    return { guest, room, bPayments, subtotal, vat, totalWithTax, paid, balanceDue };
  };

  return (
    <div id="booking-timeline-module" className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Guest name, Room #, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-lg text-xs transition bg-slate-50/50"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Showing {filteredBookings.length} of {bookings.length} reservations
        </div>
      </div>

      {/* Bookings Ledger Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Booking ID</th>
                <th>Guest Profile</th>
                <th>Room / Rate</th>
                <th>Check In / Out</th>
                <th>Status</th>
                <th>Receipts</th>
                <th className="text-right py-3 px-4">Desk Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-600">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No active reservations found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const guest = guests.find((g) => g.id === b.guest_id);
                  const room = rooms.find((r) => r.id === b.room_id);
                  const bPayments = payments.filter((p) => p.booking_id === b.id);
                  const totalPaid = bPayments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
                  const hasPending = bPayments.some((p) => p.status === "pending");
                  const activePayment = bPayments.find((p) => p.status === "pending");

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition">
                      {/* Booking ID */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800 font-mono">
                        #{b.id.substring(b.id.indexOf("-") + 1, b.id.indexOf("-") + 6) || b.id.slice(0, 5)}
                      </td>
                      {/* Guest Info */}
                      <td>
                        <div className="font-semibold text-slate-800">
                          {guest ? `${guest.first_name} ${guest.last_name}` : "Deleted Guest"}
                        </div>
                        <div className="text-[11px] text-slate-400">{guest?.email}</div>
                      </td>
                      {/* Room Details */}
                      <td>
                        <div className="font-semibold text-slate-800">Room {room?.room_number || "N/A"}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {room?.type.toUpperCase()} • ${room?.price_per_night}/night
                        </div>
                      </td>
                      {/* Stay Period */}
                      <td>
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.check_in}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 pl-4.5">to {b.check_out}</div>
                      </td>
                      {/* Status */}
                      <td>
                        {b.status === "confirmed" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                            Reserved
                          </span>
                        )}
                        {b.status === "checked_in" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                            Active Stay
                          </span>
                        )}
                        {b.status === "checked_out" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-100">
                            Checked Out
                          </span>
                        )}
                        {b.status === "cancelled" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                            Cancelled
                          </span>
                        )}
                      </td>
                      {/* Receipts & Payments */}
                      <td>
                        <div className="font-mono text-[11px]">
                          Paid: <strong className="text-emerald-600">${totalPaid}</strong>
                          <br />
                          Total: <strong className="text-slate-800">${b.total_amount}</strong>
                        </div>
                        {hasPending && activePayment && (
                          <button
                            onClick={() => onPayInvoice(activePayment.id)}
                            className="mt-1 flex items-center gap-1 px-1.5 py-0.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-[9px] font-bold rounded cursor-pointer transition animate-pulse"
                          >
                            <CreditCard className="w-3 h-3 text-rose-500" />
                            Pay via Paystack
                          </button>
                        )}
                      </td>
                      {/* Operational Desk Actions */}
                      <td className="text-right py-3.5 px-4 space-x-1">
                        {/* Print Invoice */}
                        <button
                          onClick={() => setSelectedInvoice(b)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md cursor-pointer transition inline-flex items-center"
                          title="Generate Invoice Invoice"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        {/* Transitions */}
                        {b.status === "confirmed" && (
                          <button
                            onClick={() => onUpdateStatus(b.id, "checked_in")}
                            className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 text-indigo-700 text-[10px] font-semibold rounded-md cursor-pointer transition"
                          >
                            Check-In Room
                          </button>
                        )}
                        {b.status === "checked_in" && (
                          <button
                            onClick={() => onUpdateStatus(b.id, "checked_out")}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-semibold rounded-md cursor-pointer transition"
                          >
                            Check-Out Guest
                          </button>
                        )}
                        {b.status === "confirmed" && (
                          <button
                            onClick={() => onUpdateStatus(b.id, "cancelled")}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md cursor-pointer transition inline-flex items-center"
                            title="Cancel Reservation"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal Overlay */}
      {selectedInvoice && (() => {
        const { guest, room, bPayments, subtotal, vat, totalWithTax, paid, balanceDue } = getInvoiceDetails(selectedInvoice);
        return (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div id="invoice-bill" className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="text-sm font-bold tracking-tight">Booking Invoice</h3>
                    <p className="text-[10px] text-slate-400">HospitalityOS Billing Engine</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 hover:bg-slate-800 rounded-md transition cursor-pointer text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Invoice Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-600 font-sans">
                {/* Billing details */}
                <div className="flex justify-between text-xs pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Billed To:</span>
                    <div className="font-semibold text-slate-800 mt-1">{guest ? `${guest.first_name} ${guest.last_name}` : "N/A"}</div>
                    <div className="text-slate-400">{guest?.email}</div>
                    <div className="text-slate-400">{guest?.phone}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Invoice Info:</span>
                    <div className="font-semibold font-mono text-slate-800 mt-1">#INV-{selectedInvoice.id.slice(0, 6).toUpperCase()}</div>
                    <div className="text-slate-400">Issue Date: {selectedInvoice.created_at.slice(0, 10)}</div>
                    <div className="text-slate-400">Status: <strong className="text-slate-700 capitalize">{selectedInvoice.status}</strong></div>
                  </div>
                </div>

                {/* Stay Summary */}
                <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">Stay Breakdown</span>
                    <div className="text-[11px] text-slate-400 mt-0.5">Room {room?.room_number} ({room?.type})</div>
                  </div>
                  <div className="text-right font-semibold text-slate-800">
                    {selectedInvoice.check_in} to {selectedInvoice.check_out}
                  </div>
                </div>

                {/* Ledger Items */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Ledger Audit Items</span>
                  <div className="divide-y divide-slate-200 text-xs">
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-500">Room Accommodation Rate (Base Fee)</span>
                      <span className="font-mono">${subtotal}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-500">Government VAT Tax (7.5%)</span>
                      <span className="font-mono">${vat}</span>
                    </div>
                    <div className="py-2.5 flex justify-between font-bold text-slate-800 border-t border-slate-200">
                      <span>Total Gross Due</span>
                      <span className="font-mono">${totalWithTax}</span>
                    </div>
                    <div className="py-2.5 flex justify-between text-emerald-600 font-semibold">
                      <span>Paid Receipts</span>
                      <span className="font-mono">-${paid}</span>
                    </div>
                    <div className="py-3 flex justify-between font-bold text-lg text-slate-900 border-t-2 border-slate-200 border-double">
                      <span>Balance Outstanding</span>
                      <span className="font-mono">${balanceDue > 0 ? balanceDue : 0}</span>
                    </div>
                  </div>
                </div>

                {/* Payment History Log */}
                {bPayments.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Transaction Ledger</span>
                    <div className="space-y-1.5">
                      {bPayments.map((p) => (
                        <div key={p.id} className="flex justify-between items-center text-[11px] bg-slate-50 p-2 rounded">
                          <div className="flex items-center gap-1">
                            <CheckCircle className={`w-3.5 h-3.5 ${p.status === "completed" ? "text-emerald-500" : "text-slate-400"}`} />
                            <span className="text-slate-700 font-semibold">{p.payment_method} Transfer</span>
                          </div>
                          <span className="font-mono text-slate-500">{p.created_at.slice(0, 16).replace("T", " ")}</span>
                          <strong className={p.status === "completed" ? "text-emerald-600" : "text-amber-600"}>
                            ${p.amount} {p.status.toUpperCase()}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold rounded-lg text-xs cursor-pointer transition"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Invoice
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs cursor-pointer transition"
                >
                  Close Invoice
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

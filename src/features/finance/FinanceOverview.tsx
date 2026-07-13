/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Payment, Booking, Guest } from "../../types";
import { Search, DollarSign, Wallet, FileSpreadsheet, Check, ArrowUpRight, ShieldCheck } from "lucide-react";

interface FinanceOverviewProps {
  payments: Payment[];
  bookings: Booking[];
  guests: Guest[];
  onCompletePayment: (paymentId: string) => void;
}

export default function FinanceOverview({
  payments,
  bookings,
  guests,
  onCompletePayment,
}: FinanceOverviewProps) {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [exportedMessage, setExportedMessage] = useState<string | null>(null);

  const completedPayments = payments.filter((p) => p.status === "completed");
  const pendingPayments = payments.filter((p) => p.status === "pending");

  const totalGross = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalCollected = completedPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalPending = pendingPayments.reduce((acc, p) => acc + p.amount, 0);

  const filteredPayments = payments.filter((p) => {
    // Role filter
    if (filter !== "all" && p.status !== filter) return false;

    // Search filter (booking id or guest email)
    const booking = bookings.find((b) => b.id === p.booking_id);
    const guest = booking ? guests.find((g) => g.id === booking.guest_id) : null;
    const guestName = guest ? `${guest.first_name} ${guest.last_name}`.toLowerCase() : "";

    return (
      p.booking_id.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      guestName.includes(search.toLowerCase())
    );
  });

  return (
    <div id="finance-module" className="space-y-6 relative">
      {exportedMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-800 flex items-center gap-3 z-50 text-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="font-medium">{exportedMessage}</span>
          <button onClick={() => setExportedMessage(null)} className="text-slate-400 hover:text-white font-bold ml-2">×</button>
        </div>
      )}

      {/* Financial KPI Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI: Gross Billed */}
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Gross Billed</span>
            <div className="text-2xl font-bold font-mono">${totalGross.toLocaleString()}</div>
            <p className="text-[10px] text-slate-400 font-medium">All generated invoices</p>
          </div>
          <div className="p-2 bg-slate-800 rounded-lg text-indigo-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Total Collected */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Realized Cashflow</span>
            <div className="text-2xl font-bold font-mono text-indigo-600">${totalCollected.toLocaleString()}</div>
            <p className="text-[10px] text-slate-400 font-medium">Paystack settled transactions</p>
          </div>
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Pending Settlement */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Settlement</span>
            <div className="text-2xl font-bold font-mono text-rose-500">${totalPending.toLocaleString()}</div>
            <p className="text-[10px] text-slate-400 font-medium">Unpaid room fees</p>
          </div>
          <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Ledger Table Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Ledger, Guest or Booking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-lg text-xs transition bg-slate-50/50"
            />
          </div>

          {/* Filter Status Selector */}
          <div className="flex gap-1.5">
            {["all", "completed", "pending"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition cursor-pointer ${
                  filter === s
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setExportedMessage("Exporting spreadsheet to Excel format...");
            setTimeout(() => setExportedMessage("Ledger exported successfully as CSV!"), 1200);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg shadow-sm transition cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-slate-500" /> Export CSV
        </button>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Transaction ID</th>
                <th>Guest Profile</th>
                <th>Related Booking</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Settlement Time</th>
                <th className="text-right py-3 px-4">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-sans">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No financial transactions recorded for this criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const booking = bookings.find((b) => b.id === p.booking_id);
                  const guest = booking ? guests.find((g) => g.id === booking.guest_id) : null;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        TXN-{p.id.slice(p.id.indexOf("-") + 1, p.id.indexOf("-") + 7).toUpperCase() || p.id.slice(0, 6).toUpperCase()}
                      </td>
                      {/* Guest name */}
                      <td>
                        <div className="font-semibold text-slate-800">
                          {guest ? `${guest.first_name} ${guest.last_name}` : "N/A"}
                        </div>
                        <div className="text-[10px] text-slate-400">{guest?.email}</div>
                      </td>
                      {/* Booking ref */}
                      <td className="font-mono text-slate-500">
                        #BK-{p.booking_id.slice(p.booking_id.indexOf("-") + 1, p.booking_id.indexOf("-") + 7) || p.booking_id.slice(0, 5)}
                      </td>
                      {/* Amount */}
                      <td className="font-bold text-slate-800 font-mono">
                        ${p.amount}
                      </td>
                      {/* Method */}
                      <td className="text-slate-500">{p.payment_method}</td>
                      {/* Status */}
                      <td>
                        {p.status === "completed" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Settled
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                            Unpaid Invoice
                          </span>
                        )}
                      </td>
                      {/* Settlement time */}
                      <td className="text-slate-400 font-mono">
                        {p.created_at.slice(0, 16).replace("T", " ")}
                      </td>
                      {/* Audit Actions */}
                      <td className="text-right py-3.5 px-4">
                        {p.status === "pending" ? (
                          <button
                            onClick={() => onCompletePayment(p.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 text-indigo-700 text-[10px] font-semibold rounded-md cursor-pointer transition shadow-sm"
                          >
                            <Check className="w-3 h-3" /> Approve Cash/Card
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-semibold flex items-center justify-end gap-1">
                            <ArrowUpRight className="w-3 h-3 text-indigo-500" /> Auditor Cleared
                          </span>
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
    </div>
  );
}

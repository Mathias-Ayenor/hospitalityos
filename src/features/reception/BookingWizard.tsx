/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Room, Guest, RoomStatus } from "../../types";
import { HospitalityAPI } from "../../services/api";
import { User, Key, Calendar, ClipboardCheck, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";

interface BookingWizardProps {
  rooms: Room[];
  onBookingCreated: () => void;
  branchId: string;
}

export default function BookingWizard({ rooms, onBookingCreated, branchId }: BookingWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [guestForm, setGuestForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [dates, setDates] = useState({
    check_in: new Date().toISOString().slice(0, 10),
    check_out: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10), // Default 3 nights
  });
  const [notes, setNotes] = useState("");

  // Only show available rooms for this specific branch
  const availableRooms = rooms.filter((r) => r.status === "available" && r.branch_id === branchId);
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  // Compute total duration and total amount
  const checkInDate = new Date(dates.check_in);
  const checkOutDate = new Date(dates.check_out);
  const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const totalAmount = selectedRoom ? selectedRoom.price_per_night * nights : 0;

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!guestForm.first_name || !guestForm.last_name || !guestForm.email) {
        setError("Please complete all required Guest fields (First Name, Last Name, and Email).");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedRoomId) {
        setError("Please select a room to accommodate this guest.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (new Date(dates.check_out) <= new Date(dates.check_in)) {
        setError("Check-out date must be at least 1 day after the Check-in date.");
        return;
      }
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create guest profile first
      const guest = await HospitalityAPI.createGuest(guestForm);

      // 2. Create the booking entry (will also update room status and create payment record)
      await HospitalityAPI.createBooking({
        branch_id: branchId,
        guest_id: guest.id,
        room_id: selectedRoomId,
        check_in: dates.check_in,
        check_out: dates.check_out,
        total_amount: totalAmount,
        notes,
      });

      setSuccess(true);
      onBookingCreated();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while booking.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSuccess(false);
    setSelectedRoomId("");
    setNotes("");
    setGuestForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
    });
  };

  if (success) {
    return (
      <div id="booking-success-card" className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center max-w-md mx-auto space-y-6">
        <div className="mx-auto bg-indigo-50 text-indigo-600 p-3.5 rounded-full w-14 h-14 flex items-center justify-center shadow-inner">
          <CheckCircle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Booking Confirmed</h3>
          <p className="text-xs text-slate-500 mt-1">
            Guest stays have been authorized, room has been allocated, and Paystack receipts are generated.
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg text-left text-xs divide-y divide-slate-100">
          <div className="py-1.5 flex justify-between">
            <span className="text-slate-400 font-medium">Guest:</span>
            <strong className="text-slate-800">{guestForm.first_name} {guestForm.last_name}</strong>
          </div>
          <div className="py-1.5 flex justify-between">
            <span className="text-slate-400 font-medium">Room Number:</span>
            <strong className="text-slate-800">Room {selectedRoom?.room_number}</strong>
          </div>
          <div className="py-1.5 flex justify-between">
            <span className="text-slate-400 font-medium">Duration:</span>
            <strong className="text-slate-800">{nights} Nights</strong>
          </div>
          <div className="py-1.5 flex justify-between">
            <span className="text-slate-400 font-medium">Ledger Cost:</span>
            <strong className="text-indigo-600 font-mono">${totalAmount}</strong>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
        >
          Check-In Another Guest
        </button>
      </div>
    );
  }

  return (
    <div id="booking-wizard-card" className="bg-white rounded-xl border border-slate-100 shadow-sm max-w-2xl mx-auto overflow-hidden">
      {/* Wizard Progress Steps Indicator */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <span>Desk Registration Wizard</span>
          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono">Step {step}/4</span>
        </h3>
        <div className="flex gap-1.5 items-center">
          <div className={`w-2 h-2 rounded-full ${step >= 1 ? "bg-indigo-600" : "bg-slate-200"}`}></div>
          <div className={`w-2 h-2 rounded-full ${step >= 2 ? "bg-indigo-600" : "bg-slate-200"}`}></div>
          <div className={`w-2 h-2 rounded-full ${step >= 3 ? "bg-indigo-600" : "bg-slate-200"}`}></div>
          <div className={`w-2 h-2 rounded-full ${step >= 4 ? "bg-indigo-600" : "bg-slate-200"}`}></div>
        </div>
      </div>

      {/* Wizard Body content */}
      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-lg flex items-start gap-2.5 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {/* STEP 1: GUEST REGISTRATION */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <User className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 1: Guest Profile Registration</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">First Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., Jane"
                  value={guestForm.first_name}
                  onChange={(e) => setGuestForm({ ...guestForm, first_name: e.target.value })}
                  className="px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-lg text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Last Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., Doe"
                  value={guestForm.last_name}
                  onChange={(e) => setGuestForm({ ...guestForm, last_name: e.target.value })}
                  className="px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-lg text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Email Address <span className="text-rose-500">*</span></label>
                <input
                  type="email"
                  placeholder="e.g., jane.doe@example.com"
                  value={guestForm.email}
                  onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                  className="px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-lg text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Contact Number</label>
                <input
                  type="tel"
                  placeholder="e.g., +1 (555) 019-3344"
                  value={guestForm.phone}
                  onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                  className="px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ROOM SELECTION */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <Key className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 2: Assign Available Room</h4>
            </div>

            {availableRooms.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl space-y-2">
                <AlertTriangle className="w-6 h-6 text-slate-300 mx-auto" />
                <p>No available vacant rooms left in this branch.</p>
                <p className="text-[10px] text-slate-400">Mark dirty rooms as clean or release maintenance rooms first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {availableRooms.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRoomId(r.id)}
                    className={`p-3.5 border rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/10 transition flex items-start justify-between ${
                      selectedRoomId === r.id
                        ? "border-indigo-600 bg-indigo-50/20 shadow-sm"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 text-xs">Room {r.room_number}</div>
                      <div className="text-[11px] text-slate-500 capitalize">{r.type} Room</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {r.amenities.slice(0, 3).map((a, i) => (
                          <span key={i} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                    <strong className="text-xs text-slate-900 font-mono">${r.price_per_night}/nt</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: STAY CALENDAR */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 3: Check-In Stay Dates</h4>
            </div>

            {selectedRoom && (
              <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between text-xs mb-2">
                <div>
                  <span className="font-semibold text-slate-700">Allocated Room:</span>
                  <span className="ml-2 font-mono text-slate-600">Room {selectedRoom.room_number} ({selectedRoom.type})</span>
                </div>
                <strong className="text-slate-800 font-mono">${selectedRoom.price_per_night}/night</strong>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Check-In Date</label>
                <input
                  type="date"
                  value={dates.check_in}
                  onChange={(e) => setDates({ ...dates, check_in: e.target.value })}
                  className="px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-lg text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Check-Out Date</label>
                <input
                  type="date"
                  value={dates.check_out}
                  onChange={(e) => setDates({ ...dates, check_out: e.target.value })}
                  className="px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="bg-indigo-50/30 p-4 rounded-xl border border-indigo-100 flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-slate-700 block">Stay Duration Summary</span>
                <span className="text-[11px] text-slate-500">{nights} night stay calculated</span>
              </div>
              <strong className="text-lg text-indigo-700 font-mono">${totalAmount}</strong>
            </div>
          </div>
        )}

        {/* STEP 4: NOTES AND CONFIRM */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <ClipboardCheck className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 4: Audit & File Log</h4>
            </div>

            {/* Comprehensive Booking Audit Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Guest Profile Details</span>
                <div className="space-y-1">
                  <div><strong>Name:</strong> {guestForm.first_name} {guestForm.last_name}</div>
                  <div><strong>Email:</strong> {guestForm.email}</div>
                  <div><strong>Phone:</strong> {guestForm.phone || "None listed"}</div>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accommodation Assignment</span>
                <div className="space-y-1">
                  <div><strong>Room:</strong> Room {selectedRoom?.room_number} ({selectedRoom?.type})</div>
                  <div><strong>Dates:</strong> {dates.check_in} to {dates.check_out} ({nights} nights)</div>
                  <div><strong>Gross Rate:</strong> <span className="font-semibold text-indigo-600 font-mono">${totalAmount}</span></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Special Requests / Desk Notes</label>
              <textarea
                placeholder="e.g. Needs high floor, extra pillows, early check-in instructions..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-lg text-xs resize-none"
              ></textarea>
            </div>
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        {step > 1 ? (
          <button
            onClick={handlePrevStep}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer transition disabled:opacity-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        ) : (
          <div></div>
        )}

        {step < 4 ? (
          <button
            onClick={handleNextStep}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg cursor-pointer transition"
          >
            Continue <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg cursor-pointer transition shadow-md"
          >
            {loading ? "Filing booking logs..." : "Confirm & Authorize Check-In"}
          </button>
        )}
      </div>
    </div>
  );
}

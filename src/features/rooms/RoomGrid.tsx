/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Room, RoomStatus, UserRole } from "../../types";
import { Sparkles, Hammer, AlertTriangle, Check, Filter, Home, Key, Trash2, X } from "lucide-react";

interface RoomGridProps {
  rooms: Room[];
  currentRole: UserRole;
  onUpdateRoomStatus: (roomId: string, status: RoomStatus) => void;
  onCreateMaintenance: (room_id: string, issue: string, priority: string, description?: string) => void;
}

export default function RoomGrid({
  rooms,
  currentRole,
  onUpdateRoomStatus,
  onCreateMaintenance,
}: RoomGridProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedRoomForMaint, setSelectedRoomForMaint] = useState<Room | null>(null);
  const [maintForm, setMaintForm] = useState({ issue: "", priority: "medium", description: "" });

  const filteredRooms = rooms.filter((r) => {
    if (filterStatus === "all") return true;
    return r.status === filterStatus;
  });

  const getStatusStyle = (status: RoomStatus) => {
    switch (status) {
      case "available":
        return { text: "text-emerald-700 bg-emerald-50 border-emerald-100", label: "Available" };
      case "occupied":
        return { text: "text-sky-700 bg-sky-50 border-sky-100", label: "Occupied" };
      case "dirty":
        return { text: "text-amber-700 bg-amber-50 border-amber-100", label: "Dirty (Needs Clean)" };
      case "maintenance":
        return { text: "text-rose-700 bg-rose-50 border-rose-100", label: "In Repair" };
    }
  };

  const handleMaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForMaint || !maintForm.issue) return;

    onCreateMaintenance(
      selectedRoomForMaint.id,
      maintForm.issue,
      maintForm.priority,
      maintForm.description
    );

    // Reset Form
    setSelectedRoomForMaint(null);
    setMaintForm({ issue: "", priority: "medium", description: "" });
  };

  return (
    <div id="room-grid-module" className="space-y-6">
      {/* Filtering header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-500">Filter Rooms:</span>
          <div className="flex flex-wrap gap-1">
            {["all", "available", "occupied", "dirty", "maintenance"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 text-[11px] font-semibold rounded-lg capitalize transition cursor-pointer border ${
                  filterStatus === st
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {st === "all" ? "All Rooms" : st}
              </button>
            ))}
          </div>
        </div>
        <div className="text-xs font-medium text-slate-400">
          Viewing {filteredRooms.length} of {rooms.length} rooms
        </div>
      </div>

      {/* Grid of Bento-style cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredRooms.map((r) => {
          const statusStyle = getStatusStyle(r.status);
          const isHousekeeper = currentRole === UserRole.HOUSEKEEPING || currentRole === UserRole.HOTEL_OWNER || currentRole === UserRole.MANAGER;
          const isReceptionist = currentRole === UserRole.RECEPTIONIST || currentRole === UserRole.HOTEL_OWNER || currentRole === UserRole.MANAGER;

          return (
            <div
              key={r.id}
              className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 p-4.5 flex flex-col justify-between h-48 relative overflow-hidden group ${
                r.status === "dirty" ? "border-amber-200/50" : ""
              } ${r.status === "maintenance" ? "border-rose-200/50" : ""}`}
            >
              {/* Card Header details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                    <Home className="w-4 h-4 text-slate-400" />
                    <span>Room {r.room_number}</span>
                  </div>
                  <span className={`inline-flex items-center border px-2 py-0.5 rounded text-[10px] font-bold tracking-tight capitalize ${statusStyle.text}`}>
                    {statusStyle.label}
                  </span>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{r.type} Accommodations</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">${r.price_per_night} Per Night • RLS Safe</div>
                </div>
              </div>

              {/* Amenities tags preview */}
              <div className="flex flex-wrap gap-1 my-2">
                {r.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] bg-slate-50 text-slate-500 font-medium px-1.5 py-0.5 rounded border border-slate-100"
                  >
                    {amenity}
                  </span>
                ))}
              </div>

              {/* Dynamic Action Panel based on roles and RLS */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                {/* Housekeeping Action: Mark Dirty as Clean */}
                {r.status === "dirty" && isHousekeeper && (
                  <button
                    onClick={() => onUpdateRoomStatus(r.id, RoomStatus.AVAILABLE)}
                    className="w-full py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 text-indigo-700 text-[10px] font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1 transition"
                  >
                    <Sparkles className="w-3 h-3 shrink-0" />
                    Clean & Release
                  </button>
                )}

                {/* Operations/Reception Action: Request Repair / Maintenance */}
                {r.status === "available" && isReceptionist && (
                  <button
                    onClick={() => setSelectedRoomForMaint(r)}
                    className="py-1 px-2 border border-slate-200 text-slate-600 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 text-[10px] font-semibold rounded-md cursor-pointer flex items-center gap-1 transition"
                    title="File maintenance ticket"
                  >
                    <Hammer className="w-3 h-3" />
                    Issue
                  </button>
                )}

                {/* Manual toggle check for supervisor roles */}
                {(currentRole === UserRole.HOTEL_OWNER || currentRole === UserRole.SUPER_ADMIN) && (
                  <select
                    value={r.status}
                    onChange={(e) => onUpdateRoomStatus(r.id, e.target.value as RoomStatus)}
                    className="text-[9px] bg-slate-50 border border-slate-200 text-slate-700 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="dirty">Dirty</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Maintenance Request Form Popover */}
      {selectedRoomForMaint && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleMaintSubmit}
            className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-sm overflow-hidden text-slate-600 text-xs font-sans"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hammer className="w-4.5 h-4.5 text-indigo-400" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">File Maintenance logs</h3>
                  <p className="text-[10px] text-slate-400">Locking Room {selectedRoomForMaint.room_number}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRoomForMaint(null)}
                className="p-1 hover:bg-slate-800 rounded-md transition text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="p-4 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Issue Summary <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. AC fan rattle, toilet leak, broken lock..."
                  required
                  value={maintForm.issue}
                  onChange={(e) => setMaintForm({ ...maintForm, issue: e.target.value })}
                  className="px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-lg text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Priority Level</label>
                <select
                  value={maintForm.priority}
                  onChange={(e) => setMaintForm({ ...maintForm, priority: e.target.value })}
                  className="px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-lg text-xs bg-white cursor-pointer"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Urgency</option>
                  <option value="critical">Critical Lockout</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Technical Details / Description</label>
                <textarea
                  placeholder="Provide precise details for maintenance engineers..."
                  rows={3}
                  value={maintForm.description}
                  onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })}
                  className="px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-lg text-xs resize-none"
                ></textarea>
              </div>
            </div>

            {/* Form Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedRoomForMaint(null)}
                className="flex-1 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold rounded-lg text-xs cursor-pointer text-center transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs cursor-pointer text-center transition"
              >
                File Repair Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { Hotel, Branch, UserRole } from "../../types";
import { HospitalityAPI, getActiveHotelId, setActiveHotelId } from "../../services/api";
import { Shield, Building, GitBranch, Users } from "lucide-react";

interface RoleSelectorProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  activeHotel: Hotel | null;
  onChangeHotel: (hotel: Hotel) => void;
  activeBranch: Branch | null;
  onChangeBranch: (branch: Branch | null) => void;
}

export default function RoleSelector({
  currentRole,
  onChangeRole,
  activeHotel,
  onChangeHotel,
  activeBranch,
  onChangeBranch,
}: RoleSelectorProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    // Load hotels initially
    HospitalityAPI.getHotels()
      .then((data) => {
        setHotels(data);
        if (data.length > 0 && !activeHotel) {
          onChangeHotel(data[0]);
          setActiveHotelId(data[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (activeHotel) {
      // Load branches for this specific hotel (enforces tenant-specific branches)
      HospitalityAPI.getBranches()
        .then((data) => {
          setBranches(data);
          if (data.length > 0) {
            onChangeBranch(data[0]);
          } else {
            onChangeBranch(null);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [activeHotel]);

  const handleHotelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = hotels.find((h) => h.id === e.target.value);
    if (selected) {
      setActiveHotelId(selected.id);
      onChangeHotel(selected);
    }
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = branches.find((b) => b.id === e.target.value);
    onChangeBranch(selected || null);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeRole(e.target.value as UserRole);
  };

  return (
    <div id="tenant-role-bar" className="bg-slate-900 text-white py-3 px-4 md:px-6 shadow-md border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 text-white p-2 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
          H_OS
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
            HospitalityOS
            <span className="text-xs bg-slate-800 text-indigo-400 font-mono px-2 py-0.5 rounded border border-indigo-500/20">SaaS Suite</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">Run Your Hospitality Business Smarter.</p>
        </div>
      </div>

      {/* Tenant RLS and Role Selectors */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        {/* Hotel Tenant Selection */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 w-full sm:w-auto">
          <Building className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Tenant Hotel (RLS)</span>
            <select
              value={activeHotel?.id || ""}
              onChange={handleHotelChange}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
            >
              {hotels.map((h) => (
                <option key={h.id} value={h.id} className="bg-slate-800 text-white">
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Branch Selection */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 w-full sm:w-auto">
          <GitBranch className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Branch</span>
            <select
              value={activeBranch?.id || ""}
              onChange={handleBranchChange}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
              disabled={branches.length === 0}
            >
              {branches.length === 0 ? (
                <option value="" className="bg-slate-800 text-white">No Branches</option>
              ) : (
                branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-800 text-white">
                    {b.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* RBAC Role Selection */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 w-full sm:w-auto">
          <Shield className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Role Profile (RBAC)</span>
            <select
              value={currentRole}
              onChange={handleRoleChange}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
            >
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role} className="bg-slate-800 text-white">
                  {role.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { ReactNode } from "react";
import { Building2, ShieldCheck } from "lucide-react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Left Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-center px-16">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <Building2 className="w-10 h-10 text-indigo-400" />

            <div>
              <h1 className="text-4xl font-bold">
                HospitalityOS
              </h1>

              <p className="text-slate-400">
                Hotel Management Platform
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-bold leading-tight mb-6">
            Run your hospitality business with confidence.
          </h2>

          <p className="text-slate-300 leading-7">
            HospitalityOS helps hotels, resorts, guest houses,
            apartments and hostels manage reservations,
            housekeeping, finance, POS and reporting from one
            secure platform.
          </p>

          <div className="mt-10 flex items-center gap-3">
            <ShieldCheck className="text-emerald-400" />

            <span className="text-slate-300">
              Enterprise-grade security powered by Supabase.
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

          <div className="mb-8">
            <h2 className="text-3xl font-bold">
              {title}
            </h2>

            <p className="mt-2 text-slate-500">
              {subtitle}
            </p>
          </div>

          {children}

        </div>
      </div>
    </div>
  );
}
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";

import HotelStep from "./HotelStep";
import BranchStep from "./BranchStep";
import AdminStep from "./AdminStep";
import FinishStep from "./FinishStep";

import { OnboardingData } from "./types";

export default function HotelWizard() {
  const [step, setStep] = useState(1);
const { session } = useAuth();

const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState("");
  const [data, setData] = useState<OnboardingData>({
    // Hotel
    hotelName: "",
    hotelType: "Hotel",
    registrationNumber: "",
    taxNumber: "",
    hotelEmail: "",
    hotelPhone: "",
    website: "",

    country: "Ghana",
    region: "",
    city: "",

    currency: "GHS",
    timezone: "Africa/Accra",

    // Branch
    branchName: "Main Branch",
    branchCode: "MAIN",
    branchPhone: "",
    branchEmail: "",
    branchAddress: "",

    // Administrator
    firstName: "",
    lastName: "",
    adminEmail: "",
    adminPhone: "",
    employeeNumber: "",
    adminRole: "Administrator",
  });
async function handleFinish() {
  if (!session?.access_token) {
    setError("You are not authenticated.");
    return;
  }

  try {
    setSubmitting(true);
    setError("");
console.log("Session:", session);
console.log("Access Token:", session?.access_token);
    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to complete onboarding."
      );
    }

    alert("🎉 Hotel created successfully!");

    // We will replace this with refreshUser()
    // and dashboard redirect in the next step.

    window.location.reload();
  } catch (err: any) {
    setError(err.message);
  } finally {
    setSubmitting(false);
  }
}
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome to HospitalityOS
          </h1>

          <p className="text-slate-500 mt-2">
            Let's configure your hotel.
          </p>
        </div>

        {/* Progress */}

        <div className="flex gap-3 mb-8">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
              ${
                step >= n
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {n}
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-slate-50 p-8">

          {step === 1 && (
            <HotelStep
              data={data}
              setData={setData}
            />
          )}

          {step === 2 && (
            <BranchStep
              data={data}
              setData={setData}
            />
          )}

          {step === 3 && (
            <AdminStep
              data={data}
              setData={setData}
            />
          )}

          {step === 4 && (
            <FinishStep
              data={data}
            />
          )}

        </div>
{error && (
  <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
    {error}
  </div>
)}
        <div className="flex justify-between mt-8">

          <button
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="px-6 py-3 rounded-lg border disabled:opacity-50"
          >
            Back
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-3 rounded-lg bg-indigo-600 text-white"
            >
              Continue
            </button>
          ) : (
           <button
  onClick={handleFinish}
  disabled={submitting}
  className="px-6 py-3 rounded-lg bg-green-600 text-white disabled:opacity-60"
>
  {submitting ? "Creating Hotel..." : "Finish Setup"}
</button>
          )}

        </div>

      </div>
    </div>
  );
}
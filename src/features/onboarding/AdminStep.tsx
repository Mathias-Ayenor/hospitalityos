import React from "react";
import { OnboardingData } from "./types";

interface AdminStepProps {
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
}

export default function AdminStep({
  data,
  setData,
}: AdminStepProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        Administrator
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div>
          <label className="block mb-2">
            First Name
          </label>

          <input
            className="w-full border rounded-lg px-4 py-3"
            value={data.firstName}
            onChange={(e) =>
              setData({
                ...data,
                firstName: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="block mb-2">
            Last Name
          </label>

          <input
            className="w-full border rounded-lg px-4 py-3"
            value={data.lastName}
            onChange={(e) =>
              setData({
                ...data,
                lastName: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="block mb-2">
            Email
          </label>

          <input
            type="email"
            className="w-full border rounded-lg px-4 py-3"
            value={data.adminEmail}
            onChange={(e) =>
              setData({
                ...data,
                adminEmail: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="block mb-2">
            Phone Number
          </label>

          <input
            className="w-full border rounded-lg px-4 py-3"
            value={data.adminPhone}
            onChange={(e) =>
              setData({
                ...data,
                adminPhone: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="block mb-2">
            Employee Number
          </label>

          <input
            className="w-full border rounded-lg px-4 py-3"
            value={data.employeeNumber}
            onChange={(e) =>
              setData({
                ...data,
                employeeNumber: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="block mb-2">
            Role
          </label>

          <input
            className="w-full border rounded-lg px-4 py-3 bg-slate-100"
            value={data.adminRole}
            readOnly
          />
        </div>

      </div>
    </div>
  );
}
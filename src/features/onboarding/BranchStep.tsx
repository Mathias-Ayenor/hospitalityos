import React from "react";
import { OnboardingData } from "./types";

interface BranchStepProps {
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
}

export default function BranchStep({
  data,
  setData,
}: BranchStepProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        Main Branch
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div>
          <label className="block mb-2">
            Branch Name
          </label>

          <input
            className="w-full border rounded-lg px-4 py-3"
            value={data.branchName}
            onChange={(e) =>
              setData({
                ...data,
                branchName: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="block mb-2">
            Branch Code
          </label>

          <input
            className="w-full border rounded-lg px-4 py-3"
            value={data.branchCode}
            onChange={(e) =>
              setData({
                ...data,
                branchCode: e.target.value.toUpperCase(),
              })
            }
          />
        </div>

        <div>
          <label className="block mb-2">
            Branch Phone
          </label>

          <input
            className="w-full border rounded-lg px-4 py-3"
            value={data.branchPhone}
            onChange={(e) =>
              setData({
                ...data,
                branchPhone: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="block mb-2">
            Branch Email
          </label>

          <input
            type="email"
            className="w-full border rounded-lg px-4 py-3"
            value={data.branchEmail}
            onChange={(e) =>
              setData({
                ...data,
                branchEmail: e.target.value,
              })
            }
          />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-2">
            Branch Address
          </label>

          <textarea
            rows={3}
            className="w-full border rounded-lg px-4 py-3"
            value={data.branchAddress}
            onChange={(e) =>
              setData({
                ...data,
                branchAddress: e.target.value,
              })
            }
          />
        </div>

      </div>
    </div>
  );
}
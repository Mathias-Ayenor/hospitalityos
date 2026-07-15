import React from "react";
import { OnboardingData } from "./types";

interface HotelStepProps {
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
}

export default function HotelStep({
  data,
  setData,
}: HotelStepProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        Hotel Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div>
          <label className="block mb-2">
            Hotel Name
          </label>

          <input
            className="w-full border rounded-lg px-4 py-3"
            value={data.hotelName}
            onChange={(e) =>
              setData({
                ...data,
                hotelName: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="block mb-2">
            Hotel Type
          </label>

          <select
            className="w-full border rounded-lg px-4 py-3"
            value={data.hotelType}
            onChange={(e) =>
              setData({
                ...data,
                hotelType: e.target.value,
              })
            }
          >
            <option>Hotel</option>
            <option>Resort</option>
            <option>Guest House</option>
            <option>Apartment</option>
            <option>Hostel</option>
            <option>Lodge</option>
          </select>
        </div>

      </div>
    </div>
  );
}
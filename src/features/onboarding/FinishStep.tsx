import { OnboardingData } from "./types";

interface FinishStepProps {
  data: OnboardingData;
}

export default function FinishStep({
  data,
}: FinishStepProps) {
  return (
    <div className="space-y-6">

      <h2 className="text-3xl font-bold text-green-600">
        🎉 Ready to Create Your Hotel
      </h2>

      <p className="text-slate-600">
        Please review the information below before completing the setup.
      </p>

      <div className="rounded-xl border bg-white p-6 space-y-3">

        <p>
          <strong>Hotel:</strong> {data.hotelName}
        </p>

        <p>
          <strong>Branch:</strong> {data.branchName}
        </p>

        <p>
          <strong>Administrator:</strong>{" "}
          {data.firstName} {data.lastName}
        </p>

        <p>
          <strong>Email:</strong> {data.adminEmail}
        </p>

        <p>
          <strong>Country:</strong> {data.country}
        </p>

        <p>
          <strong>City:</strong> {data.city}
        </p>

      </div>

    </div>
  );
}
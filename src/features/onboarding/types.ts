export interface OnboardingData {
  // ==========================
  // HOTEL INFORMATION
  // ==========================

  hotelName: string;
  hotelType: string;
  registrationNumber: string;
  taxNumber: string;

  hotelEmail: string;
  hotelPhone: string;
  website: string;

  country: string;
  region: string;
  city: string;

  currency: string;
  timezone: string;

  // ==========================
  // MAIN BRANCH
  // ==========================

  branchName: string;
  branchCode: string;
  branchPhone: string;
  branchEmail: string;
  branchAddress: string;

  // ==========================
  // ADMINISTRATOR
  // ==========================

  firstName: string;
  lastName: string;

  adminEmail: string;
  adminPhone: string;

  employeeNumber: string;

  adminRole: string;
}
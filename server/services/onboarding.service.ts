import { getSupabaseAdmin } from "../supabaseAdmin";

export interface OnboardingData {
  // Hotel
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

  // Branch
  branchName: string;
  branchCode: string;
  branchPhone: string;
  branchEmail: string;
  branchAddress: string;

  // Administrator
  firstName: string;
  lastName: string;
  adminEmail: string;
  adminPhone: string;
  employeeNumber: string;
  adminRole: string;
}

function createSlug(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Date.now()
  );
}

export async function completeOnboarding(
  data: OnboardingData,
  userId: string
) {
  const supabaseAdmin = getSupabaseAdmin();

  const slug = createSlug(data.hotelName);

  const { data: hotel, error } = await supabaseAdmin
    .from("hotels")
    .insert({
      name: data.hotelName,
      slug,
      hotel_type: data.hotelType,
      registration_number: data.registrationNumber || null,
      tax_number: data.taxNumber || null,
      email: data.hotelEmail,
      phone: data.hotelPhone,
      website: data.website || null,
      city: data.city,
      region: data.region,
      country: data.country,
      currency: data.currency,
      timezone: data.timezone,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return hotel;
}
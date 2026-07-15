import { getSupabaseAdmin } from "../supabaseAdmin";

export interface OnboardingData {
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

  branchName: string;
  branchCode: string;
  branchPhone: string;
  branchEmail: string;
  branchAddress: string;

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

  // -----------------------------------
  // HOTEL
  // -----------------------------------

  const slug = createSlug(data.hotelName);

  const { data: hotel, error: hotelError } = await supabaseAdmin
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

  if (hotelError) throw hotelError;

  // -----------------------------------
  // MAIN BRANCH
  // -----------------------------------

  const { data: branch, error: branchError } =
    await supabaseAdmin
      .from("branches")
      .insert({
        hotel_id: hotel.id,

        name: data.branchName,
        code: data.branchCode,

        phone: data.branchPhone || null,
        email: data.branchEmail || null,

        address: data.branchAddress || null,

        city: data.city,
        region: data.region,
        country: data.country,

        is_head_office: true,
      })
      .select()
      .single();

  if (branchError) throw branchError;

  // -----------------------------------
  // ADMIN ROLE
  // -----------------------------------

  const { data: role, error: roleError } =
    await supabaseAdmin
      .from("roles")
      .insert({
        hotel_id: hotel.id,

        name: data.adminRole,

        description:
          "Default system administrator",

        is_system_role: true,
      })
      .select()
      .single();

  if (roleError) throw roleError;

  // -----------------------------------
  // HOTEL USER
  // -----------------------------------

  const { data: hotelUser, error: userError } =
    await supabaseAdmin
      .from("hotel_users")
      .insert({
        hotel_id: hotel.id,

        branch_id: branch.id,

        role_id: role.id,

        auth_user_id: userId,

        employee_number:
          data.employeeNumber || null,

        first_name: data.firstName,

        last_name: data.lastName,

        email: data.adminEmail,

        phone: data.adminPhone,

        is_active: true,
      })
      .select()
      .single();

  if (userError) throw userError;

  return {
    hotel,
    branch,
    role,
    hotelUser,
  };
}
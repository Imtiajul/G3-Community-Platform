export type UserRole = "admin" | "moderator" | "member";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  profile_picture_url?: string | null;
  role: UserRole;
  email_verified: boolean;
  batch?: number | null;
  registration_no?: string | null;
  verification_status: VerificationStatus;
  is_staff?: boolean;
}

export interface VerificationDetails {
  verification_status: VerificationStatus;
  rejection_reason?: string | null;
  missing_fields?: string[];
  applied_at?: string | null;
  reviewed_at?: string | null;
}

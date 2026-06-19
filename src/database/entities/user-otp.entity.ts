export interface UserOtpEntity {
  id: number;
  user_id?: number | null;
  mobile: string;
  otp_code: string;
  is_used?: boolean | null;
  expires_at: string;
  created_at?: string | null;
}

export interface CreateUserOtpInput {
  user_id?: number;
  mobile: string;
  otp_code: string;
  is_used?: boolean;
  expires_at: string;
}

export interface UserEntity {
  user_id: number;
  name: string;
  mobile: string;
  email: string;
  address?: string | null;
  password?: string | null;
  status: string;
  role_id?: string | null;
  firebase_uid?: string | null;
  is_profile_completed: boolean;
  token?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  name: string;
  mobile: string;
  email: string;
  address?: string;
  password?: string;
  status: string;
  role_id?: string;
  firebase_uid?: string;
  is_profile_completed: boolean;
}

export type UpdateUserInput = Partial<
  Pick<
    UserEntity,
    | 'name'
    | 'mobile'
    | 'email'
    | 'address'
    | 'password'
    | 'status'
    | 'role_id'
    | 'firebase_uid'
    | 'is_profile_completed'
    | 'token'
  >
>;

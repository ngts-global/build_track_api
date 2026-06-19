export interface AuthenticatedUser {
  userId: number;
  mobile: string;
  email: string;
  name: string;
  role: string;
  firebaseUid?: string;
}

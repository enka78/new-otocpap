export interface User {
  id: string;
  email?: string;
  role?: string;
  user_metadata?: {
    full_name?: string;
  };
}

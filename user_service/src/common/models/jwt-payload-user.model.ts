// use snake_case for better compatibility with other languages
export interface JwtPayloadUser {
  id: number;
  email: string;
  is_admin: boolean;
  device_id?: string;
}

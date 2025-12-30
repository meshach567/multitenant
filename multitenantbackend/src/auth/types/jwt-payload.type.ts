export interface JwtPayload {
  sub: string;
  role: string;
  businessId?: string;
}

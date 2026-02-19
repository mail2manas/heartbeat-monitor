export interface CouponType {
  id: string;
  name: string;        // e.g. "Round", "Card", "Rectangular"
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CouponTypeFormData {
  name: string;
  description: string;
}

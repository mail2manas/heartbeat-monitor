import type { CouponType, CouponTypeFormData } from "@/models/CouponType";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let mockCouponTypes: CouponType[] = [
  { id: "ct-1", name: "Round", description: "Circular shaped coupon", createdAt: "2025-11-01T10:00:00Z", updatedAt: "2025-11-01T10:00:00Z" },
  { id: "ct-2", name: "Card", description: "Card shaped coupon", createdAt: "2025-11-01T10:00:00Z", updatedAt: "2025-11-01T10:00:00Z" },
  { id: "ct-3", name: "Rectangular", description: "Rectangular shaped coupon", createdAt: "2025-11-01T10:00:00Z", updatedAt: "2025-11-01T10:00:00Z" },
];

export const couponTypeService = {
  getAll: async (): Promise<CouponType[]> => { await delay(300); return [...mockCouponTypes]; },

  create: async (form: CouponTypeFormData): Promise<CouponType> => {
    await delay(400);
    const now = new Date().toISOString();
    const ct: CouponType = { id: `ct-${Date.now()}`, ...form, createdAt: now, updatedAt: now };
    mockCouponTypes.push(ct);
    return ct;
  },

  update: async (id: string, form: CouponTypeFormData): Promise<CouponType> => {
    await delay(400);
    const idx = mockCouponTypes.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Not found");
    mockCouponTypes[idx] = { ...mockCouponTypes[idx], ...form, updatedAt: new Date().toISOString() };
    return mockCouponTypes[idx];
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    mockCouponTypes = mockCouponTypes.filter((c) => c.id !== id);
  },
};

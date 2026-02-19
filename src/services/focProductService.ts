import type { FOCProduct, FOCProductFormData } from "@/models/FOCProduct";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const FOC_CATEGORIES = ["Beverages", "Snacks", "Dairy", "Personal Care", "Household"];

let mockFOCProducts: FOCProduct[] = [
  { id: "foc-1", name: "Coca Cola Zero 200ml", skuCode: "CCZ200", mrp: 0, category: "Beverages", photoUrl: "/placeholder.svg", createdAt: "2025-11-01T10:00:00Z", updatedAt: "2025-11-01T10:00:00Z" },
  { id: "foc-2", name: "Lays Classic 25g", skuCode: "LAY025", mrp: 0, category: "Snacks", photoUrl: "/placeholder.svg", createdAt: "2025-11-01T10:00:00Z", updatedAt: "2025-11-01T10:00:00Z" },
  { id: "foc-3", name: "Sprite Can 150ml", skuCode: "SPR150", mrp: 0, category: "Beverages", photoUrl: "/placeholder.svg", createdAt: "2025-11-01T10:00:00Z", updatedAt: "2025-11-01T10:00:00Z" },
];

export const focProductService = {
  getAll: async (): Promise<FOCProduct[]> => { await delay(300); return [...mockFOCProducts]; },
  getCategories: async (): Promise<string[]> => { await delay(100); return FOC_CATEGORIES; },

  create: async (form: FOCProductFormData): Promise<FOCProduct> => {
    await delay(400);
    const now = new Date().toISOString();
    const p: FOCProduct = { id: `foc-${Date.now()}`, ...form, createdAt: now, updatedAt: now };
    mockFOCProducts.push(p);
    return p;
  },

  update: async (id: string, form: FOCProductFormData): Promise<FOCProduct> => {
    await delay(400);
    const idx = mockFOCProducts.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Not found");
    mockFOCProducts[idx] = { ...mockFOCProducts[idx], ...form, updatedAt: new Date().toISOString() };
    return mockFOCProducts[idx];
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    mockFOCProducts = mockFOCProducts.filter((p) => p.id !== id);
  },
};

import type { SchemeDefinition, SchemeFormData, SKU, PackSize, SKUPackEntry } from "@/models/Scheme";
import type { CouponType } from "@/models/CouponType";
import type { FOCProduct } from "@/models/FOCProduct";

const INDIAN_STATES = [
  { code: "AP", name: "Andhra Pradesh" }, { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" }, { code: "BR", name: "Bihar" },
  { code: "CG", name: "Chhattisgarh" }, { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" }, { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" }, { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" }, { code: "KL", name: "Kerala" },
  { code: "MP", name: "Madhya Pradesh" }, { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" }, { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" }, { code: "NL", name: "Nagaland" },
  { code: "OD", name: "Odisha" }, { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" }, { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" }, { code: "TS", name: "Telangana" },
  { code: "TR", name: "Tripura" }, { code: "UP", name: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand" }, { code: "WB", name: "West Bengal" },
  { code: "DL", name: "Delhi" },
];

const MOCK_SKUS: SKU[] = [
  { id: "sku-1", name: "Coca Cola", code: "CC001" },
  { id: "sku-2", name: "Pepsi", code: "PP001" },
  { id: "sku-3", name: "Sprite", code: "SP001" },
  { id: "sku-4", name: "Fanta", code: "FN001" },
  { id: "sku-5", name: "Thums Up", code: "TU001" },
];

const MOCK_PACK_SIZES: PackSize[] = [
  { id: "ps-1", label: "200ml", skuId: "sku-1" },
  { id: "ps-2", label: "500ml", skuId: "sku-1" },
  { id: "ps-3", label: "1L", skuId: "sku-1" },
  { id: "ps-4", label: "2L", skuId: "sku-1" },
  { id: "ps-5", label: "200ml", skuId: "sku-2" },
  { id: "ps-6", label: "500ml", skuId: "sku-2" },
  { id: "ps-7", label: "1L", skuId: "sku-2" },
  { id: "ps-8", label: "250ml", skuId: "sku-3" },
  { id: "ps-9", label: "500ml", skuId: "sku-3" },
  { id: "ps-10", label: "300ml", skuId: "sku-4" },
  { id: "ps-11", label: "500ml", skuId: "sku-4" },
  { id: "ps-12", label: "200ml", skuId: "sku-5" },
  { id: "ps-13", label: "750ml", skuId: "sku-5" },
];

// FOC SKUs (for points-based schemes)
const FOC_SKUS: SKU[] = [
  { id: "foc-sku-1", name: "Coca Cola Zero 200ml", code: "CCZ200" },
  { id: "foc-sku-2", name: "Lays Classic 25g", code: "LAY025" },
  { id: "foc-sku-3", name: "Sprite Can 150ml", code: "SPR150" },
];

const FOC_PACK_SIZES: PackSize[] = [
  { id: "foc-ps-1", label: "200ml", skuId: "foc-sku-1" },
  { id: "foc-ps-2", label: "25g", skuId: "foc-sku-2" },
  { id: "foc-ps-3", label: "150ml", skuId: "foc-sku-3" },
];

let mockSchemes: SchemeDefinition[] = [
  {
    id: "scheme-1",
    schemeCode: "SCH-20251201-001",
    name: "Summer Promo - Coca Cola 500ml",
    description: "Summer promotional scheme for Coca Cola products",
    valueType: "rupees",
    startDate: "2025-12-01",
    endDate: "2026-03-31",
    fixedStateCodes: ["MH", "GJ"],
    fixedStateNames: ["Maharashtra", "Gujarat"],
    skuPackEntries: [
      {
        skuId: "sku-1", skuName: "Coca Cola", packSizeId: "ps-2", packSizeLabel: "500ml",
        couponCount: 5000, couponValue: 10, expiryDate: "2026-03-31",
        couponTypeId: "ct-1", couponTypeName: "Round", regionOverrides: [],
      },
    ],
    status: "active", createdAt: "2025-12-01T10:00:00Z", updatedAt: "2025-12-15T10:00:00Z",
  },
];

let schemeCounter = 1;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const schemeService = {
  getStates: async () => { await delay(200); return INDIAN_STATES; },
  getSKUs: async (valueType: "rupees" | "points" = "rupees") => {
    await delay(200);
    return valueType === "points" ? FOC_SKUS : MOCK_SKUS;
  },
  getPackSizes: async (skuId: string) => {
    await delay(200);
    const allPacks = [...MOCK_PACK_SIZES, ...FOC_PACK_SIZES];
    return allPacks.filter((p) => p.skuId === skuId);
  },
  getCouponTypes: async (): Promise<CouponType[]> => {
    await delay(200);
    return [
      { id: "ct-1", name: "Round", description: "Circular", createdAt: "", updatedAt: "" },
      { id: "ct-2", name: "Card", description: "Card", createdAt: "", updatedAt: "" },
      { id: "ct-3", name: "Rectangular", description: "Rectangular", createdAt: "", updatedAt: "" },
    ];
  },

  generateSchemeCode: () => {
    schemeCounter++;
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `SCH-${date}-${String(schemeCounter).padStart(3, "0")}`;
  },

  getSchemes: async () => { await delay(400); return [...mockSchemes]; },

  createScheme: async (form: SchemeFormData) => {
    await delay(500);
    const now = new Date().toISOString();
    const stateNames = form.fixedStateCodes.map((c) => INDIAN_STATES.find((s) => s.code === c)?.name || c);
    const scheme: SchemeDefinition = {
      id: `scheme-${Date.now()}`,
      schemeCode: schemeService.generateSchemeCode(),
      name: form.name,
      description: form.description,
      valueType: form.valueType,
      startDate: form.startDate,
      endDate: form.endDate,
      fixedStateCodes: form.fixedStateCodes,
      fixedStateNames: stateNames,
      skuPackEntries: form.skuPackEntries,
      status: "draft", createdAt: now, updatedAt: now,
    };
    mockSchemes.push(scheme);
    return scheme;
  },

  deleteScheme: async (id: string) => { await delay(300); mockSchemes = mockSchemes.filter((s) => s.id !== id); },
};

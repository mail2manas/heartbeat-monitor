import type { SchemeDefinition, SchemeFormData, SKU, PackSize } from "@/models/Scheme";

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

let mockSchemes: SchemeDefinition[] = [
  {
    id: "scheme-1",
    name: "Summer Promo - Coca Cola 500ml",
    skuId: "sku-1", skuName: "Coca Cola",
    packSizeId: "ps-2", packSizeLabel: "500ml",
    fixedStates: [
      { stateCode: "MH", stateName: "Maharashtra", valueType: "rupees", value: 10, noOfCoupons: 5000 },
      { stateCode: "GJ", stateName: "Gujarat", valueType: "rupees", value: 10, noOfCoupons: 3000 },
    ],
    customStates: [
      { stateCode: "KA", stateName: "Karnataka", valueType: "points", value: 50, noOfCoupons: 2000 },
      { stateCode: "TN", stateName: "Tamil Nadu", valueType: "rupees", value: 15, noOfCoupons: 4000 },
    ],
    status: "active", createdAt: "2025-12-01T10:00:00Z", updatedAt: "2025-12-15T10:00:00Z",
  },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const schemeService = {
  getStates: async () => { await delay(200); return INDIAN_STATES; },
  getSKUs: async () => { await delay(200); return MOCK_SKUS; },
  getPackSizes: async (skuId: string) => { await delay(200); return MOCK_PACK_SIZES.filter((p) => p.skuId === skuId); },

  getSchemes: async () => {
    await delay(400);
    return [...mockSchemes];
  },

  createScheme: async (form: SchemeFormData) => {
    await delay(500);
    const sku = MOCK_SKUS.find((s) => s.id === form.skuId)!;
    const pack = MOCK_PACK_SIZES.find((p) => p.id === form.packSizeId)!;
    const now = new Date().toISOString();

    const scheme: SchemeDefinition = {
      id: `scheme-${Date.now()}`,
      name: form.name,
      skuId: form.skuId, skuName: sku.name,
      packSizeId: form.packSizeId, packSizeLabel: pack.label,
      fixedStates: form.fixedStatesCodes.map((code) => {
        const st = INDIAN_STATES.find((s) => s.code === code)!;
        return { stateCode: code, stateName: st.name, valueType: form.fixedValueType, value: form.fixedValue, noOfCoupons: form.fixedNoOfCoupons };
      }),
      customStates: form.customStates,
      status: "draft", createdAt: now, updatedAt: now,
    };
    mockSchemes.push(scheme);
    return scheme;
  },

  deleteScheme: async (id: string) => {
    await delay(300);
    mockSchemes = mockSchemes.filter((s) => s.id !== id);
  },
};

export interface SKU {
  id: string;
  name: string;
  code: string;
}

export interface PackSize {
  id: string;
  label: string;
  skuId: string;
}

export type CouponValueType = "rupees" | "points";

export interface StateConfig {
  stateCode: string;
  stateName: string;
  valueType: CouponValueType;
  value: number;
  noOfCoupons: number;
}

/** Each SKU+Pack combination in the scheme */
export interface SKUPackEntry {
  skuId: string;
  skuName: string;
  packSizeId: string;
  packSizeLabel: string;
  couponCount: number;
  couponValue: number;
  expiryDate: string;          // ISO date
  couponTypeId: string;
  couponTypeName: string;
  /** Custom overrides per region for this SKU+Pack */
  regionOverrides: RegionOverride[];
}

export interface RegionOverride {
  stateCodes: string[];
  stateNames: string[];
  valueType: CouponValueType;
  value: number;
  couponCount: number;
}

export interface SchemeDefinition {
  id: string;
  schemeCode: string;           // auto-generated
  name: string;
  description: string;
  valueType: CouponValueType;
  startDate: string;
  endDate: string;
  /** Fixed-value state codes */
  fixedStateCodes: string[];
  fixedStateNames: string[];
  skuPackEntries: SKUPackEntry[];
  status: "draft" | "active" | "expired";
  createdAt: string;
  updatedAt: string;
}

export interface SchemeFormData {
  name: string;
  description: string;
  valueType: CouponValueType;
  startDate: string;
  endDate: string;
  fixedStateCodes: string[];
  /** Selected SKU+Pack combos with their details */
  skuPackEntries: SKUPackEntry[];
}

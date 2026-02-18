export interface SKU {
  id: string;
  name: string;
  code: string;
}

export interface PackSize {
  id: string;
  label: string;       // e.g. "500ml", "1L", "250g"
  skuId: string;
}

export type CouponValueType = "rupees" | "points";

export interface StateConfig {
  stateCode: string;
  stateName: string;
  valueType: CouponValueType;
  value: number;         // ₹ amount or points count
  noOfCoupons: number;
}

export interface SchemeDefinition {
  id: string;
  name: string;
  skuId: string;
  skuName: string;
  packSizeId: string;
  packSizeLabel: string;
  /** States where value is fixed (same for all) */
  fixedStates: StateConfig[];
  /** Other states where values can differ */
  customStates: StateConfig[];
  status: "draft" | "active" | "expired";
  createdAt: string;
  updatedAt: string;
}

export interface SchemeFormData {
  name: string;
  skuId: string;
  packSizeId: string;
  fixedStatesCodes: string[];
  fixedValueType: CouponValueType;
  fixedValue: number;
  fixedNoOfCoupons: number;
  customStates: StateConfig[];
}

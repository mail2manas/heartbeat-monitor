export interface FOCProduct {
  id: string;
  name: string;
  skuCode: string;
  mrp: number;
  category: string;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface FOCProductFormData {
  name: string;
  skuCode: string;
  mrp: number;
  category: string;
  photoUrl: string;
}

import { useState, useEffect, useCallback } from "react";
import type { SchemeDefinition, SchemeFormData, SKU, PackSize, SKUPackEntry, RegionOverride, CouponValueType } from "@/models/Scheme";
import type { CouponType } from "@/models/CouponType";
import { schemeService } from "@/services/schemeService";

interface IndianState { code: string; name: string; }

const emptyForm: SchemeFormData = {
  name: "", description: "", valueType: "rupees",
  startDate: "", endDate: "", fixedStateCodes: [], skuPackEntries: [],
};

export function useSchemeViewModel() {
  const [schemes, setSchemes] = useState<SchemeDefinition[]>([]);
  const [skus, setSKUs] = useState<SKU[]>([]);
  const [packSizesMap, setPackSizesMap] = useState<Record<string, PackSize[]>>({});
  const [states, setStates] = useState<IndianState[]>([]);
  const [couponTypes, setCouponTypes] = useState<CouponType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wizard
  const [step, setStep] = useState(1);
  const [schemeCode, setSchemeCode] = useState("");
  const [formData, setFormData] = useState<SchemeFormData>({ ...emptyForm });

  const fetchSchemes = useCallback(async () => {
    setIsLoading(true);
    try {
      const [schemesRes, statesRes, ctRes] = await Promise.all([
        schemeService.getSchemes(), schemeService.getStates(), schemeService.getCouponTypes(),
      ]);
      setSchemes(schemesRes);
      setStates(statesRes);
      setCouponTypes(ctRes);
    } catch { setError("Failed to load data"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchSchemes(); }, [fetchSchemes]);

  // Load SKUs based on value type
  const loadSKUs = useCallback(async (valueType: CouponValueType) => {
    const res = await schemeService.getSKUs(valueType);
    setSKUs(res);
    setPackSizesMap({});
  }, []);

  const loadPackSizes = useCallback(async (skuId: string) => {
    if (packSizesMap[skuId]) return;
    const packs = await schemeService.getPackSizes(skuId);
    setPackSizesMap((prev) => ({ ...prev, [skuId]: packs }));
  }, [packSizesMap]);

  const updateForm = useCallback((patch: Partial<SchemeFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

  // SKU+Pack entry management
  const addSKUPackEntry = useCallback((entry: SKUPackEntry) => {
    setFormData((prev) => ({ ...prev, skuPackEntries: [...prev.skuPackEntries, entry] }));
  }, []);

  const updateSKUPackEntry = useCallback((index: number, patch: Partial<SKUPackEntry>) => {
    setFormData((prev) => {
      const updated = [...prev.skuPackEntries];
      updated[index] = { ...updated[index], ...patch };
      return { ...prev, skuPackEntries: updated };
    });
  }, []);

  const removeSKUPackEntry = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev, skuPackEntries: prev.skuPackEntries.filter((_, i) => i !== index),
    }));
  }, []);

  // Region overrides for a SKU+Pack entry
  const addRegionOverride = useCallback((entryIndex: number, override: RegionOverride) => {
    setFormData((prev) => {
      const entries = [...prev.skuPackEntries];
      entries[entryIndex] = {
        ...entries[entryIndex],
        regionOverrides: [...entries[entryIndex].regionOverrides, override],
      };
      return { ...prev, skuPackEntries: entries };
    });
  }, []);

  const updateRegionOverride = useCallback((entryIndex: number, overrideIndex: number, patch: Partial<RegionOverride>) => {
    setFormData((prev) => {
      const entries = [...prev.skuPackEntries];
      const overrides = [...entries[entryIndex].regionOverrides];
      overrides[overrideIndex] = { ...overrides[overrideIndex], ...patch };
      entries[entryIndex] = { ...entries[entryIndex], regionOverrides: overrides };
      return { ...prev, skuPackEntries: entries };
    });
  }, []);

  const removeRegionOverride = useCallback((entryIndex: number, overrideIndex: number) => {
    setFormData((prev) => {
      const entries = [...prev.skuPackEntries];
      entries[entryIndex] = {
        ...entries[entryIndex],
        regionOverrides: entries[entryIndex].regionOverrides.filter((_, i) => i !== overrideIndex),
      };
      return { ...prev, skuPackEntries: entries };
    });
  }, []);

  const resetWizard = useCallback(() => {
    setStep(1);
    setFormData({ ...emptyForm });
    setSchemeCode(schemeService.generateSchemeCode());
    setSKUs([]);
    setPackSizesMap({});
  }, []);

  // Initialize code on first use
  useEffect(() => { setSchemeCode(schemeService.generateSchemeCode()); }, []);

  const submitScheme = useCallback(async () => {
    setIsSubmitting(true);
    try { await schemeService.createScheme(formData); await fetchSchemes(); resetWizard(); }
    catch { setError("Failed to create scheme"); }
    finally { setIsSubmitting(false); }
  }, [formData, fetchSchemes, resetWizard]);

  const deleteScheme = useCallback(async (id: string) => {
    setIsSubmitting(true);
    try { await schemeService.deleteScheme(id); await fetchSchemes(); }
    finally { setIsSubmitting(false); }
  }, [fetchSchemes]);

  // Available states for custom overrides (exclude fixed)
  const availableCustomStates = states.filter((s) => !formData.fixedStateCodes.includes(s.code));

  return {
    schemes, skus, packSizesMap, states, couponTypes, isLoading, isSubmitting, error,
    step, setStep, schemeCode, formData, updateForm,
    loadSKUs, loadPackSizes,
    addSKUPackEntry, updateSKUPackEntry, removeSKUPackEntry,
    addRegionOverride, updateRegionOverride, removeRegionOverride,
    availableCustomStates, submitScheme, deleteScheme, resetWizard,
  };
}

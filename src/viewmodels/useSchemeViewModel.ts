import { useState, useEffect, useCallback } from "react";
import type { SchemeDefinition, SchemeFormData, SKU, PackSize, StateConfig, CouponValueType } from "@/models/Scheme";
import { schemeService } from "@/services/schemeService";

interface IndianState { code: string; name: string; }

export function useSchemeViewModel() {
  const [schemes, setSchemes] = useState<SchemeDefinition[]>([]);
  const [skus, setSKUs] = useState<SKU[]>([]);
  const [packSizes, setPackSizes] = useState<PackSize[]>([]);
  const [states, setStates] = useState<IndianState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wizard state
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SchemeFormData>({
    name: "", skuId: "", packSizeId: "",
    fixedStatesCodes: [], fixedValueType: "rupees", fixedValue: 0, fixedNoOfCoupons: 0,
    customStates: [],
  });

  const fetchSchemes = useCallback(async () => {
    setIsLoading(true);
    try {
      const [schemesRes, skuRes, statesRes] = await Promise.all([
        schemeService.getSchemes(),
        schemeService.getSKUs(),
        schemeService.getStates(),
      ]);
      setSchemes(schemesRes);
      setSKUs(skuRes);
      setStates(statesRes);
    } catch {
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSchemes(); }, [fetchSchemes]);

  const loadPackSizes = useCallback(async (skuId: string) => {
    const packs = await schemeService.getPackSizes(skuId);
    setPackSizes(packs);
  }, []);

  const updateForm = useCallback((patch: Partial<SchemeFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

  const addCustomState = useCallback((stateCode: string) => {
    const st = states.find((s) => s.code === stateCode);
    if (!st) return;
    setFormData((prev) => ({
      ...prev,
      customStates: [...prev.customStates, { stateCode, stateName: st.name, valueType: "rupees", value: 0, noOfCoupons: 0 }],
    }));
  }, [states]);

  const updateCustomState = useCallback((index: number, patch: Partial<StateConfig>) => {
    setFormData((prev) => {
      const updated = [...prev.customStates];
      updated[index] = { ...updated[index], ...patch };
      return { ...prev, customStates: updated };
    });
  }, []);

  const removeCustomState = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      customStates: prev.customStates.filter((_, i) => i !== index),
    }));
  }, []);

  const resetWizard = useCallback(() => {
    setStep(1);
    setFormData({ name: "", skuId: "", packSizeId: "", fixedStatesCodes: [], fixedValueType: "rupees", fixedValue: 0, fixedNoOfCoupons: 0, customStates: [] });
    setPackSizes([]);
  }, []);

  const submitScheme = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await schemeService.createScheme(formData);
      await fetchSchemes();
      resetWizard();
    } catch {
      setError("Failed to create scheme");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, fetchSchemes, resetWizard]);

  const deleteScheme = useCallback(async (id: string) => {
    setIsSubmitting(true);
    try {
      await schemeService.deleteScheme(id);
      await fetchSchemes();
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchSchemes]);

  // Available states for custom (exclude fixed)
  const availableCustomStates = states.filter(
    (s) => !formData.fixedStatesCodes.includes(s.code) && !formData.customStates.some((cs) => cs.stateCode === s.code)
  );

  return {
    schemes, skus, packSizes, states, isLoading, isSubmitting, error,
    step, setStep, formData, updateForm,
    loadPackSizes, addCustomState, updateCustomState, removeCustomState,
    availableCustomStates, submitScheme, deleteScheme, resetWizard,
  };
}

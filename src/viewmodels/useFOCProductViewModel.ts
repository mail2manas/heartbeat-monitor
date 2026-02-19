import { useState, useEffect, useCallback } from "react";
import type { FOCProduct, FOCProductFormData } from "@/models/FOCProduct";
import { focProductService } from "@/services/focProductService";

export function useFOCProductViewModel() {
  const [items, setItems] = useState<FOCProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const [products, cats] = await Promise.all([focProductService.getAll(), focProductService.getCategories()]);
      setItems(products);
      setCategories(cats);
    } catch { setError("Failed to load FOC products"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = useCallback(async (form: FOCProductFormData) => {
    setIsSubmitting(true);
    try { await focProductService.create(form); await fetch(); }
    catch { setError("Failed to create"); }
    finally { setIsSubmitting(false); }
  }, [fetch]);

  const update = useCallback(async (id: string, form: FOCProductFormData) => {
    setIsSubmitting(true);
    try { await focProductService.update(id, form); await fetch(); }
    catch { setError("Failed to update"); }
    finally { setIsSubmitting(false); }
  }, [fetch]);

  const remove = useCallback(async (id: string) => {
    setIsSubmitting(true);
    try { await focProductService.delete(id); await fetch(); }
    finally { setIsSubmitting(false); }
  }, [fetch]);

  return { items, categories, isLoading, isSubmitting, error, create, update, remove };
}

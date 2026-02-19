import { useState, useEffect, useCallback } from "react";
import type { CouponType, CouponTypeFormData } from "@/models/CouponType";
import { couponTypeService } from "@/services/couponTypeService";

export function useCouponTypeViewModel() {
  const [items, setItems] = useState<CouponType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try { setItems(await couponTypeService.getAll()); }
    catch { setError("Failed to load coupon types"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = useCallback(async (form: CouponTypeFormData) => {
    setIsSubmitting(true);
    try { await couponTypeService.create(form); await fetch(); }
    catch { setError("Failed to create"); }
    finally { setIsSubmitting(false); }
  }, [fetch]);

  const update = useCallback(async (id: string, form: CouponTypeFormData) => {
    setIsSubmitting(true);
    try { await couponTypeService.update(id, form); await fetch(); }
    catch { setError("Failed to update"); }
    finally { setIsSubmitting(false); }
  }, [fetch]);

  const remove = useCallback(async (id: string) => {
    setIsSubmitting(true);
    try { await couponTypeService.delete(id); await fetch(); }
    finally { setIsSubmitting(false); }
  }, [fetch]);

  return { items, isLoading, isSubmitting, error, create, update, remove };
}

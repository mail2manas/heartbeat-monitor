export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export const debounce = <T extends (...args: unknown[]) => void>(fn: T, ms: number): T => {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
};

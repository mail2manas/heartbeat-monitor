import { useState } from "react";
import { useSchemeViewModel } from "@/viewmodels/useSchemeViewModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Plus, Trash2, ArrowRight, ArrowLeft, Check, QrCode, X, IndianRupee, Gift, CalendarIcon } from "lucide-react";
import type { CouponValueType, SKUPackEntry, RegionOverride } from "@/models/Scheme";

export default function SchemeList() {
  const vm = useSchemeViewModel();
  const [wizardOpen, setWizardOpen] = useState(false);

  const handleOpenWizard = () => { vm.resetWizard(); setWizardOpen(true); };
  const handleClose = () => { setWizardOpen(false); vm.resetWizard(); };
  const handleSubmit = async () => { await vm.submitScheme(); setWizardOpen(false); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">QR Coupon Schemes</h1>
          <p className="text-sm text-muted-foreground mt-1">Define schemes for generating QR-based coupons</p>
        </div>
        <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenWizard}><Plus className="mr-2 h-4 w-4" />Create Scheme</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><QrCode className="h-5 w-5" />New Coupon Scheme</DialogTitle>
            </DialogHeader>
            <SchemeWizard vm={vm} onSubmit={handleSubmit} onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {vm.isLoading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">Loading schemes...</div>
          ) : vm.schemes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <QrCode className="h-10 w-10 mb-2 opacity-40" /><p>No schemes created yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>States</TableHead>
                  <TableHead>SKU/Packs</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vm.schemes.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.schemeCode}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      <Badge variant={s.valueType === "rupees" ? "default" : "secondary"}>
                        {s.valueType === "rupees" ? "₹ Cash" : "Points"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {s.fixedStateCodes.slice(0, 3).map((c) => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                        {s.fixedStateCodes.length > 3 && <Badge variant="outline" className="text-xs">+{s.fixedStateCodes.length - 3}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{s.skuPackEntries.length} combo(s)</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.startDate} – {s.endDate}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === "active" ? "default" : s.status === "draft" ? "secondary" : "destructive"}>{s.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => vm.deleteScheme(s.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─────────── Wizard ─────────── */

function SchemeWizard({ vm, onSubmit, onClose }: { vm: ReturnType<typeof useSchemeViewModel>; onSubmit: () => void; onClose: () => void }) {
  const { step, setStep, schemeCode, formData, updateForm, skus, packSizesMap, loadSKUs, loadPackSizes, states, couponTypes,
    addSKUPackEntry, updateSKUPackEntry, removeSKUPackEntry, addRegionOverride, removeRegionOverride, updateRegionOverride,
    availableCustomStates, isSubmitting } = vm;

  const stepLabels = ["Basics & Dates", "Region & Value Type", "SKU & Pack Size", "Coupon Details", "Review"];

  // Local state for adding SKU+Pack combos
  const [addSkuId, setAddSkuId] = useState("");
  const [addPackIds, setAddPackIds] = useState<string[]>([]);

  const canStep1 = formData.name.trim() && formData.startDate && formData.endDate;
  const canStep2 = formData.fixedStateCodes.length > 0;
  const canStep3 = formData.skuPackEntries.length > 0;
  const canStep4 = formData.skuPackEntries.every((e) => e.couponCount > 0 && e.couponValue > 0 && e.expiryDate && e.couponTypeId);

  const handleValueTypeChange = (vt: CouponValueType) => {
    updateForm({ valueType: vt, skuPackEntries: [] });
    loadSKUs(vt);
  };

  const handleAddSKUPacks = () => {
    const sku = skus.find((s) => s.id === addSkuId);
    if (!sku) return;
    const packs = packSizesMap[addSkuId] || [];
    addPackIds.forEach((pid) => {
      const pack = packs.find((p) => p.id === pid);
      if (!pack) return;
      // avoid duplicates
      if (formData.skuPackEntries.some((e) => e.skuId === addSkuId && e.packSizeId === pid)) return;
      addSKUPackEntry({
        skuId: sku.id, skuName: sku.name, packSizeId: pid, packSizeLabel: pack.label,
        couponCount: 0, couponValue: 0, expiryDate: formData.endDate || "",
        couponTypeId: "", couponTypeName: "", regionOverrides: [],
      });
    });
    setAddSkuId("");
    setAddPackIds([]);
  };

  const selectAllStates = () => updateForm({ fixedStateCodes: states.map((s) => s.code) });
  const deselectAllStates = () => updateForm({ fixedStateCodes: [] });

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-1">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors shrink-0 ${
              step > i + 1 ? "bg-primary text-primary-foreground" : step === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {step > i + 1 ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            <span className={`text-xs whitespace-nowrap hidden md:inline ${step === i + 1 ? "font-medium text-foreground" : "text-muted-foreground"}`}>{label}</span>
            {i < stepLabels.length - 1 && <Separator className="w-4 shrink-0" />}
          </div>
        ))}
      </div>

      {/* Step 1: Basics & Dates */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Scheme Code</Label>
              <Input value={schemeCode} disabled className="bg-muted font-mono" />
            </div>
            <div className="space-y-2">
              <Label>Scheme Name *</Label>
              <Input placeholder="e.g. Summer Promo 2026" value={formData.name} onChange={(e) => updateForm({ name: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="Describe the scheme purpose" value={formData.description} onChange={(e) => updateForm({ description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DatePickerField label="Start Date *" value={formData.startDate} onChange={(d) => updateForm({ startDate: d })} />
            <DatePickerField label="End Date *" value={formData.endDate} onChange={(d) => updateForm({ endDate: d })} />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!canStep1}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* Step 2: Region & Value Type */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Value Type *</Label>
            <Select value={formData.valueType} onValueChange={(v) => handleValueTypeChange(v as CouponValueType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rupees"><span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />Cash (Rupees)</span></SelectItem>
                <SelectItem value="points"><span className="flex items-center gap-1"><Gift className="h-3 w-3" />Points (FOC Products)</span></SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Select States/Regions *</CardTitle>
                  <CardDescription>Fixed value states for this scheme</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllStates}>Select All</Button>
                  <Button variant="outline" size="sm" onClick={deselectAllStates}>Clear</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {states.map((st) => {
                  const isChecked = formData.fixedStateCodes.includes(st.code);
                  return (
                    <label key={st.code} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={isChecked} onCheckedChange={(checked) => {
                        const codes = checked ? [...formData.fixedStateCodes, st.code] : formData.fixedStateCodes.filter((c) => c !== st.code);
                        updateForm({ fixedStateCodes: codes });
                      }} />
                      {st.name}
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
            <Button onClick={() => { loadSKUs(formData.valueType); setStep(3); }} disabled={!canStep2}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* Step 3: SKU & Pack Selection */}
      {step === 3 && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Add SKU + Pack Combinations</CardTitle>
              <CardDescription>{formData.valueType === "points" ? "Only FOC products available for points-based schemes" : "Select any product SKU"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">SKU</Label>
                  <Select value={addSkuId} onValueChange={(v) => { setAddSkuId(v); setAddPackIds([]); loadPackSizes(v); }}>
                    <SelectTrigger><SelectValue placeholder="Select SKU" /></SelectTrigger>
                    <SelectContent>
                      {skus.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" onClick={handleAddSKUPacks} disabled={!addSkuId || addPackIds.length === 0}>
                  <Plus className="mr-1 h-4 w-4" />Add
                </Button>
              </div>
              {addSkuId && packSizesMap[addSkuId] && (
                <div className="flex flex-wrap gap-2 border rounded-md p-3">
                  {packSizesMap[addSkuId].map((p) => {
                    const selected = addPackIds.includes(p.id);
                    return (
                      <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={selected} onCheckedChange={(checked) => {
                          setAddPackIds(checked ? [...addPackIds, p.id] : addPackIds.filter((id) => id !== p.id));
                        }} />
                        {p.label}
                      </label>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {formData.skuPackEntries.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Selected Combinations ({formData.skuPackEntries.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Pack</TableHead>
                      <TableHead className="text-right">Remove</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.skuPackEntries.map((e, i) => (
                      <TableRow key={`${e.skuId}-${e.packSizeId}`}>
                        <TableCell>{e.skuName}</TableCell>
                        <TableCell><Badge variant="outline">{e.packSizeLabel}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => removeSKUPackEntry(i)}><X className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
            <Button onClick={() => setStep(4)} disabled={!canStep3}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* Step 4: Coupon Details (Editable Table) */}
      {step === 4 && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Coupon Details per SKU+Pack</CardTitle>
              <CardDescription>Define count, value, expiry and coupon type for each combination. Add region-level custom overrides if needed.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU / Pack</TableHead>
                    <TableHead>Coupon Count</TableHead>
                    <TableHead>{formData.valueType === "rupees" ? "Value (₹)" : "Points"}</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Coupon Type</TableHead>
                    <TableHead>Custom</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.skuPackEntries.map((entry, i) => (
                    <SKUPackDetailRow key={`${entry.skuId}-${entry.packSizeId}`}
                      entry={entry} index={i} valueType={formData.valueType}
                      couponTypes={couponTypes} availableStates={availableCustomStates}
                      onUpdate={(patch) => updateSKUPackEntry(i, patch)}
                      onAddOverride={(o) => addRegionOverride(i, o)}
                      onRemoveOverride={(oi) => removeRegionOverride(i, oi)}
                      onUpdateOverride={(oi, patch) => updateRegionOverride(i, oi, patch)}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
            <Button onClick={() => setStep(5)} disabled={!canStep4}>Review <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-y-2">
                <span className="text-muted-foreground">Scheme Code</span><span className="font-mono font-medium">{schemeCode}</span>
                <span className="text-muted-foreground">Name</span><span className="font-medium">{formData.name}</span>
                <span className="text-muted-foreground">Type</span><span className="font-medium">{formData.valueType === "rupees" ? "Cash (₹)" : "Points"}</span>
                <span className="text-muted-foreground">Period</span><span className="font-medium">{formData.startDate} – {formData.endDate}</span>
              </div>
              {formData.description && <p className="text-muted-foreground">{formData.description}</p>}
              <Separator />
              <div>
                <p className="font-medium mb-2">States ({formData.fixedStateCodes.length})</p>
                <div className="flex flex-wrap gap-1">
                  {formData.fixedStateCodes.map((c) => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}
                </div>
              </div>
              <Separator />
              <div>
                <p className="font-medium mb-2">SKU+Pack Entries ({formData.skuPackEntries.length})</p>
                {formData.skuPackEntries.map((e) => (
                  <div key={`${e.skuId}-${e.packSizeId}`} className="text-muted-foreground mb-1">
                    {e.skuName} · {e.packSizeLabel} · {e.couponCount} coupons ·
                    {formData.valueType === "rupees" ? ` ₹${e.couponValue}` : ` ${e.couponValue} pts`} · Exp: {e.expiryDate}
                    {e.regionOverrides.length > 0 && ` · ${e.regionOverrides.length} custom override(s)`}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(4)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
            <Button onClick={onSubmit} disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Scheme"} <Check className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────── SKU Pack Detail Row ─────────── */

function SKUPackDetailRow({ entry, index, valueType, couponTypes, availableStates, onUpdate, onAddOverride, onRemoveOverride, onUpdateOverride }: {
  entry: SKUPackEntry; index: number; valueType: CouponValueType;
  couponTypes: { id: string; name: string }[];
  availableStates: { code: string; name: string }[];
  onUpdate: (patch: Partial<SKUPackEntry>) => void;
  onAddOverride: (o: RegionOverride) => void;
  onRemoveOverride: (i: number) => void;
  onUpdateOverride: (i: number, patch: Partial<RegionOverride>) => void;
}) {
  const [showOverrides, setShowOverrides] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell className="font-medium whitespace-nowrap">{entry.skuName}<br /><span className="text-xs text-muted-foreground">{entry.packSizeLabel}</span></TableCell>
        <TableCell><Input type="number" min={0} className="w-24 h-8" value={entry.couponCount || ""} onChange={(e) => onUpdate({ couponCount: Number(e.target.value) })} /></TableCell>
        <TableCell><Input type="number" min={0} className="w-20 h-8" value={entry.couponValue || ""} onChange={(e) => onUpdate({ couponValue: Number(e.target.value) })} /></TableCell>
        <TableCell>
          <DatePickerCompact value={entry.expiryDate} onChange={(d) => onUpdate({ expiryDate: d })} />
        </TableCell>
        <TableCell>
          <Select value={entry.couponTypeId} onValueChange={(v) => {
            const ct = couponTypes.find((c) => c.id === v);
            onUpdate({ couponTypeId: v, couponTypeName: ct?.name || "" });
          }}>
            <SelectTrigger className="w-28 h-8"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              {couponTypes.map((ct) => <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowOverrides(!showOverrides)}>
            {entry.regionOverrides.length > 0 ? `${entry.regionOverrides.length} override(s)` : "Add"}
          </Button>
        </TableCell>
      </TableRow>
      {showOverrides && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/50 p-4">
            <RegionOverrideEditor
              overrides={entry.regionOverrides}
              valueType={valueType}
              availableStates={availableStates}
              onAdd={onAddOverride}
              onRemove={onRemoveOverride}
              onUpdate={onUpdateOverride}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

/* ─────────── Region Override Editor ─────────── */

function RegionOverrideEditor({ overrides, valueType, availableStates, onAdd, onRemove, onUpdate }: {
  overrides: RegionOverride[]; valueType: CouponValueType;
  availableStates: { code: string; name: string }[];
  onAdd: (o: RegionOverride) => void;
  onRemove: (i: number) => void;
  onUpdate: (i: number, patch: Partial<RegionOverride>) => void;
}) {
  // Collect already-used state codes
  const usedCodes = overrides.flatMap((o) => o.stateCodes);
  const remaining = availableStates.filter((s) => !usedCodes.includes(s.code));

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Region-Level Custom Overrides</p>
      {overrides.map((o, i) => (
        <div key={i} className="flex flex-wrap items-end gap-2 rounded-md border bg-background p-3">
          <div className="flex-1 min-w-[200px] space-y-1">
            <Label className="text-xs">States</Label>
            <div className="flex flex-wrap gap-1">
              {o.stateNames.map((n, si) => (
                <Badge key={o.stateCodes[si]} variant="secondary" className="text-xs">{n}</Badge>
              ))}
            </div>
          </div>
          <div className="w-20 space-y-1">
            <Label className="text-xs">{valueType === "rupees" ? "₹" : "Pts"}</Label>
            <Input type="number" min={0} className="h-8" value={o.value || ""} onChange={(e) => onUpdate(i, { value: Number(e.target.value) })} />
          </div>
          <div className="w-24 space-y-1">
            <Label className="text-xs">Count</Label>
            <Input type="number" min={0} className="h-8" value={o.couponCount || ""} onChange={(e) => onUpdate(i, { couponCount: Number(e.target.value) })} />
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(i)}><X className="h-4 w-4 text-destructive" /></Button>
        </div>
      ))}
      {remaining.length > 0 && (
        <RegionOverrideAdder states={remaining} valueType={valueType} onAdd={onAdd} />
      )}
    </div>
  );
}

function RegionOverrideAdder({ states, valueType, onAdd }: {
  states: { code: string; name: string }[]; valueType: CouponValueType;
  onAdd: (o: RegionOverride) => void;
}) {
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedCodes(checked ? states.map((s) => s.code) : []);
  };

  const handleAdd = () => {
    if (selectedCodes.length === 0) return;
    const names = selectedCodes.map((c) => states.find((s) => s.code === c)?.name || c);
    onAdd({ stateCodes: selectedCodes, stateNames: names, valueType, value: 0, couponCount: 0 });
    setSelectedCodes([]);
    setSelectAll(false);
  };

  return (
    <div className="space-y-2 border rounded-md p-3 border-dashed">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Add custom region override</Label>
        <label className="flex items-center gap-1 text-xs cursor-pointer">
          <Checkbox checked={selectAll} onCheckedChange={(c) => handleSelectAll(!!c)} />All
        </label>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 max-h-32 overflow-y-auto">
        {states.map((st) => (
          <label key={st.code} className="flex items-center gap-1 text-xs cursor-pointer">
            <Checkbox checked={selectedCodes.includes(st.code)} onCheckedChange={(checked) => {
              setSelectedCodes(checked ? [...selectedCodes, st.code] : selectedCodes.filter((c) => c !== st.code));
            }} />
            {st.name}
          </label>
        ))}
      </div>
      <Button size="sm" variant="outline" onClick={handleAdd} disabled={selectedCodes.length === 0}>
        <Plus className="mr-1 h-3 w-3" />Add Override ({selectedCodes.length} states)
      </Button>
    </div>
  );
}

/* ─────────── Date Pickers ─────────── */

function DatePickerField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const date = value ? new Date(value) : undefined;
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={(d) => d && onChange(format(d, "yyyy-MM-dd"))} initialFocus className="p-3 pointer-events-auto" />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function DatePickerCompact({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const date = value ? new Date(value) : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("w-32 h-8 justify-start text-left text-xs font-normal", !date && "text-muted-foreground")}>
          <CalendarIcon className="mr-1 h-3 w-3" />
          {date ? format(date, "dd/MM/yyyy") : "Set date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={(d) => d && onChange(format(d, "yyyy-MM-dd"))} initialFocus className="p-3 pointer-events-auto" />
      </PopoverContent>
    </Popover>
  );
}

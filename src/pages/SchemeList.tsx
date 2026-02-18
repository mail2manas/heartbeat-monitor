import { useState } from "react";
import { useSchemeViewModel } from "@/viewmodels/useSchemeViewModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, ArrowRight, ArrowLeft, Check, QrCode, X, IndianRupee, Gift } from "lucide-react";
import type { CouponValueType } from "@/models/Scheme";

export default function SchemeList() {
  const vm = useSchemeViewModel();
  const [wizardOpen, setWizardOpen] = useState(false);

  const handleOpenWizard = () => { vm.resetWizard(); setWizardOpen(true); };
  const handleClose = () => { setWizardOpen(false); vm.resetWizard(); };
  const handleSubmit = async () => { await vm.submitScheme(); setWizardOpen(false); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">QR Coupon Schemes</h1>
          <p className="text-sm text-muted-foreground mt-1">Define schemes for generating QR-based coupons at SKU & pack size level</p>
        </div>
        <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenWizard}><Plus className="mr-2 h-4 w-4" />Create Scheme</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><QrCode className="h-5 w-5" />New Coupon Scheme</DialogTitle>
            </DialogHeader>
            <SchemeWizard vm={vm} onSubmit={handleSubmit} onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Schemes Table */}
      <Card>
        <CardContent className="p-0">
          {vm.isLoading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">Loading schemes...</div>
          ) : vm.schemes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <QrCode className="h-10 w-10 mb-2 opacity-40" />
              <p>No schemes created yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scheme Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Pack Size</TableHead>
                  <TableHead>Fixed States</TableHead>
                  <TableHead>Custom States</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vm.schemes.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.skuName}</TableCell>
                    <TableCell><Badge variant="outline">{s.packSizeLabel}</Badge></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {s.fixedStates.map((fs) => (
                          <Badge key={fs.stateCode} variant="secondary" className="text-xs">
                            {fs.stateCode} · {fs.valueType === "rupees" ? `₹${fs.value}` : `${fs.value}pts`}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {s.customStates.map((cs) => (
                          <Badge key={cs.stateCode} variant="outline" className="text-xs">
                            {cs.stateCode} · {cs.valueType === "rupees" ? `₹${cs.value}` : `${cs.value}pts`}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.status === "active" ? "default" : s.status === "draft" ? "secondary" : "destructive"}>
                        {s.status}
                      </Badge>
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

/* ─────────── Wizard Component ─────────── */

function SchemeWizard({ vm, onSubmit, onClose }: { vm: ReturnType<typeof useSchemeViewModel>; onSubmit: () => void; onClose: () => void }) {
  const { step, setStep, formData, updateForm, skus, packSizes, loadPackSizes, states, addCustomState, updateCustomState, removeCustomState, availableCustomStates, isSubmitting } = vm;

  const steps = ["SKU & Pack Size", "State Configuration", "Review & Submit"];

  const canProceedStep1 = formData.name.trim() && formData.skuId && formData.packSizeId;
  const canProceedStep2 = formData.fixedStatesCodes.length > 0 && formData.fixedValue > 0 && formData.fixedNoOfCoupons > 0;

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
              step > i + 1 ? "bg-primary text-primary-foreground" : step === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm hidden sm:inline ${step === i + 1 ? "font-medium text-foreground" : "text-muted-foreground"}`}>{label}</span>
            {i < steps.length - 1 && <Separator className="w-8" />}
          </div>
        ))}
      </div>

      {/* Step 1: SKU & Pack Size */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Scheme Name</Label>
            <Input placeholder="e.g. Summer Promo - Coca Cola 500ml" value={formData.name} onChange={(e) => updateForm({ name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Select SKU (Product)</Label>
            <Select value={formData.skuId} onValueChange={(v) => { updateForm({ skuId: v, packSizeId: "" }); loadPackSizes(v); }}>
              <SelectTrigger><SelectValue placeholder="Choose a product" /></SelectTrigger>
              <SelectContent>
                {skus.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {formData.skuId && (
            <div className="space-y-2">
              <Label>Pack Size</Label>
              <Select value={formData.packSizeId} onValueChange={(v) => updateForm({ packSizeId: v })}>
                <SelectTrigger><SelectValue placeholder="Choose pack size" /></SelectTrigger>
                <SelectContent>
                  {packSizes.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* Step 2: State Configuration */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Fixed states section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Fixed-Value States</CardTitle>
              <CardDescription>Select states where coupon value is the same for this SKU</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {states.map((st) => {
                  const isCustom = formData.customStates.some((cs) => cs.stateCode === st.code);
                  const isChecked = formData.fixedStatesCodes.includes(st.code);
                  return (
                    <label key={st.code} className={`flex items-center gap-2 text-sm cursor-pointer ${isCustom ? "opacity-40" : ""}`}>
                      <Checkbox
                        disabled={isCustom}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const codes = checked
                            ? [...formData.fixedStatesCodes, st.code]
                            : formData.fixedStatesCodes.filter((c) => c !== st.code);
                          updateForm({ fixedStatesCodes: codes });
                        }}
                      />
                      {st.name}
                    </label>
                  );
                })}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Value Type</Label>
                  <Select value={formData.fixedValueType} onValueChange={(v) => updateForm({ fixedValueType: v as CouponValueType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rupees"><span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />Rupees</span></SelectItem>
                      <SelectItem value="points"><span className="flex items-center gap-1"><Gift className="h-3 w-3" />Points</span></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Value ({formData.fixedValueType === "rupees" ? "₹" : "pts"})</Label>
                  <Input type="number" min={0} value={formData.fixedValue || ""} onChange={(e) => updateForm({ fixedValue: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">No. of Coupons</Label>
                  <Input type="number" min={0} value={formData.fixedNoOfCoupons || ""} onChange={(e) => updateForm({ fixedNoOfCoupons: Number(e.target.value) })} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom states section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Custom-Value States</CardTitle>
              <CardDescription>Add states with different coupon values</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.customStates.map((cs, i) => (
                <div key={cs.stateCode} className="flex items-end gap-2 rounded-md border p-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">{cs.stateName}</Label>
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Select value={cs.valueType} onValueChange={(v) => updateCustomState(i, { valueType: v as CouponValueType })}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rupees">₹</SelectItem>
                        <SelectItem value="points">Pts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-xs">Value</Label>
                    <Input className="h-9" type="number" min={0} value={cs.value || ""} onChange={(e) => updateCustomState(i, { value: Number(e.target.value) })} />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Coupons</Label>
                    <Input className="h-9" type="number" min={0} value={cs.noOfCoupons || ""} onChange={(e) => updateCustomState(i, { noOfCoupons: Number(e.target.value) })} />
                  </div>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeCustomState(i)}>
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {availableCustomStates.length > 0 && (
                <Select onValueChange={(v) => addCustomState(v)}>
                  <SelectTrigger className="border-dashed"><SelectValue placeholder="+ Add state with custom value" /></SelectTrigger>
                  <SelectContent>
                    {availableCustomStates.map((s) => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
            <Button onClick={() => setStep(3)} disabled={!canProceedStep2}>Review <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-y-2">
                <span className="text-muted-foreground">Scheme Name</span><span className="font-medium">{formData.name}</span>
                <span className="text-muted-foreground">SKU</span><span className="font-medium">{skus.find((s) => s.id === formData.skuId)?.name}</span>
                <span className="text-muted-foreground">Pack Size</span><span className="font-medium">{packSizes.find((p) => p.id === formData.packSizeId)?.label}</span>
              </div>
              <Separator />
              <div>
                <p className="font-medium mb-2">Fixed-Value States ({formData.fixedStatesCodes.length})</p>
                <div className="flex flex-wrap gap-1">
                  {formData.fixedStatesCodes.map((code) => (
                    <Badge key={code} variant="secondary">{states.find((s) => s.code === code)?.name}</Badge>
                  ))}
                </div>
                <p className="text-muted-foreground mt-1">
                  {formData.fixedValueType === "rupees" ? `₹${formData.fixedValue}` : `${formData.fixedValue} points`} × {formData.fixedNoOfCoupons.toLocaleString()} coupons each
                </p>
              </div>
              {formData.customStates.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium mb-2">Custom-Value States ({formData.customStates.length})</p>
                    {formData.customStates.map((cs) => (
                      <p key={cs.stateCode} className="text-muted-foreground">
                        {cs.stateName}: {cs.valueType === "rupees" ? `₹${cs.value}` : `${cs.value} pts`} × {cs.noOfCoupons.toLocaleString()} coupons
                      </p>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
            <Button onClick={onSubmit} disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Scheme"} <Check className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}

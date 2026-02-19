import { useState } from "react";
import { useFOCProductViewModel } from "@/viewmodels/useFOCProductViewModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Gift, ImageIcon } from "lucide-react";
import type { FOCProductFormData } from "@/models/FOCProduct";

const emptyForm: FOCProductFormData = { name: "", skuCode: "", mrp: 0, category: "", photoUrl: "/placeholder.svg" };

export default function FOCProductList() {
  const vm = useFOCProductViewModel();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FOCProductFormData>(emptyForm);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (id: string) => {
    const item = vm.items.find((i) => i.id === id);
    if (!item) return;
    setEditId(id);
    setForm({ name: item.name, skuCode: item.skuCode, mrp: item.mrp, category: item.category, photoUrl: item.photoUrl });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editId) await vm.update(editId, form);
    else await vm.create(form);
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">FOC Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage Free of Cost product master for points-based schemes</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add FOC Product</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {vm.isLoading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">Loading...</div>
          ) : vm.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Gift className="h-10 w-10 mb-2 opacity-40" />
              <p>No FOC products defined yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU Code</TableHead>
                  <TableHead>MRP (₹)</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vm.items.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="h-10 w-10 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
                        {p.photoUrl && p.photoUrl !== "/placeholder.svg" ? (
                          <img src={p.photoUrl} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="font-mono text-sm">{p.skuCode}</TableCell>
                    <TableCell>₹{p.mrp}</TableCell>
                    <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p.id)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => vm.remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit" : "Add"} FOC Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input placeholder="e.g. Coca Cola Zero 200ml" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>SKU Code</Label>
                <Input placeholder="e.g. CCZ200" value={form.skuCode} onChange={(e) => setForm({ ...form, skuCode: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>MRP (₹)</Label>
                <Input type="number" min={0} value={form.mrp || ""} onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {vm.categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Photo URL</Label>
              <Input placeholder="Paste image URL" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} />
              <p className="text-xs text-muted-foreground">Upload functionality will be available with backend integration</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!form.name.trim() || !form.skuCode.trim() || !form.category || vm.isSubmitting}>
                {vm.isSubmitting ? "Saving..." : editId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { useCouponTypeViewModel } from "@/viewmodels/useCouponTypeViewModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Ticket } from "lucide-react";
import type { CouponTypeFormData } from "@/models/CouponType";

export default function CouponTypeList() {
  const vm = useCouponTypeViewModel();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponTypeFormData>({ name: "", description: "" });

  const openCreate = () => { setEditId(null); setForm({ name: "", description: "" }); setDialogOpen(true); };
  const openEdit = (id: string) => {
    const item = vm.items.find((i) => i.id === id);
    if (!item) return;
    setEditId(id);
    setForm({ name: item.name, description: item.description });
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
          <h1 className="text-2xl font-bold text-foreground">Coupon Types</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage coupon shape/type definitions</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Coupon Type</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {vm.isLoading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">Loading...</div>
          ) : vm.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Ticket className="h-10 w-10 mb-2 opacity-40" />
              <p>No coupon types defined yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vm.items.map((ct) => (
                  <TableRow key={ct.id}>
                    <TableCell className="font-medium">{ct.name}</TableCell>
                    <TableCell className="text-muted-foreground">{ct.description}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(ct.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(ct.id)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => vm.remove(ct.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
            <DialogTitle>{editId ? "Edit" : "Add"} Coupon Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="e.g. Round" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe the coupon type" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!form.name.trim() || vm.isSubmitting}>
                {vm.isSubmitting ? "Saving..." : editId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Trash2, Edit3, Plus, IndianRupee, Receipt } from "lucide-react";

export type Amenity = "wifi" | "meals" | "laundry" | "parking" | "ac" | "non-ac" | "attached-bath";
export interface Listing {
  id: string;
  title: string;
  address: string;
  locality: string;
  rent: number;
  contact: string;
  amenities: Amenity[];
}
export interface Payment {
  id: string;
  listingId: string;
  tenantName: string;
  phone: string;
  months: number;
  amount: number;
  date: string;
}

const LOCAL_STORAGE_KEYS = {
  LISTINGS: "pg_uk_listings",
  PAYMENTS: "pg_uk_payments",
};

function useLocalStorageState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : initial;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState] as const;
}

export default function OwnerDashboard() {
  const [listings, setListings] = useLocalStorageState<Listing[]>(LOCAL_STORAGE_KEYS.LISTINGS, []);
  const [payments, setPayments] = useLocalStorageState<Payment[]>(LOCAL_STORAGE_KEYS.PAYMENTS, []);

  const [openAdd, setOpenAdd] = useState(false);
  const [openPayFor, setOpenPayFor] = useState<string | null>(null);
  const [editing, setEditing] = useState<Listing | null>(null);

  const totalsByListing = useMemo(() => {
    const map: Record<string, number> = {};
    payments.forEach((p) => {
      map[p.listingId] = (map[p.listingId] ?? 0) + p.amount;
    });
    return map;
  }, [payments]);

  const [form, setForm] = useState<Omit<Listing, "id">>({
    title: "",
    address: "",
    locality: "",
    rent: 5000,
    contact: "",
    amenities: [],
  });

  const handleSave = () => {
    if (!form.title || !form.address || !form.locality || !form.contact) {
      toast({ title: "Missing details", description: "Please fill all required fields." });
      return;
    }
    if (editing) {
      setListings((prev) => prev.map((l) => (l.id === editing.id ? { ...editing, ...form } : l)));
      setEditing(null);
    } else {
      const id = crypto.randomUUID();
      setListings((prev) => [...prev, { id, ...form }]);
    }
    setForm({ title: "", address: "", locality: "", rent: 5000, contact: "", amenities: [] });
    setOpenAdd(false);
    toast({ title: "Saved", description: "Listing has been saved." });
  };

  const handleDelete = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    toast({ title: "Removed", description: "Listing deleted." });
  };

  const [payForm, setPayForm] = useState<{ tenantName: string; phone: string; months: number; amount: number }>({
    tenantName: "",
    phone: "",
    months: 1,
    amount: 0,
  });

  const startPay = (listing: Listing) => {
    setOpenPayFor(listing.id);
    setPayForm({ tenantName: "", phone: "", months: 1, amount: listing.rent });
  };

  const handleRecordPayment = () => {
    if (!openPayFor) return;
    if (!payForm.tenantName || !payForm.phone || payForm.amount <= 0) {
      toast({ title: "Missing details", description: "Fill all payment fields." });
      return;
    }
    const payment: Payment = {
      id: crypto.randomUUID(),
      listingId: openPayFor,
      tenantName: payForm.tenantName,
      phone: payForm.phone,
      months: payForm.months,
      amount: payForm.amount,
      date: new Date().toISOString(),
    };
    setPayments((prev) => [payment, ...prev]);
    setOpenPayFor(null);
    toast({ title: "Payment recorded", description: `₹${payment.amount} received.` });
  };

  const amenityOptions: { key: Listing["amenities"][number]; label: string }[] = [
    { key: "wifi", label: "Wi‑Fi" },
    { key: "meals", label: "Meals" },
    { key: "laundry", label: "Laundry" },
    { key: "parking", label: "Parking" },
    { key: "ac", label: "AC" },
    { key: "non-ac", label: "Non‑AC" },
    { key: "attached-bath", label: "Attached Bath" },
  ];

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Owner Dashboard</h1>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2"/> Add Listing</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Listing" : "New Listing"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g., Cozy PG near ISBT Dehradun"/>
              </div>
              <div className="grid gap-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Street, landmark"/>
              </div>
              <div className="grid gap-2">
                <Label>Locality</Label>
                <Input value={form.locality} onChange={(e) => setForm((f) => ({ ...f, locality: e.target.value }))} placeholder="Dehradun, Rishikesh, Haridwar..."/>
              </div>
              <div className="grid gap-2">
                <Label>Rent (₹/month)</Label>
                <Input type="number" value={form.rent} onChange={(e) => setForm((f) => ({ ...f, rent: Number(e.target.value || 0) }))}/>
              </div>
              <div className="grid gap-2">
                <Label>Contact</Label>
                <Input value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} placeholder="Phone or email"/>
              </div>
              <div className="grid gap-2">
                <Label>Amenities</Label>
                <div className="flex flex-wrap gap-2">
                  {amenityOptions.map((a) => (
                    <button
                      key={a.key}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          amenities: f.amenities.includes(a.key)
                            ? f.amenities.filter((am) => am !== a.key)
                            : [...f.amenities, a.key],
                        }))
                      }
                      className={"px-3 py-1 rounded-full text-xs border transition-colors " + (form.amenities.includes(a.key) ? "bg-primary text-primary-foreground" : "hover:bg-accent")}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setOpenAdd(false); setEditing(null); }}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>No listings yet</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Click "Add Listing" to create your first PG. You can track payments from here too.
            </CardContent>
          </Card>
        ) : (
          listings.map((l) => (
            <Card key={l.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{l.title}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary"><IndianRupee className="h-4 w-4"/>{l.rent.toLocaleString()}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Locality</div>
                  <div className="font-medium">{l.locality}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Address</div>
                  <div className="font-medium">{l.address}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Contact</div>
                  <div className="font-medium">{l.contact}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {l.amenities.map((a) => (
                    <span key={a} className="px-2 py-1 rounded-full bg-accent text-xs">{a}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Receipt className="h-4 w-4"/> Collected: ₹{(totalsByListing[l.id] ?? 0).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditing(l); setForm({ title: l.title, address: l.address, locality: l.locality, rent: l.rent, contact: l.contact, amenities: l.amenities }); setOpenAdd(true); }}>
                      <Edit3 className="h-4 w-4 mr-1"/> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => startPay(l)}>
                      <IndianRupee className="h-4 w-4 mr-1"/> Record Payment
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(l.id)}>
                      <Trash2 className="h-4 w-4 mr-1"/> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-sm text-muted-foreground">No payments recorded yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Listing</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => {
                    const listing = listings.find((l) => l.id === p.listingId);
                    return (
                      <TableRow key={p.id}>
                        <TableCell>{new Date(p.date).toLocaleString()}</TableCell>
                        <TableCell>{p.tenantName}</TableCell>
                        <TableCell>{listing ? listing.title : "Deleted listing"}</TableCell>
                        <TableCell className="text-right">₹{p.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!openPayFor} onOpenChange={(o) => !o && setOpenPayFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Tenant name</Label>
              <Input value={payForm.tenantName} onChange={(e) => setPayForm((f) => ({ ...f, tenantName: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input value={payForm.phone} onChange={(e) => setPayForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Months</Label>
                <Input type="number" min={1} value={payForm.months} onChange={(e) => setPayForm((f) => ({ ...f, months: Number(e.target.value || 1) }))} />
              </div>
              <div className="grid gap-2">
                <Label>Amount (₹)</Label>
                <Input type="number" min={0} value={payForm.amount} onChange={(e) => setPayForm((f) => ({ ...f, amount: Number(e.target.value || 0) }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenPayFor(null)}>Cancel</Button>
              <Button onClick={handleRecordPayment}><IndianRupee className="h-4 w-4 mr-2"/> Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

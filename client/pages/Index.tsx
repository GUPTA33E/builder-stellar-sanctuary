import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { IndianRupee, MapPin, Wifi, Car, Droplets, Snowflake, Bath, Soup, Filter, Search } from "lucide-react";
import type { Amenity, Listing, Payment } from "./OwnerDashboard";

const LOCAL_STORAGE_KEYS = {
  LISTINGS: "pg_uk_listings",
  PAYMENTS: "pg_uk_payments",
};

const sampleListings: Listing[] = [
  {
    id: crypto.randomUUID(),
    title: "Himalayan Haven PG",
    address: "Near ISBT, Majra",
    locality: "Dehradun",
    rent: 7000,
    contact: "+91 98765 43210",
    amenities: ["wifi", "meals", "laundry", "parking", "attached-bath"],
  },
  {
    id: crypto.randomUUID(),
    title: "Ganga View Residency",
    address: "Tapovan",
    locality: "Rishikesh",
    rent: 8500,
    contact: "+91 99880 11223",
    amenities: ["wifi", "meals", "attached-bath"],
  },
  {
    id: crypto.randomUUID(),
    title: "Valley Breeze PG",
    address: "Kusumkhera",
    locality: "Haldwani",
    rent: 6000,
    contact: "+91 90123 44556",
    amenities: ["wifi", "laundry", "parking", "non-ac"],
  },
  {
    id: crypto.randomUUID(),
    title: "Lake View Stay",
    address: "Tallital",
    locality: "Nainital",
    rent: 12000,
    contact: "+91 99333 22110",
    amenities: ["wifi", "laundry", "parking", "ac", "attached-bath"],
  },
  {
    id: crypto.randomUUID(),
    title: "Har Ki Pauri PG",
    address: "Bhilwara Road",
    locality: "Haridwar",
    rent: 6500,
    contact: "+91 99555 88770",
    amenities: ["wifi", "meals", "attached-bath"],
  },
  {
    id: crypto.randomUUID(),
    title: "Almora Ridge Rooms",
    address: "Lower Mall Road",
    locality: "Almora",
    rent: 5500,
    contact: "+91 90909 11122",
    amenities: ["wifi", "laundry", "non-ac"],
  },
];

function useSeededListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.LISTINGS);
    if (stored) {
      setListings(JSON.parse(stored));
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEYS.LISTINGS, JSON.stringify(sampleListings));
      setListings(sampleListings);
    }
  }, []);
  const update = (next: Listing[]) => {
    setListings(next);
    localStorage.setItem(LOCAL_STORAGE_KEYS.LISTINGS, JSON.stringify(next));
  };
  return [listings, update] as const;
}

export default function Index() {
  const [listings] = useSeededListings();
  const [payments, setPayments] = useState<Payment[]>(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.PAYMENTS);
    return raw ? JSON.parse(raw) : [];
  });
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  const localities = useMemo(
    () => Array.from(new Set(listings.map((l) => l.locality))).sort(),
    [listings],
  );

  const [query, setQuery] = useState("");
  const [loc, setLoc] = useState<string | undefined>(undefined);
  const [price, setPrice] = useState<[number, number]>([0, 15000]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  const filtered = listings.filter((l) => {
    const inQuery = `${l.title} ${l.address} ${l.locality}`.toLowerCase().includes(query.toLowerCase());
    const inLoc = !loc || l.locality === loc;
    const inPrice = l.rent >= price[0] && l.rent <= price[1];
    const hasAmenities = amenities.every((a) => l.amenities.includes(a));
    return inQuery && inLoc && inPrice && hasAmenities;
  });

  const [openPayFor, setOpenPayFor] = useState<Listing | null>(null);
  const [payForm, setPayForm] = useState<{ tenantName: string; phone: string; months: number; amount: number }>({
    tenantName: "",
    phone: "",
    months: 1,
    amount: 0,
  });

  const startPay = (listing: Listing) => {
    setOpenPayFor(listing);
    setPayForm({ tenantName: "", phone: "", months: 1, amount: listing.rent });
  };

  const confirmPayment = () => {
    if (!openPayFor) return;
    if (!payForm.tenantName || !payForm.phone || payForm.amount <= 0) {
      toast({ title: "Missing details", description: "Please fill all fields" });
      return;
    }
    const payment: Payment = {
      id: crypto.randomUUID(),
      listingId: openPayFor.id,
      tenantName: payForm.tenantName,
      phone: payForm.phone,
      months: payForm.months,
      amount: payForm.amount,
      date: new Date().toISOString(),
    };
    setPayments((prev) => [payment, ...prev]);
    setOpenPayFor(null);
    toast({ title: "Payment successful", description: `Paid ₹${payment.amount.toLocaleString()} for ${openPayFor.title}` });
  };

  const amenityIconMap: Record<Amenity, JSX.Element> = {
    wifi: <Wifi className="h-4 w-4"/>,
    meals: <Soup className="h-4 w-4"/>,
    laundry: <Droplets className="h-4 w-4"/>,
    parking: <Car className="h-4 w-4"/>,
    ac: <Snowflake className="h-4 w-4"/>,
    "non-ac": <Snowflake className="h-4 w-4 opacity-40"/>,
    "attached-bath": <Bath className="h-4 w-4"/>,
  };

  return (
    <div>
      <section className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1562157873-818bc0726f2b?q=80&w=1980&auto=format&fit=crop"
          alt="Uttarakhand Himalayas"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-background" />
        <div className="container relative z-10 py-20 md:py-28 text-white">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Find your perfect PG in Uttarakhand
            </h1>
            <p className="mt-3 text-white/90 md:text-lg">
              Browse verified paying guest stays across Dehradun, Rishikesh, Nainital, and more. Search, filter, and pay rent online—simple.
            </p>
          </div>
          <div id="search" className="mt-8 rounded-xl bg-background/90 backdrop-blur border p-4 shadow-lg">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="col-span-2 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground"/>
                <Input placeholder="Search by title, address..." value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <Select value={loc} onValueChange={(v) => setLoc(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All localities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All localities</SelectItem>
                  {localities.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="px-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Filter className="h-3.5 w-3.5"/> Price range
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" min={0} step={500} value={price[0]} onChange={(e) => setPrice([Number(e.target.value || 0), price[1]])} placeholder="Min ₹" />
                  <Input type="number" min={0} step={500} value={price[1]} onChange={(e) => setPrice([price[0], Number(e.target.value || 0)])} placeholder="Max ₹" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["wifi", "meals", "laundry", "parking", "ac", "non-ac", "attached-bath"] as Amenity[]).map((a) => (
                <button
                  key={a}
                  onClick={() =>
                    setAmenities((prev) =>
                      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
                    )
                  }
                  className={"px-3 py-1 rounded-full text-xs border transition-colors flex items-center gap-2 " + (amenities.includes(a) ? "bg-primary text-primary-foreground" : "hover:bg-accent")}
                >
                  {amenityIconMap[a]}
                  <span className="capitalize">{a.replace("-", " ")}</span>
                </button>
              ))}
              {amenities.length > 0 && (
                <Button variant="ghost" onClick={() => setAmenities([])}>Clear amenities</Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container py-10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold">Available PGs</h2>
          <div className="text-sm text-muted-foreground">{filtered.length} results</div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <Card key={l.id} className="overflow-hidden">
              <div className="h-40 w-full overflow-hidden">
                <img
                  src={`https://source.unsplash.com/featured/640x360/?room,${encodeURIComponent(l.locality)}`}
                  alt={l.title}
                  className="h-40 w-full object-cover"
                />
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">{l.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4"/>
                  <span>{l.address}, {l.locality}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1 text-primary font-semibold">
                    <IndianRupee className="h-4 w-4"/>
                    {l.rent.toLocaleString()}<span className="text-xs text-muted-foreground font-normal">/month</span>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => startPay(l)}>Pay Rent</Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {l.amenities.map((a) => (
                    <span key={a} className="px-2 py-1 rounded-full bg-accent text-xs inline-flex items-center gap-1">
                      {amenityIconMap[a]}
                      <span className="capitalize">{a.replace("-", " ")}</span>
                    </span>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Contact:</span> {l.contact}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Dialog open={!!openPayFor} onOpenChange={(o) => !o && setOpenPayFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay Rent {openPayFor ? `· ${openPayFor.title}` : ""}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={payForm.tenantName} onChange={(e) => setPayForm((f) => ({ ...f, tenantName: e.target.value }))} placeholder="Tenant full name"/>
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input value={payForm.phone} onChange={(e) => setPayForm((f) => ({ ...f, phone: e.target.value }))} placeholder="10-digit mobile"/>
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
              <Button onClick={confirmPayment}><IndianRupee className="h-4 w-4 mr-2"/> Pay now</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

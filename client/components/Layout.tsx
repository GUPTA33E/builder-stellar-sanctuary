import { Link, NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mountain, Home, LayoutDashboard } from "lucide-react";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-foreground/80 hover:text-foreground hover:bg-accent",
  );

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 grid place-items-center rounded-md bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
              <Mountain className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold tracking-tight text-lg">
                PG Uttarakhand
              </span>
              <span className="text-xs text-muted-foreground -mt-1">
                Find • Manage • Pay
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={navLinkClass}>
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4" /> Home
              </div>
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClass}>
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" /> Owner Dashboard
              </div>
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="md:hidden">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild>
              <a href="#search">Search PGs</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-background">
        <div className="container py-8 grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="flex items-center gap-2 font-semibold mb-2">
              <Mountain className="h-4 w-4" />
              PG Uttarakhand
            </div>
            <p className="text-muted-foreground">
              Housing made simple for seekers and owners across the Himalayas.
            </p>
          </div>
          <div>
            <div className="font-semibold mb-2">Explore</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-foreground">
                  Owner Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Contact</div>
            <p className="text-muted-foreground">support@pg-uttarakhand.app</p>
          </div>
        </div>
        <div className="border-t py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} PG Uttarakhand. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

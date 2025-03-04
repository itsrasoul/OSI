import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FolderOpen, Home, Menu } from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const NavContent = () => (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold mb-6">OSINT Tool</h1>

      <Button
        variant={location === "/" ? "secondary" : "ghost"}
        className="w-full justify-start"
        asChild
      >
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
      </Button>

      <Button
        variant={location.startsWith("/cases") ? "secondary" : "ghost"}
        className="w-full justify-start"
        asChild
      >
        <Link href="/cases">
          <FolderOpen className="mr-2 h-4 w-4" />
          Cases
        </Link>
      </Button>
    </div>
  );

  return (
    <>
      {/* Mobile Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 p-4 border-b bg-background z-50">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">OSINT Tool</h1>
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-sidebar border-r border-border p-4">
        <NavContent />
      </div>
    </>
  );
}
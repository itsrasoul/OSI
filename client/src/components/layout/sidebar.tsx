import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  FolderOpen,
  Home,
  Menu,
  LogOut,
  User,
  Search,
  BarChart3,
  Settings,
  Shield,
  Users,
  FileText,
  Database,
  Globe
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function Sidebar() {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const NavContent = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          OSI
        </h1>
      </div>

      {user && (
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">{user.username}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
        </div>
      )}

      <div className="space-y-1">
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

        <Button
          variant={location === "/search" ? "secondary" : "ghost"}
          className="w-full justify-start"
          asChild
        >
          <Link href="/search">
            <Search className="mr-2 h-4 w-4" />
            Advanced Search
          </Link>
        </Button>

        <Button
          variant={location === "/analytics" ? "secondary" : "ghost"}
          className="w-full justify-start"
          asChild
        >
          <Link href="/analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Link>
        </Button>

        <Button
          variant={location === "/tools" ? "secondary" : "ghost"}
          className="w-full justify-start"
          asChild
        >
          <Link href="/tools">
            <Shield className="mr-2 h-4 w-4" />
            OSINT Tools
          </Link>
        </Button>

        <Button
          variant={location === "/team" ? "secondary" : "ghost"}
          className="w-full justify-start"
          asChild
        >
          <Link href="/team">
            <Users className="mr-2 h-4 w-4" />
            Team
          </Link>
        </Button>

        <Button
          variant={location === "/reports" ? "secondary" : "ghost"}
          className="w-full justify-start"
          asChild
        >
          <Link href="/reports">
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </Link>
        </Button>

        <Button
          variant={location === "/data" ? "secondary" : "ghost"}
          className="w-full justify-start"
          asChild
        >
          <Link href="/data">
            <Database className="mr-2 h-4 w-4" />
            Data Sources
          </Link>
        </Button>
      </div>

      <div className="border-t pt-4 mt-4">
        <Button
          variant={location === "/settings" ? "secondary" : "ghost"}
          className="w-full justify-start"
          asChild
        >
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>

        {user && (
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 p-4 border-b bg-background z-50">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            OSI
          </h1>
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
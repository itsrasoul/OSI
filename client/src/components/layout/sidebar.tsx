import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FolderOpen, Home } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-sidebar border-r border-border p-4">
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
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Case } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import CaseForm from "@/components/cases/case-form";
import { useState } from "react";

export default function Home() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const { data: cases = [], isLoading } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
    queryFn: async () => {
      const response = await fetch("/api/cases");
      if (!response.ok) {
        throw new Error("Failed to fetch cases");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 30000,
    retry: 1,
    initialData: []
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome to OSI</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Investigation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              OSI helps you organize and track your OSINT investigations. Get started by:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Creating a new investigation</li>
              <li>Adding information from various sources</li>
              <li>Organizing findings by category</li>
              <li>Tracking verification status</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Cases</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : cases && cases.length > 0 ? (
              <div className="space-y-4">
                {cases.slice(0, 5).map((case_) => (
                  <Link key={case_.id} href={`/cases/${case_.id}`}>
                    <div className="p-4 rounded-lg bg-card/50 hover:bg-card/80 cursor-pointer">
                      <h3 className="font-medium">{case_.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {case_.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No cases yet. Create your first investigation!</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Useful OSINT resources and tools:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="https://osintframework.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    OSINT Framework
                  </a>
                </li>
                <li>
                  <a href="https://start.me/p/DPYPMz/the-ultimate-osint-collection" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Ultimate OSINT Collection
                  </a>
                </li>
                <li>
                  <a href="https://github.com/jivoi/awesome-osint" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Awesome OSINT Resources
                  </a>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <CaseForm open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
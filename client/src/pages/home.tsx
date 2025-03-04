import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Case } from "@shared/schema";

export default function Home() {
  const { data: cases } = useQuery<Case[]>({ 
    queryKey: ["/api/cases"]
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/cases">View All Cases</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {cases?.filter(c => c.status === "active").length || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{cases?.length || 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Case } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import CaseForm from "@/components/cases/case-form";
import { useState } from "react";
import { Link } from "wouter";

export default function CasesList() {
  const [showNewCase, setShowNewCase] = useState(false);
  const { data: cases } = useQuery<Case[]>({ 
    queryKey: ["/api/cases"]
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-6 border-b">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Cases</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track your investigations
          </p>
        </div>
        <Button onClick={() => setShowNewCase(true)} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" /> New Case
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases?.map((case_) => (
              <TableRow key={case_.id}>
                <TableCell>
                  <Link href={`/cases/${case_.id}`} className="text-blue-500 hover:underline">
                    {case_.name}
                  </Link>
                </TableCell>
                <TableCell>{case_.description}</TableCell>
                <TableCell>
                  <span className={`capitalize px-2 py-1 rounded-full text-xs font-medium
                    ${case_.status === 'active' ? 'bg-green-500/10 text-green-500' :
                      case_.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-red-500/10 text-red-500'}`}>
                    {case_.status}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`capitalize px-2 py-1 rounded-full text-xs font-medium
                    ${case_.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                      case_.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-blue-500/10 text-blue-500'}`}>
                    {case_.priority}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CaseForm open={showNewCase} onOpenChange={setShowNewCase} />
    </div>
  );
}
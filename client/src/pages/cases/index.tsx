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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Cases</h1>
        <Button onClick={() => setShowNewCase(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Case
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
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
              <TableCell>{case_.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CaseForm open={showNewCase} onOpenChange={setShowNewCase} />
    </div>
  );
}

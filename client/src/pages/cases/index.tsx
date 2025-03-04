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
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CasesList() {
  const [showNewCase, setShowNewCase] = useState(false);
  const { data: cases } = useQuery<Case[]>({ 
    queryKey: ["/api/cases"]
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-bold">Cases</h1>
          <p className="text-muted-foreground mt-2">Manage your investigation cases</p>
        </div>
        <Button 
          onClick={() => setShowNewCase(true)}
          className="w-full md:w-auto"
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" /> New Case
        </Button>
      </div>

      <ScrollArea className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Name</TableHead>
              <TableHead className="min-w-[300px]">Description</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[100px]">Priority</TableHead>
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
                <TableCell className="text-muted-foreground">
                  {case_.description}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${case_.status === 'active' ? 'bg-green-500/10 text-green-500' :
                      case_.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-red-500/10 text-red-500'}`}>
                    {case_.status}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
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
      </ScrollArea>

      <CaseForm open={showNewCase} onOpenChange={setShowNewCase} />
    </div>
  );
}
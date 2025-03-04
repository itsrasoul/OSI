import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Archive,
  BadgeAlert,
  Flag,
  Loader2,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { priorities } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CaseControlsProps {
  caseId: number;
  status: string;
  priority: string;
}

export default function CaseControls({ caseId, status, priority }: CaseControlsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      await apiRequest("PATCH", `/api/cases/${caseId}`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseId}`] });
      toast({ title: `Case ${newStatus}` });
    } catch (error) {
      toast({
        title: "Failed to update case status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    setIsLoading(true);
    try {
      await apiRequest("PATCH", `/api/cases/${caseId}`, { priority: newPriority });
      queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseId}`] });
      toast({ title: `Priority updated to ${newPriority}` });
    } catch (error) {
      toast({
        title: "Failed to update priority",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this case?")) return;
    
    setIsLoading(true);
    try {
      await apiRequest("DELETE", `/api/cases/${caseId}`, undefined);
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      window.location.href = "/cases";
    } catch (error) {
      toast({
        title: "Failed to delete case",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const priorityColors: Record<string, string> = {
    low: "bg-blue-500/10 text-blue-500",
    medium: "bg-yellow-500/10 text-yellow-500",
    high: "bg-orange-500/10 text-orange-500",
    critical: "bg-red-500/10 text-red-500"
  };

  const PriorityIcon = () => {
    switch (priority) {
      case "critical":
        return <ShieldAlert className="h-4 w-4" />;
      case "high":
        return <BadgeAlert className="h-4 w-4" />;
      case "medium":
        return <Flag className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      className="flex items-center gap-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Select
        defaultValue={priority}
        onValueChange={handlePriorityChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[140px]">
          <div className="flex items-center gap-2">
            <PriorityIcon />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {priorities.map(p => (
            <SelectItem key={p} value={p}>
              <div className="flex items-center gap-2">
                <Badge className={priorityColors[p]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        {status === "active" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange("closed")}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Archive className="h-4 w-4 mr-2" />
            )}
            Close Case
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange("active")}
            disabled={isLoading}
          >
            Reopen Case
          </Button>
        )}

        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Delete
        </Button>
      </div>
    </motion.div>
  );
}

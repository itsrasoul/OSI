import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCaseSchema, type InsertCase } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CaseForm({ open, onOpenChange }: CaseFormProps) {
  const { toast } = useToast();
  const form = useForm<InsertCase>({
    resolver: zodResolver(insertCaseSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
    },
  });

  const createCase = useMutation({
    mutationFn: async (data: InsertCase) => {
      const res = await apiRequest("POST", "/api/cases", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      toast({ title: "Case created successfully" });
      form.reset();
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Case</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createCase.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={createCase.isPending}>
              Create Case
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

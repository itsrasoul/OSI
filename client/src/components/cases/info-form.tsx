import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCaseInfoSchema, type InsertCaseInfo } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface InfoFormProps {
  caseId: number;
  category: string;
}

export default function InfoForm({ caseId, category }: InfoFormProps) {
  const { toast } = useToast();
  const form = useForm<InsertCaseInfo>({
    resolver: zodResolver(insertCaseInfoSchema),
    defaultValues: {
      caseId,
      category,
      data: {},
    },
  });

  const createInfo = useMutation({
    mutationFn: async (data: InsertCaseInfo) => {
      const res = await apiRequest("POST", `/api/cases/${caseId}/info`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseId}/info`] });
      toast({ title: "Information added successfully" });
      form.reset({ caseId, category, data: {} });
    },
  });

  const handleSubmit = (values: InsertCaseInfo) => {
    try {
      const data = JSON.parse(values.data as string);
      createInfo.mutate({ ...values, data });
    } catch (e) {
      toast({ 
        title: "Invalid JSON format",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="data"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea 
                  {...field}
                  placeholder="Enter JSON data"
                  value={typeof field.value === 'string' ? field.value : JSON.stringify(field.value, null, 2)}
                  className="font-mono"
                  rows={10}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={createInfo.isPending}>
          Add Information
        </Button>
      </form>
    </Form>
  );
}

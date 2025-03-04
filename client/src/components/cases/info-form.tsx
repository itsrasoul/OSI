import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCaseInfoSchema, type InsertCaseInfo, infoTypes } from "@shared/schema";
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

interface InfoFormProps {
  caseId: number;
  category: string;
}

export default function InfoForm({ caseId, category }: InfoFormProps) {
  const { toast } = useToast();
  const form = useForm<InsertCaseInfo & { rawText?: string }>({
    resolver: zodResolver(insertCaseInfoSchema),
    defaultValues: {
      caseId,
      category,
      data: {},
      source: "",
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
      form.reset({ caseId, category, data: {}, source: "" });
    },
  });

  const handleSubmit = (values: InsertCaseInfo & { rawText?: string }) => {
    const { rawText, ...rest } = values;
    let data: any = {};

    // If the category has predefined fields, use them
    if (category in infoTypes) {
      data = form.getValues();
    } else {
      // For categories without predefined fields, use the raw text
      data = { content: rawText };
    }

    createInfo.mutate({ ...rest, data });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {category in infoTypes ? (
          // Render structured form fields for categories with predefined fields
          <>
            {infoTypes[category as keyof typeof infoTypes].map((field) => (
              <FormField
                key={field}
                control={form.control}
                name={`data.${field}`}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel className="capitalize">{field.replace(/_/g, " ")}</FormLabel>
                    <FormControl>
                      <Input {...formField} />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </>
        ) : (
          // Render a simple textarea for free-form content
          <FormField
            control={form.control}
            name="rawText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Information</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field}
                    placeholder="Enter information here..."
                    rows={5}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  placeholder="Where did you find this information? (Optional)"
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
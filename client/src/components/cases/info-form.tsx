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

type FormData = {
  rawText?: string;
  source: string;
  data: Record<string, string>;
};

export default function InfoForm({ caseId, category }: InfoFormProps) {
  const { toast } = useToast();
  const form = useForm<FormData>({
    defaultValues: {
      source: "",
      data: {},
    },
  });

  const createInfo = useMutation({
    mutationFn: async (values: FormData) => {
      const data = category in infoTypes ? values.data : { content: values.rawText };
      const info: InsertCaseInfo = {
        caseId,
        category,
        data,
        source: values.source,
        // Set verification status based on source presence
        verificationStatus: values.source ? 'verified' : 'unverified'
      };

      const res = await apiRequest("POST", `/api/cases/${caseId}/info`, info);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseId}/info`] });
      toast({ title: "Information added successfully" });
      form.reset();
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createInfo.mutate(data))} className="space-y-4">
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
                  placeholder="Where did you find this information? Adding source will mark as verified"
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
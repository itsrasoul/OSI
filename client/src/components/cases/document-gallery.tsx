import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { CaseDocument } from "@shared/schema";

interface DocumentGalleryProps {
  caseId: number;
}

export function DocumentGallery({ caseId }: DocumentGalleryProps) {
  const { toast } = useToast();
  const [selectedDocument, setSelectedDocument] = useState<CaseDocument | null>(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: documents } = useQuery<CaseDocument[]>({
    queryKey: [`/api/cases/${caseId}/documents`],
  });

  const deleteDocument = useMutation({
    mutationFn: async (documentId: number) => {
      await apiRequest("DELETE", `/api/cases/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseId}/documents`] });
      toast({ title: "Document deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Failed to delete document",
        variant: "destructive"
      });
    }
  });

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('caseId', caseId.toString());

      const response = await fetch('/api/cases/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseId}/documents`] });
      toast({ title: "Document uploaded successfully" });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not upload document",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".pdf,.doc,.docx,.txt,.rtf,.csv,.xlsx,.xls"
          className="hidden"
          id="document-upload"
          onChange={handleDocumentUpload}
          disabled={uploading}
        />
        <Button
          asChild
          variant="outline"
          className="w-full md:w-auto"
          disabled={uploading}
        >
          <label htmlFor="document-upload" className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </label>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {documents?.map((document, index) => (
          <motion.div
            key={document.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative group p-2"
          >
            <div
              className="w-full aspect-square rounded-lg border bg-muted/50 flex items-center justify-center cursor-pointer overflow-hidden hover:shadow-lg transition-shadow"
              onClick={() => setSelectedDocument(document)}
            >
              <div className="flex flex-col items-center gap-2 p-4 text-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium truncate max-w-full">
                  {document.fileName}
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteDocument.mutate(document.id)}
              disabled={deleteDocument.isPending}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Delete document</span>
            </Button>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>Document Preview</DialogTitle>
          <DialogDescription>
            {selectedDocument?.description || selectedDocument?.fileName}
          </DialogDescription>
          <div className="relative min-h-[60vh] bg-muted rounded-lg">
            {selectedDocument && (
              <iframe
                src={selectedDocument.url}
                className="w-full h-full absolute inset-0 rounded-lg"
                title={selectedDocument.fileName}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
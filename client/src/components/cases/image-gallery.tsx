import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { CaseImage } from "@shared/schema";

interface ImageGalleryProps {
  caseId: number;
}

export function ImageGallery({ caseId }: ImageGalleryProps) {
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<CaseImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: images } = useQuery<CaseImage[]>({
    queryKey: [`/api/cases/${caseId}/images`],
  });

  const deleteImage = useMutation({
    mutationFn: async (imageId: number) => {
      await apiRequest("DELETE", `/api/cases/images/${imageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseId}/images`] });
      toast({ title: "Image deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Failed to delete image",
        variant: "destructive"
      });
    }
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('caseId', caseId.toString());

      const baseUrl = import.meta.env.VITE_API_BASE || '';
      const response = await fetch(`${baseUrl}/api/cases/images/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseId}/images`] });
      toast({ title: "Image uploaded successfully" });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not upload image",
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
          accept="image/*"
          className="hidden"
          id="image-upload"
          onChange={handleImageUpload}
          disabled={uploading}
        />
        <Button
          asChild
          variant="outline"
          className="w-full md:w-auto"
          disabled={uploading}
        >
          <label htmlFor="image-upload" className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Upload Image
          </label>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {images?.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative group p-2"
          >
            <div
              className="w-full aspect-square rounded-lg border bg-muted/50 flex items-center justify-center cursor-pointer overflow-hidden hover:shadow-lg transition-shadow"
              onClick={() => setSelectedImage(image)}
            >
              {image.thumbnail ? (
                <img
                  src={image.thumbnail}
                  alt={image.description || 'Case image thumbnail'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteImage.mutate(image.id)}
              disabled={deleteImage.isPending}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Delete image</span>
            </Button>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>Case Image Preview</DialogTitle>
          <DialogDescription>
            {selectedImage?.description || 'View full size image'}
          </DialogDescription>
          <div className="relative aspect-video">
            {selectedImage && (
              <img
                src={selectedImage.url}
                alt={selectedImage.description || 'Case image preview'}
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
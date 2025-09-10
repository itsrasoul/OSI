import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchCommandProps {
  caseId: number;
  onResultFound: (category: string, data: any) => void;
}

export default function SearchCommand({ caseId, onResultFound }: SearchCommandProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const { toast } = useToast();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleExport = async () => {
    const baseUrl = import.meta.env.VITE_API_BASE || '';
    const findings = await fetch(`${baseUrl}/api/cases/${caseId}/info`).then(res => res.json());
    const jsonStr = JSON.stringify(findings, null, 2);
    const dataUrl = `data:text/json;charset=utf-8,${encodeURIComponent(jsonStr)}`;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `case-${caseId}-findings.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Findings exported successfully" });
  };

  const analyzeTarget = async (type: string) => {
    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      let data;
      switch (type) {
        case "personal_info":
          data = {
            name: searchTerm,
            occupation: "Analyzing profile...",
            languages: "Detecting languages...",
            location: "Analyzing locations..."
          };
          break;
        case "social_media":
          data = {
            platform: "Cross-platform",
            username: searchTerm.toLowerCase().replace(/[^a-z0-9]/g, ''),
            bio: "Analyzing social presence...",
            last_active: "Determining activity patterns..."
          };
          break;
        case "employment":
          data = {
            company: "Scanning company affiliations...",
            position: "Analyzing career progression...",
            location: "Mapping professional locations...",
            linkedin_url: "Identifying professional networks..."
          };
          break;
        default:
          data = {
            content: `Intelligence gathering in progress for: ${searchTerm}`
          };
      }

      onResultFound(type, data);
      toast({
        title: "Analysis Started",
        description: `Gathering ${type.replace('_', ' ')} intelligence`
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not complete the intelligence gathering",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search target information... <kbd className="ml-auto">⌘K</kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="sr-only">
          <DialogTitle>Search Intelligence</DialogTitle>
          <DialogDescription>
            Search and analyze intelligence data across multiple sources
          </DialogDescription>
        </div>
        <CommandInput 
          placeholder="Enter target identifier (name, email, username...)" 
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Intelligence">
            <CommandItem onSelect={() => analyzeTarget("personal_info")}>
              <span>Personal Information Analysis</span>
            </CommandItem>
            <CommandItem onSelect={() => analyzeTarget("social_media")}>
              <span>Social Media Intelligence</span>
            </CommandItem>
            <CommandItem onSelect={() => analyzeTarget("employment")}>
              <span>Professional Background Analysis</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Advanced Intelligence">
            <CommandItem onSelect={() => analyzeTarget("domains")}>
              <span>Digital Footprint Analysis</span>
            </CommandItem>
            <CommandItem onSelect={() => analyzeTarget("connections")}>
              <span>Network Analysis</span>
            </CommandItem>
            <CommandItem onSelect={() => analyzeTarget("travel")}>
              <span>Movement Pattern Analysis</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Case Actions">
            <CommandItem onSelect={handleExport}>
              <span>Export Investigation Data</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
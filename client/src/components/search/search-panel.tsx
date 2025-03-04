import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchPanelProps {
  caseId: number;
  onResultFound: (category: string, data: any) => void;
}

export default function SearchPanel({ caseId, onResultFound }: SearchPanelProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearch, setActiveSearch] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setActiveSearch(searchQuery);

    try {
      // Simulate gathering information from various sources
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate potential findings based on the search query
      const findings = generateFindings(searchQuery);

      // Save each type of finding
      findings.forEach(finding => {
        onResultFound(finding.category, finding.data);
      });

      toast({
        title: "Search completed",
        description: `Found information across ${findings.length} categories`
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to gather information",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const generateFindings = (query: string) => {
    // This would be replaced with actual API calls in a production environment
    const findings = [];

    // Personal Information
    if (query.includes("@") || /^[A-Za-z\s]+$/.test(query)) {
      findings.push({
        category: "personal_info",
        data: {
          name: query.split("@")[0] || query,
          occupation: "Unknown",
          location: "Searching...",
        }
      });
    }

    // Social Media
    findings.push({
      category: "social_media",
      data: {
        platform: "Various",
        username: query.toLowerCase().replace(/[^a-z0-9]/g, ''),
        url: "Multiple potential profiles found",
        last_active: "Analyzing activity patterns..."
      }
    });

    // Professional Information
    findings.push({
      category: "employment",
      data: {
        company: "Searching company affiliations...",
        position: "Analyzing professional history...",
        linkedin_url: `Potential professional profiles for: ${query}`
      }
    });

    return findings;
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Enter name, email, username, or any identifier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isSearching}
            className="min-w-[100px]"
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        {activeSearch && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Analyzing information for: </span>
            <Badge variant="secondary">{activeSearch}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
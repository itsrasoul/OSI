import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Globe, Users, Building2, GraduationCap, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchPanelProps {
  caseId: number;
  onResultFound: (category: string, data: any) => void;
}

export default function SearchPanel({ caseId, onResultFound }: SearchPanelProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const searchEngines = [
    { id: "google", name: "Google", url: "https://www.google.com/search?q=" },
    { id: "bing", name: "Bing", url: "https://www.bing.com/search?q=" },
    { id: "duckduckgo", name: "DuckDuckGo", url: "https://duckduckgo.com/?q=" },
  ];

  const socialPlatforms = [
    { id: "linkedin", name: "LinkedIn", url: "https://www.linkedin.com/search/results/all/?keywords=" },
    { id: "twitter", name: "Twitter", url: "https://twitter.com/search?q=" },
    { id: "facebook", name: "Facebook", url: "https://www.facebook.com/search/top/?q=" },
    { id: "instagram", name: "Instagram", url: "https://www.instagram.com/explore/tags/" },
  ];

  const handleSearch = async (type: string) => {
    setIsSearching(true);
    
    try {
      // For demonstration, we'll open the search in a new tab
      // In a full implementation, this would use proper APIs
      searchEngines.forEach(engine => {
        window.open(engine.url + encodeURIComponent(searchQuery), '_blank');
      });

      // Log the search attempt
      onResultFound("search_results", {
        search_engine: "multiple",
        query: searchQuery,
        timestamp: new Date().toISOString(),
        type: type
      });

      toast({
        title: "Search initiated",
        description: "Search results opened in new tabs"
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to perform search",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const searchCategories = [
    {
      id: "general",
      name: "General Search",
      icon: Search,
      description: "Search across multiple engines"
    },
    {
      id: "social",
      name: "Social Media",
      icon: Users,
      description: "Find social media profiles"
    },
    {
      id: "business",
      name: "Business",
      icon: Building2,
      description: "Search company affiliations"
    },
    {
      id: "education",
      name: "Education",
      icon: GraduationCap,
      description: "Find educational background"
    }
  ];

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          OSINT Search Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter search term..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              onClick={() => handleSearch("general")}
              disabled={!searchQuery || isSearching}
            >
              Search
            </Button>
          </div>

          <Tabs defaultValue="general" className="mt-4">
            <TabsList className="grid grid-cols-4 gap-2">
              {searchCategories.map(category => (
                <TabsTrigger key={category.id} value={category.id}>
                  <div className="flex flex-col items-center gap-1">
                    <category.icon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {searchCategories.map(category => (
              <TabsContent key={category.id} value={category.id}>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-4">
                      {category.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {category.id === "social" && socialPlatforms.map(platform => (
                        <Button
                          key={platform.id}
                          variant="outline"
                          className="w-full"
                          onClick={() => window.open(platform.url + searchQuery, '_blank')}
                        >
                          Search {platform.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}

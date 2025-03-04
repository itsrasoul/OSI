import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const searchCategories = [
    {
      id: "general",
      name: "General Info",
      icon: Search,
      description: "Basic information and overview"
    },
    {
      id: "social",
      name: "Social Media",
      icon: Users,
      description: "Social media profiles and activity"
    },
    {
      id: "business",
      name: "Professional",
      icon: Building2,
      description: "Work history and business connections"
    },
    {
      id: "education",
      name: "Education",
      icon: GraduationCap,
      description: "Educational background"
    }
  ];

  // Simulated search results based on the query
  const simulateSearch = async (query: string, type: string) => {
    setIsSearching(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock results based on search type
      let results = [];
      const timestamp = new Date().toISOString();

      switch (type) {
        case "social":
          results = [
            {
              platform: "LinkedIn",
              possible_profile: `linkedin.com/in/${query.toLowerCase().replace(/\s+/g, '-')}`,
              notes: "Potential professional profile match"
            },
            {
              platform: "Twitter",
              possible_profile: `twitter.com/${query.toLowerCase().replace(/\s+/g, '')}`,
              notes: "Possible Twitter handle"
            }
          ];
          break;
        case "business":
          results = [
            {
              type: "Company",
              name: "Example Corp",
              role: "Potential workplace",
              location: "Various locations"
            }
          ];
          break;
        case "education":
          results = [
            {
              type: "University",
              name: "Various institutions",
              years: "Recent years",
              notes: "Potential educational history"
            }
          ];
          break;
        default:
          results = [
            {
              type: "General Info",
              summary: `Information related to: ${query}`,
              source: "OSINT Search"
            }
          ];
      }

      setSearchResults(results);

      // Save the search attempt
      onResultFound("search_results", {
        search_type: type,
        query: query,
        timestamp: timestamp,
        results: results
      });

      toast({
        title: "Search completed",
        description: `Found ${results.length} potential matches`
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
              onClick={() => simulateSearch(searchQuery, "general")}
              disabled={!searchQuery || isSearching}
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          <ScrollArea className="h-[400px]">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="w-full grid grid-cols-4 gap-4">
                {searchCategories.map(category => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    onClick={() => simulateSearch(searchQuery, category.id)}
                    disabled={!searchQuery || isSearching}
                    className="flex flex-col items-center p-4"
                  >
                    <category.icon className="h-5 w-5 mb-2" />
                    <span>{category.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {searchCategories.map(category => (
                <TabsContent key={category.id} value={category.id}>
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4">{category.name} Results</h3>
                      {searchResults.length > 0 ? (
                        <div className="space-y-4">
                          {searchResults.map((result, index) => (
                            <Card key={index} className="p-4">
                              <div className="space-y-2">
                                {Object.entries(result).map(([key, value]) => (
                                  <div key={key} className="grid grid-cols-3 gap-2">
                                    <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>
                                    <span className="col-span-2">{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          Enter a search term and click search to find information
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Case, CaseInfo, categories } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InfoForm from "@/components/cases/info-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FileText, AlertCircle, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CaseDetail() {
  const { id } = useParams();
  const caseId = parseInt(id);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{category: string, data: any}>>([]);
  const [activeSearch, setActiveSearch] = useState<string | null>(null);

  const { data: case_ } = useQuery<Case>({ 
    queryKey: [`/api/cases/${id}`]
  });

  const { data: caseInfo } = useQuery<CaseInfo[]>({ 
    queryKey: [`/api/cases/${id}/info`]
  });

  // Initialize Google Custom Search Element
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cse.google.com/cse.js?cx=d3a5507656c25422a";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setActiveSearch(searchTerm);

    try {
      const findings = [];

      // Email Analysis
      if (searchTerm.includes('@')) {
        findings.push({
          category: "personal_info",
          data: {
            email: searchTerm,
            name: searchTerm.split('@')[0],
            source: "Email Analysis"
          }
        });
      }

      // Username Analysis
      const usernamePattern = searchTerm.toLowerCase().replace(/[^a-z0-9]/g, '');
      const socialPlatforms = [
        { name: 'Twitter', url: `https://twitter.com/${usernamePattern}` },
        { name: 'LinkedIn', url: `https://linkedin.com/in/${usernamePattern}` },
        { name: 'GitHub', url: `https://github.com/${usernamePattern}` },
        { name: 'Instagram', url: `https://instagram.com/${usernamePattern}` },
        { name: 'Facebook', url: `https://facebook.com/${usernamePattern}` }
      ];

      findings.push({
        category: "social_media",
        data: {
          platform: "Cross Platform",
          username: usernamePattern,
          profiles: socialPlatforms.map(p => `${p.name}: ${p.url}`).join('\n'),
          source: "Social Media Analysis"
        }
      });

      // Domain Analysis
      if (searchTerm.includes('.')) {
        try {
          const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(searchTerm)}`);
          const data = await response.json();
          if (data.Answer) {
            findings.push({
              category: "domains",
              data: {
                domain: searchTerm,
                ip_addresses: data.Answer.map((a: any) => a.data).join(', '),
                source: "DNS Records"
              }
            });
          }
        } catch (error) {
          console.error("DNS lookup failed:", error);
        }
      }

      setSearchResults(findings);

      // Save findings
      for (const finding of findings) {
        await apiRequest("POST", `/api/cases/${id}/info`, {
          caseId,
          category: finding.category,
          data: finding.data,
          source: "OSINT Analysis",
          confidence: "medium",
          verificationStatus: "unverified"
        });
      }

      queryClient.invalidateQueries({ queryKey: [`/api/cases/${id}/info`] });
      toast({ 
        title: "Search Complete", 
        description: `Found information across ${findings.length} categories` 
      });
    } catch (error) {
      toast({ 
        title: "Search Failed", 
        description: "Error gathering information",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      high: "default",
      medium: "secondary",
      low: "destructive"
    };
    return variants[confidence] || "default";
  };

  const renderInfoData = (info: CaseInfo) => {
    if (!info.data) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant={getConfidenceBadge(info.confidence)}>
            {info.confidence}
          </Badge>
          {info.verificationStatus && (
            <Badge variant="outline">
              {info.verificationStatus.replace('_', ' ')}
            </Badge>
          )}
        </div>

        <div className="bg-card/50 rounded-md p-4">
          {typeof info.data === 'object' && !('content' in info.data) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(info.data).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <span className="font-medium capitalize min-w-[120px]">
                    {key.replace(/_/g, " ")}:
                  </span>
                  <span className="text-muted-foreground">{value?.toString() || '-'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-muted-foreground">
              {info.data.content}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          {info.source && (
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Source: {info.source}</span>
            </div>
          )}
          <span>
            Added {formatDistanceToNow(new Date(info.timestamp))} ago
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold">{case_?.name}</h1>
          <Badge variant="outline">{case_?.status}</Badge>
          {case_?.priority && (
            <Badge>{case_?.priority}</Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-2">{case_?.description}</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Enter target identifier (name, email, username...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={!searchTerm.trim() || isSearching}
                className="min-w-[100px]"
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Google Custom Search Results */}
        <Card>
          <CardHeader>
            <CardTitle>Web Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="gcse-search" data-gname="web-results"></div>
          </CardContent>
        </Card>

        {/* Social Media Results */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Social Media Profiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-4">
                  {searchResults
                    .filter(result => result.category === "social_media")
                    .map((result, index) => (
                      <div key={index} className="space-y-2">
                        <div className="whitespace-pre-wrap text-sm">
                          {result.data.profiles?.split('\n').map((profile: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 py-1">
                              <a 
                                href={profile.split(': ')[1]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                {profile.split(': ')[0]}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Additional Info */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {searchResults
                    .filter(result => !["social_media", "search_results"].includes(result.category))
                    .map((result, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold capitalize">
                            {result.category.replace(/_/g, " ")}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(result.data).map(([key, value]) => (
                              <div key={key} className="flex gap-2">
                                <span className="font-medium capitalize min-w-[120px]">
                                  {key.replace(/_/g, " ")}:
                                </span>
                                <span className="text-muted-foreground">{value?.toString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue={categories[0]} className="space-y-6">
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <TabsList className="w-full p-1">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category.replace(/_/g, " ")}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Add {category.replace(/_/g, " ")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <InfoForm caseId={caseId} category={category} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Existing {category.replace(/_/g, " ")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] pr-4">
                    {caseInfo?.filter(info => info.category === category).length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-muted-foreground">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        No information found
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {caseInfo
                          ?.filter((info) => info.category === category)
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .map((info) => (
                            <Card key={info.id} className="p-4">
                              {renderInfoData(info)}
                            </Card>
                          ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
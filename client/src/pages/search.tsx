import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Globe,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  MapPin,
  Mail,
  Phone,
  User,
  Building,
  Calendar,
  Filter,
  Download,
  Share2,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdvancedSearchPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Search configuration
  const [searchConfig, setSearchConfig] = useState({
    platforms: {
      google: true,
      bing: true,
      duckduckgo: false,
      socialMedia: true,
      darkWeb: false,
      academic: false
    },
    socialPlatforms: {
      twitter: true,
      facebook: true,
      instagram: true,
      linkedin: true,
      youtube: false,
      github: false
    },
    dataTypes: {
      personal: true,
      professional: true,
      contact: true,
      location: true,
      financial: false,
      criminal: false
    },
    filters: {
      dateRange: "any",
      language: "en",
      region: "global",
      safeSearch: true
    }
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a search term",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);

    try {
      // Simulate advanced search with multiple sources
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock results based on search configuration
      const results = generateAdvancedResults(searchQuery, searchConfig);
      setSearchResults(results);

      toast({
        title: "Search completed",
        description: `Found ${results.length} results across multiple sources`
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to complete search",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const generateAdvancedResults = (query: string, config: any) => {
    const results = [];

    // Web search results
    if (config.platforms.google || config.platforms.bing) {
      results.push({
        id: 1,
        type: "web",
        title: `${query} - Professional Profile`,
        url: `https://www.linkedin.com/in/${query.toLowerCase()}`,
        snippet: `View ${query}'s professional profile on LinkedIn. Experience in technology and business development.`,
        source: "LinkedIn",
        date: new Date().toISOString(),
        relevance: 0.95
      });
    }

    // Social media results
    if (config.platforms.socialMedia) {
      if (config.socialPlatforms.twitter) {
        results.push({
          id: 2,
          type: "social",
          title: `@${query.toLowerCase()}`,
          url: `https://twitter.com/${query.toLowerCase()}`,
          snippet: `Twitter profile for ${query}. Active user with ${Math.floor(Math.random() * 1000)}+ followers.`,
          source: "Twitter",
          date: new Date().toISOString(),
          relevance: 0.88
        });
      }

      if (config.socialPlatforms.facebook) {
        results.push({
          id: 3,
          type: "social",
          title: `${query} on Facebook`,
          url: `https://facebook.com/${query.toLowerCase()}`,
          snippet: `Facebook profile and activity for ${query}. Located in major metropolitan area.`,
          source: "Facebook",
          date: new Date().toISOString(),
          relevance: 0.82
        });
      }
    }

    // Professional results
    if (config.dataTypes.professional) {
      results.push({
        id: 4,
        type: "professional",
        title: `${query} - Company Directory`,
        url: `https://company.com/directory/${query.toLowerCase()}`,
        snippet: `Employee profile: ${query}, Senior Developer at Tech Corp. Joined in 2020.`,
        source: "Corporate Directory",
        date: new Date().toISOString(),
        relevance: 0.91
      });
    }

    // Contact information
    if (config.dataTypes.contact) {
      results.push({
        id: 5,
        type: "contact",
        title: `${query} - Contact Information`,
        url: `https://whitepages.com/name/${query.toLowerCase()}`,
        snippet: `Phone: (555) 123-4567, Email: ${query.toLowerCase()}@example.com, Address: 123 Main St`,
        source: "Public Records",
        date: new Date().toISOString(),
        relevance: 0.78
      });
    }

    return results;
  };

  const exportResults = () => {
    const csvContent = [
      ["Type", "Title", "URL", "Source", "Date", "Relevance"],
      ...searchResults.map(result => [
        result.type,
        result.title,
        result.url,
        result.source,
        result.date,
        result.relevance
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `osint-search-${searchQuery}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export completed",
      description: "Search results exported to CSV"
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Advanced OSINT Search</h1>
          <p className="text-muted-foreground">
            Comprehensive intelligence gathering across multiple sources
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportResults} disabled={searchResults.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share Search
          </Button>
        </div>
      </div>

      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Search Configuration</TabsTrigger>
          <TabsTrigger value="results">Search Results</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Main Search Input */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    className="pl-10 text-lg"
                    placeholder="Enter name, email, username, company, or any identifier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isSearching}
                  size="lg"
                  className="px-8"
                >
                  {isSearching ? "Searching..." : "Advanced Search"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platforms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Search Platforms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="google"
                      checked={searchConfig.platforms.google}
                      onCheckedChange={(checked) =>
                        setSearchConfig(prev => ({
                          ...prev,
                          platforms: { ...prev.platforms, google: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="google">Google</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bing"
                      checked={searchConfig.platforms.bing}
                      onCheckedChange={(checked) =>
                        setSearchConfig(prev => ({
                          ...prev,
                          platforms: { ...prev.platforms, bing: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="bing">Bing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="duckduckgo"
                      checked={searchConfig.platforms.duckduckgo}
                      onCheckedChange={(checked) =>
                        setSearchConfig(prev => ({
                          ...prev,
                          platforms: { ...prev.platforms, duckduckgo: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="duckduckgo">DuckDuckGo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="social"
                      checked={searchConfig.platforms.socialMedia}
                      onCheckedChange={(checked) =>
                        setSearchConfig(prev => ({
                          ...prev,
                          platforms: { ...prev.platforms, socialMedia: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="social">Social Media</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Platforms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Twitter className="h-5 w-5" />
                  Social Platforms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(searchConfig.socialPlatforms).map(([platform, checked]) => (
                    <div key={platform} className="flex items-center space-x-2">
                      <Checkbox
                        id={platform}
                        checked={checked}
                        onCheckedChange={(checked) =>
                          setSearchConfig(prev => ({
                            ...prev,
                            socialPlatforms: { ...prev.socialPlatforms, [platform]: checked as boolean }
                          }))
                        }
                      />
                      <Label htmlFor={platform} className="capitalize">{platform}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Data Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(searchConfig.dataTypes).map(([type, checked]) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={checked}
                        onCheckedChange={(checked) =>
                          setSearchConfig(prev => ({
                            ...prev,
                            dataTypes: { ...prev.dataTypes, [type]: checked as boolean }
                          }))
                        }
                      />
                      <Label htmlFor={type} className="capitalize">{type.replace('_', ' ')}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateRange">Date Range</Label>
                    <Select
                      value={searchConfig.filters.dateRange}
                      onValueChange={(value) =>
                        setSearchConfig(prev => ({
                          ...prev,
                          filters: { ...prev.filters, dateRange: value }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any time</SelectItem>
                        <SelectItem value="day">Past 24 hours</SelectItem>
                        <SelectItem value="week">Past week</SelectItem>
                        <SelectItem value="month">Past month</SelectItem>
                        <SelectItem value="year">Past year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={searchConfig.filters.language}
                      onValueChange={(value) =>
                        setSearchConfig(prev => ({
                          ...prev,
                          filters: { ...prev.filters, language: value }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="safeSearch"
                    checked={searchConfig.filters.safeSearch}
                    onCheckedChange={(checked) =>
                      setSearchConfig(prev => ({
                        ...prev,
                        filters: { ...prev.filters, safeSearch: checked as boolean }
                      }))
                    }
                  />
                  <Label htmlFor="safeSearch">Safe search (filter explicit content)</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Search Results ({searchResults.length})</h2>
                <Badge variant="secondary">Query: {searchQuery}</Badge>
              </div>

              {searchResults.map((result) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full p-2 bg-primary/10">
                        {result.type === 'web' && <Globe className="h-4 w-4 text-primary" />}
                        {result.type === 'social' && <Twitter className="h-4 w-4 text-primary" />}
                        {result.type === 'professional' && <Building className="h-4 w-4 text-primary" />}
                        {result.type === 'contact' && <Mail className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium hover:underline cursor-pointer">{result.title}</h3>
                          <Badge variant="outline" className="text-xs">{result.source}</Badge>
                          <Badge variant="secondary" className="text-xs">
                            {(result.relevance * 100).toFixed(0)}% relevance
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{result.snippet}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{result.url}</span>
                          <span>{new Date(result.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No search results yet</h3>
                <p className="text-muted-foreground">
                  Configure your search parameters and click "Advanced Search" to begin gathering intelligence.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{searchResults.length}</div>
                    <div className="text-sm text-muted-foreground">Total Results</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {searchResults.filter(r => r.relevance > 0.8).length}
                    </div>
                    <div className="text-sm text-muted-foreground">High Relevance</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {new Set(searchResults.map(r => r.source)).size}
                    </div>
                    <div className="text-sm text-muted-foreground">Sources</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Source Distribution</h4>
                  {Object.entries(
                    searchResults.reduce((acc, result) => {
                      acc[result.source] = (acc[result.source] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-sm">{source}</span>
                      <Badge variant="secondary">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

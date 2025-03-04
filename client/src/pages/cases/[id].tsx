import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Case, CaseInfo, categories } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InfoForm from "@/components/cases/info-form";
import CaseDashboard from "@/components/cases/case-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  FileText,
  AlertCircle,
  Users,
  Globe,
  Building,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import CaseControls from "@/components/cases/case-controls";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export default function CaseDetail() {
  const { id } = useParams();
  const caseId = parseInt(id);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{category: string, data: any}>>([]);
  const [activeSearch, setActiveSearch] = useState<string | null>(null);

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

  const { data: case_ } = useQuery<Case>({
    queryKey: [`/api/cases/${id}`]
  });

  const { data: caseInfo } = useQuery<CaseInfo[]>({
    queryKey: [`/api/cases/${id}/info`]
  });

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
            domain: searchTerm.split('@')[1],
            source: "Email Analysis",
            links: [
              `https://haveibeenpwned.com/account/${searchTerm}`,
              `https://hunter.io/email-verifier/${searchTerm}`
            ].join('\n')
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
        { name: 'Facebook', url: `https://facebook.com/${usernamePattern}` },
        { name: 'TikTok', url: `https://tiktok.com/@${usernamePattern}` },
        { name: 'Reddit', url: `https://reddit.com/user/${usernamePattern}` },
        { name: 'YouTube', url: `https://youtube.com/@${usernamePattern}` },
        { name: 'Medium', url: `https://medium.com/@${usernamePattern}` },
        { name: 'Dev.to', url: `https://dev.to/${usernamePattern}` },
        { name: 'Mastodon', url: `https://mastodon.social/@${usernamePattern}` }
      ];

      findings.push({
        category: "social_media",
        data: {
          platform: "Cross Platform",
          username: usernamePattern,
          profiles: socialPlatforms.map(p => `${p.name}: ${p.url}`).join('\n'),
          source: "Social Media Analysis",
          usernameLookup: `https://namechk.com/${usernamePattern}`
        }
      });

      // Domain Analysis
      if (searchTerm.includes('.')) {
        findings.push({
          category: "domains",
          data: {
            domain: searchTerm,
            links: [
              `WHOIS Lookup: https://who.is/whois/${searchTerm}`,
              `DNS Records: https://dns-lookup.com/${searchTerm}`,
              `SSL Info: https://www.ssllabs.com/ssltest/analyze.html?d=${searchTerm}`,
              `Archive: https://web.archive.org/web/*/${searchTerm}`,
              `Subdomains: https://crt.sh/?q=${searchTerm}`
            ].join('\n'),
            source: "Domain Intelligence",
            tools: [
              `Shodan: https://www.shodan.io/search?query=${searchTerm}`,
              `SecurityTrails: https://securitytrails.com/domain/${searchTerm}/dns`
            ].join('\n')
          }
        });
      }

      // Public Records Search
      findings.push({
        category: "search_results",
        data: {
          source: "Public Records",
          generalSearch: [
            `Brave Search: https://search.brave.com/search?q=${encodeURIComponent(searchTerm)}`,
            `DuckDuckGo: https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}`,
            `Yandex: https://yandex.com/search/?text=${encodeURIComponent(searchTerm)}`,
            `Wayback Machine: https://archive.org/search?query=${encodeURIComponent(searchTerm)}`
          ].join('\n'),
          newsSearch: [
            `Google News: https://news.google.com/search?q=${encodeURIComponent(searchTerm)}`,
            `Bing News: https://www.bing.com/news/search?q=${encodeURIComponent(searchTerm)}`
          ].join('\n'),
          imageSearch: [
            `Google Images: https://images.google.com/search?q=${encodeURIComponent(searchTerm)}`,
            `TinEye: https://tineye.com/search?q=${encodeURIComponent(searchTerm)}`
          ].join('\n'),
          documentSearch: [
            `Google Docs: https://www.google.com/search?q=filetype:doc+OR+filetype:pdf+${encodeURIComponent(searchTerm)}`,
            `SlideShare: https://www.slideshare.net/search/slideshow?q=${encodeURIComponent(searchTerm)}`
          ].join('\n')
        }
      });

      // Business Intelligence
      if (searchTerm.length > 2) {
        findings.push({
          category: "employment",
          data: {
            query: searchTerm,
            businessSearch: [
              `CrunchBase: https://www.crunchbase.com/textsearch?q=${encodeURIComponent(searchTerm)}`,
              `OpenCorporates: https://opencorporates.com/companies?q=${encodeURIComponent(searchTerm)}`,
              `LinkedIn Companies: https://www.linkedin.com/company/${searchTerm}`
            ].join('\n'),
            source: "Business Intelligence"
          }
        });
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
        description: `Found ${findings.length} intelligence sources`
      });
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Error gathering intelligence",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const renderInfoData = (info: CaseInfo) => {
    if (!info.data) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant={info.confidence === "high" ? "default" :
                        info.confidence === "medium" ? "secondary" :
                        "destructive"}>
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
    <motion.div
      className="space-y-6"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className="border-b pb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold">{case_?.name}</h1>
            <p className="text-muted-foreground mt-2">{case_?.description}</p>
          </div>
          {case_ && (
            <CaseControls
              caseId={caseId}
              status={case_.status}
              priority={case_.priority}
            />
          )}
        </div>
      </motion.div>

      <motion.div
        className="max-w-2xl mx-auto space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Enter name, email, username, domain, or any identifier..."
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

            {activeSearch && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Analyzing information for: </span>
                <Badge variant="secondary">{activeSearch}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Google Custom Search Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Live Google Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <style>{`
              /* Dark theme styles for Google Custom Search */
              .gsc-control-cse {
                background-color: transparent !important;
                border: none !important;
              }
              .gsc-input-box {
                background: hsl(var(--background)) !important;
                border-color: hsl(var(--border)) !important;
              }
              .gsc-input {
                color: hsl(var(--foreground)) !important;
              }
              .gsc-completion-container {
                background: hsl(var(--background)) !important;
                border-color: hsl(var(--border)) !important;
              }
              .gsc-completion-title {
                color: hsl(var(--foreground)) !important;
              }
              .gsc-result {
                background-color: transparent !important;
              }
              .gs-title {
                color: hsl(var(--primary)) !important;
              }
              .gs-snippet {
                color: hsl(var(--muted-foreground)) !important;
              }
              .gsc-url-top {
                color: hsl(var(--muted-foreground)) !important;
              }
              .gsc-table-result {
                background-color: transparent !important;
              }
              .gsc-cursor-page {
                color: hsl(var(--foreground)) !important;
              }
              .gsc-cursor-current-page {
                color: hsl(var(--primary)) !important;
              }
              .gsc-search-button-v2 {
                background-color: hsl(var(--primary)) !important;
                border-color: hsl(var(--primary)) !important;
              }
            `}</style>
            <div className="gcse-search" data-gname="web-results"></div>
          </CardContent>
        </Card>

        {/* Investigation Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <CaseDashboard caseInfo={caseInfo} />
        </motion.div>

        {/* Social Media Results */}
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
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
                        <motion.div
                          key={index}
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="whitespace-pre-wrap text-sm">
                            {result.data.profiles?.split('\n').map((profile: string, i: number) => (
                              <motion.div
                                key={i}
                                className="flex items-center gap-2 py-1"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                              >
                                <a
                                  href={profile.split(': ')[1]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  {profile.split(': ')[0]}
                                </a>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Additional Info - Enhanced */}
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="grid gap-4">
              {/* Domain Information */}
              {searchResults.some(r => r.category === "domains") && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-500" />
                      Domain Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px] pr-4">
                      {searchResults
                        .filter(r => r.category === "domains")
                        .map((result, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="space-y-4"
                          >
                            <div className="whitespace-pre-wrap">
                              {result.data.links?.split('\n').map((link: string, i: number) => (
                                <motion.div
                                  key={i}
                                  className="flex items-center gap-2 py-1"
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                >
                                  <a
                                    href={link.split(': ')[1]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {link.split(': ')[0]}
                                  </a>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Business Information */}
              {searchResults.some(r => r.category === "employment") && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-green-500" />
                      Business Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px] pr-4">
                      {searchResults
                        .filter(r => r.category === "employment")
                        .map((result, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="space-y-4"
                          >
                            <div className="whitespace-pre-wrap">
                              {result.data.businessSearch?.split('\n').map((link: string, i: number) => (
                                <motion.div
                                  key={i}
                                  className="flex items-center gap-2 py-1"
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                >
                                  <a
                                    href={link.split(': ')[1]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {link.split(': ')[0]}
                                  </a>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Search Results */}
              {searchResults.some(r => r.category === "search_results") && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-purple-500" />
                      Search Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] pr-4">
                      {searchResults
                        .filter(r => r.category === "search_results")
                        .map((result, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="space-y-6"
                          >
                            {/* General Search */}
                            <div className="space-y-2">
                              <h3 className="text-sm font-medium text-muted-foreground">
                                General Search
                              </h3>
                              <div className="grid gap-2">
                                {result.data.generalSearch?.split('\n').map((link: string, i: number) => (
                                  <motion.a
                                    key={i}
                                    href={link.split(': ')[1]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                  >
                                    {link.split(': ')[0]}
                                  </motion.a>
                                ))}
                              </div>
                            </div>

                            {/* News Search */}
                            <div className="space-y-2">
                              <h3 className="text-sm font-medium text-muted-foreground">
                                News Search
                              </h3>
                              <div className="grid gap-2">
                                {result.data.newsSearch?.split('\n').map((link: string, i: number) => (
                                  <motion.a
                                    key={i}
                                    href={link.split(': ')[1]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                  >
                                    {link.split(': ')[0]}
                                  </motion.a>
                                ))}
                              </div>
                            </div>

                            {/* Document Search */}
                            <div className="space-y-2">
                              <h3 className="text-sm font-medium text-muted-foreground">
                                Document Search
                              </h3>
                              <div className="grid gap-2">
                                {result.data.documentSearch?.split('\n').map((link: string, i: number) => (
                                  <motion.a
                                    key={i}
                                    href={link.split(': ')[1]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                  >
                                    {link.split(': ')[0]}
                                  </motion.a>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="overflow-hidden"
        >
          <Tabs defaultValue={categories[0]} className="space-y-6">
            <div className="relative">
              <ScrollArea className="w-full">
                <TabsList className="inline-flex w-max border-b p-1 gap-2">
                  {categories.map((category) => (
                    <TabsTrigger 
                      key={category} 
                      value={category} 
                      className="min-w-[150px] capitalize whitespace-nowrap"
                    >
                      {category.replace(/_/g, " ")}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>
            </div>

            {categories.map((category) => (
              <TabsContent key={category} value={category} className="mt-6 min-h-[500px]">
                <div className="grid gap-6 xl:grid-cols-2">
                  <Card className="h-fit">
                    <CardHeader>
                      <CardTitle>Add {category.replace(/_/g, " ")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <InfoForm caseId={caseId} category={category} />
                    </CardContent>
                  </Card>

                  <Card className="h-fit">
                    <CardHeader>
                      <CardTitle>Existing {category.replace(/_/g, " ")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-[calc(100vh-24rem)] overflow-y-auto pr-4">
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
                                <motion.div
                                  key={info.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 }}
                                >
                                  <Card className="p-4">
                                    {renderInfoData(info)}
                                  </Card>
                                </motion.div>
                              ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
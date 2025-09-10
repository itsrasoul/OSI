import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Globe,
  Mail,
  Phone,
  MapPin,
  Hash,
  Link2,
  Shield,
  Eye,
  FileText,
  Image,
  Video,
  Code,
  Database,
  Wifi,
  Server,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Download,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ToolsPage() {
  const { toast } = useToast();
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // Tool states
  const [emailLookup, setEmailLookup] = useState("");
  const [phoneLookup, setPhoneLookup] = useState("");
  const [domainLookup, setDomainLookup] = useState("");
  const [ipLookup, setIpLookup] = useState("");
  const [hashLookup, setHashLookup] = useState("");
  const [urlAnalysis, setUrlAnalysis] = useState("");

  const handleToolAction = (toolName: string, input: string) => {
    if (!input.trim()) {
      toast({
        title: "Input required",
        description: `Please enter a ${toolName.toLowerCase()} to analyze.`,
        variant: "destructive"
      });
      return;
    }

    setActiveTool(toolName);
    toast({
      title: `${toolName} Analysis`,
      description: `Analyzing ${input}...`
    });

    // Simulate analysis
    setTimeout(() => {
      setActiveTool(null);
      toast({
        title: "Analysis Complete",
        description: `${toolName} analysis finished. Check results below.`
      });
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard."
    });
  };

  const tools = [
    {
      id: "email",
      name: "Email Analysis",
      icon: Mail,
      description: "Analyze email addresses for validity, domain info, and potential breaches",
      category: "Contact"
    },
    {
      id: "phone",
      name: "Phone Lookup",
      icon: Phone,
      description: "Lookup phone numbers for carrier info, location, and validation",
      category: "Contact"
    },
    {
      id: "domain",
      name: "Domain Analysis",
      icon: Globe,
      description: "Check domain registration, WHOIS data, and security status",
      category: "Web"
    },
    {
      id: "ip",
      name: "IP Geolocation",
      icon: MapPin,
      description: "Get detailed geolocation and network information for IP addresses",
      category: "Network"
    },
    {
      id: "hash",
      name: "Hash Analysis",
      icon: Hash,
      description: "Analyze file hashes for malware detection and file identification",
      category: "Security"
    },
    {
      id: "url",
      name: "URL Analysis",
      icon: Link2,
      description: "Check URLs for malicious content, redirects, and safety status",
      category: "Security"
    }
  ];

  const categories = ["All", "Contact", "Web", "Network", "Security"];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">OSINT Tools</h1>
          <p className="text-muted-foreground">
            Professional-grade investigation tools and utilities
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Shield className="h-4 w-4 mr-1" />
            Secure Analysis
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Eye className="h-4 w-4 mr-1" />
            Privacy Focused
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="tools" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tools">Investigation Tools</TabsTrigger>
          <TabsTrigger value="utilities">Utilities</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-6">
          {/* Tool Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Tool Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Email Analysis Tool */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail className="h-5 w-5 text-blue-500" />
                  Email Analysis
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Validate emails, check breaches, and analyze domains
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    placeholder="user@example.com"
                    value={emailLookup}
                    onChange={(e) => setEmailLookup(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleToolAction("Email Analysis", emailLookup)}
                  disabled={activeTool === "Email Analysis"}
                >
                  {activeTool === "Email Analysis" ? "Analyzing..." : "Analyze Email"}
                </Button>
              </CardContent>
            </Card>

            {/* Phone Lookup Tool */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Phone className="h-5 w-5 text-green-500" />
                  Phone Lookup
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Carrier info, location data, and number validation
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={phoneLookup}
                    onChange={(e) => setPhoneLookup(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleToolAction("Phone Lookup", phoneLookup)}
                  disabled={activeTool === "Phone Lookup"}
                >
                  {activeTool === "Phone Lookup" ? "Looking up..." : "Lookup Phone"}
                </Button>
              </CardContent>
            </Card>

            {/* Domain Analysis Tool */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5 text-purple-500" />
                  Domain Analysis
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  WHOIS data, DNS records, and security status
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain Name</Label>
                  <Input
                    id="domain"
                    placeholder="example.com"
                    value={domainLookup}
                    onChange={(e) => setDomainLookup(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleToolAction("Domain Analysis", domainLookup)}
                  disabled={activeTool === "Domain Analysis"}
                >
                  {activeTool === "Domain Analysis" ? "Analyzing..." : "Analyze Domain"}
                </Button>
              </CardContent>
            </Card>

            {/* IP Geolocation Tool */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-red-500" />
                  IP Geolocation
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Geographic location, ISP, and network information
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ip">IP Address</Label>
                  <Input
                    id="ip"
                    placeholder="192.168.1.1"
                    value={ipLookup}
                    onChange={(e) => setIpLookup(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleToolAction("IP Geolocation", ipLookup)}
                  disabled={activeTool === "IP Geolocation"}
                >
                  {activeTool === "IP Geolocation" ? "Locating..." : "Geolocate IP"}
                </Button>
              </CardContent>
            </Card>

            {/* Hash Analysis Tool */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Hash className="h-5 w-5 text-orange-500" />
                  Hash Analysis
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Malware detection and file type identification
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hash">File Hash</Label>
                  <Input
                    id="hash"
                    placeholder="MD5, SHA1, or SHA256 hash"
                    value={hashLookup}
                    onChange={(e) => setHashLookup(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleToolAction("Hash Analysis", hashLookup)}
                  disabled={activeTool === "Hash Analysis"}
                >
                  {activeTool === "Hash Analysis" ? "Analyzing..." : "Analyze Hash"}
                </Button>
              </CardContent>
            </Card>

            {/* URL Analysis Tool */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Link2 className="h-5 w-5 text-indigo-500" />
                  URL Analysis
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Malware scanning, redirect chains, and safety checks
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL to Analyze</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com"
                    value={urlAnalysis}
                    onChange={(e) => setUrlAnalysis(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleToolAction("URL Analysis", urlAnalysis)}
                  disabled={activeTool === "URL Analysis"}
                >
                  {activeTool === "URL Analysis" ? "Analyzing..." : "Analyze URL"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Sample Analysis Result</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="secondary">Clean</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence:</span>
                      <span>95%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Scanned:</span>
                      <span>2 minutes ago</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard("Sample result data")}>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utilities" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Code Utilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Base64 Encoder/Decoder</Label>
                  <Textarea placeholder="Enter text to encode/decode..." />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">Encode</Button>
                  <Button className="flex-1" variant="outline">Decode</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Converters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>JSON Formatter</Label>
                  <Textarea placeholder="Paste JSON to format..." />
                </div>
                <Button className="w-full">Format JSON</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Network Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Port Scanner</Label>
                  <Input placeholder="example.com:80" />
                </div>
                <Button className="w-full">Scan Ports</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  File Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Metadata Extractor</Label>
                  <Input type="file" />
                </div>
                <Button className="w-full">Extract Metadata</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Essential Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href="https://haveibeenpwned.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Have I Been Pwned
                  </div>
                  <div className="text-sm text-muted-foreground">Check for data breaches</div>
                </a>

                <a
                  href="https://www.virustotal.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    VirusTotal
                  </div>
                  <div className="text-sm text-muted-foreground">File and URL analysis</div>
                </a>

                <a
                  href="https://www.shodan.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="font-medium flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Shodan
                  </div>
                  <div className="text-sm text-muted-foreground">Search internet-connected devices</div>
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Professional Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href="https://www.osintframework.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    OSINT Framework
                  </div>
                  <div className="text-sm text-muted-foreground">Comprehensive OSINT methodology</div>
                </a>

                <a
                  href="https://inteltechniques.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Intel Techniques
                  </div>
                  <div className="text-sm text-muted-foreground">Professional OSINT training</div>
                </a>

                <a
                  href="https://github.com/jivoi/awesome-osint"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="font-medium flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Awesome OSINT
                  </div>
                  <div className="text-sm text-muted-foreground">Curated OSINT tools and resources</div>
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick References</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="font-medium">OSINT Methodology</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Define → Gather → Analyze → Report
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="font-medium">Data Sources</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Public records, social media, WHOIS, DNS, etc.
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="font-medium">Legal Considerations</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Always respect privacy laws and terms of service
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

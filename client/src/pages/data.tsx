import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Globe, Twitter, Facebook, Instagram, Youtube, Search, Settings, Plus, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataSource {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "error";
  lastSync: string;
  recordsCount: number;
  apiKey?: string;
  rateLimit: number;
  description: string;
}

const mockDataSources: DataSource[] = [
  {
    id: "1",
    name: "Twitter API",
    type: "Social Media",
    status: "active",
    lastSync: "2024-01-16T10:30:00Z",
    recordsCount: 15420,
    apiKey: "••••••••••••••••",
    rateLimit: 300,
    description: "Real-time Twitter data collection and analysis"
  },
  {
    id: "2",
    name: "Facebook Graph API",
    type: "Social Media",
    status: "active",
    lastSync: "2024-01-16T09:15:00Z",
    recordsCount: 8750,
    apiKey: "••••••••••••••••",
    rateLimit: 200,
    description: "Facebook posts, profiles, and group data"
  },
  {
    id: "3",
    name: "Instagram Basic API",
    type: "Social Media",
    status: "inactive",
    lastSync: "2024-01-15T14:20:00Z",
    recordsCount: 3200,
    apiKey: "",
    rateLimit: 100,
    description: "Instagram posts and user data collection"
  },
  {
    id: "4",
    name: "Google Search API",
    type: "Search Engine",
    status: "active",
    lastSync: "2024-01-16T11:45:00Z",
    recordsCount: 25600,
    apiKey: "••••••••••••••••",
    rateLimit: 100,
    description: "Web search results and indexing data"
  },
  {
    id: "5",
    name: "Dark Web Monitor",
    type: "Dark Web",
    status: "error",
    lastSync: "2024-01-15T08:30:00Z",
    recordsCount: 450,
    apiKey: "••••••••••••••••",
    rateLimit: 50,
    description: "Dark web forums and marketplace monitoring"
  }
];

export default function DataSourcesPage() {
  const [dataSources, setDataSources] = useState<DataSource[]>(mockDataSources);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [newSource, setNewSource] = useState({
    name: "",
    type: "",
    apiKey: "",
    description: ""
  });
  const { toast } = useToast();

  const handleToggleSource = (sourceId: string) => {
    setDataSources(sources =>
      sources.map(source =>
        source.id === sourceId
          ? { ...source, status: source.status === "active" ? "inactive" : "active" }
          : source
      )
    );
  };

  const handleAddSource = () => {
    if (!newSource.name || !newSource.type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const source: DataSource = {
      id: Date.now().toString(),
      name: newSource.name,
      type: newSource.type,
      status: "inactive",
      lastSync: new Date().toISOString(),
      recordsCount: 0,
      apiKey: newSource.apiKey ? "••••••••••••••••" : "",
      rateLimit: 100,
      description: newSource.description
    };

    setDataSources([...dataSources, source]);
    setNewSource({ name: "", type: "", apiKey: "", description: "" });
    setIsAddDialogOpen(false);

    toast({
      title: "Data Source Added",
      description: "New data source has been added successfully.",
    });
  };

  const handleSyncSource = (sourceId: string) => {
    // Simulate sync
    toast({
      title: "Sync Started",
      description: "Data source synchronization has been initiated.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "inactive": return <XCircle className="h-4 w-4 text-gray-500" />;
      case "error": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "secondary";
      case "error": return "destructive";
      default: return "secondary";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Social Media": return <Twitter className="h-4 w-4" />;
      case "Search Engine": return <Search className="h-4 w-4" />;
      case "Dark Web": return <Globe className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Social Media": return "bg-blue-100 text-blue-800";
      case "Search Engine": return "bg-green-100 text-green-800";
      case "Dark Web": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Sources</h1>
          <p className="text-muted-foreground">
            Manage and configure data sources for OSINT investigations
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Data Source
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Data Source</DialogTitle>
              <DialogDescription>
                Configure a new data source for your investigations.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Source Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Twitter API"
                  value={newSource.name}
                  onChange={(e) => setNewSource({...newSource, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="type">Source Type</Label>
                <Select value={newSource.type} onValueChange={(value) => setNewSource({...newSource, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Search Engine">Search Engine</SelectItem>
                    <SelectItem value="Dark Web">Dark Web</SelectItem>
                    <SelectItem value="Public Records">Public Records</SelectItem>
                    <SelectItem value="News API">News API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="apiKey">API Key (Optional)</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter API key"
                  value={newSource.apiKey}
                  onChange={(e) => setNewSource({...newSource, apiKey: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of the data source"
                  value={newSource.description}
                  onChange={(e) => setNewSource({...newSource, description: e.target.value})}
                />
              </div>
              <Button onClick={handleAddSource} className="w-full">
                Add Data Source
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataSources.length}</div>
            <p className="text-xs text-muted-foreground">
              Configured data sources
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dataSources.filter(s => s.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dataSources.reduce((sum, source) => sum + source.recordsCount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Records collected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Sources</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dataSources.filter(s => s.status === "error").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dataSources.map((source) => (
          <Card key={source.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(source.type)}
                  <CardTitle className="text-lg">{source.name}</CardTitle>
                </div>
                {getStatusIcon(source.status)}
              </div>
              <CardDescription>{source.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getTypeColor(source.type)}>
                  {source.type}
                </Badge>
                <Badge variant={getStatusBadgeVariant(source.status)}>
                  {source.status}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Records:</span>
                  <span className="font-medium">{source.recordsCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate Limit:</span>
                  <span className="font-medium">{source.rateLimit}/hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Sync:</span>
                  <span className="font-medium">
                    {new Date(source.lastSync).toLocaleDateString()}
                  </span>
                </div>
                {source.apiKey && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">API Key:</span>
                    <span className="font-medium font-mono">{source.apiKey}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={source.status === "active"}
                    onCheckedChange={() => handleToggleSource(source.id)}
                  />
                  <Label className="text-sm">
                    {source.status === "active" ? "Active" : "Inactive"}
                  </Label>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSyncSource(source.id)}
                  >
                    Sync
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSource(source)}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration Dialog */}
      {selectedSource && (
        <Dialog open={!!selectedSource} onOpenChange={() => setSelectedSource(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure {selectedSource.name}</DialogTitle>
              <DialogDescription>
                Update settings and API configuration for this data source.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="api">API Settings</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="space-y-4">
                <div>
                  <Label htmlFor="sourceName">Source Name</Label>
                  <Input id="sourceName" defaultValue={selectedSource.name} />
                </div>
                <div>
                  <Label htmlFor="sourceDesc">Description</Label>
                  <Input id="sourceDesc" defaultValue={selectedSource.description} />
                </div>
                <div>
                  <Label htmlFor="sourceType">Type</Label>
                  <Select defaultValue={selectedSource.type}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                      <SelectItem value="Search Engine">Search Engine</SelectItem>
                      <SelectItem value="Dark Web">Dark Web</SelectItem>
                      <SelectItem value="Public Records">Public Records</SelectItem>
                      <SelectItem value="News API">News API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="api" className="space-y-4">
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input id="apiKey" type="password" defaultValue={selectedSource.apiKey} />
                </div>
                <div>
                  <Label htmlFor="rateLimit">Rate Limit (requests/hour)</Label>
                  <Input id="rateLimit" type="number" defaultValue={selectedSource.rateLimit} />
                </div>
              </TabsContent>
              <TabsContent value="advanced" className="space-y-4">
                <div>
                  <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
                  <Input id="syncInterval" type="number" defaultValue="60" />
                </div>
                <div>
                  <Label htmlFor="retention">Data Retention (days)</Label>
                  <Input id="retention" type="number" defaultValue="90" />
                </div>
              </TabsContent>
            </Tabs>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelectedSource(null)}>
                Cancel
              </Button>
              <Button>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

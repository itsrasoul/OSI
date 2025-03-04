import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Case, CaseInfo, categories, confidenceLevels } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InfoForm from "@/components/cases/info-form";
import SearchPanel from "@/components/search/search-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CaseDetail() {
  const { id } = useParams();
  const caseId = parseInt(id);

  const { data: case_ } = useQuery<Case>({ 
    queryKey: [`/api/cases/${id}`]
  });

  const { data: caseInfo } = useQuery<CaseInfo[]>({ 
    queryKey: [`/api/cases/${id}/info`]
  });

  if (!case_) return null;

  const handleSearchResult = async (category: string, data: any) => {
    try {
      await apiRequest("POST", `/api/cases/${id}/info`, {
        caseId,
        category,
        data,
        source: "OSINT Search",
        confidence: "medium"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/cases/${id}/info`] });
    } catch (error) {
      console.error("Failed to save search result:", error);
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

    if ('content' in info.data) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={getConfidenceBadge(info.confidence)}>
              {info.confidence}
            </Badge>
            {info.verificationStatus && (
              <Badge variant="outline">
                {info.verificationStatus.replace('_', ' ')}
              </Badge>
            )}
          </div>
          <p className="whitespace-pre-wrap">{info.data.content}</p>
          {info.source && (
            <p className="text-sm text-muted-foreground">
              Source: {info.source}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Added {formatDistanceToNow(new Date(info.timestamp))} ago
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={getConfidenceBadge(info.confidence)}>
            {info.confidence}
          </Badge>
          {info.verificationStatus && (
            <Badge variant="outline">
              {info.verificationStatus.replace('_', ' ')}
            </Badge>
          )}
        </div>
        {Object.entries(info.data).map(([key, value]) => (
          <div key={key} className="grid grid-cols-3 gap-2">
            <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>
            <span className="col-span-2">{value}</span>
          </div>
        ))}
        {info.source && (
          <p className="text-sm text-muted-foreground mt-2">
            Source: {info.source}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Added {formatDistanceToNow(new Date(info.timestamp))} ago
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">{case_.name}</h1>
        <p className="text-muted-foreground">{case_.description}</p>
      </div>

      <SearchPanel caseId={caseId} onResultFound={handleSearchResult} />

      <Tabs defaultValue={categories[0]} className="space-y-4">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category.replace(/_/g, " ")}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
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
                  <ScrollArea className="h-[600px]">
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
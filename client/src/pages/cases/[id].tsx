import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Case, CaseInfo, categories, confidenceLevels, verificationStatuses } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InfoForm from "@/components/cases/info-form";
import SearchPanel from "@/components/search/search-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FileText, AlertCircle } from "lucide-react";

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
        confidence: "medium",
        verificationStatus: "unverified"
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
          <h1 className="text-4xl font-bold">{case_.name}</h1>
          <Badge variant="outline">{case_.status}</Badge>
          {case_.priority && (
            <Badge>{case_.priority}</Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-2">{case_.description}</p>
      </div>

      <SearchPanel caseId={caseId} onResultFound={handleSearchResult} />

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
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Case, CaseInfo, categories } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InfoForm from "@/components/cases/info-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">{case_.name}</h1>
        <p className="text-muted-foreground">{case_.description}</p>
      </div>

      <Tabs defaultValue={categories[0]} className="space-y-4">
        <TabsList>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid gap-4 grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Add New {category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <InfoForm caseId={caseId} category={category} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Existing {category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {caseInfo
                        ?.filter((info) => info.category === category)
                        .map((info) => (
                          <div key={info.id} className="p-2 border rounded">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(info.data, null, 2)}
                            </pre>
                          </div>
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

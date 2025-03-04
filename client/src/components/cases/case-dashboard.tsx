import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { CaseInfo, Case } from "@shared/schema";
import {
  FileText,
  AlertCircle,
  Users,
  Globe,
  Building2,
  GraduationCap,
  MapPin,
  Shield,
  Calendar,
  PersonStanding,
  Mail,
  Network,
  FileSearch,
  CheckCircle2,
  AlertOctagon,
  Clock,
  CheckCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CaseDashboardProps {
  caseInfo?: Case[] | CaseInfo[];
}

export default function CaseDashboard({ caseInfo = [] }: CaseDashboardProps) {
  // Fetch all cases to get stats
  const { data: cases } = useQuery<Case[]>({
    queryKey: ['/api/cases'],
    // Refresh data every 5 seconds
    refetchInterval: 5000
  });

  // Calculate case statistics - excluding closed cases
  const activeCases = cases?.filter(c => c.status === 'active').length || 0;
  const pendingReview = cases?.filter(c => c.status === 'pending').length || 0;
  const closedCases = cases?.filter(c => c.status === 'closed').length || 0;
  const totalCases = cases?.length || 0;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className="grid gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Summary Statistics */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-3 bg-blue-500/10">
                <CheckCircle2 className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Cases</p>
                <h3 className="text-2xl font-bold">{activeCases}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-3 bg-yellow-500/10">
                <AlertOctagon className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <h3 className="text-2xl font-bold">{pendingReview}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-3 bg-red-500/10">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Closed Cases</p>
                <h3 className="text-2xl font-bold">{closedCases}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-3 bg-green-500/10">
                <Clock className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cases</p>
                <h3 className="text-2xl font-bold">{totalCases}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity Timeline */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities & Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {caseInfo?.slice(-10).map((info, index) => {
                const isInfo = 'category' in info;
                return (
                  <motion.div
                    key={info.id}
                    className="flex gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      {isInfo ? (
                        <FileText className="h-5 w-5 text-primary" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="space-y-1">
                      {isInfo ? (
                        <>
                          <p className="text-sm font-medium leading-none capitalize">
                            {info.category.replace(/_/g, " ")}
                          </p>
                          <div className="flex items-center gap-2">
                            {info.source && (
                              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Source: {info.source || 'Not specified'}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium leading-none">
                            {info.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              info.status === 'active' ? 'default' :
                              info.status === 'pending' ? 'secondary' :
                              'outline'
                            } className="text-xs">
                              {info.status}
                            </Badge>
                            <Badge variant={
                              info.priority === 'high' ? 'destructive' :
                              info.priority === 'medium' ? 'secondary' :
                              'default'
                            } className="text-xs">
                              {info.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {info.description}
                          </p>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
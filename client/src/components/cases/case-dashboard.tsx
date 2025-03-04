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

  // Calculate total information coverage percentage
  const calculateProgress = () => {
    if (!caseInfo?.length) return 0;
    const totalPossibleFields = 20; // Maximum expected fields
    const uniqueCategories = new Set(
      caseInfo
        .filter((info): info is CaseInfo => 'category' in info)
        .map(info => info.category)
    );
    return Math.min((uniqueCategories.size / totalPossibleFields) * 100, 100);
  };

  // Calculate verification percentage
  const calculateVerificationProgress = () => {
    if (!caseInfo?.length) return 0;
    const infos = caseInfo.filter((info): info is CaseInfo => 'source' in info);
    const verifiedCount = infos.filter(info => info.source).length;
    return Math.round((verifiedCount / infos.length) * 100);
  };

  // Prepare data for visualizations
  const categoryCounts = caseInfo
    .filter((info): info is CaseInfo => 'category' in info)
    .reduce((acc, info) => {
      acc[info.category] = (acc[info.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(categoryCounts || {}).map(([category, count]) => ({
    category: category.replace(/_/g, " "),
    count
  }));

  // Prepare timeline data for the line chart
  const timelineData = caseInfo
    .filter((info): info is CaseInfo => 'timestamp' in info)
    .reduce((acc, info) => {
      const date = new Date(info.timestamp).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const lineChartData = Object.entries(timelineData || {}).map(([date, count]) => ({
    date,
    findings: count
  }));

  const categoryIcons: Record<string, any> = {
    personal_info: PersonStanding,
    emails: Mail,
    social_media: Globe,
    employment: Building2,
    education: GraduationCap,
    addresses: MapPin,
    criminal_records: Shield,
    travel: Calendar,
    connections: Network,
    search_results: FileSearch
  };

  const progressPercentage = calculateProgress();
  const verificationPercentage = calculateVerificationProgress();

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

      {/* Progress and Charts */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
        {/* Investigation Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Investigation Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Target Information Coverage</span>
                  <span className="text-sm text-muted-foreground">{progressPercentage.toFixed(0)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Information Verification</span>
                  <span className="text-sm text-muted-foreground">{verificationPercentage}%</span>
                </div>
                <Progress value={verificationPercentage} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(categoryCounts || {}).map(([category, count], index) => (
                  <motion.div
                    key={category}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm capitalize">{category.replace(/_/g, " ")}</span>
                    <span className="text-sm text-muted-foreground ml-auto">{count}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Findings Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Investigation Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="findings" 
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity Timeline */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {caseInfo?.slice(-5).map((info, index) => {
                const Icon = categoryIcons[info.category] || FileText;
                const isVerified = ('source' in info) ? info.source : undefined;
                return (
                  <motion.div
                    key={info.id}
                    className="flex gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none capitalize">
                        {info.category.replace(/_/g, " ")}
                      </p>
                      <div className="flex items-center gap-2">
                        {isVerified && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Source: {isVerified || 'Not specified'}
                      </p>
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
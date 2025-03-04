import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { CaseInfo } from "@shared/schema";
import { 
  FileText, 
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
  FileSearch
} from "lucide-react";

interface CaseDashboardProps {
  caseInfo?: CaseInfo[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function CaseDashboard({ caseInfo }: CaseDashboardProps) {
  // Prepare data for visualizations
  const categoryCounts = caseInfo?.reduce((acc, info) => {
    acc[info.category] = (acc[info.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryCounts || {}).map(([category, count]) => ({
    category: category.replace(/_/g, " "),
    count
  }));

  const confidenceCounts = caseInfo?.reduce((acc, info) => {
    acc[info.confidence] = (acc[info.confidence] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(confidenceCounts || {}).map(([confidence, count]) => ({
    name: confidence,
    value: count
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

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <motion.div
      className="grid gap-6 md:grid-cols-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Data Statistics */}
      <motion.div variants={itemVariants} className="md:col-span-2">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Information Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis 
                      dataKey="category" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
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
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Confidence Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Confidence Levels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => 
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Recent Activity Timeline */}
      <motion.div variants={itemVariants} className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Investigation Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {caseInfo?.slice(-5).map((info, index) => {
                const Icon = categoryIcons[info.category] || FileText;
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
                        <Badge variant="secondary" className={`text-xs ${getConfidenceColor(info.confidence)}`}>
                          {info.confidence}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {info.verificationStatus}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Source: {info.source || 'Not specified'}
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
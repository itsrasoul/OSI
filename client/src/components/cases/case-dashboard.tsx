import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
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
  Calendar
} from "lucide-react";

interface CaseDashboardProps {
  caseInfo?: CaseInfo[];
}

export default function CaseDashboard({ caseInfo }: CaseDashboardProps) {
  // Prepare data for visualization
  const categoryCounts = caseInfo?.reduce((acc, info) => {
    acc[info.category] = (acc[info.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryCounts || {}).map(([category, count]) => ({
    category: category.replace(/_/g, " "),
    count
  }));

  const categoryIcons: Record<string, any> = {
    personal_info: Users,
    social_media: Globe,
    employment: Building2,
    education: GraduationCap,
    addresses: MapPin,
    criminal_records: Shield,
    travel: Calendar
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

  return (
    <motion.div
      className="grid gap-6 md:grid-cols-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Data Statistics */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Investigation Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity Timeline */}
      <motion.div variants={itemVariants}>
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
                      <p className="text-sm font-medium leading-none">
                        {info.category.replace(/_/g, " ")}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {info.confidence}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {info.verificationStatus}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Source: {info.source}
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

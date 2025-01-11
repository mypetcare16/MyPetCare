"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { UpcomingAppointments } from "@/components/UpcomingAppointments";
import {
  Bell,
  Calendar,
  ChevronRight,
  ClipboardList,
  Home,
  Search,
  Settings,
  Users,
  Activity,
  Brain,
  Heart,
  Pill,
  Thermometer,
  MessageCircle,
  TrendingUp,
  AlertCircle,
  Star,
  ThumbsUp,
  ArrowRight,
  UserPlus,
  FileText,
  Stethoscope,
  Zap,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays,
  Clipboard,
  UserCheck,
  MessageSquare,
  HelpCircle,
  Clock4,
  AlertTriangle,
  AlertOctagon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SlotCreationForm } from "@/components/slot-creation-form";
import { Modal, ModalContent, ModalTrigger } from "@/components/ui/modal";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-xl font-semibold text-gray-700">
          Loading vetvault...
        </p>
      </div>
    </div>
  );
};

export default function EnhancedDoctorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const router = useRouter();
  const { user } = useUser();
  const doctorId = user?.id || "";
  const [showSlotCreationForm, setShowSlotCreationForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const patientData =
    useQuery(api.patients.getAppoitmentsByDoctor, { doctorId }) || [];
  const todayAppointments = useQuery(
    api.appointment.getNumberOfAppointmentsTodayForDoctor,
    { doctorId }
  );
  const weeklyAppointments = useQuery(
    api.appointment.getWeeklyAppointmentsForDoctor,
    { doctorId }
  );
  const patientFlowData = useQuery(api.appointment.getPatientFlowThisWeek, {
    doctorId,
  });
  const patientSatisfactionData = useQuery(
    api.appointment.getPatientSatisfactionData,
    { doctorId }
  );

  const patientRetentionData = [
    { name: "New", value: 30 },
    { name: "Returning", value: 70 },
  ];

  const postConsultationData = [
    { name: "Felt Better", value: 65 },
    { name: "No Change", value: 20 },
    { name: "Worsened", value: 15 },
  ];

  const followUpData = [
    { name: "No Follow-up", value: 40 },
    { name: "Follow-up Required", value: 60 },
  ];

  const referralData = [
    { name: "Jan", referrals: 5 },
    { name: "Feb", referrals: 8 },
    { name: "Mar", referrals: 12 },
    { name: "Apr", referrals: 10 },
    { name: "May", referrals: 15 },
    { name: "Jun", referrals: 18 },
  ];

  const medicinePatternData = [
    { name: "Antibiotics", prescriptions: 120, effectiveness: 85 },
    { name: "Antihypertensives", prescriptions: 200, effectiveness: 92 },
    { name: "Antidiabetics", prescriptions: 150, effectiveness: 88 },
    { name: "Analgesics", prescriptions: 180, effectiveness: 78 },
    { name: "Antidepressants", prescriptions: 90, effectiveness: 75 },
  ];

  const whatsappBotData = [
    { name: "Appointment Reminders", value: 150 },
    { name: "Medication Reminders", value: 120 },
    { name: "Health Tips", value: 80 },
    { name: "Quick Queries", value: 50 },
  ];
  const loggedInEmail = user?.emailAddresses[0]?.emailAddress || "";

  const userExists = useQuery(api.users.checkUserEmail, {
    email: loggedInEmail,
  });
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const getCriticalityIcon = (criticality: string) => {
    switch (criticality) {
      case "High":
        return <AlertOctagon className="h-5 w-5 text-red-500" />;
      case "Medium":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "Low":
        return <AlertCircle className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex pt-4 sm:pt-16 justify-center items-center w-full">
        <div className="w-full max-w-7xl px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-0">
              Welcome, Dr {user?.username || user?.firstName || "User"}!
            </h2>
            <Modal open={isOpen} onOpenChange={setIsOpen}>
              <ModalTrigger asChild>
                <Button className="bg-blue-500 text-sm sm:text-base">
                  Create Slots
                </Button>
              </ModalTrigger>
              <ModalContent>
                <SlotCreationForm doctorId={doctorId} onClose={handleClose} />
              </ModalContent>
            </Modal>
          </div>
          <Card className="mb-4 sm:mb-8">
            <CardContent className="p-2 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                <div className="flex items-center space-x-4">
                  <CalendarDays className="h-10 w-10 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Appointments Today
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {todayAppointments
                        ? todayAppointments.count
                        : "Loading..."}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Users className="h-10 w-10 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Patients This Week
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {weeklyAppointments
                        ? weeklyAppointments.count
                        : "Loading..."}
                    </h3>
                    <p className="text-xs text-gray-500">
                      ↑ 12% from last week
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Clipboard className="h-10 w-10 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Lab Results Pending
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">7</h3>
                    <p className="text-xs text-gray-500">2 critical</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <UserCheck className="h-10 w-10 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Patient Retention Rate
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">85%</h3>
                    <p className="text-xs text-gray-500">
                      ↑ 2% from last month
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-gray-800">
                  Patient Flow This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer
                  width="100%"
                  height={200}
                  className="sm:h-[250px]"
                >
                  <LineChart data={patientFlowData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="patients"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-gray-800">
                  Patient Satisfaction Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer
                  width="100%"
                  height={200}
                  className="sm:h-[250px]"
                >
                  <RadarChart
                    outerRadius={80}
                    data={patientSatisfactionData || []}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} />
                    <Radar
                      name="You"
                      dataKey="A"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Industry Avg"
                      dataKey="B"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.6}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="mb-4 sm:mb-8">
            <UpcomingAppointments />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-gray-800">
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center space-x-4">
                    <AlertCircle className="h-6 w-6 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Potential Drug Interaction
                      </p>
                      <p className="text-xs text-gray-600">
                        Check prescriptions for patients on multiple medications
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Activity className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Improved Treatment Efficacy
                      </p>
                      <p className="text-xs text-gray-600">
                        New treatment plan showing positive results for diabetes
                        patients
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Treatment Efficacy Trend
                      </p>
                      <p className="text-xs text-gray-600">
                        15% improvement in patient outcomes for hypertension
                        treatments
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Brain className="h-6 w-6 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        AI Diagnosis Accuracy
                      </p>
                      <p className="text-xs text-gray-600">
                        95% accuracy in preliminary diagnoses this month
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-gray-800">
                  WhatsApp Bot Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer
                  width="100%"
                  height={150}
                  className="sm:h-[200px]"
                >
                  <BarChart data={whatsappBotData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-2 sm:mt-4">
                  <h4 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
                    Key Insights
                  </h4>
                  <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                    <li>
                      • 150 appointment reminders sent, reducing no-shows by 30%
                    </li>
                    <li>
                      • 120 medication reminders improving adherence rates
                    </li>
                    <li>
                      • 80 health tips shared, increasing patient engagement
                    </li>
                    <li>
                      • 50 quick queries resolved, saving 5 hours of staff time
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-gray-800">
                Follow-up Call Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-4">
                {patientData.map((patient) => (
                  <div
                    key={patient.id}
                    className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                          {patient.name} - {patient.condition}
                        </h4>
                        <p className="text-gray-600 mt-1 text-xs sm:text-sm">
                          Last visit: {patient.lastVisit} | Next appointment:{" "}
                          {patient.nextAppointment}
                        </p>
                      </div>
                      <Badge
                        variant={
                          patient.followUpStatus === "Completed"
                            ? "default"
                            : patient.followUpStatus === "Scheduled"
                              ? "secondary"
                              : "destructive"
                        }
                        className="mt-1 sm:mt-0 text-xs"
                      >
                        {patient.followUpStatus}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center">
                      {patient.followUpStatus === "Completed" && (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      )}
                      {patient.followUpStatus === "Scheduled" && (
                        <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                      )}
                      {patient.followUpStatus === "Pending" && (
                        <XCircle className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <p className="text-xs sm:text-sm text-gray-700">
                        {patient.lastFollowUpCall
                          ? `Last follow-up call: ${patient.lastFollowUpCall}`
                          : "No follow-up call recorded"}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">
                      <strong>Follow-up notes:</strong> {patient.followUpNotes}
                    </p>
                    <div className="mt-2 sm:mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-300 hover:bg-blue-50 text-xs sm:text-sm"
                        onClick={() =>
                          handleNavigation(`/patient/${patient.id}`)
                        }
                      >
                        View Full History
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-300 hover:bg-green-50 text-xs sm:text-sm"
                        onClick={() =>
                          handleNavigation(
                            `/patient/${patient.id}/treatment-plan`
                          )
                        }
                      >
                        Treatment Plan
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`text-xs sm:text-sm ${
                          patient.followUpStatus === "Completed"
                            ? "text-purple-600 border-purple-300 hover:bg-purple-50"
                            : "text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                        }`}
                        onClick={() =>
                          handleNavigation(`/patient/${patient.id}/follow-up`)
                        }
                      >
                        {patient.followUpStatus === "Completed"
                          ? "Schedule Next Follow-up"
                          : "Manage Follow-up"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

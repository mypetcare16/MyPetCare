import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Calendar,
  FileText,
  PieChart,
  MessageSquare,
  Clock,
  LucideIcon,
} from "lucide-react";
import { ClientMotionDiv } from "@/components/ClientMotionDiv";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
}) => (
  <ClientMotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <Card className="h-full border-2 border-blue-200 bg-white">
      <CardHeader>
        <Icon className="w-10 h-10 text-blue-500 mb-2" />
        <CardTitle className="text-blue-700">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-blue-900">{description}</p>
      </CardContent>
    </Card>
  </ClientMotionDiv>
);

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <Card className="border-2 border-blue-200 bg-white">
    <CardContent className="p-6">
      <div className="text-4xl font-bold mb-2 text-blue-700">{value}</div>
      <p className="text-blue-900">{label}</p>
    </CardContent>
  </Card>
);

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-blue-50 overflow-hidden">
      <main className="flex-2">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-blue-500 to-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-blue-900">
                  Your AI-Powered Doctor Companion
                </h1>
                <p className="mx-auto max-w-[700px] text-blue-800 md:text-xl">
                  Revolutionize your medical practice with MyMediRecords.
                  Enhance patient care, streamline workflows, and unlock the
                  power of AI in healthcare.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input
                    className="max-w-lg flex-1 border-blue-500"
                    placeholder="Enter your email"
                    type="email"
                  />
                  <Button
                    type="submit"
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Get Started
                  </Button>
                </form>
                <p className="text-xs text-blue-800">
                  Start your free 30-day trial. No credit card required.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-white"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12 text-blue-700">
              AI-Powered Features
            </h2>
            <div className="grid gap-6 lg:grid-cols-3">
              <FeatureCard
                icon={Brain}
                title="Intelligent Diagnosis Assistance"
                description="Leverage advanced AI algorithms to support your diagnostic process and improve accuracy."
              />
              <FeatureCard
                icon={Calendar}
                title="Smart Appointment Scheduling"
                description="Optimize your clinic's efficiency with AI-driven appointment management and patient reminders."
              />
              <FeatureCard
                icon={FileText}
                title="Automated Medical Records"
                description="Streamline documentation with AI-powered note-taking and intelligent record management."
              />
              <FeatureCard
                icon={MessageSquare}
                title="24/7 Patient Communication"
                description="Provide round-the-clock support with AI chatbots, enhancing patient engagement and care continuity."
              />
              <FeatureCard
                icon={PieChart}
                title="Predictive Analytics"
                description="Gain valuable insights into patient trends and optimize your practice with data-driven decision making."
              />
              <FeatureCard
                icon={Clock}
                title="Time-Saving Automation"
                description="Reduce administrative burden with AI-powered task automation, allowing you to focus more on patient care."
              />
            </div>
          </div>
        </section>

        <section
          id="benefits"
          className="w-full py-12 md:py-24 lg:py-32 bg-blue-100"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12 text-blue-700">
              Why Choose MyMediRecords
            </h2>
            <div className="grid gap-6 lg:grid-cols-3">
              <StatCard value="50%" label="Reduction in Administrative Tasks" />
              <StatCard value="30%" label="Increase in Patient Satisfaction" />
              <StatCard
                value="25%"
                label="Improvement in Diagnostic Accuracy"
              />
            </div>
          </div>
        </section>

        <section
          id="testimonials"
          className="w-full py-12 md:py-24 lg:py-32 bg-white"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12 text-blue-700">
              What Doctors Say
            </h2>
            <div className="grid gap-6 lg:grid-cols-3">
              {[
                {
                  name: "Dr. Emily Chen",
                  role: "Cardiologist",
                  quote:
                    "MyMediRecords has revolutionized my practice. The AI-assisted diagnosis and automated follow-ups have significantly improved patient care.",
                },
                {
                  name: "Dr. Michael Patel",
                  role: "General Practitioner",
                  quote:
                    "The smart scheduling features have made patient communication effortless. I can't imagine practicing without MyMediRecords now.",
                },
                {
                  name: "Dr. Sarah Johnson",
                  role: "Pediatrician",
                  quote:
                    "The AI-powered analytics have provided invaluable insights into patient trends, allowing me to provide more proactive and personalized care.",
                },
              ].map((testimonial, index) => (
                <Card key={index} className="border-2 border-blue-200 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={`https://i.pravatar.cc/40?img=${index + 1}`}
                        alt={testimonial.name}
                        className="rounded-full"
                        width={40}
                        height={40}
                      />
                      <div>
                        <p className="font-semibold text-blue-700">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-blue-500">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <p className="text-blue-900 italic">
                      "{testimonial.quote}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-500 text-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Ready to Transform Your Practice?
                </h2>
                <p className="mx-auto max-w-[600px] text-blue-100 md:text-xl">
                  Join thousands of healthcare professionals already benefiting
                  from MyMediRecords's AI-powered solutions.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input
                    className="max-w-lg flex-1 bg-white text-blue-900 placeholder:text-blue-400"
                    placeholder="Enter your email"
                    type="email"
                  />
                  <Button
                    type="submit"
                    className="bg-blue-700 text-white hover:bg-blue-800"
                  >
                    Get Started
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-blue-200">
        <p className="text-xs text-blue-800">
          © 2024 MyMediRecords. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a
            className="text-xs hover:underline underline-offset-4 text-blue-500"
            href="#"
          >
            Terms of Service
          </a>
          <a
            className="text-xs hover:underline underline-offset-4 text-blue-500"
            href="#"
          >
            Privacy
          </a>
        </nav>
      </footer>
    </div>
  );
}

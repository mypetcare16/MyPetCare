"use client";

import React, { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
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
  TypeIcon as type,
  type LucideIcon,
} from "lucide-react";
import { ClientMotionDiv } from "@/components/ClientMotionDiv";
import { ReactNode } from "react";

const DecorativeShape = ({ className }: { className: string }) => (
  <svg
    className={`absolute ${className}`}
    width="300"
    height="300"
    viewBox="0 0 300 300"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="150"
      cy="150"
      r="150"
      fill="url(#paint0_radial)"
      fillOpacity="0.4"
    />
    <circle
      cx="150"
      cy="150"
      r="100"
      stroke="url(#paint1_linear)"
      strokeWidth="4"
      strokeOpacity="0.6"
    />
    <path
      d="M150 50L172.451 122.549L245 145L172.451 167.451L150 240L127.549 167.451L55 145L127.549 122.549L150 50Z"
      fill="url(#paint2_linear)"
      fillOpacity="0.8"
    />
    <defs>
      <radialGradient
        id="paint0_radial"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(150 150) rotate(90) scale(150)"
      >
        <stop stopColor="#60A5FA" />
        <stop offset="1" stopColor="#60A5FA" stopOpacity="0" />
      </radialGradient>
      <linearGradient
        id="paint1_linear"
        x1="150"
        y1="50"
        x2="150"
        y2="250"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#93C5FD" />
      </linearGradient>
      <linearGradient
        id="paint2_linear"
        x1="150"
        y1="50"
        x2="150"
        y2="240"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#93C5FD" />
      </linearGradient>
    </defs>
  </svg>
);

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    />
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-blue-200 mix-blend-multiply"
        style={{
          width: Math.random() * 100 + 50,
          height: Math.random() * 100 + 50,
        }}
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity: 0,
        }}
        animate={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity: [0, 0.2, 0],
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

const FloatingIcon = ({
  icon: Icon,
  delay,
  x,
  y,
}: {
  icon: React.ElementType;
  delay: number;
  x: string;
  y: string;
}) => (
  <motion.div
    className="absolute text-blue-600"
    style={{ left: x, top: y }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{
      duration: 0.5,
      delay,
      ease: "easeOut",
    }}
  >
    <motion.div
      animate={{
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
      }}
    >
      <Icon size={32} />
    </motion.div>
  </motion.div>
);

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface AnimatedSectionProps {
  children: ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center"
  >
    <Icon className="w-12 h-12 text-blue-500 mb-4" />
    <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 },
      }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{label}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center">
        <Badge className="text-xl font-bold">{value}</Badge>
      </div>
    </CardContent>
  </Card>
);

export default function Home() {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-blue-50 overflow-hidden">
      <main className="flex-2">
        <section
          ref={ref}
          className="relative w-full py-20 md:py-32 lg:py-48 overflow-hidden"
        >
          <AnimatedBackground />
          <DecorativeShape className="top-0 left-0 transform -translate-x-1/2 -translate-y-1/2" />
          <DecorativeShape className="bottom-0 right-0 transform translate-x-1/2 translate-y-1/2" />
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <motion.div
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center space-y-4 text-center"
            >
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-blue-800">
                  Your AI-Powered Veterinary Companion
                </h1>
                <p className="mx-auto max-w-[700px] text-xl md:text-2xl text-blue-600">
                  Revolutionize your veterinary practice with VetVaults. Enhance
                  pet care, streamline workflows, and unlock the power of AI in
                  veterinary medicine.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="w-full max-w-sm space-y-2"
              >
                <form className="flex space-x-2">
                  <Input
                    className="flex-1 bg-white border-2 border-blue-300 focus:border-blue-500 text-blue-900 placeholder-blue-400"
                    placeholder="Enter your email"
                    type="email"
                  />
                  <Button
                    type="submit"
                    className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
                  >
                    Get Started
                  </Button>
                </form>
                <p className="text-sm text-blue-600">
                  Start your free 30-day trial. No credit card required.
                </p>
              </motion.div>
            </motion.div>
          </div>

          <FloatingIcon icon={Brain} delay={0.7} x="10%" y="20%" />
          <FloatingIcon icon={Calendar} delay={0.9} x="85%" y="15%" />
          <FloatingIcon icon={FileText} delay={1.1} x="75%" y="75%" />
          <FloatingIcon icon={MessageSquare} delay={1.3} x="15%" y="80%" />
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
                description="Leverage advanced AI algorithms to support your diagnostic process and improve accuracy for pet health issues."
              />
              <FeatureCard
                icon={Calendar}
                title="Smart Appointment Scheduling"
                description="Optimize your clinic's efficiency with AI-driven appointment management and pet owner reminders."
              />
              <FeatureCard
                icon={FileText}
                title="Automated Veterinary Records"
                description="Streamline documentation with AI-powered note-taking and intelligent pet record management."
              />
              <FeatureCard
                icon={MessageSquare}
                title="24/7 Pet Owner Communication"
                description="Provide round-the-clock support with AI chatbots, enhancing pet owner engagement and care continuity."
              />
              <FeatureCard
                icon={PieChart}
                title="Predictive Analytics"
                description="Gain valuable insights into pet health trends and optimize your practice with data-driven decision making."
              />
              <FeatureCard
                icon={Clock}
                title="Time-Saving Automation"
                description="Reduce administrative burden with AI-powered task automation, allowing you to focus more on pet care."
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
              Why Choose VetVaults
            </h2>
            <div className="grid gap-6 lg:grid-cols-3">
              <StatCard value="50%" label="Reduction in Administrative Tasks" />
              <StatCard
                value="30%"
                label="Increase in Pet Owner Satisfaction"
              />
              <StatCard
                value="25%"
                label="Improvement in Diagnostic Accuracy for Pets"
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
              What Veterinarians Say
            </h2>
            <div className="grid gap-6 lg:grid-cols-3">
              {[
                {
                  name: "Dr. Emily Chen",
                  role: "Veterinary Cardiologist",
                  quote:
                    "VetVaults has revolutionized my practice. The AI-assisted diagnosis and automated follow-ups have significantly improved pet care.",
                },
                {
                  name: "Dr. Michael Patel",
                  role: "General Veterinary Practitioner",
                  quote:
                    "The smart scheduling features have made pet owner communication effortless. I can't imagine practicing without VetVaults now.",
                },
                {
                  name: "Dr. Sarah Johnson",
                  role: "Veterinary Pediatrician",
                  quote:
                    "The AI-powered analytics have provided invaluable insights into pet health trends, allowing me to provide more proactive and personalized care.",
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
                  Ready to Transform Your Veterinary Practice?
                </h2>
                <p className="mx-auto max-w-[600px] text-blue-100 md:text-xl">
                  Join thousands of veterinary professionals already benefiting
                  from VetVaults' AI-powered solutions.
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
          © 2024 VetVaults. All rights reserved.
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

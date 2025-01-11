"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Book,
  Award,
  Star,
  PlayCircle,
  ChevronRight,
  Share2,
  Bookmark,
  Menu,
  Sun,
  Moon,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Hls from "hls.js";

// Add Google Fonts
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface DoctorProfileProps {
  userId: string;
}

interface Video {
  _id: string;
  userId: string;
  url: string;
  cloudflareId: string;
  status: string;
  metadata: {
    name: string;
    size: number;
    type: string;
  };
  createdAt: string;
}

const VideoPlayer: React.FC<{ src: string }> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
    } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = src;
    }
  }, [src]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative group">
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-lg"
        playsInline
        onClick={togglePlay}
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={togglePlay}
          className="bg-black bg-opacity-50 text-white rounded-full p-4 transform transition-transform hover:scale-110"
        >
          {isPlaying ? (
            <span className="sr-only">Pause</span>
          ) : (
            <PlayCircle className="w-12 h-12" />
          )}
        </button>
      </div>
    </div>
  );
};

export function DoctorProfile({ userId }: DoctorProfileProps) {
  const doctor = useQuery(api.users.getUserDetails, { userId });
  const generateFileUrl = useMutation(api.prescriptions.generateFileUrl);
  const videos = useQuery(api.videos.list, { userId }) || [];

  const [profileImageUrl, setProfileImageUrl] = useState(
    "/placeholder.svg?height=300&width=300"
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (doctor && doctor.profileImageUrl) {
        try {
          const fileUrl = await generateFileUrl({
            storageId: doctor.profileImageUrl,
          });
          setProfileImageUrl(fileUrl);
        } catch (error) {
          console.error("Error generating file URL:", error);
        }
      }
    };

    fetchProfileImage();
  }, [doctor, generateFileUrl]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  if (!doctor) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 transition-colors duration-300 ${poppins.className}`}
    >
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm fixed top-0 left-0 w-full z-50 transition-colors duration-300">
        <Link className="flex items-center justify-center" href="#">
          <motion.span
            className="font-bold text-xl md:text-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            VetVault
          </motion.span>
        </Link>
        <nav className="hidden md:flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:text-blue-600 transition-colors dark:text-gray-300 dark:hover:text-blue-400"
            href="#"
          >
            About
          </Link>
          <Link
            className="text-sm font-medium hover:text-blue-600 transition-colors dark:text-gray-300 dark:hover:text-blue-400"
            href="#"
          >
            Medical Team
          </Link>
          <Link
            className="text-sm font-medium hover:text-blue-600 transition-colors dark:text-gray-300 dark:hover:text-blue-400"
            href="#"
          >
            Blog
          </Link>
          <Link
            className="text-sm font-medium hover:text-blue-600 transition-colors dark:text-gray-300 dark:hover:text-blue-400"
            href="#"
          >
            Login
          </Link>
          <Button className="bg-gradient-to-r from-blue-600 to-sky-400 text-white hover:opacity-90 transition-opacity">
            Sign Up
          </Button>
        </nav>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className="text-gray-700 dark:text-gray-300"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button
            className="md:hidden"
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-white dark:bg-gray-900 md:hidden"
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex flex-col h-full p-4">
              <Button
                className="self-end mb-8"
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
              <nav className="flex flex-col gap-4">
                <Link
                  className="text-lg font-medium hover:text-blue-600 transition-colors dark:text-gray-300 dark:hover:text-blue-400"
                  href="#"
                >
                  About
                </Link>
                <Link
                  className="text-lg font-medium hover:text-blue-600 transition-colors dark:text-gray-300 dark:hover:text-blue-400"
                  href="#"
                >
                  Medical Team
                </Link>
                <Link
                  className="text-lg font-medium hover:text-blue-600 transition-colors dark:text-gray-300 dark:hover:text-blue-400"
                  href="#"
                >
                  Blog
                </Link>
                <Link
                  className="text-lg font-medium hover:text-blue-600 transition-colors dark:text-gray-300 dark:hover:text-blue-400"
                  href="#"
                >
                  Login
                </Link>
                <Button className="bg-gradient-to-r from-blue-600 to-sky-400 text-white hover:opacity-90 transition-opacity w-full">
                  Sign Up
                </Button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <main className="container mx-auto px-4 py-8 mt-16">
        <section className="mb-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg transition-colors duration-300">
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src={profileImageUrl}
                alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                width={300}
                height={300}
                className="rounded-full w-48 h-48 object-cover border-4 border-white dark:border-gray-700 shadow-lg"
              />
              <Badge className="absolute bottom-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Available
              </Badge>
            </motion.div>
            <div className="text-center md:text-left">
              <motion.h1
                className="text-4xl font-bold mb-2 text-gray-900 dark:text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Dr. {doctor.firstName} {doctor.lastName}
              </motion.h1>
              <motion.p
                className="text-xl text-gray-600 dark:text-gray-400 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {doctor.role || "Medical Professional"}
              </motion.p>
              <motion.div
                className="flex flex-wrap justify-center md:justify-start gap-2 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-semibold">
                  {doctor.specialization || "Specialist"}
                </Badge>
                {/* Add more badges for certifications or specialties */}
              </motion.div>
              <motion.div
                className="space-y-3 text-sm text-gray-600 dark:text-gray-400"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <span>{doctor.address || "Location not specified"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-blue-500" />
                  <span>{doctor.phone || "Phone number not available"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <span>{doctor.email || "Email not available"}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  About Dr. {doctor.firstName} {doctor.lastName}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  {doctor.bio || "Bio not available"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">
                  Patient Q&A Videos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {videos.map((video: Video) => (
                    <motion.div
                      key={video._id}
                      className="bg-white dark:bg-gray-800 rounded-md overflow-hidden shadow hover:shadow-lg transition-shadow duration-300"
                      whileHover={{ scale: 1.02 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 12,
                      }}
                    >
                      <div className="aspect-w-16 aspect-h-9">
                        <VideoPlayer src={video.url} />
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="text-sm sm:text-md font-semibold mb-1 text-gray-900 dark:text-white">
                          {video.metadata.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Uploaded on{" "}
                          {new Date(video.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Like
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Comment
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900"
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Watch
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Patient Testimonials
                </h2>
                <div className="space-y-6">
                  {patientTestimonials.map((testimonial, index) => (
                    <motion.div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <p className="italic mb-4 text-gray-700 dark:text-gray-300">
                        "{testimonial.comment}"
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
                        - {testimonial.name}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Education & Training
                </h2>
                <ul className="space-y-4">
                  {educationAndTraining.map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Book className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.degree}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {item.institution}
                        </p>
                        <p className="text-gray-500 dark:text-gray-500">
                          {item.year}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Awards & Honors
                </h2>
                <ul className="space-y-4">
                  {awardsAndHonors.map((award, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Award className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {award.title}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {award.year}
                        </p>
                        <p className="text-gray-500 dark:text-gray-500">
                          {award.organization}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Upcoming Events
                </h2>
                <ul className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {event.date} | {event.time}
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                          {event.description}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Recent Publications
                </h2>
                <ul className="space-y-4">
                  {recentPublications.map((pub, index) => (
                    <motion.li
                      key={index}
                      className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <h3 className="font-medium text-lg mb-1 text-gray-900 dark:text-white">
                        {pub.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {pub.authors}
                      </p>
                      <p className="text-gray-500 dark:text-gray-500 text-sm">
                        {pub.journal}
                      </p>
                      <Button
                        variant="link"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-0 h-auto mt-2"
                      >
                        Read More <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

const educationAndTraining = [
  {
    degree: "Fellowship in Reproductive Endocrinology and Infertility",
    institution: "Johns Hopkins University School of Medicine",
    year: "2018 - 2021",
  },
  {
    degree: "Residency in Obstetrics and Gynecology",
    institution: "University of Maryland School of Medicine",
    year: "2014 - 2018",
  },
  {
    degree: "Doctor of Medicine (MD)",
    institution: "University of Missouri-Kansas City School of Medicine",
    year: "2008 - 2014",
  },
];

const awardsAndHonors = [
  {
    title: "Rising Star in Reproductive Medicine",
    year: "2023",
    organization: "American Society for Reproductive Medicine",
  },
  {
    title: "Excellence in Research Award",
    year: "2022",
    organization: "Johns Hopkins University School of Medicine",
  },
  {
    title: "Best Clinical Paper Award",
    year: "2021",
    organization: "Society for Reproductive Endocrinology and Infertility",
  },
];

const recentPublications = [
  {
    title:
      "CRISPR-Cas9 Applications in Reproductive Endocrinology: A Comprehensive Review",
    authors: "Cayton Vaught K.C., Smith J.R., Johnson A.M.",
    journal: "Journal of Reproductive Medicine, 2023",
  },
  {
    title:
      "Fertility Preservation Outcomes in Women with Sickle Cell Disease: A Multi-Center Study",
    authors: "Cayton Vaught K.C., Brown L.T., Davis R.E., et al.",
    journal: "Fertility and Sterility, 2022",
  },
  {
    title: "Genetic Markers for Predicting Ovarian Response in IVF Patients",
    authors: "Johnson A.M., Cayton Vaught K.C., Williams P.L.",
    journal: "Human Reproduction, 2021",
  },
];

const upcomingEvents = [
  {
    title: "Webinar: Understanding PCOS and Fertility",
    date: "July 15, 2024",
    time: "2:00 PM - 3:30 PM EST",
    description:
      "Join Dr. Cayton Vaught for an informative session on the latest advancements in PCOS management and its impact on fertility.",
  },
  {
    title: "Q&A Session: Fertility Preservation Options",
    date: "August 5, 2024",
    time: "6:00 PM - 7:00 PM EST",
    description:
      "An open discussion on various fertility preservation methods, ideal for patients considering their future family planning options.",
  },
];

const patientTestimonials = [
  {
    name: "Sarah M.",
    rating: 5,
    comment:
      "Dr. Cayton Vaught's expertise and compassionate care made our fertility journey so much easier. We're now proud parents of twins!",
  },
  {
    name: "Michael L.",
    rating: 5,
    comment:
      "The personalized treatment plan Dr. Cayton Vaught developed for my wife's PCOS has dramatically improved her quality of life.",
  },
  {
    name: "Emily R.",
    rating: 5,
    comment:
      "Dr. Cayton Vaught's knowledge of the latest fertility treatments gave us hope when we thought we had run out of options. We're forever grateful.",
  },
];

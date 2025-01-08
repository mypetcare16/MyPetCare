"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExpertCard } from "@/components/expert-card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type Expert = {
  userId: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  specialization?: string;
  bio?: string;
  profileImageUrl?: string;
  imageUrl?: string;
};

export function ExpertsSection() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const allDoctors = useQuery(api.users.getAllDoctors);
  const generateFileUrl = useMutation(api.prescriptions.generateFileUrl);

  useEffect(() => {
    const fetchExperts = async () => {
      if (allDoctors === undefined) return;

      try {
        const expertsWithImages = await Promise.all(
          allDoctors.map(async (doctor) => {
            let imageUrl = "/placeholder.svg?height=400&width=400"; // Default placeholder
            if (doctor.profileImageUrl) {
              try {
                const fileUrl = await generateFileUrl({
                  storageId: doctor.profileImageUrl,
                });
                imageUrl = fileUrl;
              } catch (error) {
                console.error("Error generating file URL:", error);
                // Keep the placeholder image if there's an error
              }
            }
            return { ...doctor, imageUrl };
          })
        );
        setExperts(expertsWithImages);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching experts:", err);
        setError("Failed to load experts. Please try again later.");
        setLoading(false);
      }
    };

    fetchExperts();
  }, [allDoctors, generateFileUrl]);

  if (loading) {
    return <div className="text-center py-24">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-24 text-red-500">{error}</div>;
  }

  return (
    <section className="w-full py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50">
      <div className="container px-4 md:px-6 mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair text-navy-900 mb-4">
            Our Medical Experts
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 font-inter">
            Trusted professionals at the forefront of healthcare
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12">
          {experts.map((expert, index) => (
            <motion.div
              key={expert.userId}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                key={expert.userId}
                href={`/doctor-profile/${expert.userId}`}
              >
                <div className="cursor-pointer">
                  <ExpertCard
                    name={`${expert.firstName} ${expert.lastName}`}
                    title={expert.role || "Doctor"}
                    specialty={expert.specialization || "Surgen"}
                    imageUrl={
                      expert.imageUrl ||
                      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973461_640.png"
                    }
                    bio={expert.bio || "Experienced healthcare professional"}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
            className="flex items-center justify-center"
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl p-6 flex flex-col items-center justify-center h-full text-center">
              <h3 className="text-2xl font-playfair text-navy-900 mb-2">
                Apply to be a Content Creator
              </h3>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
                aria-label="Apply to be a content creator"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

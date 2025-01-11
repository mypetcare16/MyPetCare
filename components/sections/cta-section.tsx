"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";

export default function CTASection() {
  return (
    <>
      <section className="bg-blue-50 py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 items-start">
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl md:text-4xl font-playfair leading-tight text-blue-900">
                Our mission is to revolutionize veterinary care with AI-powered
                insights
              </h3>
            </motion.div>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <p className="text-gray-700 leading-relaxed font-inter">
                In a world where pet health is paramount, we're committed to
                providing accurate, AI-enhanced veterinary insights. VetVaults
                bridges the gap between veterinary professionals and pet owners,
                ensuring everyone has access to cutting-edge pet healthcare
                management.
              </p>
            </motion.div>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <p className="text-gray-700 leading-relaxed font-inter">
                Built by a diverse team of veterinarians, pet care specialists,
                animal health experts, and technologists, VetVaults is
                revolutionizing how people manage and understand pet health
                information. Join us in our journey to create a healthier world
                for our beloved animal companions.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-teal-600 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair leading-tight">
                Get AI-powered pet health insights today
              </h2>
              <p className="text-xl md:text-2xl text-blue-200 font-inter">
                Join thousands of veterinarians who trust VetVaults for advanced
                pet care management
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-gradient-to-r from-teal-500 to-green-500 text-white px-8 py-4 text-lg rounded-full font-semibold hover:from-teal-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-playfair mb-6">
                  Stay informed with our veterinary newsletter
                </h3>
                <div className="space-y-4">
                  <Select>
                    <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select your interests" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">
                        General Pet Health
                      </SelectItem>
                      <SelectItem value="nutrition">
                        Pet Nutrition & Diet
                      </SelectItem>
                      <SelectItem value="behavior">Animal Behavior</SelectItem>
                      <SelectItem value="tech">
                        Veterinary Technology
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    />
                    <Button className="bg-white text-blue-900 hover:bg-blue-100 transition-colors duration-300">
                      <Mail className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-sm text-blue-200">
                    By subscribing, you agree to our Terms of Service and
                    Privacy Policy.
                  </p>
                </div>
              </div>
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full opacity-50 blur-3xl"></div>
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-gradient-to-br from-green-400 to-teal-500 rounded-full opacity-50 blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

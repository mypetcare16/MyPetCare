'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'

interface ExpertCardProps {
  name: string
  title: string
  specialty: string
  imageUrl: string
  bio: string
}

export function ExpertCard({ name, title, specialty, imageUrl, bio }: ExpertCardProps) {
  return (
    <motion.div 
      className="flex flex-col items-center bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
      whileHover={{ y: -5 }}
    >
      <div className="w-full aspect-square overflow-hidden">
        <motion.img
          src={imageUrl}
          alt={`${name}, ${specialty}`}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="p-6 text-center">
        <h3 className="text-2xl font-playfair text-navy-900 mb-1">{name}</h3>
        <p className="text-lg text-indigo-600 font-semibold mb-2">{title}</p>
        <p className="text-gray-600 mb-4">{specialty}</p>
        <p className="text-sm text-gray-500 italic mb-4">{bio}</p>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
          aria-label={`View more about ${name}`}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </motion.div>
  )
}


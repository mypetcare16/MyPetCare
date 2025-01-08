'use client'

import { motion, MotionProps } from 'framer-motion'
import { ReactNode } from 'react'

type ClientMotionDivProps = MotionProps & {
  children: ReactNode;
}

export const ClientMotionDiv: React.FC<ClientMotionDivProps> = ({ children, ...props }) => {
  return <motion.div {...props}>{children}</motion.div>
}
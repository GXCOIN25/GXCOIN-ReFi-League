import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MetaMaskStepProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const MetaMaskStep: React.FC<MetaMaskStepProps> = ({
  children,
  title,
  description,
  icon,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn('w-full', className)}
    >
      <div className="text-center mb-6">
        {icon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="inline-block mb-4"
          >
            {icon}
          </motion.div>
        )}
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        {description && (
          <p className="text-gray-400 text-sm max-w-md mx-auto">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  );
};

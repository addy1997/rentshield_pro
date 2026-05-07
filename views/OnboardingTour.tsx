import React, { useState } from 'react';
import { Scan, AlertTriangle, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeuButton } from '../components/ui';
import { useAppContext } from '../context/AppContext';

export default function OnboardingTour() {
  const { dispatch } = useAppContext();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Scan Contracts",
      description: "Instantly analyze tenancy agreements for illegal clauses and hidden risks.",
      icon: Scan,
      color: "text-neone-blue"
    },
    {
      title: "Log Hazards",
      description: "Document and report maintenance issues with AI-powered evidence logging.",
      icon: AlertTriangle,
      color: "text-neone-red"
    },
    {
      title: "Know Your Rights",
      description: "Access instant legal guidance and protect your deposit.",
      icon: Shield,
      color: "text-neone-green"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      dispatch({ type: 'SET_ONBOARDING_SEEN' });
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl p-8 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gray-100 dark:bg-gray-800">
            <motion.div
              className="h-full bg-neone-blue"
              initial={{ width: `${((step) / steps.length) * 100}%` }}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="mt-8 mb-6 flex justify-center">
            <div className={`w-24 h-24 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center ${steps[step].color}`}>
              {React.createElement(steps[step].icon, { size: 48 })}
            </div>
          </div>

          <h2 className="text-2xl font-display font-bold text-black dark:text-white mb-3">
            {steps[step].title}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            {steps[step].description}
          </p>

          <NeuButton onClick={handleNext} className="w-full h-12 text-sm font-bold">
            {step === steps.length - 1 ? "Got it" : "Next"}
          </NeuButton>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

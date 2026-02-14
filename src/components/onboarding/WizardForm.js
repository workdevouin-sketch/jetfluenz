'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, backdropVariants } from './animationData';
import { X, AlertCircle } from 'lucide-react';
import StepRoleSelection from './StepRoleSelection';
import StepInfluencer from './StepInfluencer';
import StepBusiness from './StepBusiness';
import SuccessScreen from './SuccessScreen';
import { handleSignupFlow } from '../../lib/waitlist';

export default function WizardForm({ isOpen, onClose }) {
    const [step, setStep] = useState('role'); // roles, influencer, business, success
    const [role, setRole] = useState(null);
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // New loading state
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);

    const triggerError = (msg) => {
        setError(msg);
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
    };

    const handleRoleSelect = (selectedRole) => {
        setIsLoading(true);
        setRole(selectedRole);
        // Simulate loading delay to prevent flicker/layout shift
        setTimeout(() => {
            setStep(selectedRole);
            setIsLoading(false);
        }, 600);
    };

    const handleDataUpdate = (data) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const handleSubmit = async (finalData) => {
        setIsSubmitting(true);
        const completeData = {
            ...formData,
            ...finalData,
            role
        };

        try {
            const result = await handleSignupFlow(completeData);
            if (result.success) {
                setStep('success');
            } else {
                triggerError(result.error || 'Account with this email already exists.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            triggerError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Dynamic Background Backdrop */}
                    <motion.div
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Toast Notification */}
                    <AnimatePresence>
                        {showError && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                className="fixed top-8 left-1/2 -translate-x-1/2 z-[70] w-full max-w-sm"
                            >
                                <div className="bg-white border-l-4 border-red-500 rounded-xl shadow-2xl p-4 flex items-start gap-3 mx-4">
                                    <div className="bg-red-100 p-2 rounded-lg">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-gray-900">Form Error</h4>
                                        <p className="text-sm text-gray-600">{error}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowError(false)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Card Container */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative w-full max-w-4xl bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header / Close Button */}
                        <div className="absolute top-4 right-4 z-10">
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors group"
                            >
                                <X className="w-6 h-6 text-gray-400 group-hover:text-gray-900 transition-colors" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col p-6 sm:p-8 md:p-12 text-gray-900 overflow-y-auto custom-scrollbar relative">
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div
                                        key="loader"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex items-center justify-center bg-white z-20"
                                    >
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-[#2008b9]/20 border-t-[#2008b9] rounded-full animate-spin" />
                                            <p className="text-[#2008b9] font-medium animate-pulse">Loading...</p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <>
                                        {step === 'role' && (
                                            <StepRoleSelection key="role" onSelect={handleRoleSelect} />
                                        )}

                                        {step === 'influencer' && (
                                            <StepInfluencer
                                                key="influencer"
                                                onSubmit={handleSubmit}
                                                isSubmitting={isSubmitting}
                                                initialData={formData}
                                            />
                                        )}

                                        {step === 'business' && (
                                            <StepBusiness
                                                key="business"
                                                onSubmit={handleSubmit}
                                                isSubmitting={isSubmitting}
                                                initialData={formData}
                                            />
                                        )}

                                        {step === 'success' && (
                                            <SuccessScreen key="success" onClose={onClose} />
                                        )}
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

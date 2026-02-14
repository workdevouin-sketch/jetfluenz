'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, backdropVariants, pageVariants } from './animationData';
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
    const [direction, setDirection] = useState(0); // -1 for back, 1 for next
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);

    const triggerError = (msg) => {
        setError(msg);
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
    };

    const handleRoleSelect = (selectedRole) => {
        setDirection(1);
        setRole(selectedRole);
        setStep(selectedRole);
    };

    const handleBackToRole = () => {
        setDirection(-1);
        setStep('role');
        setRole(null);
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
                setDirection(1);
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
                        {/* Header / Close Button - Fixed to prevent overlap */}
                        <div className="absolute top-5 right-5 z-50">
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full bg-gray-100/50 hover:bg-gray-100 transition-colors group backdrop-blur-sm"
                            >
                                <X className="w-5 h-5 text-gray-500 group-hover:text-gray-900 transition-colors" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col p-6 sm:p-8 md:p-12 text-gray-900 overflow-y-auto custom-scrollbar relative overflow-x-hidden">
                            <AnimatePresence mode="wait" custom={direction}>
                                {step === 'role' && (
                                    <motion.div
                                        key="role"
                                        custom={direction}
                                        variants={pageVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        className="w-full h-full"
                                    >
                                        <StepRoleSelection onSelect={handleRoleSelect} />
                                    </motion.div>
                                )}

                                {step === 'influencer' && (
                                    <motion.div
                                        key="influencer"
                                        custom={direction}
                                        variants={pageVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        className="w-full h-full"
                                    >
                                        <StepInfluencer
                                            onSubmit={handleSubmit}
                                            isSubmitting={isSubmitting}
                                            initialData={formData}
                                            onBack={handleBackToRole}
                                        />
                                    </motion.div>
                                )}

                                {step === 'business' && (
                                    <motion.div
                                        key="business"
                                        custom={direction}
                                        variants={pageVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        className="w-full h-full"
                                    >
                                        <StepBusiness
                                            onSubmit={handleSubmit}
                                            isSubmitting={isSubmitting}
                                            initialData={formData}
                                            onBack={handleBackToRole}
                                        />
                                    </motion.div>
                                )}

                                {step === 'success' && (
                                    <motion.div
                                        key="success"
                                        custom={direction}
                                        variants={pageVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        className="w-full h-full"
                                    >
                                        <SuccessScreen onClose={onClose} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import StepRoleSelection from './StepRoleSelection';
import StepInfluencer from './StepInfluencer';
import StepBusiness from './StepBusiness';
import SuccessScreen from './SuccessScreen';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function WizardForm({ isOpen, onClose }) {
    const [step, setStep] = useState('role'); // roles, influencer, business, success
    const [role, setRole] = useState(null);
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setStep(selectedRole); // 'influencer' or 'business'
    };

    const handleDataUpdate = (data) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const handleSubmit = async (finalData) => {
        setIsSubmitting(true);
        const completeData = {
            ...formData,
            ...finalData,
            role,
            submittedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            status: 'waitlist'
        };

        try {
            if (db) {
                await addDoc(collection(db, 'users'), completeData);
            } else {
                console.log('Firebase not initialized, mocking submission:', completeData);
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
            setStep('success');
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Something went wrong. Please try again.');
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#2008b9]/90 backdrop-blur-sm"
                    />

                    {/* Main Card Container */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-4xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header / Close Button */}
                        <div className="absolute top-4 right-4 z-10">
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors group"
                            >
                                <X className="w-6 h-6 text-white/70 group-hover:text-white" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col p-6 sm:p-8 md:p-12 text-white overflow-y-auto custom-scrollbar">
                            <AnimatePresence mode="wait">
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
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

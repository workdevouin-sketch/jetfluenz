'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, staggerContainer, fadeInUp } from './animationData';
import { ArrowLeft, ArrowRight, Building2, Globe, CheckCircle } from 'lucide-react';

const STEPS = [
    { id: 'identity', title: 'Identity' },
    { id: 'profile', title: 'Profile' },
    { id: 'legal', title: 'Legal' }
];



export default function StepBusiness({ onSubmit, isSubmitting, initialData }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState(initialData || {});
    const [direction, setDirection] = useState(0);
    const [validationError, setValidationError] = useState('');

    const validateStep = (stepId) => {
        setValidationError('');
        if (stepId === 'identity') {
            if (!data.companyName || !data.email || !data.phone) {
                setValidationError('Please fill in all required company details.');
                return false;
            }
        }
        if (stepId === 'profile') {
            if (!data.website) {
                setValidationError('Website URL is required.');
                return false;
            }
        }
        if (stepId === 'legal') {
            if (!data.agreedToTerms || !data.agreedToAuthorized) {
                setValidationError('You must agree to the terms to proceed.');
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (!validateStep(STEPS[currentStep].id)) return;

        if (currentStep < STEPS.length - 1) {
            setDirection(1);
            setCurrentStep(prev => prev + 1);
        } else {
            onSubmit(data);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setDirection(-1);
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const currentStepId = STEPS[currentStep].id;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full"
        >
            {/* Header & Progress */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold">Business Registration</h2>
                    <span className="text-sm text-white/50">Step {currentStep + 1} of {STEPS.length}</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-400 to-indigo-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar overflow-x-hidden">
                <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                    {currentStepId === 'identity' && (
                        <motion.div
                            key="identity"
                            custom={direction}
                            variants={pageVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="space-y-6"
                        >
                            <motion.h3 variants={fadeInUp} initial="hidden" animate="show" className="text-xl font-semibold mb-6 flex items-center">
                                <Building2 className="w-5 h-5 mr-2 text-blue-300" /> Company Identity
                            </motion.h3>
                            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
                                <motion.div variants={fadeInUp}>
                                    <Input label="Company Name" name="companyName" value={data.companyName} onChange={handleChange} placeholder="Acme Corp" />
                                </motion.div>
                                <motion.div variants={fadeInUp}>
                                    <Input label="Contact Person" name="contactPerson" value={data.contactPerson} onChange={handleChange} placeholder="John Manager" />
                                </motion.div>
                                <div className="grid grid-cols-2 gap-4">
                                    <motion.div variants={fadeInUp}>
                                        <Input label="Business Email" type="email" name="email" value={data.email} onChange={handleChange} placeholder="contact@acme.com" />
                                    </motion.div>
                                    <motion.div variants={fadeInUp}>
                                        <Input label="Phone" type="tel" name="phone" value={data.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
                                    </motion.div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {currentStepId === 'profile' && (
                        <motion.div
                            key="profile"
                            custom={direction}
                            variants={pageVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="space-y-6"
                        >
                            <motion.h3 variants={fadeInUp} initial="hidden" animate="show" className="text-xl font-semibold mb-6 flex items-center">
                                <Globe className="w-5 h-5 mr-2 text-blue-300" /> Brand Profile
                            </motion.h3>
                            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
                                <motion.div variants={fadeInUp}>
                                    <Input label="Website URL" name="website" value={data.website} onChange={handleChange} placeholder="https://acme.com" />
                                </motion.div>
                                <motion.div variants={fadeInUp}>
                                    <Input label="Industry / Category" name="industry" value={data.industry} onChange={handleChange} placeholder="e.g., E-commerce, SaaS, Fashion" />
                                </motion.div>
                                <motion.div variants={fadeInUp}>
                                    <Input label="LinkedIn / Social URL" name="social" value={data.social} onChange={handleChange} placeholder="https://linkedin.com/company/acme" />
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    )}

                    {currentStepId === 'legal' && (
                        <motion.div
                            key="legal"
                            custom={direction}
                            variants={pageVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="space-y-6"
                        >
                            <motion.h3 variants={fadeInUp} initial="hidden" animate="show" className="text-xl font-semibold mb-6 flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2 text-blue-300" /> Final Step
                            </motion.h3>
                            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4">
                                <motion.label variants={fadeInUp} className="flex items-start space-x-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="agreedToTerms"
                                        checked={data.agreedToTerms || false}
                                        onChange={(e) => setData({ ...data, agreedToTerms: e.target.checked })}
                                        className="mt-1 w-5 h-5 rounded border-white/30 bg-white/10 checked:bg-blue-600 checked:border-transparent transition-all"
                                    />
                                    <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                                        I agree to the Terms of Service and Privacy Policy.
                                    </span>
                                </motion.label>
                                <motion.label variants={fadeInUp} className="flex items-start space-x-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="agreedToAuthorized"
                                        checked={data.agreedToAuthorized || false}
                                        onChange={(e) => setData({ ...data, agreedToAuthorized: e.target.checked })}
                                        className="mt-1 w-5 h-5 rounded border-white/30 bg-white/10 checked:bg-blue-600 checked:border-transparent transition-all"
                                    />
                                    <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                                        I confirm that I am authorized to represent this business.
                                    </span>
                                </motion.label>
                                {validationError && (
                                    <div className="text-red-400 text-sm animate-pulse">{validationError}</div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t border-white/10 mt-4">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={`flex items-center px-6 py-2 rounded-lg transition-colors ${currentStep === 0 ? 'text-white/20 cursor-not-allowed' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="flex items-center px-8 py-3 bg-white text-[#2008b9] font-bold rounded-lg hover:bg-white/90 active:scale-95 transition-all shadow-lg shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Processing...' : (
                        currentStep === STEPS.length - 1 ? 'Submit Support' : 'Next Step'
                    )}
                    {!isSubmitting && currentStep !== STEPS.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
                </motion.button>
            </div>
        </motion.div>
    );
}

const Input = ({ label, ...props }) => (
    <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-white/80">{label}</label>
        <input
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all shadow-inner"
            {...props}
        />
    </div>
);

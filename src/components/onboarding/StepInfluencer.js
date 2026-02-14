'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, staggerContainer, fadeInUp } from './animationData';
import { ArrowLeft, ArrowRight, Instagram, Users, MapPin, CheckCircle } from 'lucide-react';
import LocationAutocomplete from './LocationAutocomplete';
import InfoTooltip from '../ui/InfoTooltip';
import CampaignTypeSelector from './CampaignTypeSelector';

const STEPS = [
    { id: 'identity', title: 'Identity' },
    { id: 'social', title: 'Social Cred' },
    { id: 'details', title: 'Deep Dive' },
    { id: 'legal', title: 'Legal' }
];



export default function StepInfluencer({ onSubmit, isSubmitting, initialData }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState(initialData || {});
    const [direction, setDirection] = useState(0);
    const [validationError, setValidationError] = useState('');

    const validateStep = (stepId) => {
        setValidationError('');
        if (stepId === 'identity') {
            if (!data.name || !data.email || !data.phone) {
                setValidationError('Please fill in all required contact details.');
                return false;
            }
        }
        if (stepId === 'social') {
            if (!data.instagram) {
                setValidationError('Instagram ID is required.');
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
        let value = e.target.value;
        if (e.target.name === 'instagram') {
            value = value.replace(/@/g, '');
        }
        setData({ ...data, [e.target.name]: value });
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
                    <h2 className="text-2xl font-bold text-gray-900">Influencer Application</h2>
                    <span className="text-sm text-gray-500">Step {currentStep + 1} of {STEPS.length}</span>
                </div>
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-[#2008b9]"
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
                            <motion.h3 variants={fadeInUp} initial="hidden" animate="show" className="text-xl font-semibold mb-6 flex items-center text-gray-900">
                                <Users className="w-5 h-5 mr-2 text-[#2008b9]" /> Who are you?
                            </motion.h3>
                            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
                                <motion.div variants={fadeInUp}>
                                    <Input label="Full Name" name="name" value={data.name} onChange={handleChange} placeholder="Jane Doe" tooltip="Enter your legal name or the name you use for business." />
                                </motion.div>
                                <motion.div variants={fadeInUp}>
                                    <Input label="Email Address" type="email" name="email" value={data.email} onChange={handleChange} placeholder="jane@example.com" tooltip="We'll send campaign invites and notifications here." />
                                </motion.div>
                                <motion.div variants={fadeInUp}>
                                    <Input label="Phone Number" type="tel" name="phone" value={data.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" tooltip="For urgent campaign updates or account verification." />
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    )}

                    {currentStepId === 'social' && (
                        <motion.div
                            key="social"
                            custom={direction}
                            variants={pageVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="space-y-6"
                        >
                            <motion.h3 variants={fadeInUp} initial="hidden" animate="show" className="text-xl font-semibold mb-6 flex items-center text-gray-900">
                                <Instagram className="w-5 h-5 mr-2 text-[#2008b9]" /> Social Presence
                            </motion.h3>
                            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
                                <motion.div variants={fadeInUp}>
                                    <Input label="Instagram ID" name="instagram" value={data.instagram} onChange={handleChange} placeholder="username" tooltip="Your main Instagram handle where you post content." />
                                </motion.div>

                                <motion.div variants={fadeInUp} className="flex flex-col space-y-2">
                                    <div className="flex items-center">
                                        <label className="text-sm font-medium text-gray-700">Primary Niche</label>
                                        <InfoTooltip text="Select the category that best describes your content style." />
                                    </div>
                                    <select
                                        name="niche"
                                        value={data.niche}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#2008b9] focus:ring-1 focus:ring-[#2008b9] transition-colors"
                                    >
                                        <option value="" className="text-gray-500">Any Niche</option>
                                        <option value="Fashion" className="text-black">Fashion</option>
                                        <option value="Beauty" className="text-black">Beauty</option>
                                        <option value="Tech" className="text-black">Tech</option>
                                        <option value="Lifestyle" className="text-black">Lifestyle</option>
                                        <option value="Fitness" className="text-black">Fitness</option>
                                        <option value="Travel" className="text-black">Travel</option>
                                        <option value="Food" className="text-black">Food</option>
                                    </select>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    )}

                    {currentStepId === 'details' && (
                        <motion.div
                            key="details"
                            custom={direction}
                            variants={pageVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="space-y-6"
                        >
                            <motion.h3 variants={fadeInUp} initial="hidden" animate="show" className="text-xl font-semibold mb-6 flex items-center text-gray-900">
                                <MapPin className="w-5 h-5 mr-2 text-[#2008b9]" /> The Details
                            </motion.h3>
                            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <motion.div variants={fadeInUp} className="flex flex-col space-y-2">
                                        <div className="flex items-center">
                                            <label className="text-sm font-medium text-gray-700">Age Group</label>
                                            <InfoTooltip text="Helps us match you with campaigns targeting specific demographics." />
                                        </div>
                                        <select
                                            name="age"
                                            value={data.age}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#2008b9] focus:ring-1 focus:ring-[#2008b9] transition-colors"
                                        >
                                            <option value="" className="text-gray-500">Select...</option>
                                            <option value="18-24" className="text-black">18-24</option>
                                            <option value="25-34" className="text-black">25-34</option>
                                            <option value="35-44" className="text-black">35-44</option>
                                            <option value="45-54" className="text-black">45-54</option>
                                            <option value="55-64" className="text-black">55-64</option>
                                            <option value="65+" className="text-black">65+</option>
                                        </select>
                                    </motion.div>
                                    <motion.div variants={fadeInUp}>
                                        <LocationAutocomplete
                                            label="Location"
                                            value={data.location}
                                            onChange={handleChange}
                                            placeholder="City, Country"
                                            tooltip="Enter your city to find local collaboration opportunities."
                                        />
                                    </motion.div>
                                </div>

                                <motion.div variants={fadeInUp} className="flex flex-col space-y-3">
                                    <div className="flex items-center">
                                        <label className="text-sm font-medium text-gray-700">Preferred Campaign Types</label>
                                        <InfoTooltip text="Select the types of collaborations you are most interested in." />
                                    </div>
                                    <CampaignTypeSelector
                                        value={data.campaignTypes}
                                        onChange={(value) => setData({ ...data, campaignTypes: value })}
                                    />
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
                            <motion.h3 variants={fadeInUp} initial="hidden" animate="show" className="text-xl font-semibold mb-6 flex items-center text-gray-900">
                                <CheckCircle className="w-5 h-5 mr-2 text-[#2008b9]" /> Final Step
                            </motion.h3>
                            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                                <motion.label variants={fadeInUp} className="flex items-start space-x-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="agreedToTerms"
                                        checked={data.agreedToTerms || false}
                                        onChange={(e) => setData({ ...data, agreedToTerms: e.target.checked })}
                                        className="mt-1 w-5 h-5 rounded border-gray-300 text-[#2008b9] focus:ring-[#2008b9] transition-all"
                                    />
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                        I agree to the Terms of Service and Privacy Policy. I understand that Jetfluenz is currently in beta.
                                    </span>
                                </motion.label>
                                <motion.label variants={fadeInUp} className="flex items-start space-x-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="agreedToAuthorized"
                                        checked={data.agreedToAuthorized || false}
                                        onChange={(e) => setData({ ...data, agreedToAuthorized: e.target.checked })}
                                        className="mt-1 w-5 h-5 rounded border-gray-300 text-[#2008b9] focus:ring-[#2008b9] transition-all"
                                    />
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                        I confirm that the provided information is accurate and I am authorized to represent this account.
                                    </span>
                                </motion.label>
                                {isSubmitting && validationError && (
                                    <div className="text-red-400 text-sm">{validationError}</div>
                                )}
                                {!isSubmitting && validationError && (
                                    <div className="text-red-400 text-sm animate-pulse">{validationError}</div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t border-gray-100 mt-4">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={`flex items-center px-6 py-2 rounded-lg transition-colors ${currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="flex items-center px-8 py-3 bg-[#2008b9] text-white font-bold rounded-lg hover:bg-[#2008b9]/90 active:scale-95 transition-all shadow-lg shadow-[#2008b9]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Processing...' : (
                        currentStep === STEPS.length - 1 ? 'Submit Application' : 'Next Step'
                    )}
                    {!isSubmitting && currentStep !== STEPS.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
                </motion.button>
            </div>
        </motion.div>
    );
}

const Input = ({ label, tooltip, ...props }) => (
    <div className="flex flex-col space-y-2">
        <div className="flex items-center">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            {tooltip && <InfoTooltip text={tooltip} />}
        </div>
        <input
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9] focus:ring-1 focus:ring-[#2008b9] transition-all shadow-sm"
            {...props}
        />
    </div>
);

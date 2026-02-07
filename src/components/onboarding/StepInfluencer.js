'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
            setCurrentStep(prev => prev + 1);
        } else {
            onSubmit(data);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
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
                    <h2 className="text-2xl font-bold">Influencer Application</h2>
                    <span className="text-sm text-white/50">Step {currentStep + 1} of {STEPS.length}</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-400 to-indigo-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="wait">
                    {currentStepId === 'identity' && (
                        <motion.div
                            key="identity"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-6"
                        >
                            <h3 className="text-xl font-semibold mb-6 flex items-center">
                                <Users className="w-5 h-5 mr-2 text-blue-300" /> Who are you?
                            </h3>
                            <div className="space-y-4">
                                <Input label="Full Name" name="name" value={data.name} onChange={handleChange} placeholder="Jane Doe" tooltip="Enter your legal name or the name you use for business." />
                                <Input label="Email Address" type="email" name="email" value={data.email} onChange={handleChange} placeholder="jane@example.com" tooltip="We'll send campaign invites and notifications here." />
                                <Input label="Phone Number" type="tel" name="phone" value={data.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" tooltip="For urgent campaign updates or account verification." />
                            </div>
                        </motion.div>
                    )}

                    {currentStepId === 'social' && (
                        <motion.div
                            key="social"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-6"
                        >
                            <h3 className="text-xl font-semibold mb-6 flex items-center">
                                <Instagram className="w-5 h-5 mr-2 text-blue-300" /> Social Presence
                            </h3>
                            <div className="space-y-4">
                                <Input label="Instagram ID" name="instagram" value={data.instagram} onChange={handleChange} placeholder="username" tooltip="Your main Instagram handle where you post content." />

                                <div className="flex flex-col space-y-2">
                                    <div className="flex items-center">
                                        <label className="text-sm font-medium text-white/80">Primary Niche</label>
                                        <InfoTooltip text="Select the category that best describes your content style." />
                                    </div>
                                    <select
                                        name="niche"
                                        value={data.niche}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/50 focus:bg-white/10 transition-colors"
                                    >
                                        <option value="" className="text-black">Any Niche</option>
                                        <option value="Fashion" className="text-black">Fashion</option>
                                        <option value="Beauty" className="text-black">Beauty</option>
                                        <option value="Tech" className="text-black">Tech</option>
                                        <option value="Lifestyle" className="text-black">Lifestyle</option>
                                        <option value="Fitness" className="text-black">Fitness</option>
                                        <option value="Travel" className="text-black">Travel</option>
                                        <option value="Food" className="text-black">Food</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStepId === 'details' && (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-6"
                        >
                            <h3 className="text-xl font-semibold mb-6 flex items-center">
                                <MapPin className="w-5 h-5 mr-2 text-blue-300" /> The Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="flex flex-col space-y-2">
                                    <div className="flex items-center">
                                        <label className="text-sm font-medium text-white/80">Age Group</label>
                                        <InfoTooltip text="Helps us match you with campaigns targeting specific demographics." />
                                    </div>
                                    <select
                                        name="age"
                                        value={data.age}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/50 focus:bg-white/10 transition-colors"
                                    >
                                        <option value="" className="text-black">Select...</option>
                                        <option value="18-24" className="text-black">18-24</option>
                                        <option value="25-34" className="text-black">25-34</option>
                                        <option value="35-44" className="text-black">35-44</option>
                                        <option value="45-54" className="text-black">45-54</option>
                                        <option value="55-64" className="text-black">55-64</option>
                                        <option value="65+" className="text-black">65+</option>
                                    </select>
                                </div>
                                <LocationAutocomplete
                                    label="Location"
                                    value={data.location}
                                    onChange={handleChange}
                                    placeholder="City, Country"
                                    tooltip="Enter your city to find local collaboration opportunities."
                                />
                            </div>

                            <div className="flex flex-col space-y-3">
                                <div className="flex items-center">
                                    <label className="text-sm font-medium text-white/80">Preferred Campaign Types</label>
                                    <InfoTooltip text="Select the types of collaborations you are most interested in." />
                                </div>
                                <CampaignTypeSelector
                                    value={data.campaignTypes}
                                    onChange={(value) => setData({ ...data, campaignTypes: value })}
                                />
                            </div>
                        </motion.div>
                    )}

                    {currentStepId === 'legal' && (
                        <motion.div
                            key="legal"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-6"
                        >
                            <h3 className="text-xl font-semibold mb-6 flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2 text-blue-300" /> Final Step
                            </h3>
                            <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4">
                                <label className="flex items-start space-x-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="agreedToTerms"
                                        checked={data.agreedToTerms || false}
                                        onChange={(e) => setData({ ...data, agreedToTerms: e.target.checked })}
                                        className="mt-1 w-5 h-5 rounded border-white/30 bg-white/10 checked:bg-blue-600 checked:border-transparent transition-all"
                                    />
                                    <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                                        I agree to the Terms of Service and Privacy Policy. I understand that Jetfluenz is currently in beta.
                                    </span>
                                </label>
                                <label className="flex items-start space-x-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="agreedToAuthorized"
                                        checked={data.agreedToAuthorized || false}
                                        onChange={(e) => setData({ ...data, agreedToAuthorized: e.target.checked })}
                                        className="mt-1 w-5 h-5 rounded border-white/30 bg-white/10 checked:bg-blue-600 checked:border-transparent transition-all"
                                    />
                                    <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                                        I confirm that the provided information is accurate and I am authorized to represent this account.
                                    </span>
                                </label>
                                {isSubmitting && validationError && (
                                    <div className="text-red-400 text-sm">{validationError}</div>
                                )}
                                {!isSubmitting && validationError && (
                                    <div className="text-red-400 text-sm animate-pulse">{validationError}</div>
                                )}
                            </div>
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
                <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="flex items-center px-8 py-3 bg-white text-[#2008b9] font-bold rounded-lg hover:bg-white/90 active:scale-95 transition-all shadow-lg shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Processing...' : (
                        currentStep === STEPS.length - 1 ? 'Submit Application' : 'Next Step'
                    )}
                    {!isSubmitting && currentStep !== STEPS.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
                </button>
            </div>
        </motion.div>
    );
}

const Input = ({ label, tooltip, ...props }) => (
    <div className="flex flex-col space-y-2">
        <div className="flex items-center">
            <label className="text-sm font-medium text-white/80">{label}</label>
            {tooltip && <InfoTooltip text={tooltip} />}
        </div>
        <input
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-colors"
            {...props}
        />
    </div>
);

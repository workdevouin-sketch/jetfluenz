'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@/lib/auth/helpers';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { resetPassword, verifyResetCode, confirmResetPassword } = useAuth();

    // URL parameters for the reset flow
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    // States
    const [step, setStep] = useState(mode === 'resetPassword' && oobCode ? 'confirm' : 'request');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [userEmail, setUserEmail] = useState(''); // Email of the user associated with the code

    // Verify code if in confirm mode
    useEffect(() => {
        if (mode === 'resetPassword' && oobCode) {
            handleVerifyCode(oobCode);
        }
    }, [mode, oobCode]);

    const handleVerifyCode = async (code) => {
        setVerifying(true);
        setError('');
        const result = await verifyResetCode(code);
        if (result.success) {
            setUserEmail(result.email);
            setStep('confirm');
        } else {
            setError(getAuthErrorMessage(result.error));
            setStep('error');
        }
        setVerifying(false);
    };

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await resetPassword(email);
            if (result.success) {
                setSuccess(true);
            } else {
                setError(getAuthErrorMessage(result.error));
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmReset = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await confirmResetPassword(oobCode, password);
            if (result.success) {
                setSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setError(getAuthErrorMessage(result.error));
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-stretch">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex w-1/2 bg-[#2008b9] flex-col justify-center px-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full border border-white/10 translate-x-1/2 -translate-y-1/4"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full border border-white/5 translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full border border-white/10 -translate-x-1/2 translate-y-1/4"></div>

                <div className="relative z-10 text-white">
                    <Link href="/">
                        <img src="/logo.png" alt="Jetfluenz" className="h-32 mb-6 cursor-pointer" />
                    </Link>
                    <h1 className="text-4xl font-bold mb-4">Secure Your Account</h1>
                    <p className="text-xl text-blue-100 max-w-md leading-relaxed">
                        Reset your password to keep your influencer marketing campaigns running smoothly.
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <Link href="/login" className="inline-flex items-center text-sm text-[#2008b9] hover:underline mb-6">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Link>
                        <h2 className="text-3xl font-bold text-[#343C6A]">
                            {step === 'request' ? 'Forgot Password?' : 'Reset Password'}
                        </h2>
                        <p className="text-gray-400 mt-2">
                            {step === 'request'
                                ? "Enter your email and we'll send you a reset link."
                                : step === 'confirm'
                                    ? `Enter a new password for ${userEmail}`
                                    : "Verification failed"}
                        </p>
                    </div>

                    {verifying ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-12 h-12 animate-spin text-[#2008b9] mb-4" />
                            <p className="text-gray-500">Verifying reset link...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {success ? (
                                <div className="bg-green-50 text-green-600 p-6 rounded-[20px] text-center space-y-4">
                                    <CheckCircle className="w-12 h-12 mx-auto" />
                                    <div>
                                        <h3 className="text-lg font-bold mb-1">
                                            {step === 'request' ? 'Email Sent!' : 'Success!'}
                                        </h3>
                                        <p className="text-sm">
                                            {step === 'request'
                                                ? `We've sent a password reset link to ${email}. Please check your inbox.`
                                                : "Your password has been reset successfully. Redirecting you to login..."}
                                        </p>
                                    </div>
                                    {step === 'request' && (
                                        <button
                                            onClick={() => setSuccess(false)}
                                            className="text-[#2008b9] font-medium hover:underline text-sm"
                                        >
                                            Didn't get the email? Try again
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {step === 'request' && (
                                        <form onSubmit={handleRequestReset} className="space-y-6">
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Mail className="h-5 w-5 text-gray-300" />
                                                </div>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="Email Address"
                                                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[20px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2008b9] focus:border-transparent transition-all shadow-sm"
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-[#2008b9] text-white font-bold py-4 rounded-[20px] shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:bg-blue-800 transition-all transform hover:-translate-y-0.5 flex justify-center items-center disabled:opacity-70"
                                            >
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                                            </button>
                                        </form>
                                    )}

                                    {step === 'confirm' && (
                                        <form onSubmit={handleConfirmReset} className="space-y-6">
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Lock className="h-5 w-5 text-gray-300" />
                                                </div>
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="New Password"
                                                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[20px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2008b9] focus:border-transparent transition-all shadow-sm"
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>

                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Lock className="h-5 w-5 text-gray-300" />
                                                </div>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirm New Password"
                                                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[20px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2008b9] focus:border-transparent transition-all shadow-sm"
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-[#2008b9] text-white font-bold py-4 rounded-[20px] shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:bg-blue-800 transition-all transform hover:-translate-y-0.5 flex justify-center items-center disabled:opacity-70"
                                            >
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                                            </button>
                                        </form>
                                    )}

                                    {step === 'error' && (
                                        <div className="text-center space-y-4">
                                            <p className="text-gray-600">The link you followed is invalid or has expired.</p>
                                            <button
                                                onClick={() => {
                                                    setStep('request');
                                                    setError('');
                                                }}
                                                className="w-full bg-[#2008b9] text-white font-bold py-4 rounded-[20px] shadow-lg hover:bg-blue-800 transition-all"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Remember your password?{' '}
                            <Link href="/login" className="text-[#2008b9] font-bold hover:underline">
                                Log in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#2008b9]" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}

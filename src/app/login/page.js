'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@/lib/auth/helpers';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, isAuthenticated, userData, getUserDashboard, loading: authLoading } = useAuth();
    const timeoutRef = useRef(null);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Check for session expiration or error messages
    useEffect(() => {
        const expired = searchParams.get('expired') === 'true';
        const errorParam = searchParams.get('error');

        if (expired) {
            setError('Your session has expired. Please log in again.');
        } else if (errorParam === 'pending') {
            setError('Your account is pending approval. You will be notified once it is active.');
        } else if (errorParam === 'banned') {
            setError('This account has been suspended.');
        }

        // Cleanup timeout on unmount
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [searchParams]);

    // Redirect if already authenticated AND userData is loaded
    useEffect(() => {
        console.log('Login redirect check:', {
            authLoading,
            isAuthenticated,
            hasRole: !!userData?.role,
            role: userData?.role,
            dashboardRoute: userData?.role ? getUserDashboard() : 'N/A'
        });

        if (!authLoading && isAuthenticated && userData?.role) {
            const dashboardRoute = getUserDashboard();
            console.log('Redirecting to:', dashboardRoute);

            // Clear the timeout since we're redirecting successfully
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            if (dashboardRoute !== '/') {
                router.push(dashboardRoute);
            }
        }
    }, [isAuthenticated, authLoading, userData, router, getUserDashboard]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await login(email, password);

            if (result.success) {
                // Set a timeout fallback in case userData doesn't load
                timeoutRef.current = setTimeout(() => {
                    setLoading(false);
                    setError('Login successful but unable to load user data. Please refresh the page.');
                }, 5000); // 5 second timeout

                // AuthContext will handle user data fetching
                // The useEffect will handle the redirect once userData is loaded
            } else {
                // Display user-friendly error message
                setError(getAuthErrorMessage(result.error));
                setLoading(false);
            }
        } catch (err) {
            console.error('Login Error:', err);
            setError('An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    // Don't render login form if already authenticated
    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#2008b9]" />
            </div>
        );
    }

    if (isAuthenticated && userData?.role) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="flex min-h-screen items-stretch">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex w-1/2 bg-[#2008b9] flex-col justify-center px-20 relative overflow-hidden">
                {/* Abstract Curves (CSS) */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full border border-white/10 translate-x-1/2 -translate-y-1/4"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full border border-white/5 translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full border border-white/10 -translate-x-1/2 translate-y-1/4"></div>

                <div className="relative z-10 text-white">
                    <img src="/logo.png" alt="Jetfluenz" className="h-32 mb-6" />
                    <p className="text-xl text-blue-100 max-w-md leading-relaxed">
                        connects micro-influencers with businesses to create authentic campaigns that convert.
                    </p>
                    <button className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full font-medium transition-all text-white border border-white/20">
                        Read More
                    </button>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-[#343C6A]">Hello Again!</h2>
                        <p className="text-gray-400 mt-2">Welcome Back</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Email Input */}
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

                        {/* Password Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-300" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[20px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2008b9] focus:border-transparent transition-all shadow-sm"
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#2008b9] text-white font-bold py-4 rounded-[20px] shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:bg-blue-800 transition-all transform hover:-translate-y-0.5 flex justify-center items-center disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
                        </button>

                        <div className="text-center">
                            <Link
                                href="/reset-password"
                                className="text-gray-400 hover:text-[#2008b9] text-sm transition-colors"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                    </form>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                        <p className="text-sm text-gray-600">
                            <strong>New user?</strong> Your account must be approved by an admin.
                            Contact support if you haven't received your login credentials.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#2008b9]" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}

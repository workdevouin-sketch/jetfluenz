'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Check for Admin Credentials (Hardcoded)
            if (email === 'devou.in@gmail.com' && password === 'jetfluenz2026') {
                localStorage.setItem('jetfluenz_user', JSON.stringify({
                    id: 'admin_master',
                    role: 'admin',
                    email: email,
                    name: 'Admin'
                }));
                router.push('/admin');
                return;
            }

            // 2. Query User by Email (Normal Users)
            const q = query(collection(db, 'users'), where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError('No account found with this email.');
                setLoading(false);
                return;
            }

            // 2. Validate Password (User ID) and Status
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            const userId = userDoc.id;

            if (userData.status === 'banned') {
                setError('Your account has been banned due to violation of terms.');
                setLoading(false);
                return;
            }

            if (userData.status !== 'approved') {
                setError('Your account is still pending approval.');
                setLoading(false);
                return;
            }

            // Expected password is the UserID (or the stored password field if we set it)
            // We set 'password' field in createAccountForUser, so we can check that.
            // Fallback to ID check if password field missing.
            const validPassword = userData.password || userId;

            if (password !== validPassword) {
                setError('Incorrect password (Hint: Check your provided credentials).');
                setLoading(false);
                return;
            }

            // 3. Login Success
            // Persist simple session (in real app, use Firebase Auth)
            localStorage.setItem('jetfluenz_user', JSON.stringify({ id: userId, ...userData }));

            // Redirect based on role
            if (userData.role === 'business') {
                router.push('/dashboard/business');
            } else {
                router.push('/dashboard/influencer');
            }

        } catch (err) {
            console.error('Login Error:', err);
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-stretch">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex w-1/2 bg-[#2008b9] flex-col justify-center px-20 relative overflow-hidden">
                {/* Abstract Curves (CSS) */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full border border-white/10 translate-x-1/2 -translate-y-1/4"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full border border-white/5 translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full border border-white/10 -translate-x-1/2 translate-y-1/4"></div>

                <div className="relative z-10 text-white">
                    <h1 className="text-5xl font-bold mb-4">Jetfluenz.</h1>
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
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                                {error}
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
                                placeholder="Password (Use Your User ID)"
                                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[20px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2008b9] focus:border-transparent transition-all shadow-sm"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#2008b9] text-white font-bold py-4 rounded-[20px] shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:bg-blue-800 transition-all transform hover:-translate-y-0.5 flex justify-center items-center disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
                        </button>

                        <div className="text-center">
                            <Link href="#" className="text-gray-400 hover:text-[#2008b9] text-sm transition-colors">
                                Forgot Password
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

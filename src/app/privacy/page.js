import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm">
                <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
                <p className="text-gray-500 mb-8">Last Updated: January 16, 2026</p>

                <div className="prose prose-blue max-w-none text-gray-700 space-y-8">

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
                        <p>At Jetfluenz, we respect your privacy and are committed to protecting the personal information you share with us. This policy outlines how we collect, use, and safeguard your data.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
                        <p className="mb-2">We collect information you provide directly to us when you join our waitlist or use our platform, including:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Identity Data: Name, company name, age group.</li>
                            <li>Contact Data: Email address, phone number.</li>
                            <li>Social Data: Instagram handle, potential reach, niche.</li>
                            <li>Profile Data: Industry, interests, preferences.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>To provide and maintain our Service.</li>
                            <li>To match influencers with relevant business opportunities.</li>
                            <li>To notify you about changes to our Service.</li>
                            <li>To provide customer support.</li>
                            <li>To monitor the usage of specific features.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Sharing</h2>
                        <p>We do not sell your personal data. We may share your data with:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Prospective Partners:</strong> Business users may view Influencer profiles (and vice versa) for the purpose of campaigns.</li>
                            <li><strong>Service Providers:</strong> Third parties who facilitate our service (e.g., hosting, analytics).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Security</h2>
                        <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. We strive to use commercially acceptable means to protect your Personal Data.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">6. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support.jetfluenz@devou.in" className="text-blue-600 hover:underline">support.jetfluenz@devou.in</a>.</p>
                    </section>

                </div>
            </div>
        </div>
    );
}

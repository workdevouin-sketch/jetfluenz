import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm">
                <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
                <p className="text-gray-500 mb-8">Last Updated: January 16, 2026</p>

                <div className="prose prose-blue max-w-none text-gray-700 space-y-8">

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
                        <p>Welcome to Jetfluenz. By accessing or using our platform, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the service.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">2. User Accounts</h2>
                        <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                    </section>

                    <section className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                        <h2 className="text-xl font-bold text-red-800 mb-3">3. Non-Circumvention & Non-Solicitation (Critical)</h2>
                        <p className="font-medium text-red-900 mb-2">
                            This is a legally binding agreement between you (the "Influencer" or "Business") and Jetfluenz.
                        </p>
                        <p className="mb-4">
                            <strong>3.1 Prohibition on Direct Contact:</strong> Users agree NOT to directly contact, solicit, contract with, or transact business with any other user introduced through the Jetfluenz platform for the purpose of avoiding commission fees or platform policies.
                        </p>
                        <p className="mb-4">
                            <strong>3.2 Exclusivity Period:</strong> This non-circumvention obligation applies for a period of <strong>twenty-four (24) months</strong> from the date of the user's first interaction or introduction via the Jetfluenz platform.
                        </p>
                        <p>
                            <strong>3.3 Penalties:</strong> Violation of this clause will result in strict legal action, immediate permanent suspension from the platform, and a penalty fee equal to the greater of $5,000 USD or 25% of the total circumvented transaction value.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">4. Intellectual Property</h2>
                        <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Jetfluenz and its licensors. The Service is protected by copyright, trademark, and other laws of both India and foreign countries.</p>
                    </section>

                    <section className="bg-gray-50 border-l-4 border-gray-500 p-6 rounded-r-lg">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Platform Disclaimer & Limitation of Liability</h2>
                        <p className="mb-4">
                            <strong>5.1 Intermediary Role:</strong> Jetfluenz acts solely as a technological platform to connect Businesses and Influencers. We are not a party to any agreement, contract, or transaction entered into between designated users.
                        </p>
                        <p className="mb-4">
                            <strong>5.2 No Liability for Products:</strong> Jetfluenz assumes <strong>no responsibility or liability</strong> for the quality, safety, legality, or efficacy of any products, services, or brands promoted through the platform. Any product liability claims are solely between the Business and the Influencer/End Consumer.
                        </p>
                        <p className="mb-4">
                            <strong>5.3 No Liability for Conduct:</strong> Jetfluenz is <strong>not responsible</strong> for the conduct, statements, content, or controversies associated with any Influencer or Business. Users interact at their own risk.
                        </p>
                        <p>
                            <strong>5.4 Dispute Resolution:</strong> Any disputes regarding payments, deliverables, or product issues must be resolved directly between the Business and the Influencer. Jetfluenz disclaims all liability for such disputes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">6. Termination</h2>
                        <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">7. Changes</h2>
                        <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">8. Contact Us</h2>
                        <p>If you have any questions about these Terms, please contact us at <a href="mailto:support.jetfluenz@devou.in" className="text-blue-600 hover:underline">support.jetfluenz@devou.in</a>.</p>
                    </section>

                </div>
            </div>
        </div>
    );
}

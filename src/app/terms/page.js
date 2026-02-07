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

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">3. Campaign Types & Compensation</h2>
                        <p className="mb-4"><strong>3.1 Campaign Classifications:</strong> Campaigns on Jetfluenz may be classified as:</p>
                        <ul className="list-disc pl-5 mb-4 space-y-1">
                            <li><strong>Paid Campaigns:</strong> Influencers receive monetary compensation for services.</li>
                            <li><strong>Gifted Campaigns:</strong> Influencers receive products or services in exchange for deliverables, with no monetary payment.</li>
                        </ul>
                        <p><strong>3.2 Binding Agreement:</strong> By accepting a campaign, the Influencer agrees to the specific compensation terms (Paid or Gifted) outlined in the campaign offer.</p>
                    </section>

                    <section className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                        <h2 className="text-xl font-bold text-yellow-800 mb-3">4. Confidentiality & Non-Disclosure</h2>
                        <p className="mb-4">
                            <strong>4.1 Non-Disclosure of Commercial Relationship:</strong> Information regarding the specific commercial terms, payment details, or the explicit "Paid" nature of a campaign is considered confidential.
                        </p>
                        <p className="mb-4">
                            <strong>4.2 Post-Campaign Disclosure:</strong> Influencers agree <strong>NOT to explicitly disclose</strong> to the public that a campaign was "Paid" or discuss financial details after the campaign has concluded, except as strictly required by applicable advertising laws (e.g., using standard #ad or #sponsored tags is permitted).
                        </p>
                        <p>
                            <strong>4.3 Breach of Confidence:</strong> Publicly disclosing confidential payment details or disparaging the paid nature of the partnership is a violation of these terms and grounds for immediate account suspension.
                        </p>
                    </section>

                    <section className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                        <h2 className="text-xl font-bold text-red-800 mb-3">5. Non-Circumvention & Non-Solicitation (Critical)</h2>
                        <p className="font-medium text-red-900 mb-2">
                            This is a legally binding agreement between you (the "Influencer" or "Business") and Jetfluenz.
                        </p>
                        <p className="mb-4">
                            <strong>5.1 Prohibition on Direct Contact:</strong> Users agree NOT to directly contact, solicit, contract with, or transact business with any other user introduced through the Jetfluenz platform for the purpose of avoiding commission fees or platform policies.
                        </p>
                        <p className="mb-4">
                            <strong>5.2 Exclusivity Period:</strong> This non-circumvention obligation applies for a period of <strong>twenty-four (24) months</strong> from the date of the user's first interaction or introduction via the Jetfluenz platform.
                        </p>
                        <p>
                            <strong>5.3 Penalties:</strong> Violation of this clause will result in strict legal action, immediate permanent suspension from the platform, and a penalty fee equal to the greater of ₹4,00,000 INR or 25% of the total circumvented transaction value.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">6. Intellectual Property</h2>
                        <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Jetfluenz and its licensors. The Service is protected by copyright, trademark, and other laws of both India and foreign countries.</p>
                    </section>

                    <section className="bg-gray-50 border-l-4 border-gray-500 p-6 rounded-r-lg">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">7. Platform Disclaimer & Limitation of Liability</h2>
                        <p className="mb-4">
                            <strong>7.1 Intermediary Role:</strong> Jetfluenz acts solely as a technological platform to connect Businesses and Influencers. We are not a party to any agreement, contract, or transaction entered into between designated users.
                        </p>
                        <p className="mb-4">
                            <strong>7.2 No Liability for Products:</strong> Jetfluenz assumes <strong>no responsibility or liability</strong> for the quality, safety, legality, or efficacy of any products, services, or brands promoted through the platform. Any product liability claims are solely between the Business and the Influencer/End Consumer.
                        </p>
                        <p className="mb-4">
                            <strong>7.3 No Liability for Conduct:</strong> Jetfluenz is <strong>not responsible</strong> for the conduct, statements, content, or controversies associated with any Influencer or Business. Users interact at their own risk.
                        </p>
                        <p>
                            <strong>7.4 Dispute Resolution:</strong> Any disputes regarding payments, deliverables, or product issues must be resolved directly between the Business and the Influencer. Jetfluenz disclaims all liability for such disputes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">8. Termination</h2>
                        <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">9. Changes</h2>
                        <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact Us</h2>
                        <p>If you have any questions about these Terms, please contact us at <a href="mailto:support.jetfluenz@devou.in" className="text-blue-600 hover:underline">support.jetfluenz@devou.in</a>.</p>
                    </section>

                </div>
            </div>
        </div>
    );
}

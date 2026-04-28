import React from 'react';
import { Head } from '@inertiajs/react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Privacy Policy" />
            <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-8">
                <h1 className="text-3xl font-bold text-gray-900 border-b pb-4 mb-6">Privacy Policy</h1>
                
                <p className="text-gray-600 mb-6 italic">Effective Date: April 28, 2026</p>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
                    <p className="text-gray-700 leading-relaxed">
                        Welcome to Docklands Accountants. We are committed to protecting your personal and financial information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our mobile and web applications.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
                    <ul className="list-disc pl-5 text-gray-700 space-y-2">
                        <li><strong>Profile Information:</strong> Name, email address, phone number, and occupation.</li>
                        <li><strong>Financial Data:</strong> Tax records, payroll details, and company financial documents you upload to our secure portal.</li>
                        <li><strong>Communication:</strong> Messages and records of consultations between you and your accountant.</li>
                        <li><strong>Usage Data:</strong> Information about how you interact with our services via your mobile device.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
                    <p className="text-gray-700 leading-relaxed">
                        We use your information strictly to provide accounting services, including:
                        Managing your tax filings (VAT, Corporation Tax), processing payroll, and facilitating secure communication. We do not sell or share your data with third parties for marketing purposes.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Data Security</h2>
                    <p className="text-gray-700 leading-relaxed">
                        We implement industry-standard encryption (SSL/TLS) for data in transit and secure database storage. Access to your financial documents is restricted to you and your assigned professional accountant.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Your Rights</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        You have the right to access, correct, or request the deletion of your personal data. 
                    </p>
                    <p className="text-gray-700">
                        For account deletion requests, please visit our <a href="/account-deletion" className="text-blue-600 hover:underline">Account Deletion Page</a>.
                    </p>
                </section>

                <section className="mb-8 border-t pt-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Contact Us</h2>
                    <p className="text-gray-700">
                        If you have any questions about this Privacy Policy, please contact us at:
                        <br />
                        <strong>Email:</strong> proai.london@gmail.com
                    </p>
                </section>
            </div>
        </div>
    );
}

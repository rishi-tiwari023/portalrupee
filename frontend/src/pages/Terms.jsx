import React from 'react';

const Terms = () => {
    return (
        <div className="min-h-screen pt-28 pb-12 px-4 max-w-4xl mx-auto">
            <div className="premium-card p-10 md:p-14 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-8 pb-6 border-b border-slate-100">Terms and Conditions</h1>
                
                <div className="prose prose-slate max-w-none space-y-6">
                    <p className="text-sm text-slate-500 font-medium">Last Updated: June 2026</p>
                    
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-800">1. Introduction</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Welcome to PortalRupee. These terms and conditions govern your use of the PortalRupee digital banking platform, accessible via our website. By registering for an account or using our services, you accept these terms in full and agree to comply with all applicable laws and regulations, including those prescribed by the Reserve Bank of India (RBI).
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-800">2. Account Registration and KYC</h2>
                        <p className="text-slate-600 leading-relaxed">
                            In compliance with RBI's Master Direction on KYC, all users must complete the mandatory Know Your Customer (KYC) verification process before initiating transactions. You agree to provide accurate, current, and complete information during the registration process. PortalRupee reserves the right to freeze or close accounts that fail to meet compliance standards.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-800">3. Transaction Limits and Security</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Daily transaction limits are applied based on your account type and KYC tier. You are responsible for maintaining the confidentiality of your login credentials and Transaction PIN (TPIN). PortalRupee will not be held liable for any loss arising from unauthorized access due to compromised credentials on the user's end.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-800">4. Dispute Resolution</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Any disputes arising from unauthorized or failed transactions must be reported within 72 hours of the occurrence. Our grievance redressal mechanism is designed in accordance with the RBI Ombudsman Scheme. We aim to resolve all technical disputes within T+5 working days.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-800">5. Termination</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the service will immediately cease.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Terms;

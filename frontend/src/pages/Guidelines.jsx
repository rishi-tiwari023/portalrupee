import React from 'react';
import RBIGuideline from '../components/RBIGuideline';

const Guidelines = () => {
    return (
        <div className="min-h-screen pt-28 pb-12 px-4 max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Regulatory Guidelines</h1>
                <p className="text-lg text-slate-600">PortalRupee complies fully with the regulations of the Reserve Bank of India.</p>
            </div>
            
            <RBIGuideline />
            
            <div className="premium-card p-10 mt-12 rounded-[2rem] bg-white border border-slate-100 shadow-xl">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Important RBI Directives</h2>
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">1</div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Customer Liability in Unauthorized Electronic Banking Transactions</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                As per RBI guidelines, customers must notify the bank immediately upon noticing an unauthorized transaction. Zero liability applies if the unauthorized transaction occurs due to contributory fraud/negligence/deficiency on the part of the bank.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">2</div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Positive Pay System for Cheques</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                To prevent fraud, PortalRupee incorporates the Positive Pay System for all cheque transactions above ₹50,000, requiring reconfirmation of key details.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">3</div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Digital Lending Guidelines</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                All lending activities through PortalRupee adhere to the RBI's digital lending norms, ensuring transparency in interest rates, no hidden charges, and clear loan agreements.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Guidelines;

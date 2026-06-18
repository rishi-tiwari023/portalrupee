import React from 'react';
import { TrendingUp, PieChart, Percent, Activity } from 'lucide-react';

const InterestInfo = () => {
    return (
        <div className="min-h-screen pt-28 pb-12 px-4 max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Interest Rates & Yields</h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                    PortalRupee offers competitive interest rates compliant with RBI benchmarks. Stay informed about the returns on your savings and investments.
                </p>
                <p className="text-sm text-slate-500 mt-4">Rates are effective from June 2026 and are subject to change.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="premium-card p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl relative overflow-hidden">
                    <div className="absolute top-4 right-4 opacity-10 pointer-events-none text-indigo-400">
                        <TrendingUp className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                            <Percent className="w-7 h-7" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Savings Accounts</h2>
                        <p className="text-slate-500 mb-8">Earn attractive daily interest on your balances.</p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="font-semibold text-slate-700">Balance up to ₹1 Lakh</span>
                                <span className="text-xl font-bold text-indigo-600">3.50% p.a.</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="font-semibold text-slate-700">₹1 Lakh to ₹10 Lakhs</span>
                                <span className="text-xl font-bold text-indigo-600">4.50% p.a.</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <span className="font-semibold text-slate-800">Above ₹10 Lakhs</span>
                                <span className="text-xl font-bold text-indigo-700">6.00% p.a.</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="premium-card p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl relative overflow-hidden">
                    <div className="absolute top-4 right-4 opacity-10 pointer-events-none text-emerald-400">
                        <PieChart className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                            <Activity className="w-7 h-7" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Fixed Deposits</h2>
                        <p className="text-slate-500 mb-8">Secure your future with guaranteed returns.</p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="font-semibold text-slate-700">7 Days to 45 Days</span>
                                <span className="text-xl font-bold text-emerald-600">4.00% p.a.</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="font-semibold text-slate-700">1 Year to 2 Years</span>
                                <span className="text-xl font-bold text-emerald-600">7.10% p.a.</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <span className="font-semibold text-slate-800">Special 400 Days</span>
                                <span className="text-xl font-bold text-emerald-700">7.60% p.a.</span>
                            </div>
                            <p className="text-xs text-slate-500 text-center mt-4">
                                *Senior citizens receive an additional 0.50% on all FD tenures.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center">
                <p className="text-sm text-slate-500">
                    Interest calculation methodology follows RBI guidelines. Savings account interest is calculated on the daily closing balance and credited quarterly.
                </p>
            </div>
        </div>
    );
};

export default InterestInfo;

import React from 'react';
import { Shield, Zap, Globe, Award, Key, Smartphone, RefreshCw, Bell, Snowflake, MessageSquare, PieChart, LayoutDashboard } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen pt-28 pb-12 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">What is PortalRupee?</h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-6">
                    PortalRupee is a next-generation digital banking platform built for the modern Indian economy. 
                    We provide secure, lightning-fast, and transparent financial services compliant with RBI regulations.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-3xl mx-auto text-left flex gap-3 items-start">
                    <span className="text-xl">⚠️</span>
                    <p className="text-amber-900 text-sm md:text-base font-medium">
                        To be clear: PortalRupee is NOT an actual bank, UPI service, or VPA provider. It's a demo project, a full-stack simulation built to explore how real banking systems work under the hood.
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
                <div className="premium-card p-8 rounded-[2rem] bg-white border border-slate-100 shadow-lg text-center hover:-translate-y-2 transition-transform flex flex-col justify-start">
                    <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 flex-shrink-0">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">Bank-Grade Security</h3>
                    <p className="text-sm text-slate-500">Military-grade encryption and strict RBI compliance keep your funds and data completely secure.</p>
                </div>
                
                <div className="premium-card p-8 rounded-[2rem] bg-white border border-slate-100 shadow-lg text-center hover:-translate-y-2 transition-transform flex flex-col justify-start">
                    <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 flex-shrink-0">
                        <Zap className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">Lightning Fast</h3>
                    <p className="text-sm text-slate-500">Real-time settlements and atomic transactions mean your money moves at the speed of thought.</p>
                </div>

                <div className="premium-card p-8 rounded-[2rem] bg-white border border-slate-100 shadow-lg text-center hover:-translate-y-2 transition-transform flex flex-col justify-start">
                    <div className="w-16 h-16 mx-auto bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 mb-6 flex-shrink-0">
                        <Globe className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">Digital First</h3>
                    <p className="text-sm text-slate-500">No branch visits required. Fully digital KYC and account management right from your dashboard.</p>
                </div>

                <div className="premium-card p-8 rounded-[2rem] bg-white border border-slate-100 shadow-lg text-center hover:-translate-y-2 transition-transform flex flex-col justify-start">
                    <div className="w-16 h-16 mx-auto bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 flex-shrink-0">
                        <Award className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">Premium Service</h3>
                    <p className="text-sm text-slate-500">Dedicated relationship managers and 24/7 priority support for all your banking needs.</p>
                </div>
            </div>

            <div className="mb-24">
                <div className="text-center mb-24 mt-12">
                    <h2 className="text-4xl font-bold text-slate-900 mb-6">Platform Features</h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6 leading-relaxed">Experience a full suite of modern banking features tailored for you.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="premium-card p-6 bg-white border border-slate-100 shadow-sm rounded-[2rem] hover:-translate-y-1 transition-transform">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                            <Key className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-2">Secure TPIN</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">Authorize every transaction with a dedicated Transaction PIN for maximum security.</p>
                    </div>

                    <div className="premium-card p-6 bg-white border border-slate-100 shadow-sm rounded-[2rem] hover:-translate-y-1 transition-transform">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-2">TOTP 2FA</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">Protect your account with Time-based One-Time Passwords via authenticator apps.</p>
                    </div>

                    <div className="premium-card p-6 bg-white border border-slate-100 shadow-sm rounded-[2rem] hover:-translate-y-1 transition-transform">
                        <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 mb-4">
                            <Snowflake className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-2">Account Freeze</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">Branch Managers can freeze accounts for compliance and safety, and unfreeze them upon verification.</p>
                    </div>

                    <div className="premium-card p-6 bg-white border border-slate-100 shadow-sm rounded-[2rem] hover:-translate-y-1 transition-transform">
                        <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 mb-4">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-2">Integrated Social Chat</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">Chat instantly with friends, family, or anyone you've transferred money to within the PortalRupee ecosystem.</p>
                    </div>

                    <div className="premium-card p-6 bg-white border border-slate-100 shadow-sm rounded-[2rem] hover:-translate-y-1 transition-transform">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                            <PieChart className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-2">Financial Insights</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">Analyze your spending and saving habits with beautiful, intuitive charts.</p>
                    </div>

                    <div className="premium-card p-6 bg-white border border-slate-100 shadow-sm rounded-[2rem] hover:-translate-y-1 transition-transform">
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4">
                            <Bell className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-2">Real-time Notifications</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">Stay updated with instant in-app alerts for every transaction and account change.</p>
                    </div>

                    <div className="premium-card p-6 bg-white border border-slate-100 shadow-sm rounded-[2rem] hover:-translate-y-1 transition-transform">
                        <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-4">
                            <RefreshCw className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-2">Secure Reset</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">Easily reset your TPIN or Password using integrated, secure workflows.</p>
                    </div>

                    <div className="premium-card p-6 bg-white border border-slate-100 shadow-sm rounded-[2rem] hover:-translate-y-1 transition-transform">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                            <LayoutDashboard className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-2">Role-based Dashboards</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">Specialized, secure interfaces for Users, Branch Managers, and Administrators.</p>
                    </div>
                </div>
            </div>

            <div className="premium-card p-12 mt-12 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 w-full">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
                    <p className="text-lg text-slate-600 leading-relaxed mb-6">
                        To democratize premium banking services across India. We believe that world-class financial technology should be accessible to everyone, backed by the trust and regulatory framework of the Indian banking system.
                    </p>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        PortalRupee is operated in adherence with the guidelines issued by the Reserve Bank of India (RBI) and the National Payments Corporation of India (NPCI).
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;

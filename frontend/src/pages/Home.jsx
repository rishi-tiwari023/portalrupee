import React from 'react';
import EMICalculator from '../components/EMICalculator';
import RBIGuideline from '../components/RBIGuideline';
import logo from '../assets/logo.png';

const Home = () => (
  <div className="flex flex-col gap-12 w-full max-w-7xl mx-auto p-6 md:p-12">
    <div className="text-center py-10 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="w-24 h-24 mb-6 rounded-3xl overflow-hidden shadow-xl shadow-indigo-100/50 hover:scale-105 transition-transform cursor-pointer">
        <img src={logo} alt="PortalRupee Logo" className="w-full h-full object-contain" />
      </div>
      <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
        Welcome to <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">PortalRupee</span>
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Experience premium banking with dynamic tools, lightning-fast transactions, and rock-solid security.
      </p>
    </div>
    <EMICalculator />
    <RBIGuideline />
  </div>
);

export default Home;

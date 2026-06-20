import React from 'react';
import { motion } from 'framer-motion';

const DemoCredentials = () => {
  return (
    <div className="flex flex-col gap-12 w-full max-w-7xl mx-auto p-6 md:p-12 pt-28 md:pt-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl mx-auto mt-6 bg-white p-8 rounded-3xl shadow-xl border border-slate-100"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Demo Credentials</h1>
          <p className="text-slate-500">New registrations require approval. Use these to test the workflow.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 hover:shadow-md transition-shadow">
            <div className="text-sm font-black text-indigo-600 uppercase mb-3 tracking-wider">Admin</div>
            <div className="mb-1">
              <span className="text-xs text-slate-500 font-semibold mr-2">Email:</span>
              <span className="text-base font-bold text-slate-800 break-all">admin@portalrupee.com</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold mr-2">Password:</span>
              <span className="text-sm font-medium text-slate-700">Password@123</span>
            </div>
          </div>
          <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 hover:shadow-md transition-shadow">
            <div className="text-sm font-black text-purple-600 uppercase mb-3 tracking-wider">Manager</div>
            <div className="mb-1">
              <span className="text-xs text-slate-500 font-semibold mr-2">Email:</span>
              <span className="text-base font-bold text-slate-800 break-all">manager@portalrupee.com</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold mr-2">Password:</span>
              <span className="text-sm font-medium text-slate-700">Password@123</span>
            </div>
          </div>
          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 hover:shadow-md transition-shadow">
            <div className="text-sm font-black text-amber-600 uppercase mb-3 tracking-wider">Cashier</div>
            <div className="mb-1">
              <span className="text-xs text-slate-500 font-semibold mr-2">Email:</span>
              <span className="text-base font-bold text-slate-800 break-all">cashier@portalrupee.com</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold mr-2">Password:</span>
              <span className="text-sm font-medium text-slate-700">Password@123</span>
            </div>
          </div>
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 hover:shadow-md transition-shadow">
            <div className="text-sm font-black text-emerald-600 uppercase mb-3 tracking-wider">Customer</div>
            <div className="mb-1">
              <span className="text-xs text-slate-500 font-semibold mr-2">Email:</span>
              <span className="text-base font-bold text-slate-800 break-all">customer@portalrupee.com</span>
            </div>
            <div className="mb-2">
              <span className="text-xs text-slate-500 font-semibold mr-2">Password:</span>
              <span className="text-sm font-medium text-slate-700">Password@123</span>
            </div>
            <div className="pt-2 border-t border-emerald-200">
              <span className="text-xs text-slate-500 font-semibold mr-2">TPIN:</span>
              <span className="text-sm font-bold text-emerald-700">111111</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DemoCredentials;

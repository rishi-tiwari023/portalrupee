import React from 'react';
import { useSelector } from 'react-redux';
import { User, Mail, Shield, Phone, Calendar, MapPin, Edit3 } from 'lucide-react';
/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Profile Section */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8">
           <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-medium hover:bg-indigo-100 transition-colors">
              <Edit3 size={18} />
              <span>Edit Profile</span>
           </button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[3px] shadow-lg shadow-indigo-100">
            <div className="w-full h-full rounded-[1.4rem] bg-white flex items-center justify-center text-4xl font-bold text-indigo-600">
              {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
            </div>
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-800 mb-1">
              {user?.firstName} {user?.lastName}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center mt-2">
              <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                {user?.role}
              </span>
              <span className="flex items-center gap-1 text-slate-400 text-sm font-medium">
                <MapPin size={14} />
                <span>India</span>
              </span>
              <span className="flex items-center gap-1 text-slate-400 text-sm font-medium">
                <Calendar size={14} />
                <span>Joined April 2026</span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Information */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100"
        >
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <User size={20} className="text-indigo-600" />
            <span>Personal Information</span>
          </h2>

          <div className="space-y-6">
            <motion.div variants={itemVariants} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-slate-700 font-medium">{user?.email}</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Mobile Number</p>
                <p className="text-slate-700 font-medium">{user?.mobile || '+91 99999 88888'}</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Account Role</p>
                <p className="text-slate-700 font-medium capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Security / Account Status */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100"
        >
          <h2 className="text-xl font-bold text-slate-800 mb-6">Account Status</h2>
          
          <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-600 font-medium">KYC Verification</span>
              <span className="px-2 py-1 bg-amber-100 text-amber-600 text-[10px] font-bold rounded shadow-sm uppercase">Pending</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Your account is currently in "Limited" mode. Complete your KYC verification to unlock full transaction limits and messaging features.
            </p>
            <button className="w-full py-3 bg-white text-indigo-600 border border-indigo-100 rounded-xl font-semibold shadow-sm hover:bg-indigo-50 transition-all">
              Start KYC Verification
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Last Login</span>
              <span className="text-slate-400 text-sm italic font-medium">Yet to decide</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Device</span>
              <span className="text-slate-400 text-sm italic font-medium">Yet to decide</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;

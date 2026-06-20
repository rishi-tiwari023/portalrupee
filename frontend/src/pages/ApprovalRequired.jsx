import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const ApprovalRequired = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser()).unwrap();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
      >
        <div className="bg-amber-500 p-8 text-center flex flex-col items-center">
          <div className="bg-white/20 p-4 rounded-full mb-4">
            <ShieldAlert className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Approval Required</h1>
          <p className="text-amber-100 font-medium text-sm">Your account is pending review</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Hello, {user?.firstName}!</h2>
          <p className="text-slate-600 mb-6 leading-relaxed text-sm">
            Thank you for registering with PortalRupee. To ensure the highest level of security, all new accounts require approval from an administrator before they can access the platform.
          </p>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8">
            <h3 className="text-sm font-bold text-slate-700 mb-2">What happens next?</h3>
            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
              <li>Our team will review your application shortly.</li>
              <li>You will receive an email notification once your account is approved.</li>
              <li>After approval, you can log in and access all features.</li>
            </ul>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ApprovalRequired;

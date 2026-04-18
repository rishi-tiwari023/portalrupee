import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Shield, Phone, Calendar, MapPin, Edit3, X, Save, Loader2, ArrowRight } from 'lucide-react';
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
import { useFormik } from 'formik';
import * as z from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { updateProfile, setTPIN, updateUser, changeTPIN } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import TPINSetupWizard from '../components/TPINSetupWizard';
import TwoFactorSetup from '../components/TwoFactorSetup';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
});

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = React.useState(false);
  const [showTPINWizard, setShowTPINWizard] = React.useState(false);
  const [show2FAWizard, setShow2FAWizard] = React.useState(false);

  const handleTPINSuccess = async (payload) => {
    try {
      if (typeof payload === 'object') {
        // Change mode
        await dispatch(changeTPIN(payload)).unwrap();
        toast.success('TPIN updated successfully!');
      } else {
        // Setup mode
        await dispatch(setTPIN(payload)).unwrap();
        toast.success('TPIN setup successfully!');
        dispatch(updateUser({ tpinSet: true }));
      }
      setShowTPINWizard(false);
    } catch (error) {
      toast.error(error || 'Failed to update TPIN');
      throw error;
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
    },
    validationSchema: toFormikValidationSchema(profileSchema),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await dispatch(updateProfile(values)).unwrap();
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } catch (error) {
        toast.error(error || 'Failed to update profile');
      }
    },
  });

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
        <div className="absolute top-0 right-0 p-8 z-20">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-medium hover:bg-indigo-100 transition-colors shadow-sm"
            >
              <Edit3 size={18} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
                <span>Cancel</span>
              </button>
              <button
                onClick={formik.handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span>Save Changes</span>
              </button>
            </div>
          )}
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

          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div
                key="view-info"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                    <p className="text-slate-700 font-medium">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Mobile Number</p>
                    <p className="text-slate-700 font-medium">{user?.mobile || '+91 99999 88888'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Account Role</p>
                    <p className="text-slate-700 font-medium capitalize">{user?.role?.toLowerCase()}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="edit-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={formik.handleSubmit}
                className="space-y-5"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">First Name</label>
                    <input
                      name="firstName"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all ${formik.touched.firstName && formik.errors.firstName ? 'border-rose-300' : 'border-slate-100'}`}
                    />
                    {formik.touched.firstName && formik.errors.firstName && (
                      <p className="text-[10px] text-rose-500 font-bold ml-1">{formik.errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Last Name</label>
                    <input
                      name="lastName"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all ${formik.touched.lastName && formik.errors.lastName ? 'border-rose-300' : 'border-slate-100'}`}
                    />
                    {formik.touched.lastName && formik.errors.lastName && (
                      <p className="text-[10px] text-rose-500 font-bold ml-1">{formik.errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all ${formik.touched.email && formik.errors.email ? 'border-rose-300' : 'border-slate-100'}`}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-[10px] text-rose-500 font-bold ml-1">{formik.errors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Mobile Number</label>
                  <input
                    name="mobile"
                    value={formik.values.mobile}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="+91 00000 00000"
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all ${formik.touched.mobile && formik.errors.mobile ? 'border-rose-300' : 'border-slate-100'}`}
                  />
                  {formik.touched.mobile && formik.errors.mobile && (
                    <p className="text-[10px] text-rose-500 font-bold ml-1">{formik.errors.mobile}</p>
                  )}
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Security & PIN */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Shield size={20} className="text-indigo-600" />
              <span>Security & PIN</span>
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {!showTPINWizard && !show2FAWizard ? (
              <motion.div
                key="security-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-700 font-semibold">Transaction PIN</span>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${user?.tpinSet ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {user?.tpinSet ? 'Active' : 'Not Set'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    Your TPIN is required for all transfers and withdrawals. Keep it secure.
                  </p>
                  <button
                    onClick={() => setShowTPINWizard(true)}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                  >
                    {user?.tpinSet ? 'Change TPIN' : 'Setup TPIN'}
                  </button>
                </div>

                <div className="space-y-4 pt-2">
                  <div 
                    className="flex items-center justify-between group cursor-pointer" 
                    onClick={() => setShow2FAWizard(true)}
                  >
                    <div className="space-y-0.5">
                      <span className="text-slate-600 font-medium group-hover:text-indigo-600 transition-colors block">Two-Factor Authentication</span>
                      <p className="text-[10px] text-slate-400 font-medium">Google Authenticator TOTP</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${user?.twoFactorEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-all" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : showTPINWizard ? (
              <motion.div
                key="wizard-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <TPINSetupWizard
                  onCancel={() => setShowTPINWizard(false)}
                  onSuccess={handleTPINSuccess}
                  isChangeMode={user?.tpinSet}
                  title={user?.tpinSet ? "Change TPIN" : "Setup TPIN"}
                />
              </motion.div>
            ) : (
              <motion.div
                key="2fa-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <TwoFactorSetup 
                  isEnabled={user?.twoFactorEnabled}
                  onCancel={() => setShow2FAWizard(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Account Status */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-none md:col-span-2"
      >
        <h2 className="text-xl font-bold text-slate-800 mb-6 font-display">Account Status</h2>

        <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-600 font-medium">KYC Verification</span>
            <span className="px-2 py-1 bg-amber-100 text-amber-600 text-[10px] font-bold rounded shadow-sm uppercase font-display">Pending</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mb-4 font-medium">
            Your account is currently in "Limited" mode. Complete your KYC verification to unlock full transaction limits and messaging features.
          </p>
          <button className="px-6 py-3 bg-white text-indigo-600 border border-indigo-100 rounded-xl font-bold shadow-sm hover:bg-indigo-50 transition-all">
            Start KYC Verification
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Last Login</span>
            <span className="text-slate-600 font-extrabold text-sm">Today, 10:45 AM</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Device</span>
            <span className="text-slate-600 font-extrabold text-sm">Chrome (Windows 11)</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;

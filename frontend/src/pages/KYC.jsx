/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowLeft, CheckCircle2, FileText, Sparkles, Award } from 'lucide-react';
import { toast } from 'react-toastify';
import FileUpload from '../components/FileUpload';
import { updateUser, submitKYC } from '../store/slices/authSlice';

/**
 * Premium KYC Submission Page integrating multiple FileUpload instances
 */
const KYC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Document states
  const [idDoc, setIdDoc] = useState(null);
  const [sigDoc, setSigDoc] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idDoc || !sigDoc) {
      toast.error('Please upload all required documents.');
      return;
    }

    setSubmitting(true);

    try {
      await dispatch(submitKYC({
        idDocKey: idDoc.key,
        sigDocKey: sigDoc.key,
      })).unwrap();

      setSubmitting(false);
      setIsSubmitted(true);
      toast.success('KYC Documents submitted for verification successfully!');
    } catch (error) {
      setSubmitting(false);
      toast.error(error || 'Failed to submit KYC documents.');
    }
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut', staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back CTA Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/dashboard/profile')}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm self-start"
      >
        <ArrowLeft size={16} />
        <span>Back to Profile</span>
      </motion.button>

      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="kyc-form"
            initial="hidden"
            animate="visible"
            variants={pageVariants}
            className="space-y-8"
          >
            {/* Header section */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-indigo-50/40 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-indigo-600 shadow-sm">
                  <Shield size={28} />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">KYC Document Verification</h1>
                  <p className="text-sm text-slate-400 font-medium mt-1">
                    Complete your identity verification to unlock unlimited wallet transactions, P2P transfers, and full account access.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Main Form content */}
            <motion.form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* File Upload 1: ID Proof */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col justify-between"
                >
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">1</span>
                      <h3 className="font-extrabold text-slate-800">Government-issued ID Proof</h3>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Upload a scanned copy or clean photo of your Aadhaar Card, Passport, or PAN Card. Ensure all four corners are visible and details are clearly legible.
                    </p>
                  </div>

                  <FileUpload
                    label=""
                    onUploadSuccess={(data) => setIdDoc(data)}
                    onUploadError={() => setIdDoc(null)}
                    accept={['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']}
                  />

                  {idDoc && (
                    <div className="mt-4 p-3 bg-emerald-50/20 border border-emerald-100 rounded-2xl flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                      <span className="text-[10px] font-black text-emerald-700 truncate">S3 Reference Key Verified</span>
                    </div>
                  )}
                </motion.div>

                {/* File Upload 2: Signature proof */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col justify-between"
                >
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">2</span>
                      <h3 className="font-extrabold text-slate-800">Signature Document</h3>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Please sign on a blank piece of clean white paper, take a sharp photo under clear lighting, and upload the image.
                    </p>
                  </div>

                  <FileUpload
                    label=""
                    onUploadSuccess={(data) => setSigDoc(data)}
                    onUploadError={() => setSigDoc(null)}
                    accept={['image/jpeg', 'image/png', 'image/jpg']} // Signatures typically images only
                  />

                  {sigDoc && (
                    <div className="mt-4 p-3 bg-emerald-50/20 border border-emerald-100 rounded-2xl flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                      <span className="text-[10px] font-black text-emerald-700 truncate">S3 Reference Key Verified</span>
                    </div>
                  )}
                </motion.div>

              </div>

              {/* Submission section */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mt-0.5">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800">Documents Verification Agreement</h4>
                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed mt-0.5">
                      By submitting, you represent that the uploaded documents belong to you and all information provided is accurate and true.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!idDoc || !sigDoc || submitting}
                  className={`
                    w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-2
                    ${(!idDoc || !sigDoc)
                      ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed border border-slate-200/40'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 hover:shadow-indigo-200'
                    }
                  `}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Encrypting & Sending...</span>
                    </>
                  ) : (
                    <span>Submit Verification</span>
                  )}
                </button>
              </motion.div>
            </motion.form>
          </motion.div>
        ) : (
          /* Success Screen */
          <motion.div
            key="kyc-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-3xl p-10 md:p-16 border border-slate-100 shadow-sm text-center max-w-2xl mx-auto space-y-8 relative overflow-hidden"
          >
            {/* Ambient Background Elements */}
            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-indigo-50/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-emerald-50/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              {/* Success Badge */}
              <div className="w-24 h-24 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mb-8 shadow-lg shadow-emerald-500/5 relative group">
                <CheckCircle2 size={48} className="transition-transform group-hover:scale-110" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md"
                >
                  <Sparkles size={12} />
                </motion.div>
              </div>

              {/* Text context */}
              <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Documents Transmitted Successfully</h2>
              <p className="text-sm font-medium text-slate-400 max-w-md leading-relaxed mb-8">
                Your KYC proof has been securely encrypted, sent to our private storage vault, and is now awaiting verification.
              </p>

              {/* Status details */}
              <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-left space-y-4 mb-8">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification Status</span>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-600 text-[10px] font-black rounded uppercase tracking-wider">Awaiting Audit</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document 1 (Identity)</span>
                  <span className="text-xs font-bold text-slate-600">{idDoc?.originalName || 'identity_document.pdf'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document 2 (Signature)</span>
                  <span className="text-xs font-bold text-slate-600">{sigDoc?.originalName || 'signature_specimen.png'}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl text-sm transition-all"
                >
                  Go to Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/profile')}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group"
                >
                  <Award size={16} />
                  <span>View Account Status</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KYC;

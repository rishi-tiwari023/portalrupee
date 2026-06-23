import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDownCircle, CheckCircle2, Loader2, IndianRupee, MessageSquare, ShieldCheck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as zod from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { deposit, clearTransactionStatus } from '../store/slices/transactionSlice';
import { fetchDashboardSummary } from '../store/slices/dashboardSlice';
import { toast } from 'react-toastify';

const depositSchema = zod.object({
  accountNumber: zod.string().min(1, 'Please select an account'),
  amount: zod.number().positive('Amount must be greater than zero'),
  description: zod.string().max(100, 'Description too long').optional(),
  totpToken: zod.string().optional(),
});

const DepositModal = ({ isOpen, onClose, accounts }) => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.transaction);
  const user = useSelector((state) => state.auth.user);
  const twoFactorEnabled = user?.twoFactorEnabled;

  const formik = useFormik({
    initialValues: {
      accountNumber: accounts?.[0]?.accountNumber || '',
      amount: '',
      description: '',
      totpToken: '',
    },
    validationSchema: toFormikValidationSchema(depositSchema),
    enableReinitialize: true,
    onSubmit: async (values) => {
      const resultAction = await dispatch(deposit(values));
      if (deposit.fulfilled.match(resultAction)) {
        toast.success('Request has been forwarded to cashier.');
        dispatch(fetchDashboardSummary());
        setTimeout(() => {
          onClose();
          dispatch(clearTransactionStatus());
        }, 3000);
      }
    },
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                  <ArrowDownCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Add Funds</h3>
                  <p className="text-sm text-slate-500 font-medium">Deposit money into your account</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8">
              {success ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.div>
                  <h4 className="text-2xl font-black text-slate-900 mb-2">Request Forwarded!</h4>
                  <p className="text-slate-500 font-medium max-w-xs mx-auto">
                    Your deposit of ₹{formik.values.amount.toLocaleString()} is waiting for approval from the cashier.
                  </p>
                </div>
              ) : (
                <form onSubmit={formik.handleSubmit} className="space-y-6">
                  {/* Account Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Select Account</label>
                    <select
                      name="accountNumber"
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                      {...formik.getFieldProps('accountNumber')}
                    >
                      {accounts?.map((acc) => (
                        <option key={acc._id} value={acc.accountNumber}>
                          {acc.accountType} - {acc.accountNumber} (₹{acc.balance.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Amount</label>
                    <div className="relative group">
                      <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type="number"
                        name="amount"
                        placeholder="0.00"
                        className={`w-full pl-14 pr-5 py-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold text-slate-900 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                          ${formik.touched.amount && formik.errors.amount ? 'border-rose-300 bg-rose-50' : 'border-transparent focus:border-emerald-500'}
                        `}
                        onChange={(e) => formik.setFieldValue('amount', parseFloat(e.target.value) || '')}
                        onBlur={formik.handleBlur}
                        onWheel={(e) => e.target.blur()}
                        value={formik.values.amount}
                      />
                    </div>
                    {formik.touched.amount && formik.errors.amount && (
                      <p className="text-[10px] text-rose-500 font-black uppercase tracking-wider ml-1">{formik.errors.amount}</p>
                    )}
                  </div>

                  {/* Description Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Description (Optional)</label>
                    <div className="relative group">
                      <MessageSquare className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type="text"
                        name="description"
                        placeholder="Purpose of deposit"
                        className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none font-bold text-slate-900 transition-all"
                        {...formik.getFieldProps('description')}
                      />
                    </div>
                  </div>

                  {/* TOTP Input if enabled */}
                  {twoFactorEnabled && (
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">2FA Verification</label>
                      <div className="relative group">
                        <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                          type="text"
                          name="totpToken"
                          placeholder="6-digit OTP from app"
                          maxLength={6}
                          className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-900 transition-all"
                          {...formik.getFieldProps('totpToken')}
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                       {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !formik.isValid}
                    className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-lg shadow-emerald-100 active:scale-95 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Confirm Deposit</span>
                        <ArrowDownCircle className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Secure transaction powered by PortalRupee Core.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DepositModal;

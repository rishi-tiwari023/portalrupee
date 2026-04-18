import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpCircle, CheckCircle2, Loader2, IndianRupee, MessageSquare, AlertCircle, ShieldCheck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as zod from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { withdraw, clearTransactionStatus } from '../store/slices/transactionSlice';
import { fetchDashboardSummary } from '../store/slices/dashboardSlice';
import { toast } from 'react-toastify';

const WithdrawModal = ({ isOpen, onClose, accounts }) => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.transaction);
  const user = useSelector((state) => state.auth.user);
  const twoFactorEnabled = user?.twoFactorEnabled;

  // to get selected account balance
  const getSelectedAccountBalance = (accNum) => {
    const account = accounts?.find(a => a.accountNumber === accNum);
    return account ? account.balance : 0;
  };

  const withdrawSchema = zod.object({
    accountNumber: zod.string().min(1, 'Please select an account'),
    amount: zod.number().positive('Amount must be greater than zero'),
    description: zod.string().max(100, 'Description too long').optional(),
    totpToken: zod.string().optional(),
  }).refine((data) => {
    const balance = getSelectedAccountBalance(data.accountNumber);
    return data.amount <= balance;
  }, {
    message: "Insufficient balance in selected account",
    path: ["amount"],
  });

  const formik = useFormik({
    initialValues: {
      accountNumber: accounts?.[0]?.accountNumber || '',
      amount: '',
      description: '',
      totpToken: '',
    },
    validationSchema: toFormikValidationSchema(withdrawSchema),
    enableReinitialize: true,
    onSubmit: async (values) => {
      const resultAction = await dispatch(withdraw(values));
      if (withdraw.fulfilled.match(resultAction)) {
        toast.success('Withdrawal successful!');
        dispatch(fetchDashboardSummary());
        setTimeout(() => {
          onClose();
          dispatch(clearTransactionStatus());
        }, 2000);
      }
    },
  });

  const selectedBalance = getSelectedAccountBalance(formik.values.accountNumber);

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
                <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-200">
                  <ArrowUpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Withdraw Funds</h3>
                  <p className="text-sm text-slate-500 font-medium">Cash out from your account</p>
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
                  <h4 className="text-2xl font-black text-slate-900 mb-2">Transaction Successful!</h4>
                  <p className="text-slate-500 font-medium max-w-xs mx-auto">
                    ₹{formik.values.amount.toLocaleString()} has been withdrawn from your account.
                  </p>
                </div>
              ) : (
                <form onSubmit={formik.handleSubmit} className="space-y-6">
                  {/* Account Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Select Account</label>
                    <select
                      name="accountNumber"
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                      {...formik.getFieldProps('accountNumber')}
                    >
                      {accounts?.map((acc) => (
                        <option key={acc._id} value={acc.accountNumber}>
                          {acc.accountType} - {acc.accountNumber}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">
                      Available Balance: <span className="text-slate-900">₹{selectedBalance.toLocaleString()}</span>
                    </p>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Amount</label>
                    <div className="relative group">
                      <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                      <input
                        type="number"
                        name="amount"
                        placeholder="0.00"
                        className={`w-full pl-14 pr-5 py-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold text-slate-900 transition-all
                          ${formik.touched.amount && formik.errors.amount ? 'border-rose-300 bg-rose-50' : 'border-transparent focus:border-rose-500'}
                        `}
                        onChange={(e) => formik.setFieldValue('amount', parseFloat(e.target.value) || '')}
                        onBlur={formik.handleBlur}
                        value={formik.values.amount}
                      />
                    </div>
                    {formik.touched.amount && formik.errors.amount && (
                      <div className="flex items-center gap-1.5 text-rose-500 ml-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <p className="text-[10px] font-black uppercase tracking-wider">{formik.errors.amount}</p>
                      </div>
                    )}
                  </div>

                  {/* Description Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Description (Optional)</label>
                    <div className="relative group">
                      <MessageSquare className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                      <input
                        type="text"
                        name="description"
                        placeholder="Purpose of withdrawal"
                        className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none font-bold text-slate-900 transition-all"
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
                    className="w-full h-14 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-lg shadow-rose-100 active:scale-95 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Confirm Withdrawal</span>
                        <ArrowUpCircle className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Please ensure you have sufficient funds before proceeding.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WithdrawModal;

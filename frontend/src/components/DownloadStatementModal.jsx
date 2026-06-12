import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, Loader2, Calendar } from 'lucide-react';
import { useFormik } from 'formik';
import * as zod from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { toast } from 'react-toastify';
import api from '../api/axios';

const statementSchema = zod.object({
  accountId: zod.string().min(1, 'Please select an account'),
  startDate: zod.string().min(1, 'Start date is required'),
  endDate: zod.string().min(1, 'End date is required'),
}).refine((data) => {
  return new Date(data.startDate) <= new Date(data.endDate);
}, {
  message: "Start date must be before or equal to end date",
  path: ["startDate"], // highlight the startDate field
});

const DownloadStatementModal = ({ isOpen, onClose, accounts }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const formik = useFormik({
    initialValues: {
      accountId: accounts?.[0]?._id || '',
      startDate: '',
      endDate: '',
    },
    validationSchema: toFormikValidationSchema(statementSchema),
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsDownloading(true);
      try {
        const response = await api.get('/transactions/statement', {
          params: {
            accountId: values.accountId,
            startDate: values.startDate,
            endDate: values.endDate,
          },
          responseType: 'blob', // Important for handling binary file data
        });

        // Find the selected account to use its number in the filename
        const selectedAccount = accounts?.find(acc => acc._id === values.accountId);
        const accNumber = selectedAccount?.accountNumber || 'Account';

        // Create a blob URL and trigger download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `statement-${accNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Statement downloaded successfully!');
        onClose();
      } catch (error) {
        console.error('Download error:', error);
        toast.error('Failed to download statement. Please try again.');
      } finally {
        setIsDownloading(false);
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
                <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Statement</h3>
                  <p className="text-sm text-slate-500 font-medium">Download your account statement</p>
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
              <form onSubmit={formik.handleSubmit} className="space-y-6">
                {/* Account Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Select Account</label>
                  <select
                    name="accountId"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                    {...formik.getFieldProps('accountId')}
                  >
                    {accounts?.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.accountType} - {acc.accountNumber}
                      </option>
                    ))}
                  </select>
                  {formik.touched.accountId && formik.errors.accountId && (
                    <p className="text-[10px] text-rose-500 font-black uppercase tracking-wider ml-1">{formik.errors.accountId}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Start Date</label>
                    <div className="relative group">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                      <input
                        type="date"
                        name="startDate"
                        className={`w-full pl-14 pr-5 py-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold text-slate-700 transition-all cursor-text
                          ${formik.touched.startDate && formik.errors.startDate ? 'border-rose-300 bg-rose-50' : 'border-transparent focus:border-indigo-500'}
                        `}
                        {...formik.getFieldProps('startDate')}
                      />
                    </div>
                    {formik.touched.startDate && formik.errors.startDate && (
                      <p className="text-[10px] text-rose-500 font-black uppercase tracking-wider ml-1">{formik.errors.startDate}</p>
                    )}
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">End Date</label>
                    <div className="relative group">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                      <input
                        type="date"
                        name="endDate"
                        className={`w-full pl-14 pr-5 py-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold text-slate-700 transition-all cursor-text
                          ${formik.touched.endDate && formik.errors.endDate ? 'border-rose-300 bg-rose-50' : 'border-transparent focus:border-indigo-500'}
                        `}
                        {...formik.getFieldProps('endDate')}
                      />
                    </div>
                    {formik.touched.endDate && formik.errors.endDate && (
                      <p className="text-[10px] text-rose-500 font-black uppercase tracking-wider ml-1">{formik.errors.endDate}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isDownloading || !formik.isValid}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center gap-3 mt-4"
                >
                  {isDownloading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Download PDF</span>
                      <Download className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
            
            {/* Footer */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Generated securely from PortalRupee servers.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DownloadStatementModal;

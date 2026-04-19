import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ArrowRight, 
  ArrowLeft, 
  Send, 
  User as UserIcon, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ChevronRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { 
  searchUsers, 
  executeTransfer, 
  resetTransactionState, 
  clearSearchResults 
} from '../store/slices/transactionSlice';
import { fetchMyAccounts } from '../store/slices/accountSlice';
import TPINInput from '../components/TPINInput';
import { toast } from 'react-toastify';

const Transfer = () => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [tpin, setTpin] = useState('');
  const [tpinError, setTpinError] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [totpError, setTotpError] = useState('');

  const { searchResults, loading, error, success, lastTransaction } = useSelector((state) => state.transaction);
  const { accounts } = useSelector((state) => state.account);
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMyAccounts());
    return () => {
      dispatch(resetTransactionState());
      dispatch(clearSearchResults());
    };
  }, [dispatch]);

  // Set default account if available
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0]);
    }
  }, [accounts, selectedAccount]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2) {
        dispatch(searchUsers(searchQuery));
      } else {
        dispatch(clearSearchResults());
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, dispatch]);

  const handleNextStep = () => {
    if (step === 1 && !selectedReceiver) {
      toast.warn('Please select a recipient');
      return;
    }
    if (step === 2) {
      if (!amount || parseFloat(amount) <= 0) {
        toast.warn('Please enter a valid amount');
        return;
      }
      if (parseFloat(amount) > selectedAccount.balance) {
        toast.error('Insufficient balance in selected account');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBackStep = () => {
    setStep(step - 1);
  };

  const handleTransfer = async () => {
    if (tpin.length !== 6) {
      setTpinError('Please enter your 6-digit TPIN');
      return;
    }

    const transferData = {
      receiverId: selectedReceiver._id,
      amount: parseFloat(amount),
      description: description || `Transfer to ${selectedReceiver.firstName}`,
      tpin,
      totpToken: currentUser?.twoFactorEnabled ? totpToken : undefined
    };

    const resultAction = await dispatch(executeTransfer(transferData));
    if (executeTransfer.fulfilled.match(resultAction)) {
      setStep(4);
      toast.success('Transfer successful!');
    } else {
      setTpin(''); // Clear TPIN on error
      if (currentUser?.twoFactorEnabled) setTotpToken('');
      setTpinError(resultAction.payload || 'Transfer failed. Check TPIN/TOTP and try again.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  // Mock "Recent Contacts" from my own recent transaction history logic placeholder
  const recentContacts = []; // In a real app, populate from recent transactions

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Step Indicator */}
      {step < 4 && (
        <div className="mb-12 flex items-center justify-center">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div 
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all shadow-md
                  ${step >= s ? 'bg-indigo-600 text-white scale-110 shadow-indigo-200' : 'bg-white text-slate-400 border border-slate-100'}
                `}
              >
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 mx-2 rounded-full transition-all ${step > s ? 'bg-indigo-600' : 'bg-slate-100'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="premium-card bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-slate-100"
          >
            <h2 className="text-3xl font-black text-slate-800 mb-2">Send Money</h2>
            <p className="text-slate-500 font-medium mb-8">Search for a recipient by their name, email, mobile, or account number.</p>

            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Name, email, mobile, or account number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium"
              />
            </div>

            {/* Search Results */}
            <div className="space-y-4 mb-10 overflow-hidden">
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.filter(u => u._id !== currentUser?._id).map((resUser) => (
                  <button
                    key={resUser._id}
                    onClick={() => setSelectedReceiver(resUser)}
                    className={`w-full flex items-center justify-between p-4 rounded-3xl transition-all border-2
                      ${selectedReceiver?._id === resUser._id 
                        ? 'border-indigo-600 bg-indigo-50/50' 
                        : 'border-transparent hover:bg-slate-50'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-slate-900 font-bold">{resUser.firstName} {resUser.lastName}</p>
                        <p className="text-slate-400 text-xs font-semibold">{resUser.mobile}</p>
                      </div>
                    </div>
                    {selectedReceiver?._id === resUser._id && (
                      <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                ))
              ) : searchQuery.length > 2 ? (
                <div className="text-center py-8 text-slate-400">
                  <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="font-bold">No users found matching "{searchQuery}"</p>
                </div>
              ) : (
                /* Recent Section Mock */
                <div>
                  <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Quick Select</h4>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    <div className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group">
                      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                        <Search className="w-6 h-6 text-slate-400" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">More</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              disabled={!selectedReceiver}
              onClick={handleNextStep}
              className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl
                ${selectedReceiver 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
              `}
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="premium-card bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-slate-100"
          >
            <button 
              onClick={handleBackStep}
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Recipient
            </button>

            <h2 className="text-3xl font-black text-slate-800 mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
              Sending to {selectedReceiver.firstName}
            </h2>
            <p className="text-slate-500 font-medium mb-8">Enter the amount and confirm the source account.</p>

            {/* Amount Input */}
            <div className="bg-slate-50 p-8 rounded-[2.5rem] mb-8 text-center border-2 border-slate-50 focus-within:border-indigo-500 transition-all">
              <span className="text-slate-400 text-sm font-black uppercase tracking-widest block mb-4">Enter Amount</span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-light text-slate-300">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent text-5xl font-black tracking-tighter text-slate-900 w-full text-center outline-none max-w-[200px]"
                />
              </div>
            </div>

            {/* Account Selection */}
            <div className="mb-8">
              <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">From Account</h4>
              <div className="space-y-3">
                {accounts.map((acc) => (
                  <button
                    key={acc._id}
                    onClick={() => setSelectedAccount(acc)}
                    className={`w-full flex items-center justify-between p-4 rounded-3xl transition-all border-2
                      ${selectedAccount?._id === acc._id 
                        ? 'border-indigo-600 bg-indigo-50/30' 
                        : 'border-slate-100 hover:bg-slate-50'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-slate-800">{acc.accountType} (**** {acc.accountNumber.slice(-4)})</p>
                        <p className="text-xs font-bold text-slate-400 tracking-tight">Balance: ₹{acc.balance.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    {selectedAccount?._id === acc._id && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Message (Optional)</h4>
              <input
                type="text"
                placeholder="What's this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-slate-200 outline-none font-medium transition-all"
              />
            </div>

            <button
              onClick={handleNextStep}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-200"
            >
              Review Transaction <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="premium-card bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 text-center"
          >
            <button 
              onClick={handleBackStep}
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-sm mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Amount
            </button>

            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10" />
            </div>

            <h2 className="text-3xl font-black text-slate-800 mb-2">Security Check</h2>
            <p className="text-slate-500 font-medium mb-10 max-w-xs mx-auto">
              You are sending <span className="text-indigo-600 font-bold">₹{amount}</span> to <span className="text-indigo-600 font-bold">{selectedReceiver.firstName}</span>. Please enter your 6-digit Transaction PIN.
            </p>

            <div className="mb-8">
              <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Transaction PIN</h4>
              <TPINInput 
                length={6} 
                onChange={setTpin} 
                value={tpin}
                error={tpinError}
                onEnter={handleTransfer}
              />
            </div>

            {currentUser?.twoFactorEnabled && (
              <div className="mb-12">
                <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">2FA Code</h4>
                <TPINInput 
                  length={6} 
                  onChange={setTotpToken} 
                  value={totpToken}
                  error={totpError}
                  onEnter={handleTransfer}
                />
              </div>
            )}

            <button
              onClick={handleTransfer}
              disabled={loading || tpin.length !== 6 || (currentUser?.twoFactorEnabled && totpToken.length !== 6)}
              className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl
                ${loading || tpin.length !== 6 || (currentUser?.twoFactorEnabled && totpToken.length !== 6)
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'}
              `}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Authorize Transfer <Send className="w-5 h-5" /></>
              )}
            </button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="premium-card bg-white p-8 sm:p-12 rounded-[3.5rem] shadow-2xl border border-slate-50 text-center relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-400/10 blur-3xl -mt-32 rounded-full" />
            
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 15 }}
              className="w-24 h-24 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30 ring-8 ring-emerald-500/10"
            >
              <CheckCircle2 className="w-12 h-12" />
            </motion.div>

            <h2 className="text-4xl font-black text-slate-900 mb-2">Success!</h2>
            <p className="text-slate-500 font-bold mb-10 tracking-tight">Your money has been successfully delivered.</p>

            <div className="bg-slate-50 rounded-[2.5rem] p-8 mb-10 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-black uppercase tracking-widest">Transaction ID</span>
                <span className="text-slate-900 font-black font-mono">#{lastTransaction?.transactionId || 'PR-2026-X99'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-black uppercase tracking-widest">Sent To</span>
                <span className="text-slate-900 font-black">{selectedReceiver.firstName} {selectedReceiver.lastName}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-black uppercase tracking-widest">Total Amount</span>
                <span className="text-indigo-600 font-black text-xl tracking-tighter">₹{amount}.00</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  setStep(1);
                  setSearchQuery('');
                  setSelectedReceiver(null);
                  setAmount('');
                  setTpin('');
                  dispatch(resetTransactionState());
                }}
                className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black rounded-2xl transition-all active:scale-95"
              >
                Send More
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-indigo-200"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transfer;

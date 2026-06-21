import { useState } from 'react';
import { toast } from 'react-toastify';
import { X, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import './EMICalculator.css';

const EMICalculator = () => {
    const [loanAmount, setLoanAmount] = useState(89000);
    const [tenure, setTenure] = useState(3);
    const [interestRate, setInterestRate] = useState(12.69);
    // Calculate EMI (Derived State)
    const monthlyRate = interestRate / 12 / 100;
    const numMonths = tenure * 12;
    const monthlyEMI = (loanAmount > 0 && tenure > 0 && interestRate > 0)
        ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numMonths)) / (Math.pow(1 + monthlyRate, numMonths) - 1)
        : 0;
    const totalPayable = monthlyEMI * numMonths;
    const interestAmount = totalPayable - loanAmount;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 0,
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const handleLoanAmountChange = (e) => {
        const val = e.target.value === '' ? 0 : parseInt(e.target.value);
        setLoanAmount(val);
    };

    const handleTenureChange = (e) => {
        const val = e.target.value === '' ? 0 : parseInt(e.target.value);
        setTenure(val);
    };

    const handleInterestRateChange = (e) => {
        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
        setInterestRate(val);
    };

    const handleClear = () => {
        setLoanAmount(890000);
        setTenure(2);
        setInterestRate(12.69);
    };

    const [showMailModal, setShowMailModal] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSendMail = async (e) => {
        e.preventDefault();
        if (!emailInput) {
            toast.warn('Please enter an email address');
            return;
        }
        
        setIsSending(true);
        try {
            await api.post('/calculator/emi-mail', {
                email: emailInput,
                emiDetails: {
                    loanAmount,
                    tenure,
                    interestRate,
                    monthlyEMI,
                    totalPayable,
                    interestAmount
                }
            });
            toast.success('EMI details sent successfully!', { className: 'premium-toast' });
            setShowMailModal(false);
            setEmailInput('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send email. Please try again.', { className: 'premium-toast' });
        } finally {
            setIsSending(false);
        }
    };

    const loanAmountMin = 10000;
    const loanAmountMax = 10000000;
    const tenureMin = 1;
    const tenureMax = 30;
    const interestMin = 0.25;
    const interestMax = 50;

    const loanAmountPercent = Math.min(100, Math.max(0, ((loanAmount - loanAmountMin) / (loanAmountMax - loanAmountMin)) * 100));
    const tenurePercent = Math.min(100, Math.max(0, ((tenure - tenureMin) / (tenureMax - tenureMin)) * 100));
    const interestPercent = Math.min(100, Math.max(0, ((interestRate - interestMin) / (interestMax - interestMin)) * 100));

    return (
        <div className="emi-calculator-container">
            <div className="emi-calculator-header">
                <h1 className="emi-calculator-title">Simplify financial planning with the right tools</h1>
                <p className="emi-calculator-subtitle">Flexible EMIs to address your needs</p>
            </div>

            <div className="emi-calculator-wrapper">
                <div className="emi-calculator-left">
                    <div className="slider-group">
                        <div className="slider-header">
                            <label className="slider-label">Loan Amount (₹)</label>
                            <input
                                type="number"
                                className="slider-input"
                                value={loanAmount || ''}
                                onChange={handleLoanAmountChange}
                                min={loanAmountMin}
                                max={loanAmountMax}
                            />
                        </div>
                        <div className="slider-container">
                            <div className="slider-labels">
                                <span>{formatCurrency(loanAmountMin)}</span>
                                <span>{formatCurrency(loanAmountMax)}</span>
                            </div>
                            <div className="slider-wrapper" style={{
                                '--slider-progress': `${loanAmountPercent}%`
                            }}>
                                <input
                                    type="range"
                                    min={loanAmountMin}
                                    max={loanAmountMax}
                                    step={10000}
                                    value={loanAmount}
                                    onChange={handleLoanAmountChange}
                                    className="slider"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="slider-group">
                        <div className="slider-header">
                            <label className="slider-label">Loan Tenure (Years)</label>
                            <input
                                type="number"
                                className="slider-input"
                                value={tenure || ''}
                                onChange={handleTenureChange}
                                min={tenureMin}
                                max={tenureMax}
                            />
                        </div>
                        <div className="slider-container">
                            <div className="slider-labels">
                                <span>{tenureMin} Year</span>
                                <span>{tenureMax} Years</span>
                            </div>
                            <div className="slider-wrapper" style={{
                                '--slider-progress': `${tenurePercent}%`
                            }}>
                                <input
                                    type="range"
                                    min={tenureMin}
                                    max={tenureMax}
                                    step={1}
                                    value={tenure}
                                    onChange={handleTenureChange}
                                    className="slider"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="slider-group">
                        <div className="slider-header">
                            <label className="slider-label">Interest Rate (% PA)</label>
                            <input
                                type="number"
                                className="slider-input"
                                value={interestRate || ''}
                                onChange={handleInterestRateChange}
                                step="0.01"
                                min={interestMin}
                                max={interestMax}
                            />
                        </div>
                        <div className="slider-container">
                            <div className="slider-labels">
                                <span>{interestMin}% PA</span>
                                <span>{interestMax}% PA</span>
                            </div>
                            <div className="slider-wrapper" style={{
                                '--slider-progress': `${interestPercent}%`
                            }}>
                                <input
                                    type="range"
                                    min={interestMin}
                                    max={interestMax}
                                    step={0.01}
                                    value={interestRate}
                                    onChange={handleInterestRateChange}
                                    className="slider"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="emi-calculator-right">
                    <div className="emi-result">
                        <p className="emi-result-label">Your Monthly EMI will be</p>
                        <p className="emi-result-amount">{formatCurrency(monthlyEMI)}</p>
                    </div>

                    <div className="emi-breakdown">
                        <div className="breakdown-item">
                            <span className="breakdown-label">Amount Payable</span>
                            <span className="breakdown-value">{formatCurrency(totalPayable)}</span>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Interest Amount</span>
                            <span className="breakdown-value">{formatCurrency(interestAmount)}</span>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Principle Amount</span>
                            <span className="breakdown-value">{formatCurrency(loanAmount)}</span>
                        </div>
                    </div>

                    <div className="emi-actions">
                        <button className="btn-primary" onClick={() => setShowMailModal(true)}>
                            Get this as mail
                        </button>
                        <button className="btn-secondary" onClick={handleClear}>
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showMailModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative border border-slate-100"
                        >
                            <button 
                                onClick={() => setShowMailModal(false)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                            
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                                <Mail size={24} />
                            </div>
                            
                            <h3 className="text-2xl font-extrabold text-slate-800 mb-2 font-outfit">Get Calculation Details</h3>
                            <p className="text-slate-500 mb-6 text-sm">
                                Enter your email address below to receive a detailed breakdown of this EMI calculation.
                            </p>
                            
                            <form onSubmit={handleSendMail} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isSending}
                                    className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                                >
                                    {isSending ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send to Email
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EMICalculator;


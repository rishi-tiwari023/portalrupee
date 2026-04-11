import { useState } from 'react';
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
                        {/* TODO: Implement get as mail functionality using nodemailer */}
                        <button className="btn-primary" disabled>
                            Get this as mail
                        </button>
                        <button className="btn-secondary" onClick={handleClear}>
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EMICalculator;


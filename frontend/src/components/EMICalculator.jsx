import { useState, useEffect } from 'react';
import './EMICalculator.css';

const EMICalculator = () => {
    const [loanAmount, setLoanAmount] = useState(89000);
    const [tenure, setTenure] = useState(3);
    const [interestRate, setInterestRate] = useState(12.69);
    const [monthlyEMI, setMonthlyEMI] = useState(0);
    const [totalPayable, setTotalPayable] = useState(0);
    const [interestAmount, setInterestAmount] = useState(0);

    // Calculate EMI
    useEffect(() => {
        if (loanAmount > 0 && tenure > 0 && interestRate > 0) {
            const monthlyRate = interestRate / 12 / 100;
            const numMonths = tenure * 12;
            const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numMonths)) /
                (Math.pow(1 + monthlyRate, numMonths) - 1);
            const total = emi * numMonths;
            const interest = total - loanAmount;

            setMonthlyEMI(emi);
            setTotalPayable(total);
            setInterestAmount(interest);
        }
    }, [loanAmount, tenure, interestRate]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 0,
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const handleLoanAmountChange = (e) => {
        setLoanAmount(parseInt(e.target.value));
    };

    const handleTenureChange = (e) => {
        setTenure(parseInt(e.target.value));
    };

    const handleInterestRateChange = (e) => {
        setInterestRate(parseFloat(e.target.value));
    };

    const handleClear = () => {
        setLoanAmount(890000);
        setTenure(2);
        setInterestRate(12.69);
    };

    // TODO: Implement get as mail functionality using nodemailer
    // handleGetAsMail function will be implemented later with backend API integration

    const loanAmountMin = 25000;
    const loanAmountMax = 5000000;
    const tenureMin = 1;
    const tenureMax = 10;
    const interestMin = 6.5;
    const interestMax = 25;

    const loanAmountPercent = ((loanAmount - loanAmountMin) / (loanAmountMax - loanAmountMin)) * 100;
    const tenurePercent = ((tenure - tenureMin) / (tenureMax - tenureMin)) * 100;
    const interestPercent = ((interestRate - interestMin) / (interestMax - interestMin)) * 100;

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
                            <label className="slider-label">Loan Amount</label>
                            <input
                                type="text"
                                className="slider-input"
                                value={formatCurrency(loanAmount)}
                                readOnly
                            />
                        </div>
                        <div className="slider-container">
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
                            <label className="slider-label">Loan Tenure</label>
                            <div className="slider-value-box">{tenure} years</div>
                        </div>
                        <div className="slider-container">
                            <div className="slider-labels">
                                <span>1 year</span>
                                <span>10 years</span>
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
                            <label className="slider-label">Interest Rate</label>
                            <div className="slider-value-box">{interestRate.toFixed(2)}%</div>
                        </div>
                        <div className="slider-container">
                            <div className="slider-labels">
                                <span>6.50% PA</span>
                                <span>25% PA</span>
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


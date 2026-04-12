import React from 'react';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 text-center"
          >
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-inner">
              <AlertTriangle size={40} />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-800 mb-3">Something went wrong</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
              We've encountered an unexpected error. Don't worry, your data is safe. Try refreshing the page or returning home.
            </p>

            {import.meta.env.DEV && (
              <div className="mb-8 p-4 bg-slate-50 rounded-2xl text-left overflow-auto max-h-40 border border-slate-100">
                <code className="text-xs text-rose-600 font-mono">
                  {this.state.error?.toString()}
                </code>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
              >
                <RefreshCcw size={18} />
                <span>Reload</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all"
              >
                <Home size={18} />
                <span>Go Home</span>
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, CheckCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { user } = useSelector((state) => state.auth);

  // Appearance Settings State (from Context)
  const { theme, setTheme } = useTheme();
  const [localTheme, setLocalTheme] = useState(theme);

  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  const handleSave = () => {
    setTheme(localTheme);
    toast.success('Settings saved successfully!', { icon: <CheckCircle className="text-emerald-500" /> });
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto pb-10">
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <SettingsIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
          Manage your account preferences and application experience.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm rounded-[2rem] p-8 flex flex-col justify-between transition-colors duration-300">
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
            <div>
              <h3 className="font-bold text-slate-700 dark:text-slate-200">Theme</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Choose how the application looks.</p>
            </div>
            <select 
              value={localTheme}
              onChange={(e) => setLocalTheme(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 min-w-[150px] cursor-pointer"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800/50 flex justify-end">
          <button 
            onClick={handleSave}
            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-colors active:scale-95 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

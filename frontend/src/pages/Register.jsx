import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as zod from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Lock, UserPlus, AlertCircle, Eye, EyeOff, ShieldCheck, CreditCard } from 'lucide-react';
import { registerUser } from '../store/slices/authSlice';

const registerSchema = zod.object({
    name: zod.string().min(2, 'Name must be at least 2 characters'),
    email: zod.string().email('Invalid email address'),
    mobile: zod.string().regex(/^[0-9]{10}$/, 'Mobile must be 10 digits'),
    password: zod.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: zod.string().min(6, 'Confirm password must be at least 6 characters'),
    role: zod.enum(['CUSTOMER', 'CASHIER', 'MANAGER']),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            mobile: '',
            password: '',
            confirmPassword: '',
            role: 'CUSTOMER',
        },
        validationSchema: toFormikValidationSchema(registerSchema),
        onSubmit: async (values) => {
            const { name, confirmPassword, ...otherData } = values;
            
            // Split name into firstName and lastName
            const nameParts = name.trim().split(/\s+/);
            const firstName = nameParts[0] || '';
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : (firstName ? '' : '');
            
            const registerData = {
                firstName,
                lastName: lastName || ' ', // Backend might require non-empty last name
                ...otherData
            };

            const resultAction = await dispatch(registerUser(registerData));
            if (registerUser.fulfilled.match(resultAction)) {
                navigate('/dashboard');
            }
        },
    });

    const roles = [
        { id: 'CUSTOMER', label: 'Customer', icon: User },
        { id: 'CASHIER', label: 'Cashier', icon: CreditCard },
        { id: 'MANAGER', label: 'Manager', icon: ShieldCheck },
    ];

    return (
        <div className="min-h-screen py-20 flex items-center justify-center p-6 relative overflow-hidden bg-slate-50">
            {/* Decorative Orbs */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="w-full max-w-2xl"
            >
                <div className="premium-card p-8 md:p-12 bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[3rem] relative overflow-hidden">
                    <div className="mb-10">
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Create Account</h2>
                        <p className="text-slate-500 font-medium text-lg">Join PortalRupee for professional banking services</p>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-8">
                        <AnimatePresence mode='wait'>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold border border-red-100"
                                >
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Role Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Select Your Role</label>
                            <div className="grid grid-cols-3 gap-4">
                                {roles.map((role) => {
                                    const Icon = role.icon;
                                    const active = formik.values.role === role.id;
                                    return (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => formik.setFieldValue('role', role.id)}
                                            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${active
                                                ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 shadow-sm'
                                                : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-slate-100'
                                                }`}
                                        >
                                            <Icon className={`w-6 h-6 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                                            <span className="text-xs font-bold">{role.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Rishi Tiwari"
                                        className={`w-full pl-12 pr-4 py-4 bg-slate-100/50 border-2 rounded-2xl focus:outline-none transition-all ${formik.touched.name && formik.errors.name ? 'border-red-300' : 'border-transparent focus:border-indigo-500'
                                            }`}
                                        {...formik.getFieldProps('name')}
                                    />
                                </div>
                            </div>

                            {/* Mobile */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Mobile Number</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        name="mobile"
                                        placeholder="9876543210"
                                        className={`w-full pl-12 pr-4 py-4 bg-slate-100/50 border-2 rounded-2xl focus:outline-none transition-all ${formik.touched.mobile && formik.errors.mobile ? 'border-red-300' : 'border-transparent focus:border-indigo-500'
                                            }`}
                                        {...formik.getFieldProps('mobile')}
                                    />
                                </div>
                            </div>

                            {/* Email Address */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="name@domain.com"
                                        className={`w-full pl-12 pr-4 py-4 bg-slate-100/50 border-2 rounded-2xl focus:outline-none transition-all ${formik.touched.email && formik.errors.email ? 'border-red-300' : 'border-transparent focus:border-indigo-500'
                                            }`}
                                        {...formik.getFieldProps('email')}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="••••••••"
                                        className={`w-full pl-12 pr-12 py-4 bg-slate-100/50 border-2 rounded-2xl focus:outline-none transition-all ${formik.touched.password && formik.errors.password ? 'border-red-300' : 'border-transparent focus:border-indigo-500'
                                            }`}
                                        {...formik.getFieldProps('password')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        className={`w-full pl-12 pr-4 py-4 bg-slate-100/50 border-2 rounded-2xl focus:outline-none transition-all ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-300' : 'border-transparent focus:border-indigo-500'
                                            }`}
                                        {...formik.getFieldProps('confirmPassword')}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Create My Account</span>
                                        <UserPlus className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            <p className="text-center text-sm text-slate-500 font-medium">
                                Already have an account?{' '}
                                <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                                    Sign In Instead
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;

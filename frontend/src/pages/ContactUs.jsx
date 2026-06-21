import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            return toast.error('Please fill out all fields.', { className: 'premium-toast' });
        }

        try {
            setIsLoading(true);
            // This expects a POST /api/v1/contact route on the backend
            await api.post('/contact', formData);
            toast.success('Message sent successfully! We will get back to you soon.', { className: 'premium-toast' });
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message. Please try again later.', { className: 'premium-toast' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-28 pb-12 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Contact Us</h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    We are here to help. Reach out to PortalRupee for any banking, account, or general inquiries.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-start">
                {/* Contact Info */}
                <div className="space-y-8">
                    <div className="premium-card p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6">Get In Touch</h3>
                        
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Customer Care</h4>
                                    <p className="text-lg font-bold text-slate-800">Will be added later</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Email Support</h4>
                                    <p className="text-lg font-bold text-slate-800">rishitiwari023.dev@gmail.com</p>
                                    <p className="text-sm text-slate-500">We aim to reply within 24 hours</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Head Office</h4>
                                    <p className="text-lg font-bold text-slate-800">PortalRupee Tower</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="premium-card p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6">Send a Message</h3>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required disabled={isLoading} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl outline-none transition-all disabled:opacity-70" placeholder="Rishi Tiwari" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isLoading} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl outline-none transition-all disabled:opacity-70" placeholder="name@domain.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Subject</label>
                            <input type="text" name="subject" value={formData.subject} onChange={handleChange} required disabled={isLoading} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl outline-none transition-all disabled:opacity-70" placeholder="How can we help?" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Message</label>
                            <textarea rows="4" name="message" value={formData.message} onChange={handleChange} required disabled={isLoading} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl outline-none transition-all resize-none disabled:opacity-70" placeholder="Your message..."></textarea>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                            {isLoading ? (
                                <>
                                    <span>Sending...</span>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                </>
                            ) : (
                                <>
                                    <span>Send Message</span>
                                    <Send className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;

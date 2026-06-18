import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer border-t border-slate-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <p className="text-center text-sm text-slate-500 font-medium">
                    &copy; {new Date().getFullYear()} Portal Rupee. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;


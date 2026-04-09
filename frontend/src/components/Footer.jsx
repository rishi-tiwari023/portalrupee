import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';
import logo from '../assets/logo.png';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer__inner">
                <div className="footer__main">
                    <div className="footer__branding">
                        <img src={logo} alt="PortalRupee Logo" className="footer__logo" />
                        <span className="footer__brand-name">PortalRupee</span>
                    </div>
                    <div className="footer__social">
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer__social-link footer__social-link--linkedin"
                            aria-label="LinkedIn"
                        >
                            <FaLinkedin />
                        </a>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer__social-link footer__social-link--github"
                            aria-label="GitHub"
                        >
                            <FaGithub />
                        </a>
                        <a
                            href="https://x.com/home"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer__social-link footer__social-link--x"
                            aria-label="X (Twitter)"
                        >
                            <FaXTwitter />
                        </a>
                        <a
                            href="mailto:contact@portalrupee.com"
                            className="footer__social-link footer__social-link--email"
                            aria-label="Email"
                        >
                            <MdEmail />
                        </a>
                    </div>
                </div>
                <p className="footer__copyright">
                    &copy; {new Date().getFullYear()} Portal Rupee. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;


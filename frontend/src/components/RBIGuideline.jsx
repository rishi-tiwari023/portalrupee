import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import './RBIGuideline.css';

const RBIGuideline = () => {
    const textRef = useRef(null);

    useEffect(() => {
        if (textRef.current) {
            // Manual splitting for better control and reliability
            const charElements = textRef.current.querySelectorAll('.char');

            animate(charElements, {
                opacity: [0, 1],
                y: [
                    { to: -40, ease: 'outExpo', duration: 400 },
                    { to: 0, ease: 'outBounce', duration: 1000 }
                ],
                rotate: {
                    from: -45,
                    to: 0,
                    ease: 'outBack',
                    duration: 600
                },
                delay: stagger(30),
            });
        }
    }, []);

    const splitTextToSpans = (text) => {
        return text.split('').map((char, index) => (
            <span key={index} className="char" style={{ display: 'inline-block', whiteSpace: 'pre' }}>
                {char}
            </span>
        ));
    };

    return (
        <div className="rbi-guideline">
            <div className="rbi-guideline__content">
                <h2 className="rbi-guideline__headline" ref={textRef}>
                    <div className="rbi-guideline__headline-line rbi-guideline__headline--primary">
                        {splitTextToSpans('" RBI Kehta Hai Jaankar Baniye')}
                    </div>
                    <div className="rbi-guideline__headline-line rbi-guideline__headline--secondary">
                        {splitTextToSpans('Satark Rahiye! "')}
                    </div>
                </h2>
                <div className="rbi-guideline__body">
                    <p>
                        Customer protection through customer education is, therefore, one of the important functions of the Reserve Bank of India. 'RBI Kehta Hai' is an initiative of the Reserve Bank of India to educate the public about its regulations which are aimed at enhancing the quality of customer service in banks.
                    </p>
                    <p>Be a well-informed bank customer to make a better choice.</p>
                    <div className="rbi-guideline__cta">
                        <a
                            href="https://rbikehtahai.rbi.org.in/"
                            className="rbi-guideline__button"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Learn more
                            <span aria-hidden="true">↗</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RBIGuideline;


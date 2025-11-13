import { useEffect, useRef } from 'react';
import { animate, stagger, splitText } from 'animejs';
import './RBIGuideline.css';

const RBIGuideline = () => {
    const containerRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        if (textRef.current) {
            const { chars } = splitText(textRef.current, { words: false, chars: true });

            animate(chars, {
                // Property keyframes
                y: [
                    { to: '-2.75rem', ease: 'outExpo', duration: 600 },
                    { to: 0, ease: 'outBounce', duration: 800, delay: 100 }
                ],
                // Property specific parameters
                rotate: {
                    from: '-1turn',
                    delay: 0
                },
                delay: stagger(50),
                ease: 'inOutCirc'
            });
        }
    }, []);

    return (
        <div className="rbi-guideline" ref={containerRef}>
            <div className="rbi-guideline__content">
                <h2 className="rbi-guideline__headline" ref={textRef}>
                    <span className="rbi-guideline__headline--primary">"RBI Kehta Hai...</span>
                    <span className="rbi-guideline__headline--secondary">Jaankar Baniyen, Satark Rahiye!"</span>
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


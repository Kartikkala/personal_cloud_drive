import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";
interface propstype {
    otp: string[],
    setOtp: React.Dispatch<React.SetStateAction<string[]>>,
    resetTimer: boolean,
    setservererror: React.Dispatch<React.SetStateAction<string | null>>
}


const OtpInput = (props: propstype) => {
    const navigate = useNavigate();
    const { otp, setOtp, resetTimer, setservererror } = props;
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [timeLeft, setTimeLeft] = useState(30);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Function to start or restart the timer
        const startTimer = () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            setTimeLeft(180);
            timerRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(timerRef.current as NodeJS.Timeout);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        };

        // Start timer on component mount and when resetTimer changes
        startTimer();

        // Cleanup interval on component unmount
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [resetTimer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { value } = e.target;
        if (/^[a-zA-Z0-9]*$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const otp_submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (timeLeft == 0) {
            setservererror("OTP Expired");
        }
        else {
            navigate('/signup_otp/credential');
        }
    }

    return (
        <>
            <div className="flex justify-around w-full items-center mb-3">
                <h2 className=" text-2xl font-semibold">Enter OTP :</h2>
                <h5 className='text-gray-600 text-sm'>Time till OTP expires :{timeLeft}</h5>
            </div>
            <form onSubmit={otp_submit} className='flex flex-col items-center'>
                <div className="flex space-x-2">
                    {otp.map((_, index) => (
                        <input
                            required
                            key={index}
                            type="text"
                            value={otp[index]}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            maxLength={1}
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            className="w-12 h-12 text-center text-2xl border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    ))}
                </div>
                <button type="submit" className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white lg:text-base text-sm font-bold py-3 px-7 rounded lg:mt-6 md:mt-9 sm:mt-5 mt-2 mb-4 flex items-center">
                    <h1 className="mr-3">Next</h1>  <FaArrowRight />
                </button>
            </form>
        </>
    );
};

export default OtpInput;

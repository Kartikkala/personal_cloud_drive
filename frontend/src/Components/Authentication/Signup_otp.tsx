
import { MdEmail } from "react-icons/md";
import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import OtpInput from "./Enterotp";
import Signup_creadential from "./Signup_creadential";

interface stateemail {
    email: string,
    email_validation: string | null
}

const Signup_otp = () => {
    const location = useLocation();
    const host = "http://localhost:5000/api/otp";
    const [otp_email, setotp_email] = useState<stateemail>({ email: "", email_validation: "" });
    const [otp_visibility, setotp_visibility] = useState<boolean>(false);
    const [servererror, setservererror] = useState<string | null>(null);
    const [otp, setOtp] = useState(Array(6).fill(''));
    const [resetTimer, setResetTimer] = useState(false);

    const emailRegex = /^\w+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
    const otp_email_handler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setotp_email({ ...otp_email, email: e.target.value, email_validation: e.target.value && !emailRegex.test(e.target.value) ? "Invalid email format" : "" });
    }
    const emailsubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        if (resetTimer == false) {
            setResetTimer(true);
        }
        else {
            setResetTimer(false);
        }
        setotp_visibility(true);
        e.preventDefault();
        const response = await fetch(`${host}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: otp_email.email })
        })
        const json = await response.json();
        if (json.success == false) {
            setservererror("Internal server error");
        }
    }

    useEffect(() => {
        if (servererror != null) {
            setTimeout(() => {
                setservererror(null);
            }, 3000);
        }
    }, [servererror])

    return (
        <div className="w-full h-[100vh] flex justify-center items-center absolute top-0 z-10">
            <div className="2xl:w-[62.5%] xl:w-9/12 lg:w-10/12 w-[94%] 2xl:min-h-[38rem] lg:min-h-[35rem] md:min-h-[30rem] sm:min-h-[27rem] min-h-[32rem] flex flex-row rounded-2xl ">

                <div className="w-1/2 sm:block hidden">
                </div>
                <div className="sm:w-1/2 w-full flex flex-col items-center ">

                    <Routes>
                        <Route path="/credential" element={<Signup_creadential otp={otp} email={otp_email.email} />}></Route>
                    </Routes>

                    {location.pathname == "/signup_otp" && <div className="w-full h-full">
                        <form onSubmit={emailsubmit} className="w-full flex flex-col items-center" >


                            <div className="flex flex-col 2xl:mt-56 lg:mt-48 md:mt-40 sm:mt-36 mt-48 xl:w-4/6 lg:w-9/12 md:w-[76%] sm:w-11/12 w-5/6">

                                <div className="text-red-500 h-5 font-Josefin md:text-sm sm:text-xs text-sm mx-auto">{servererror}</div>

                                <span className="relative 2xl:my-1.5 md:my-1 sm:my-0.5 mt-2 mb-1">
                                    <label htmlFor="signup_email" className="absolute lg:text-2xl hover:cursor-pointer"><MdEmail /></label>
                                    <input className="focus:outline-none border-b-2 border-gray-300 lg:px-11 px-7 w-full lg:text-base text-sm font-Josefin" placeholder="Your Email" type="email" name="signup_email" id="signup_email" required value={otp_email.email} onChange={otp_email_handler} />
                                </span>

                                <div className="text-red-500 h-5 font-Josefin md:text-sm sm:text-xs text-sm xl:ml-6 sm:ml-3 ml-6 lg:mb-2 sm:mb-0 mb-1" >{otp_email.email_validation}</div>

                            </div>

                            <button type="submit" className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white lg:text-base text-sm font-bold py-2 px-7 rounded lg:mt-2 md:mt-5 sm:mt-1 mt-2 mb-4">
                                {otp_visibility ? "Resend OTP" : "Get OTP"}
                            </button>
                        </form>

                        {otp_visibility && <div className="flex flex-col items-center">
                            <OtpInput otp={otp} setOtp={setOtp} resetTimer={resetTimer} setservererror={setservererror} />
                        </div>}
                    </div>}
                </div>
            </div>

        </div>
    )
}

export default Signup_otp

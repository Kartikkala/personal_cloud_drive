
import { FaUserTie } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { MdVisibility } from "react-icons/md";
import React, { useEffect, useState } from "react";
import { MdVisibilityOff } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Signup = () => {

    const host = "http://localhost:5000/api/register";
    const navigate = useNavigate();
    const [signup_servererror, setsignup_servererror] = useState<null | string>(null);

    const [signup_visibility, setsignup_visibility] = useState<{ password_visibility: string, cpassword_visibility: string }>({ password_visibility: "password", cpassword_visibility: "password" });

    const [signup_cred, setsignup_cred] = useState<{ signup_name: string, signup_email: string, signup_password: string, signup_cpassword: string }>({ signup_name: "", signup_email: "", signup_password: "", signup_cpassword: "" });

    const [signup_validation, setsignup_validation] = useState<{ name_validation: string, email_validation: string, password_validation: string, cpassword_validation: string }>({ name_validation: "", email_validation: "", password_validation: "", cpassword_validation: "" });

    //password visibility handler:
    const password_visibility_handler = () => {
        setsignup_visibility({ ...signup_visibility, password_visibility: signup_visibility.password_visibility == "password" ? "" : "password" })
    }
    const cpassword_visibility_handler = () => {
        setsignup_visibility({ ...signup_visibility, cpassword_visibility: signup_visibility.cpassword_visibility == "password" ? "" : "password" })
    }

    // onchange event handlers:
    const name_handler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setsignup_cred({ ...signup_cred, signup_name: e.target.value });
        setsignup_validation({ ...signup_validation, name_validation: e.target.value && e.target.value.length < 3 ? "Name must be atleast 3 characters" : "" });
    }

    const emailRegex = /^\w+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
    const email_handler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setsignup_cred({ ...signup_cred, signup_email: e.target.value });
        if (signup_cred.signup_name.length == 0) {
            setsignup_validation({ ...signup_validation, email_validation: e.target.value && !emailRegex.test(e.target.value) ? "Invalid email format" : "", name_validation: e.target.value ? "Name is a required field" : "" });
        }
        else {
            setsignup_validation({ ...signup_validation, email_validation: e.target.value && !emailRegex.test(e.target.value) ? "Invalid email format" : "" });
        }
    }

    const passwardRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const password_handler = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(passwardRegex);
        setsignup_cred({ ...signup_cred, signup_password: e.target.value });
        if (signup_cred.signup_name.length == 0 && signup_cred.signup_email.length == 0) {
            setsignup_validation({ ...signup_validation, name_validation: e.target.value ? "Name is a required field" : "", email_validation: e.target.value ? "Email is a required field" : "", password_validation: e.target.value && !passwardRegex.test(e.target.value) ? "Min-requirement:7+ digit,1 char,1 num,and 1 symbol" : "" });
        }
        else if (signup_cred.signup_name.length == 0) {
            setsignup_validation({ ...signup_validation, name_validation: e.target.value ? "Name is a required field" : "", password_validation: e.target.value && !passwardRegex.test(e.target.value) ? "Min-requirement:7+ digit,1 char,1 num,and 1 symbol" : "" });
        }
        else if (signup_cred.signup_email.length == 0) {
            setsignup_validation({ ...signup_validation, email_validation: e.target.value ? "Email is a required field" : "", password_validation: e.target.value && !passwardRegex.test(e.target.value) ? "Min-requirement:7+ digit,1 char,1 num,and 1 symbol" : "" });
        }
        else {
            setsignup_validation({ ...signup_validation, password_validation: e.target.value && !passwardRegex.test(e.target.value) ? "Min-requirement:7+ digit,1 char,1 num,and 1 symbol" : "" });
        }
    }

    const cpassword_handler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setsignup_cred({ ...signup_cred, signup_cpassword: e.target.value });
        if (signup_cred.signup_password.length == 0) {
            setsignup_validation({ ...signup_validation, password_validation: e.target.value ? "Password is a required field" : "", cpassword_validation: e.target.value && signup_cred.signup_password !== e.target.value ? "Password does not match" : "" });
        }
        else {
            setsignup_validation({ ...signup_validation, cpassword_validation: e.target.value && signup_cred.signup_password !== e.target.value ? "Password does not match" : "" });
        }
    }

    // form submit event handler:
    const signup_submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const user_register = await fetch(`${host}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: signup_cred.signup_email, password: signup_cred.signup_password, name: signup_cred.signup_name })
        })
        const json = await user_register.json();
        if (json.success == true) {
            localStorage.setItem('token', json.token);
            navigate("/");
        }
        else {
            setsignup_servererror("Internal server error");
            setsignup_cred({ signup_name: "", signup_email: "", signup_password: "", signup_cpassword: "" });
        }
    }
    useEffect(() => {
        if (signup_servererror != null) {
            setTimeout(() => {
                setsignup_servererror(null);
            }, 2000);
        }
    }, [signup_servererror])

    return (

        <div className="w-full h-[100vh] flex justify-center items-center absolute top-0 z-10">
            <div className="2xl:w-[62.5%] xl:w-9/12 lg:w-10/12 w-[94%] 2xl:min-h-[38rem] lg:min-h-[35rem] md:min-h-[30rem] sm:min-h-[27rem] min-h-[32rem] flex flex-row rounded-2xl ">

                <div className="w-1/2 sm:block hidden">
                </div>

                <form onSubmit={signup_submit} className="sm:w-1/2 w-full flex flex-col items-center ">

                    

                    <div className="flex flex-col 2xl:mt-56 lg:mt-48 md:mt-40 sm:mt-36 mt-48 xl:w-4/6 lg:w-9/12 md:w-[76%] sm:w-11/12 w-5/6">
                        {/* br tag is block level element and span is a inline element so br cannnot be used inside the span element */}

                        <div className="text-red-500 h-5 font-Josefin md:text-sm sm:text-xs text-sm mx-auto">{signup_servererror}</div>

                        <span className="relative 2xl:mb-1.5 md:mt-2 md:mb-1 sm:mt-1 mb-0.5">
                            <label htmlFor="signup_name" className="absolute lg:text-xl hover:cursor-pointer" ><FaUserTie /></label>
                            <input className="focus:outline-none border-b-2 border-gray-300 lg:px-11 px-7 w-full lg:text-base text-sm font-Josefin" placeholder="Your name" id="signup_name" type="text" required minLength={3} maxLength={24} value={signup_cred.signup_name} onChange={name_handler} />
                        </span>

                        <div className="text-red-500 h-5 font-Josefin md:text-sm sm:text-xs text-sm xl:ml-6 sm:ml-3 ml-6 lg:mb-2 sm:mb-0 mb-1">{signup_validation.name_validation}</div>

                        <span className="relative 2xl:my-1.5 md:my-1 sm:my-0.5 mt-2 mb-1">
                            <label htmlFor="signup_email" className="absolute lg:text-2xl hover:cursor-pointer"><MdEmail /></label>
                            <input className="focus:outline-none border-b-2 border-gray-300 lg:px-11 px-7 w-full lg:text-base text-sm font-Josefin" placeholder="Your Email" type="email" name="signup_email" id="signup_email" required value={signup_cred.signup_email} onChange={email_handler} />
                        </span>

                        <div className="text-red-500 h-5 font-Josefin md:text-sm sm:text-xs text-sm xl:ml-6 sm:ml-3 ml-6 lg:mb-2 sm:mb-0 mb-1" >{signup_validation.email_validation}</div>

                        <span className="relative 2xl:my-1.5 md:my-1 sm:my-0.5 my-1">
                            <label htmlFor="signup_password" className="absolute lg:text-lg text-sm hover:cursor-pointer"><FaLock /></label>
                            <MdVisibility className={`absolute right-1 lg:text-xl hover:cursor-pointer ${signup_visibility.password_visibility == "password" ? "" : "hidden"}`} name="signup_passcode" onClick={password_visibility_handler} />
                            <MdVisibilityOff className={`absolute right-1 lg:text-xl hover:cursor-pointer ${signup_visibility.password_visibility == "password" ? "hidden" : ""}`} name="signup_passcode" onClick={password_visibility_handler} />
                            <input className="focus:outline-none border-b-2 border-gray-300 lg:px-11 px-7 w-full lg:text-base text-sm font-Josefin" placeholder="Password" type={signup_visibility.password_visibility} name="signup_password" id="signup_password" required minLength={8} maxLength={24} value={signup_cred.signup_password} onChange={password_handler} />
                        </span>

                        <div className={`text-red-500 h-5 font-Josefin lg:text-sm text-xs lg:mb-2 sm:mb-0 mb-1 ${signup_cred.signup_password.length == 0 ? "xl:ml-6 sm:ml-3 ml-6" : "xl:ml-0 sm:ml-0 ml-0"}`}>{signup_validation.password_validation}</div>

                        <span className="relative 2xl:my-1.5 md:my-1 sm:my-0.5 my-1">
                            <label htmlFor="signup_cpassword" className="absolute lg:text-lg text-sm hover:cursor-pointer"><FaLock /></label>
                            <MdVisibility className={`absolute right-1 lg:text-xl hover:cursor-pointer ${signup_visibility.cpassword_visibility == "password" ? "" : "hidden"}`} name="cpassword_visibility" onClick={cpassword_visibility_handler} />
                            <MdVisibilityOff className={`absolute right-1 lg:text-xl hover:cursor-pointer ${signup_visibility.cpassword_visibility == "password" ? "hidden" : ""}`} name="cpassword_visibility" onClick={cpassword_visibility_handler} />
                            <input className="focus:outline-none border-b-2 border-gray-300 lg:px-11 px-7 w-full lg:text-base text-sm font-Josefin" placeholder="Confirm Password" type={signup_visibility.cpassword_visibility} name="signup_cpassword" id="signup_cpassword" required minLength={8} maxLength={24} value={signup_cred.signup_cpassword} onChange={cpassword_handler} />
                        </span>

                        <div className="text-red-500 h-5 font-Josefin md:text-sm sm:text-xs text-sm xl:ml-6 sm:ml-3 ml-6 lg:mb-2 sm:mb-0 mb-1">{signup_validation.cpassword_validation}</div>

                    </div>
                    <button type="submit" className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white lg:text-base text-sm font-bold py-3 px-4 rounded lg:mt-2 md:mt-5 sm:mt-1 mt-2">
                        Create Account
                    </button>
                </form>

            </div>

        </div>
    )
}

export default Signup;

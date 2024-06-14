import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { MdVisibility } from "react-icons/md";
import { useEffect, useState } from "react";
import { MdVisibilityOff } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Signin = () => {

    const host = "http://localhost:5000/api/login";
    const navigate = useNavigate();
    const [signin_servererror, setsignin_servererror] = useState<null | string>(null);

    const [signincred, setsignincred] = useState<{ signin_email: string, signin_password: string, email_error: string, password_error: string }>({ signin_email: "", signin_password: "", email_error: "", password_error: "" });
    const [signin_visibility, setsignin_visibility] = useState<string>("password");

    //passward visibility handler:
    const visibilityhandler = () => {
        setsignin_visibility(signin_visibility === "password" ? "" : "password");
    }

    // onchange handler for email:
    const emailRegex = /^\w+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setsignincred({
            ...signincred,
            signin_email: event.target.value,
            email_error:
                event.target.value && !emailRegex.test(event.target.value)
                    ? 'Invalid email format .'
                    : '',
        });
    };
    // onchange handler for password:
    const passwardRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // checking if the email input field is empty or not:
        if (signincred.signin_email.length == 0) {
            setsignincred({
                ...signincred, signin_password: event.target.value, password_error: event.target.value && !passwardRegex.test(event.target.value) ? `Min-requirement:7+ digit,1 char,1 num,and 1 symbol` : '', email_error: event.target.value && "Email is a Required field ."
            });
        }
        else {
            setsignincred({
                ...signincred,
                signin_password: event.target.value,
                password_error:
                    event.target.value && !passwardRegex.test(event.target.value)
                        ? "Min-requirement:7+ digit,1 char,1 num,and 1 symbol "
                        : '',
            });
        }
    };
    // form submit event handler:
    const formsubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const user_signin = await fetch(`${host}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: signincred.signin_email, password: signincred.signin_password })
        })
        const json = await user_signin.json();
        if (json.success == true) {
            localStorage.setItem('token', json.token);
            navigate('/');
        }
        else {
            setsignin_servererror("Internal server error");
            setsignincred({ signin_email: "", signin_password: "", email_error: "", password_error: "" });
        }
    }
    useEffect(() => {
        if (signin_servererror != null) {
            setTimeout(() => {
                setsignin_servererror(null);
            }, 2000);
        }
    }, [signin_servererror])

    return (

        <div className="w-full h-[100vh] flex justify-center items-center absolute top-0 z-10">
            <div className="2xl:w-[62.5%] xl:w-9/12 lg:w-10/12 w-[94%] 2xl:min-h-[38rem] lg:min-h-[35rem] md:min-h-[30rem] sm:min-h-[27rem] min-h-[32rem] flex flex-row rounded-2xl ">
                <div className="w-1/2 sm:block hidden">
                </div>
                <form onSubmit={formsubmit} className="sm:w-1/2 w-full flex flex-col items-center ">

                    <div className="flex flex-col 2xl:mt-56 lg:mt-48 md:mt-40 sm:mt-36 mt-48 lg:w-4/6 md:w-[76%] sm:w-11/12 w-5/6">

                        <div className="text-red-500 h-5 font-Josefin lg:text-sm sm:text-xs text-sm mx-auto">{signin_servererror}</div>
                        <span className="relative mb-2">
                            <label htmlFor="signin_email" className="absolute md:text-2xl hover:cursor-pointer"><MdEmail /></label>
                            <input className="focus:outline-none border-b-2 border-gray-300 md:px-11 px-7 w-full md:text-base text-sm font-Josefin" placeholder="Your Email" type="email" name="signin_email" id="signin_email" required value={signincred.signin_email} onChange={handleEmailChange} />
                        </span>
                        <div className={`text-red-500 h-5 font-Josefin lg:text-sm sm:text-xs text-sm xl:ml-6 md:ml-4 sm:ml-1.5 ml-5 `}> {signincred.email_error}</div>
                        <br />

                        <span className="relative mb-2">
                            <label htmlFor="signin_password" className="absolute md:text-lg hover:cursor-pointer"><FaLock /></label>
                            <MdVisibility className={`absolute right-1 md:text-xl hover:cursor-pointer ${signin_visibility == "password" ? "" : "hidden"} `} onClick={visibilityhandler} />
                            <MdVisibilityOff className={`absolute right-1 md:text-xl hover:cursor-pointer ${signin_visibility == "password" ? "hidden" : ""} `} onClick={visibilityhandler} />
                            <input className="focus:outline-none border-b-2 border-gray-300 md:px-11 px-7 w-full md:text-base text-sm font-Josefin" placeholder="Password" type={signin_visibility} name="signin_password" id="signin_password" required minLength={8} maxLength={22} value={signincred.signin_password} onChange={handlePasswordChange} />
                        </span>
                        <div className="text-red-500 h-5 font-Josefin xl:text-sm text-xs sm:ml-0 ml-2">{signincred.password_error}</div>
                        <br />

                    </div>
                    <button type="submit" className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white font-Josefin text-lg py-[0.62rem] px-9 rounded mt-3">
                        Log in
                    </button>
                </form>

            </div>

        </div>
    )
}

export default Signin

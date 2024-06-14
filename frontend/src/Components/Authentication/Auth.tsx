import { Link, useLocation } from "react-router-dom";
import Young from "./young.jpg"

const Auth = () => {
    const location = useLocation();


    return (
        <div className="w-full h-[100vh] flex justify-center items-center z-0 ">
            <div className="2xl:w-[62.5%] xl:w-9/12 lg:w-10/12 w-[94%] 2xl:min-h-[38rem] lg:min-h-[35rem] md:min-h-[30rem] sm:min-h-[27rem] min-h-[32rem] flex flex-row bg-white rounded-2xl  ">

                <div className="w-1/2 sm:block hidden">
                    <img className="h-5/6 rounded-2xl" src={Young} />
                </div>

                <div className="sm:w-1/2 w-full flex flex-col items-center justify-start">
                    <div className="lg:pb-5 sm:pb-0 pb-5 2xl:pt-16 lg:pt-10 sm:pt-7 pt-12 text-3xl font-Guerrilla">
                        KV-CLOUD
                    </div>
                    <div className="flex flex-row font-Josefin lg:text-xl text-lg md:py-7 py-5">

                        <Link className={`md:px-11 px-8 py-2 z-20 font-bold rounded-md ${location.pathname == "/signup_otp" || location.pathname == "/signup_otp/credential" ? "bg-gradient-to-r from-green-400 to-blue-500 text-white  hover:from-pink-500 hover:to-yellow-500" : "bg-white text-black hover:cursor-default"}`} to="/signin">Sign in</Link>

                        <Link className={`md:px-11 px-8 py-2 z-20 font-bold rounded-md ${location.pathname == "/signin" ? "bg-gradient-to-r from-green-400 to-blue-500 text-white  hover:from-pink-500 hover:to-yellow-500" : "bg-white text-black cursor-default"}`} to="/signup_otp">Sign up</Link>

                    </div>
                </div>

            </div>
        </div>
    )
}

export default Auth;

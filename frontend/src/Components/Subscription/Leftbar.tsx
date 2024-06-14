
import { Avatar, AvatarFallback, AvatarImage } from "../../shadcn/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTrigger,
} from "@/shadcn/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs"
import { FaUserTie } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import { MdVisibility } from "react-icons/md";
import React, { useState } from "react";
import { MdVisibilityOff } from "react-icons/md";
import { FaUser } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { MdFamilyRestroom } from "react-icons/md";
import { BiLogoGmail } from "react-icons/bi";

interface Credential {
    add_name: string,
    add_oldpassword: string,
    add_newpassword: string
}

const Leftbar = () => {
    const data = {
        add_name: "",
        add_oldpassword: "",
        add_newpassword: ""
    }
    const [add_credential, setadd_credential] = useState<Credential>(data);
    const [add_validation, setadd_validation] = useState<Credential>(data);
    const [addpassword_visibility, setaddpassword_visibility] = useState<{ oldpassword_visibility: string, newpassword_visibility: string }>({ oldpassword_visibility: "password", newpassword_visibility: "password" });

    const navigate = useNavigate();
    const signout_handler = () => {
        localStorage.removeItem('token');
        navigate('/signin');
    }

    const username_handler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setadd_credential({ ...add_credential, add_name: e.target.value });
        setadd_validation({ ...add_validation, add_name: e.target.value && e.target.value.length < 3 ? "Name must be atleast 3 characters" : "" });
    }
    const passwardRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const oldpassword_handler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setadd_credential({ ...add_credential, add_oldpassword: e.target.value });
        setadd_validation({
            ...add_validation, add_name: e.target.value && add_credential.add_name.length == 0 ? "Name is a required field" : "", add_oldpassword: e.target.value && !passwardRegex.test(e.target.value) ? "Min-requirement:7+ digit,1 char,1 num,and 1 symbol" : ""
        })
    }
    const newpassword_handler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setadd_credential({ ...add_credential, add_newpassword: e.target.value });
        setadd_validation({
            ...add_validation, add_name: e.target.value && add_credential.add_name.length == 0 ? "Name is a required field" : "", add_oldpassword: e.target.value && add_credential.add_oldpassword.length == 0 ? "Old password is a required field" : "", add_newpassword: e.target.value && !passwardRegex.test(e.target.value) ? "Min-requirement:7+ digit,1 char,1 num,and 1 symbol" : ""
        })
    }
    const oldpassword_visibility_handler = () => {
        setaddpassword_visibility({ ...addpassword_visibility, oldpassword_visibility: addpassword_visibility.oldpassword_visibility == "password" ? "" : "password" })
    }

    const newpassword_visibility_handler = () => {
        setaddpassword_visibility({ ...addpassword_visibility, newpassword_visibility: addpassword_visibility.newpassword_visibility == "password" ? "" : "password" })
    }
    // Form submit event:
    const add_submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    }

    return (
        <div className="h-[94%] w-11/12 flex flex-col justify-between items-center">
            <div className="">
                <Avatar className="mx-auto mt-2">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>

                <Dialog>
                    <DialogTrigger>
                        <div className="flex justify-center items-center mt-4">
                            <FaUser className=" mr-2 rounded-full text-xl" />
                            <span className="text-black font-Josefin 2xl:text-xl text-lg mt-1">My Cloud
                            </span>
                        </div>
                    </DialogTrigger>
                    <DialogContent className=" flex justify-center">
                        <DialogHeader className="flex justify-end">
                            <DialogDescription className=" h-[94%] bg-black flex justify-center items-center">
                                <div className="font-Josefin h-[96%] w-[96%]">

                                    {/* <div className="text-2xl font-bold text-black">Your Profile</div> */}
                                    <Avatar className="mx-auto mt-2">
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <div className="text-lg font-semibold text-white">Kartik Kala</div>


                                    <Tabs defaultValue="User Info" className="w-full mt-4">
                                        <TabsList>
                                            <TabsTrigger value="User Info">User Info</TabsTrigger>
                                            <TabsTrigger value="Add Info">Add Info</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="User Info" className="text-white 2xl:mt-9 mt-12 text-xl">

                                            <div className="flex flex-row items-center">
                                                <FaUserTie className="inline-block text-base mr-2 ml-2 relative bottom-[0.20rem]" />
                                                <h1 className="font-bold">First Name :</h1>
                                            </div>
                                            <div className="mb-5 font-Josefin text-gray-200">kartik </div>

                                            <div className="flex flex-row items-center">
                                                <MdFamilyRestroom className=" ml-2 inline-block text-base mr-2 relative bottom-[0.20rem]" />
                                                <h1 className=" font-bold">Last Name :</h1>
                                            </div>
                                            <div className="mb-5 font-Josefin text-gray-200">Kala</div>


                                            <div className="flex flex-row items-center">
                                                <BiLogoGmail className=" ml-2 text-lg inline-block mr-2 relative bottom-[0.20rem]" />
                                                <h1 className=" font-bold">Email :</h1>
                                            </div>

                                            <div className="font-Josefin text-gray-200">kartikKala4532@gmail.com</div>
                                        </TabsContent>

                                        <TabsContent value="Add Info" className="2xl:mt-0 lg:mt-7">
                                            <form onSubmit={add_submit} className="mt-5 flex flex-col items-center w-full text-white">

                                                <span className="relative 2xl:mb-1.5 md:mt-2 md:mb-1 sm:mt-1 mb-0.5 w-11/12">
                                                    <label htmlFor="signup_name" className="absolute lg:text-xl hover:cursor-pointer " ><FaUserTie /></label>
                                                    <input className="focus:outline-none border-b-2 border-gray-300 lg:px-11 px-7 w-full lg:text-base text-sm font-Josefin bg-black" placeholder="Your Name" id="signup_name" type="text" required minLength={3} maxLength={24} value={add_credential.add_name} onChange={username_handler} />
                                                </span>

                                                <div className="text-red-500 h-5 font-Josefin md:text-sm sm:text-xs text-sm lg:mb-2 sm:mb-0 mb-1">{add_validation.add_name}</div>

                                                <span className="relative 2xl:my-1.5 md:my-1 sm:my-0.5 my-1 w-11/12">
                                                    <label htmlFor="signup_password" className="absolute lg:text-lg text-sm hover:cursor-pointer"><FaLock /></label>

                                                    <MdVisibility className={`absolute right-1 lg:text-xl hover:cursor-pointer ${addpassword_visibility.oldpassword_visibility == "password" ? "" : "hidden"}`} name="signup_passcode" onClick={oldpassword_visibility_handler} />

                                                    <MdVisibilityOff className={`absolute right-1 lg:text-xl hover:cursor-pointer ${addpassword_visibility.oldpassword_visibility == "" ? "" : "hidden"}`} name="signup_passcode" onClick={oldpassword_visibility_handler} />

                                                    <input type={addpassword_visibility.oldpassword_visibility} className="focus:outline-none border-b-2 border-gray-300 lg:px-11 px-7 w-full lg:text-base text-sm font-Josefin bg-black" placeholder="Old Password" name="signup_password" id="signup_password" required minLength={8} maxLength={24} onChange={oldpassword_handler} value={add_credential.add_oldpassword} />
                                                </span>
                                                <div className="text-red-500 h-5 font-Josefin md:text-sm sm:text-xs text-sm lg:mb-2 sm:mb-0 mb-1">{add_validation.add_oldpassword}</div>

                                                <span className="relative 2xl:my-1.5 md:my-1 sm:my-0.5 my-1 w-11/12">

                                                    <label htmlFor="signup_password" className="absolute lg:text-lg text-sm hover:cursor-pointer"><FaLock /></label>

                                                    <MdVisibility className={`absolute right-1 lg:text-xl hover:cursor-pointer  ${addpassword_visibility.newpassword_visibility == "password" ? "" : "hidden"}`} name="signup_passcode" onClick={newpassword_visibility_handler} />
                                                    <MdVisibilityOff className={`absolute right-1 lg:text-xl hover:cursor-pointer ${addpassword_visibility.newpassword_visibility == "" ? "" : "hidden"}`} name="signup_passcode" onClick={newpassword_visibility_handler} />

                                                    <input type={addpassword_visibility.newpassword_visibility} className="focus:outline-none border-b-2 border-gray-300 lg:px-11 px-7 w-full lg:text-base text-sm font-Josefin bg-black" placeholder="New Password" name="signup_password" id="signup_password" required minLength={8} maxLength={24} onChange={newpassword_handler} value={add_credential.add_newpassword} />
                                                </span>
                                                <div className="text-red-500 h-5 font-Josefin md:text-sm sm:text-xs text-sm lg:mb-2 sm:mb-0 mb-1">{add_validation.add_newpassword}</div>

                                                <button type="submit" className="bg-gradient-to-r from-green-400 to-blue-500 w-10/12 hover:from-pink-500 hover:to-yellow-500 text-white lg:text-base text-sm font-bold py-3 px-4 rounded lg:mt-2 md:mt-5 sm:mt-1 mt-2">
                                                    Save Changes
                                                </button>

                                            </form>
                                        </TabsContent>
                                    </Tabs>


                                    <div className=""></div>

                                </div>
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>


            </div>

            <button onClick={signout_handler} className="bg-black hover:bg-gray-700 text-white font-Josefin py-3 px-3 rounded mb-2 w-11/12">
                Sign out
            </button>
        </div>
    )
}

export default Leftbar;

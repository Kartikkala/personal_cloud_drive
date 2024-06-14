import { FaFileUpload } from "react-icons/fa";
import { HiLink } from "react-icons/hi";
import { GrStorage } from "react-icons/gr";
import { useState } from "react";
import { useAppDispatch } from "@/app/Hook";
import { upload_link } from "../../slice/Link_upload"
import { fetch_files_fun } from "../../slice/Fetchfiles";
// import socket from "./Socket";



const Rightbar = () => {

    const dispatch = useAppDispatch();

    const [file_state, setfile_state] = useState<File | string>("");
    const [uri_state, seturi_state] = useState<string>("");
    const [linkvalidation, setlinkvalidation] = useState<string | null>(null);
    const [disable, setdisable] = useState<boolean>(true);

    // const normalDownloadPattern = /https?:\/\/[^\s\/$.?#].[^\s]*\/[^\s]*(download|\.zip|\.exe|\.pdf|\.mp3|\.mp4|\.jpg|\.jpeg|\.png|\.gif|\.tar\.gz|\.rar|\.7z|\.iso|\.docx?|\.xlsx?|\.pptx?|\.txt|\.apk|\.dmg|\.bin|\.msi|\.deb|\.rpm|\.pkg|\.avi|\.mov|\.wmv|\.flv|\.mkv|\.webm|\.ogg|\.wav|\.aac)(\?[^\s]*)?(?!.*\.torrent)/gi;


    // const torrentAndMagnetPattern = /(https?:\/\/[^\s\/$.?#].[^\s]*\/[^\s]*\.torrent(\?[^\s]*)?|magnet:\?xt=urn:btih:[a-zA-Z0-9]{40,}(\&[^\s]*)?)/gi;

    const onchange_fileinput = (event: React.ChangeEvent<HTMLInputElement>) => {

        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setfile_state(selectedFile);
            setdisable(false);
        }
        else {
            setfile_state("");
            setdisable(true);
        }
    }

    const onchange_uriinput = (e: React.ChangeEvent<HTMLInputElement>) => {
        // const dispatch = useAppDispatch();

        seturi_state(e.target.value);
        // if (!normalDownloadPattern.test(e.target.value) && !torrentAndMagnetPattern.test(e.target.value) && e.target.value.length != 0) {
        //     setlinkvalidation("Invalid Link format");
        //     setdisable(true);
        // }
        if (e.target.value.length == 0) {
            setlinkvalidation(null);
        }
        else {
            setlinkvalidation(null);
            setdisable(false);
        }
    }

    const inputFileUpload = async () => {
        if (!file_state) {
            console.error('No file selected');
            return;
        }

        if (typeof file_state === 'string') {
            console.error('File state is a string, not a File');
            return;
        }

        const formData = new FormData();
        formData.append('file', file_state);

        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/fs/uploadFile', {
            method: 'POST',
            headers: {
                "Authorization": token as string,
                "filesize": file_state.size.toString(), // Convert size to string
            },
            body: formData,
        });

        const json = await response.json();
        if (!json.success) {
            console.log("Error in uploading the file to the cloud");
        }
        else {
            dispatch(fetch_files_fun());
            console.log("file added successfully");
        }
    };

    const formsumbit_handler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (uri_state.length != 0) {
            // if (normalDownloadPattern.test(uri_state)) {
                dispatch(upload_link(uri_state));
            dispatch(fetch_files_fun());
            seturi_state("");

                // socket.on('statusUpdate', (value: ArrayOfObjects) => {
                //     const val = value[0];
                //     dispatch(changestate(val));
                //     if (value[0].totalLength == value[0].uploadLength) {
                //         dispatch(fetch_files_fun());
                //     }
                // })
            // }

        } else {
            console.log("I am working and I am else")
            inputFileUpload();
            dispatch(fetch_files_fun());
            setfile_state("")
        }
    };

    return (
        <div className="w-11/12 h-[96%] flex flex-col justify-between overflow-y-auto">

            <div className=" bg-gray-100 flex flex-col xl:justify-normal justify-center ">
                <div className="3xl:h-72 h-64 flex flex-col justify-center items-center rounded">
                    <FaFileUpload className="h-36 w-full text-gray-800" />
                    <div className="text-xl font-bold text-center pt-2">Add new files</div>
                </div>

                <form onSubmit={formsumbit_handler} className="flex flex-col items-center pb-8">
                    <input type="file" disabled={uri_state.length !== 0} onChange={onchange_fileinput} className="border-2 border-gray-300 rounded file:bg-gray-800 file:border-none  file:text-white file:bottom-0 file:p-2 file:xl:text-base file:text-sm xl:text-base lg:text-sm text-xs file:rounded bg-white xl:w-11/12 w-[96%] p-1 font-Josefin lg:file:mr-4 file:mr-2" />

                    <div className="flex 3xl:my-5 my-3 items-center justify-center w-full">
                        <div className=" border-t-[1px] border-black xl:w-5/12 w-4/12 h-0"></div>
                        <span className="text-2xl font-Josefin px-2">or</span>
                        <div className="border-t-[1px] border-black xl:w-5/12 w-4/12 h-0"></div>
                    </div>

                    <div className="relative w-full flex justify-center">
                        <label htmlFor="link" className="xl:text-2xl text-xl absolute bottom-4 xl:left-8 left-3"><HiLink /></label>
                        <input type="text" disabled={file_state != ""} onChange={onchange_uriinput} value={uri_state} className="border-2 border-black p-3 xl:pl-14 pl-9 xl:w-11/12 w-[96%] font-Josefin rounded xl:text-base text-sm" placeholder="Add upload link here" name="link" id="link" />
                    </div>

                    <div className="text-red-500 h-5 font-Josefin md:text-sm sm:text-xs text-sm mt-2">{linkvalidation}</div>

                    <button disabled={disable} className="bg-black hover:bg-gray-900 text-white font-Josefin font-extrabold  py-3 px-4 rounded xl:mt-5 mt-6 w-10/12">
                        Add File
                    </button>
                </form>

            </div>
            {/* progress bar */}
            <div className="bg-cyan-700 rounded-lg text-lg] ">

                <div className="3xl:p-2 xl:p-1 p-2 flex flex-col items-center space-y-1">
                    <div className="flex justify-center items-center text-black rounded-lg 3xl:p-2 p-1 w-full">
                        <GrStorage className="font-bold mr-2 rounded text-white" />
                        <div className="text-center font-bold xl:text-2xl text-xl">Your Storage</div>
                    </div>

                    <div className="w-28 h-28 relative border-[6px] border-black rounded-full">
                        {/* <IoAdd className="absolute -left-[2.85rem] -top-[2.80rem] z-30 h-48 w-48 text-white" /> */}
                        <div className="absolute z-40 text-xl left-[1.85rem] top-9 font-bold">75%</div>
                        <div className="w-[88%] h-[88%] bg-blue-500 rounded-full absolute z-10 left-[0.35rem] top-[0.37rem] box-border border-[6px] border-black"></div>
                        <progress className="rounded-full custom-progress bg-gray-200 w-full h-full overflow-hidden  box-border" value="75" max="100">
                        </progress>
                    </div>

                    <p className="pt-1 ml-2 font-medium xl:text-lg lg:text-base text-sm"><span className="text-white">75gb</span> is used out of <span className="text-white">100gb</span></p>
                </div>
            </div>

        </div>
    )
}

export default Rightbar;

import React, { useEffect, useState } from 'react'
import { HiDotsVertical } from "react-icons/hi";
import { MdOndemandVideo } from "react-icons/md";
import { MdOutlineAudioFile } from "react-icons/md";
import { IoDocumentText } from "react-icons/io5";
import { IoImages } from "react-icons/io5";
import { AiFillFilePpt } from "react-icons/ai";
import { BiSolidFileHtml } from "react-icons/bi";
import { FaFileZipper } from "react-icons/fa6";
import { MdMore } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { FiDownload } from "react-icons/fi"
import { FaPlay } from "react-icons/fa6";

import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from "@/shadcn/ui/menubar"
import { useAppDispatch } from '@/app/Hook';
import { fetch_files_fun } from '@/slice/Fetchfiles';
import { useNavigate } from 'react-router-dom';
import { changestate } from '@/slice/StatusUpdate';


interface mydata {
    size: number,
    birthtime: string,
    directory: boolean,
    file: boolean,
    symlink: boolean,
    name: string
}

interface myprops {
    fileobj: mydata,
    file_type: string
}
type IconComponentType = React.ComponentType<{ className?: string }>;

interface image {
    [key: string]: React.ComponentType;
}

const FileGrid = (props: myprops) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const obj: image = {
        Videos: MdOndemandVideo,
        Audios: MdOutlineAudioFile,
        Images: IoImages,
        Documents: IoDocumentText,
    }
    const obj_more: image = {
        ppt: AiFillFilePpt,
        html: BiSolidFileHtml,
        zip: FaFileZipper,
        rest: MdMore
    }


    const { fileobj, file_type } = props;
    const [IconSelected, setIconSelected] = useState<IconComponentType | null>(null);
    useEffect(() => {
        if (file_type == "More") {
            if (fileobj.name.endsWith("ppt")) {
                const value = () => obj_more.ppt;
                setIconSelected(value);
            }
            else if (fileobj.name.endsWith("html")) {
                const value = () => obj_more.html;
                setIconSelected(value);
            }
            else if (fileobj.name.endsWith("zip")) {
                const value = () => obj_more.zip;
                setIconSelected(value);
            }
            else {
                const value = () => obj_more.rest;
                setIconSelected(value);
            }

        }
        else {
            const value = () => obj[file_type];
            setIconSelected(value);
        }
    }, [file_type])

    const Download_handler = async () => {
        const token: string | null = localStorage.getItem('token');
        const response = await fetch('http:/localhost:5000//api/fs/downloadFIleClient', {
            method : "POST",
            headers: {
                "Authorization": token as string,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ targetPath: `/${fileobj.name}` })
        })
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileobj.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } else {
            console.error('Failed to download file');
        }

    }
    const Deleteclick_handler = async () => {
        const token: string | null = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/fs/delete', {
            method : "POST",
            headers: {
                "Authorization": token as string,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ targetPath: `/${fileobj.name}` })
        })
        const json = await response.json();
        if (json.deleted == true) {
            dispatch(fetch_files_fun());
        }
    }

    const clickplay = () => {
        if (file_type == "Videos") {
            const encodeURI = encodeURIComponent("/" + fileobj.name);
            dispatch(changestate(encodeURI));
            navigate("/Streamvideos");
        }
    }


    return (

        <div className="inline-block xl:w-40 lg:w-[9.5rem] md:w-36 sm:w-32 w-36 overflow-hidden shadow-lg bg-white rounded-lg">

            <div className="relative w-full xl:h-32 lg:h-28 md:h-[6.5rem] h-24  flex justify-center items-center">

                <Menubar className='absolute text-black right-3 top-3 text-xl'>
                    <MenubarMenu>
                        <MenubarTrigger>
                            <HiDotsVertical className='absolute text-black right-0 top-0 text-xl' />
                        </MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem>
                                <button onClick={Download_handler} className='flex items-center w-full'><FiDownload className='text-black mr-2' />  Download</button>
                            </MenubarItem>
                            <MenubarItem>
                                <button onClick={Deleteclick_handler} className='flex items-center w-full'> <MdDelete className='text-black mr-2' /> Delete</button>
                            </MenubarItem>
                            <MenubarItem className={`${file_type == "Videos" ? "" : "hidden"}`}>
                                <button onClick={clickplay} className='flex items-center w-full'><FaPlay className='text-black mr-2 ' /> Play</button>
                            </MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>


                {IconSelected && <IconSelected className=" xl:text-7xl lg:text-6xl text-5xl text-black" />}
            </div>

            <div className="bg-gray-200">
                <div className="xl:pt-4 md:pt-3 pt-4 text-center font-Josefin text-base">
                    {fileobj.name.length > 17 ? fileobj.name.slice(0, 17) + "..." : fileobj.name}
                </div>
                <div className=" xl:pb-4 md:pb-3 pb-4 font-light text-center text-xs">
                    {fileobj.size.toFixed(3)}mb | {fileobj.birthtime.split('T')[0]}

                </div>
            </div>
        </div>
    )
}

export default FileGrid;


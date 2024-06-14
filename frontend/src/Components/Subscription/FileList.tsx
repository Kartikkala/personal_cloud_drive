import React, { useEffect, useState } from 'react'
import { HiDotsVertical } from "react-icons/hi";
import { FcVideoFile } from "react-icons/fc";
import { FcAudioFile } from "react-icons/fc";
import { FcImageFile } from "react-icons/fc";
import { FcDocument } from "react-icons/fc";
import { MdMore } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { FiDownload } from "react-icons/fi";
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
import { changestate } from '@/slice/Streamslice';
import { useNavigate } from 'react-router-dom';

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

const FileList = (props: myprops) => {
    const dispatch = useAppDispatch();

    const obj: image = {
        Videos: FcVideoFile,
        Audios: FcAudioFile,
        Images: FcImageFile,
        Documents: FcDocument,
        More: MdMore
    }

    const navigate = useNavigate();

    const { fileobj, file_type } = props;
    const [Selectedicon, setSelectedicon] = useState<IconComponentType | null>(null);
    useEffect(() => {
        const value = () => obj[file_type];
        setSelectedicon(value);
    }, [file_type])

    const Downloadclick = async () => {

        const token: string | null = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/fs/downloadFIleClient', {
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
    const Deleteclick = async () => {
        const token: string | null = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/fs/delete',{
            method : "POST",
            headers: {
                "authorization": token as string,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ targetPath: `/${fileobj.name}` })
        })
        const jsonarray = await response.json();
        for(let i=0;i<jsonarray.length; i++)
        {
            const json = jsonarray[i]
            if (json.deleted) {
                dispatch(fetch_files_fun());
            }
        }
    }

    const playclick = () => {
        if (file_type == "Videos") {
            const encodeURI = encodeURIComponent("/" + fileobj.name);
            dispatch(changestate(encodeURI));
            navigate("/Streamvideos");
        }
    }

    return (

        <div className='h-12 hover:bg-gray-300 border-b-[1.5px] border-gray-500 flex justify-between items-center font-Josefin lg:px-4 px-2 xl:text-base sm:text-sm text-xs'>
            <div className="flex w-[45%] items-center">
                {Selectedicon && <Selectedicon className="sm:text-2xl text-xl xl:pr-2 text-blue-500" />}
                <div className="">{fileobj.name}</div>
            </div>

            <div className="w-[26%]">{fileobj.size.toFixed(3)}mb</div>
            <div className="w-[26%] ">{fileobj.birthtime.split('T')[0]}</div>
            <div className="w-[3%] h-full hover:cursor-pointer border-blue-500 flex justify-center ">

                <Menubar className="w-full h-full">
                    <MenubarMenu >
                        <MenubarTrigger className='h-full w-full flex justify-center'>
                            <HiDotsVertical className='' />
                        </MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem>
                                <button onClick={Downloadclick} className='flex items-center w-full'><FiDownload className='text-black mr-2  ' />   Download</button>
                            </MenubarItem>
                            <MenubarItem>
                                <button onClick={Deleteclick} className='flex items-center w-full'><MdDelete className='text-black mr-2 ' /> Delete</button>
                            </MenubarItem>
                            <MenubarItem className={`${file_type == "Videos" ? "" : "hidden"}`}>
                                <button onClick={playclick} className='flex items-center w-full'><FaPlay className='text-black mr-2 ' /> Play</button>
                            </MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>

            </div>
        </div>
    )
}

export default FileList;


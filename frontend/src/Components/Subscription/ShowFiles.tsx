import { useEffect, useState } from 'react'
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useLocation, useNavigate } from 'react-router-dom';
import { BsFillGrid3X3GapFill } from "react-icons/bs";
import FileList from './FileList';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/shadcn/ui/tooltip"
import FileGrid from './FileGrid';


interface mydata {
    size: number,
    birthtime: string,
    directory: boolean,
    file: boolean,
    symlink: boolean,
    name: string
}
interface propsobj {
    data: mydata[]
}

const ShowFiles = (props: propsobj) => {
    const [grid_view, setgrid_view] = useState<boolean>(false);
    const [category, setcategory] = useState<string>("");
    const { data } = props;

    const location = useLocation();
    useEffect(() => {
        const str = location.pathname;
        const arr = str.split("/");
        const ctgry = arr[arr.length - 1];
        setcategory(ctgry);
    }, [])

    const navigate = useNavigate();
    const backclick = () => {
        navigate("/");
    }

    const formatchange = () => {
        if (grid_view) {
            setgrid_view(false);
        }
        else {
            setgrid_view(true);
        }
    }

    return (
        <>
            <div className="xl:h-14 h-[3.25rem] flex items-center justify-between pl-3 pr-6 rounded-2xl border-b-2 border-black md:mb-10 mb-8 bg-white">
                <div className="flex items-center font-bold">
                    <IoArrowBackCircleSharp onClick={backclick} className='xl:text-4xl text-3xl hover:cursor-pointer' />
                    <div className="xl:text-2xl text-xl font-Josefin 2xl:ml-10 xl:ml-6 ml-4" >
                        {category}
                    </div>

                </div>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <BsFillGrid3X3GapFill onClick={formatchange} className='xl:text-xl text-lg' />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Grid format</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

            </div>
            {!grid_view && <div className="flex justify-between lg:px-4 px-2 pb-2 border-b-[1.5px] border-black font-semibold md:text-base text-sm">
                <div className="w-[45%]">Name</div>
                <div className="w-[26%]">Size</div>
                <div className="w-[26%]">Date</div>
                <div className="w-[3%]"></div>
            </div>}
            {grid_view && <div className="grid 3xl:grid-cols-5 xl:grid-cols-4 md:grid-cols-3 sm:grid-cols-4 xs:grid-cols-3 grid-cols-2 3xl:gap-x-10 gap-5 justify-items-center m-4">
                {data.map((value, index) => {
                    return <FileGrid key={index} fileobj={value} file_type={category} />
                })}
            </div>}
            {!grid_view && data.map((value, index) => {
                return <FileList key={index} fileobj={value} file_type={category} />
            })}
        </>
    )
}

export default ShowFiles;

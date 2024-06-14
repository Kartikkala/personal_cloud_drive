import { BiSearchAlt2 } from "react-icons/bi";
import { IoVideocam } from "react-icons/io5";
import { AiFillAudio } from "react-icons/ai";
import { FaImages } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { MdMore } from "react-icons/md";
import { Routes, Route, useLocation } from "react-router-dom"
import ShowFiles from "./ShowFiles";
import { useEffect, useState } from "react";
import Categoriescard from "./Categoriescard";
import File from './FileList'
import History from './History'
import { useAppDispatch, useAppSelector } from "@/app/Hook";
import { fetch_files_fun } from "../../slice/Fetchfiles";
import { changeState } from "@/slice/Videofiles";

interface mydata {
    size: number,
    birthtime: string,
    directory: boolean,
    file: boolean,
    symlink: boolean,
    name: string
}
interface myda {
    size: number,
    birthtime: string,
    directory: boolean,
    file: boolean,
    symlink: boolean,
    name: string
    category: string
}

interface size {
    videofilesize: number,
    audiofilesize: number,
    documentfilesize: number,
    imagefilesize: number,
    morefilesize: number,
}
type UpdateStateFunction = (newState: boolean) => void;

interface getting_props {
    downloadhistory: boolean,
    changestate: UpdateStateFunction
}


const Contentbar = (props: getting_props) => {
    const { downloadhistory, changestate } = props;

    const dispatch = useAppDispatch();

    const location = useLocation();

   
    // inital data object for sizedata state variable:
    const sizedata: size = {
        videofilesize: 0,
        audiofilesize: 0,
        documentfilesize: 0,
        imagefilesize: 0,
        morefilesize: 0,
    }

    // const dispatch = useAppDispatch();
    const files = useAppSelector((state) => state.fetch_files.files)
    useEffect(() => {
        dispatch(fetch_files_fun());
    }, [])

    // const [files, setfiles] = useState<mydata[]>(data);
    const [videofiles, setvideofiles] = useState<mydata[]>([]);
    const [audiofiles, setaudiofiles] = useState<mydata[]>([]);
    const [imagefiles, setimagefiles] = useState<mydata[]>([]);
    const [documentfiles, setdocumentfiles] = useState<mydata[]>([]);
    const [morefiles, setmorefiles] = useState<mydata[]>([]);
    const [filesize, setfilesize] = useState<size>(sizedata);


    const arra: { tag: string, img: React.ComponentType, size: number, file_no: number }[] = [
        {
            tag: "Videos",
            img: IoVideocam,
            size: filesize.videofilesize,
            file_no: videofiles.length
        },
        {
            tag: "Audios",
            img: AiFillAudio,
            size: filesize.audiofilesize,
            file_no: audiofiles.length
        }, {
            tag: "Images",
            img: FaImages,
            size: filesize.imagefilesize,
            file_no: imagefiles.length
        }, {
            tag: "Documents",
            img: IoDocumentText,
            size: filesize.documentfilesize,
            file_no: documentfiles.length
        }, {
            tag: "More",
            img: MdMore,
            size: filesize.morefilesize,
            file_no: morefiles.length
        }
    ]
    const [elements, setelements] = useState<{ tag: string, img: React.ComponentType, size: number, file_no: number }[]>(arra);
    const [latest_files, setlatest_files] = useState<myda[] | null>(null);



    const [files_addtional, setfiles_additional] = useState<myda[]>([])

    useEffect(() => {
        const videos: mydata[] = []; const audios: mydata[] = []; const images: mydata[] = []; const documents: mydata[] = []; const more: mydata[] = [];
        const sizeobj: size = { ...sizedata };
        const files_copy: myda[] = [];

        // files.forEach((file) => {
        for (let i = 0; i < files?.length; i++) {
            const file = Object.assign({}, files[i]);

            file.size = file.size / 1048576;

            if (file.name.endsWith(".mp4")) {
                videos.push(file);
                sizeobj.videofilesize += file.size;
                const file_copy: myda = { ...file, category: "Videos" };
                files_copy.push(file_copy);

            }
            else if (file.name.endsWith(".mp3")) {
                audios.push(file);
                sizeobj.audiofilesize += file.size;
                const file_copy: myda = { ...file, category: "Audios" };
                files_copy.push(file_copy);
            }
            else if (file.name.endsWith("jpg") || file.name.endsWith(".png")) {
                images.push(file);
                sizeobj.imagefilesize += file.size;
                const file_copy: myda = { ...file, category: "Images" };
                files_copy.push(file_copy);
            }
            else if (file.name.endsWith(".pdf") || file.name.endsWith(".docx")) {
                documents.push(file);
                sizeobj.documentfilesize += file.size;
                const file_copy: myda = { ...file, category: "Documents" };
                files_copy.push(file_copy);
            }
            else {
                more.push(file);
                sizeobj.morefilesize += file.size;
                const file_copy: myda = { ...file, category: "More" };
                files_copy.push(file_copy);
            }
            // })
        }

        files_copy.sort((a, b) => new Date(b.birthtime).getTime() - new Date(a.birthtime).getTime());
        setfiles_additional(files_copy);
        const latest_arr = files_copy.slice(0, 5);
        setlatest_files(latest_arr);

        setvideofiles(videos);
        dispatch(changeState(videos));
        setaudiofiles(audios);
        setimagefiles(images);
        setdocumentfiles(documents);
        setmorefiles(more);
        setfilesize(sizeobj);

    }, [files])

    useEffect(() => {
        setelements(arra);
    }, [filesize]);

    const [searchbar, setsearchbar] = useState<string>("");
    const [match_array, setmatch_array] = useState<myda[]>([]);
    const search_onchange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setsearchbar(event.target.value);
    }
    useEffect(() => {
        const regex = new RegExp(searchbar, 'i');
        const match_method = files_addtional.filter((value) => {
            return regex.test(value.name);
        })
        setmatch_array(match_method);

    }, [searchbar])
    useEffect(() => { }, [downloadhistory])


    return (
        <div className="h-[97%] w-full box-border border-b-2 border-white flex justify-center">
            {!downloadhistory && <div className="w-[94%] h-full overflow-y-hidden ">

                {/* Search bar */}
                <div className={`2xl:h-[4.4rem] sm:h-16 h-14  flex items-center xl:justify-normal justify-center bg-gray-700 rounded-lg ${location.pathname == "/home" ? "2xl:mb-[4%] mb-[5%]" : "2xl:mb-[1%] mb-[2%]"} `}>

                    <div className="relative bg-white xl:h-12 sm:h-11 h-10 xl:w-4/6 sm:w-9/12 w-10/12 flex justify-center items-center rounded xl:ml-16">
                        <label htmlFor="search" className="absolute sm:text-2xl text-xl xs:left-4 left-3 xl:bottom-[0.85rem]  bottom-3 border-black">
                            <BiSearchAlt2 />

                        </label>
                        <input type="text" onChange={search_onchange} className="focus:outline-none font-Josefin xl:ml-0 ml-8 w-4/5 md:text-base sm:text-lg text-base" name="search" id="search" placeholder="Search by Name" value={searchbar} />
                    </div>
                </div>

                {!searchbar && <div className={` overflow-y-auto ${location.pathname == "/" ? " 2xl:h-[86%] h-[87%]" : " 2xl:h-[90%] h-[91%]"} ${location.pathname == "/" ? "bg-gray-200" : "bg-gray-100 rounded-t-xl"}`}>
                    <Routes>
                        <Route path="/category/Videos" element={<ShowFiles data={videofiles} />}></Route>
                        <Route path="/category/Audios" element={<ShowFiles data={audiofiles} />}></Route>
                        <Route path="/category/Images" element={<ShowFiles data={imagefiles} />}></Route>
                        <Route path="/category/Documents" element={<ShowFiles data={documentfiles} />}></Route>
                        <Route path="/category/More" element={<ShowFiles data={morefiles} />}></Route>
                    </Routes>

                    {location.pathname == "/" && <div>
                        <h1 className="xl:text-3xl text-2xl font-bold mb-7">Categories:</h1>
                        <div className="grid 3xl:grid-cols-5 xl:grid-cols-4 md:grid-cols-3 sm:grid-cols-4 xs:grid-cols-3 grid-cols-2 3xl:gap-x-10 gap-5 justify-items-center">
                            {elements.map((value) => {
                                return <Categoriescard key={String(value.tag)} item={value} />;
                            })}
                        </div>

                        <h1 className="xl:text-3xl text-2xl font-bold my-7">Recent Files:</h1>
                        <div className="flex justify-between lg:px-4 px-2 pb-2 border-b-[1.5px] border-black font-semibold md:text-base text-sm">
                            <div className="w-[45%]">Name</div>
                            <div className="w-[26%]">Size</div>
                            <div className="w-[26%]">Date</div>
                            <div className="w-[3%]"></div>
                        </div>
                        {latest_files && latest_files.map((value, index) => {
                            return <File key={index} fileobj={value} file_type={value.category} />
                        })}
                    </div>}

                </div>}
                {

                    searchbar && <div className="overflow-y-auto 2xl:h-[86%] h-[87%] bg-gray-200 mt-5">
                        <div className="flex justify-between lg:px-4 px-2 pb-2 border-b-[1.5px] border-black font-semibold md:text-base text-sm">
                            <div className="w-[45%]">Name</div>
                            <div className="w-[26%]">Size</div>
                            <div className="w-[26%]">Date</div>
                            <div className="w-[3%]"></div>
                        </div>
                        {match_array && match_array.map((value, index) => {
                            return <File key={index} fileobj={value} file_type={value.category} />
                        })}
                    </div>
                }

            </div>}
            {downloadhistory && <div className="w-[94%] h-full overflow-y-hidden">
                <History  changestate={changestate} />
            </div>}
        </div>
    )
}

export default Contentbar;

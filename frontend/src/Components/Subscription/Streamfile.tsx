import { useAppDispatch, useAppSelector } from '@/app/Hook';
import { nullset } from '@/slice/Streamslice';
import { useEffect, useRef } from 'react'
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import FileList from './FileList';



const Streamfile = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const videofilename = useAppSelector((state) => state.Stream_slice);
    const token = localStorage.getItem('token')
    const videofiles = useAppSelector((state) => state.Video_file);
    const videoRef = useRef<HTMLVideoElement>(null);

    const backarrowclick = () => {
        navigate("/");
        dispatch(nullset());
    }

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.removeAttribute('src');
            videoRef.current.load();
        }
    }, [videofilename])

    return (
        <div className="h-[97%] w-full box-border border-b-2 border-white flex flex-col items-center overflow-y-auto">
            <div className='h-12 w-8/12 bg-white rounded-lg flex items-center'>
                <IoArrowBackCircleSharp onClick={backarrowclick} className='text-5xl mr-8' />
                <div className="text-xl font-bold">Video Streaming</div>
            </div>

            <video ref={videoRef} className='my-7 w-10/12 h-auto' controls>
                <source src={`http://localhost:5000/api/video/stream?token=${token}&filepath=${videofilename}`} />
                Video tag is not supported by the your browser
            </video>


            {videofiles.length !== 0 && (

                <div className="w-full">
                    <div className="w-full flex justify-between lg:px-4 px-2 pb-2 border-b-[1.5px] border-black font-semibold md:text-base text-sm">
                        <div className="w-[45%]">Name</div>
                        <div className="w-[26%]">Size</div>
                        <div className="w-[26%]">Date</div>
                        <div className="w-[3%]"></div>
                    </div>
                    {videofiles.map((file, index) => (
                        <FileList key={index} fileobj={file} file_type="Videos" />
                    ))}
                </div>


            )}

        </div>

    )
}

export default Streamfile;

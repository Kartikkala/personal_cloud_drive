import Navbar from "./Navbar";
import Leftbar from "./Leftbar";
import Rightbar from "./Rightbar";

import Contentbar from "./Contentbar";
import { useEffect, useState } from "react";
import { Routes, useNavigate, Route } from "react-router-dom";
import Streamfile from "./Streamfile";
import { useAppSelector } from "@/app/Hook";


type UpdateStateFunction = (newState: boolean) => void;

const HomePage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/signin');
    }
  }, [])

  const [downloadhistory, setdownloadhistory] = useState<boolean>(false);

  const streamstate = useAppSelector((state) => state.Stream_slice)

  const changestate: UpdateStateFunction = (value: boolean) => {
    setdownloadhistory(value);
  }
  return (
    <div className='w-[100vw] h-[100vh] flex justify-center items-center overflow-hidden'>
      <div className='h-full w-full bg-white flex '>

        <div className="h-full 3xl:w-[10%] 2xl:w-[12%] xl:w-[13%] w-[15%] box-content bg-gradient-to-b from-cyan-700 to-gray-400 rounded-r-xl border-r-4 border-white lg:flex justify-center items-center hidden ">
          <Leftbar />
        </div>

        <div className="bg-gray-200 h-full 3xl:w-[90%] 2xl:w-[88%] xl:[w-87%] lg:w-[85%] w-full lg:rounded-2xl rounded-t-lg flex flex-col">

          <nav className="h-[6%] box-border bg-gray-200 border-b-2 border-white lg:rounded-t-xl rounded-t-lg flex flex-row justify-around items-center" >
            <Navbar downloadhistory={downloadhistory} changestate={changestate} />
          </nav>

          <div className="flex h-[94%] rounded-b-2xl ">

            <div className=" md:w-[70%] box-border w-full md:border-r-2 border-white flex justify-center items-center ">
              <Routes>
                <Route path="/Streamvideos" element={<Streamfile />}></Route>
              </Routes>
              {!streamstate && <Contentbar downloadhistory={downloadhistory} changestate={changestate} />}
            </div>

            <div className="w-[30%] md:flex items-center justify-center hidden">
              <div className="2xl:h-[95%] h-[97%] 2xl:w-11/12 w-[94%] bg-white rounded flex justify-center items-center">
                <Rightbar />
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}

export default HomePage;

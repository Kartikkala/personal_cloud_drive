import { FaCloud } from "react-icons/fa";
// import { PiDotsSixBold } from "react-icons/pi";
import { CgFormatJustify } from "react-icons/cg"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shadcn/ui/popover"

type UpdateStateFunction = (newState: boolean) => void;

import { FaCloudUploadAlt } from "react-icons/fa";
// import { BsThreeDotsVertical } from "react-icons/bs";

interface propinter {
  downloadhistory: boolean,
  changestate: UpdateStateFunction
}
const Navbar = (props: propinter) => {
  const { downloadhistory, changestate } = props;
  const history_onclick = () => {
    if (downloadhistory == true) {
      changestate(false);
    }
    else {
      changestate(true);
    }
  }
  return (
    <>
      <span className="flex items-center xl:space-x-4 space-x-2">
        <FaCloud className="text-4xl" />
        <span className="2xl:text-2xl text-xl font-bold">KV-CLOUD</span>
      </span>

      <span className="flex items-center xl:space-x-4 space-x-2">
        <FaCloudUploadAlt onClick={history_onclick} className="md:text-3xl text-2xl" />

        <Popover>
          <PopoverTrigger>
            <CgFormatJustify className=" md:text-3xl text-2xl" />
          </PopoverTrigger>
          <PopoverContent>content for the popover here</PopoverContent>
        </Popover>

      </span>
    </>
  )
}

export default Navbar

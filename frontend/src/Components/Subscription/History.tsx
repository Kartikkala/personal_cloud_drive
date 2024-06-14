import { IoArrowBackCircleSharp } from "react-icons/io5";
type UpdateStateFunction = (newState: boolean) => void;


interface history_props {
    changestate: UpdateStateFunction
}
const History = (props: history_props) => {
    const { changestate } = props;

    const back_handler = () => {
        console.log("back_handler");
        changestate(false);

    }
    return (
        <div className='mt-10'>
            <div className="flex h-14 bg-white border-b-2 border-black rounded-xl items-center p-4">
                <IoArrowBackCircleSharp onClick={back_handler} className='xl:text-4xl text-3xl hover:cursor-pointer mr-10' />
                <div className="text-xl font-bold"> Upload and Download History</div>
            </div>
            <div className="mt-5">
                No uploading History
            </div>
        </div>
    )
}

export default History
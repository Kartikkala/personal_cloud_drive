import { createSlice } from "@reduxjs/toolkit";


interface mydata {
    size: number,
    birthtime: string,
    directory: boolean,
    file: boolean,
    symlink: boolean,
    name: string
}

const initialState: mydata[] = [];

const Videofile_slice = createSlice({
    name: "Video_file",
    initialState,
    reducers: {
        changeState: (_state, value) => value.payload
    },
})

export const { changeState } = Videofile_slice.actions
export default Videofile_slice.reducer;
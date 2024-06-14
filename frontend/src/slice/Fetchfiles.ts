import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";


interface mydata {
    size: number,
    birthtime: string,
    directory: boolean,
    file: boolean,
    symlink: boolean,
    name: string,

}

interface ResponseType {
    permission: boolean,
    exception: boolean,
    pathExists: boolean,
    content: mydata[]
}
interface InitialType {
    files: mydata[],
    status: null | string
}

const initialState: InitialType = {
    files: [],
    status: null
}

// thunk function:
export const fetch_files_fun = createAsyncThunk("aria/downloadFileServer", async () => {
    const token: string | null = localStorage.getItem('token');
    const response = await fetch("http://localhost:5000/api/fs/ls", {
        method: "POST",
        headers: {
            'Content-Type': "application/json",
            "Authorization": token as string
        },
        body: JSON.stringify({ targetPath: "/" })
    })
    const json = await response.json();
    return json;
})

const Fetchfiles_slice = createSlice({
    name: "fetch_files",
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(fetch_files_fun.pending, (state) => {
            state.status = "pending";
        })
        builder.addCase(fetch_files_fun.fulfilled, (state, action: PayloadAction<ResponseType>) => {
            state.status = "fullfilled";
            state.files = action.payload.content;
        })
        builder.addCase(fetch_files_fun.rejected, (state) => {
            state.status = "rejected";
        })
    }
})
export default Fetchfiles_slice.reducer;
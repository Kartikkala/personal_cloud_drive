import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface ResponseType {
    guid: string | null,
    active: boolean | null,
    waiting: boolean | null,
}
interface InitialType {
    data: ResponseType | null,
    status: null | string
}

const initialState: InitialType = {
    data: {
        guid: null,
        active: null,
        waiting: null,
    },
    status: null
}

// thunk function:
export const upload_link = createAsyncThunk("aria/downloadFileServer", async (uri: string) => {
    const token = localStorage.getItem('token')
    console.log("upload_link function working");
    const response = await fetch("http://localhost:5000/api/aria/downloadFileServer", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization" : token as string
        },
        body: JSON.stringify({uri})
    })
    const json = await response.json();
    return json;
})

const Linkupload_slice = createSlice({
    name: "link_upload",
    initialState,
    reducers: {
        guiddelete:()=> initialState
    },
    extraReducers: (builder) => {
        builder.addCase(upload_link.pending, (state) => {
            state.status = "pending";
        })
        builder.addCase(upload_link.fulfilled, (state, action: PayloadAction<ResponseType>) => {
            state.status = "fullfilled";
            state.data = action.payload;
        })
        builder.addCase(upload_link.rejected,(state)=>{
            state.status="rejected";
        })
    }
})
export const { guiddelete } = Linkupload_slice.actions
export default Linkupload_slice.reducer;
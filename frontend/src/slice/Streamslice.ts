import { createSlice } from "@reduxjs/toolkit";

const initialState: string | null = null;


const Stream_slice = createSlice({
    name: "Status_update",
    initialState,
    reducers: {
        nullset: () => null,
        changestate: (_state, val) => {
            return val.payload;
        }
    },

})

export const { nullset, changestate } = Stream_slice.actions
export default Stream_slice.reducer;
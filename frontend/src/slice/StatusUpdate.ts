import { createSlice } from "@reduxjs/toolkit";


type ArrayOfObjects = Array<Record<string, unknown>>;
const initialState: ArrayOfObjects = [];
const StatusUpdate_slice = createSlice({
    name: "Status_update",
    initialState,
    reducers: {
        changestate: (_state, obj) => {
            return [obj.payload];
        },
        reversestate: () => initialState
    },

})

export const { changestate, reversestate } = StatusUpdate_slice.actions
export default StatusUpdate_slice.reducer;
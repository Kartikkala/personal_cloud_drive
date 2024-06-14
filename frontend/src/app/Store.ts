import { configureStore } from '@reduxjs/toolkit'
import LinkUploadReducers from '../slice/Link_upload'
import FetchfilesReducers from '../slice/Fetchfiles'
import StateupdateReducers from '../slice/StatusUpdate'
import StreamsliceReducers from '../slice/Streamslice'
import VideofileReducers from '../slice/Videofiles'

export const store = configureStore({
    reducer: {
        link_upload: LinkUploadReducers,
        fetch_files: FetchfilesReducers,
        status_update: StateupdateReducers,
        Stream_slice: StreamsliceReducers,
        Video_file: VideofileReducers
    },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
//  This is a custom type that represents the dispatch function type specific to your store, including any middleware like thunks.
export type AppDispatch = typeof store.dispatch
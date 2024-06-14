import { io, Socket } from 'socket.io-client';

const END: string = "http://localhost:5000";

const socket: Socket = io(END, {
    transportOptions: {
        polling: {
            extraHeaders: {
                'Authorization': localStorage.getItem('token')
            }
        }
    }
});

export default socket;

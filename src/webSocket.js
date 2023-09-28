import { wsEndPoint } from "./constants";

export const makeWebSocketConnection = (session_id) => {   
    
    if(session_id){
        const socket = new WebSocket(`${wsEndPoint}?session_id=${session_id}`);
        socket.onerror = (error) => {
            alert(`Connection error: ${error}`);
        }
        return socket;
    }
    return null;
}
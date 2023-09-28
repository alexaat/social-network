import { serverHost } from "./constants.js";
import {getCookie, SESSION_ID} from './cookies';

export const buildImageUrl = (fileName) => {
    return  `${serverHost}/image?id=${fileName}`
}

// export const getData = (endPoint) => {
//     const session_id = getCookie(SESSION_ID);
//     if(session_id){
//         return fetch(serverHost + `/${endPoint}?` + new URLSearchParams({session_id}),{
//             method: "GET",
//             headers: {
//                 'Accept' : 'application/json'
//             }
//             })
//            .then(resp=>resp.json())                
//     }else{
//         return null;
//     }   
// }


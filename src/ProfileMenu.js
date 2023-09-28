import {useNavigate} from 'react-router-dom';
import {SESSION_ID, deleteCookie, getCookie} from './cookies';
import { serverHost } from './constants';


const ProfileMenu = ({ userName }) => {
    
    //Navigation
    const navigate = useNavigate();


    const showProfileHandler = () => {
        navigate('./profile');
    }

    const signOutHandler = () => {
        const session_id = getCookie(SESSION_ID);

        fetch(serverHost + "/signout?" + new URLSearchParams({ session_id }), {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(resp => resp.json())
        .then(data => {
            if(data){
                console.log(data)
            }
        })
        .catch(err => alert(err))
        
        
        deleteCookie(SESSION_ID);
        navigate('/signin');


    }   
    
    return (
        <div className="profile-menu">
            <div className="profile-menu-item" onClick={showProfileHandler}> {userName} | Show Profile</div>
            <div className="profile-menu-item" onClick={signOutHandler}>Sign Out</div>
        </div>
    )
}

export default ProfileMenu;
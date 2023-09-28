import { useEffect, useState } from "react";
import { getCookie, SESSION_ID } from './cookies';
import { serverHost } from "./constants";
import { useNavigate } from 'react-router-dom';
import NavBar from "./NavBar";
import {ToggleButtonGroup, ToggleButton} from '@mui/material';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';



const ProfilePage = () => {
    //Navigation
    const navigate = useNavigate();

    const [privacy, setPrivacy] = useState('public');

    const [user, setUser] = useState();

    const pivacyChangeHandler = (event, value) => {
        if(value!=null){
            setPrivacy(value); 
            user.privacy = value;

            const session_id = getCookie(SESSION_ID);

            fetch(serverHost+'/user?' + new URLSearchParams({session_id}),
            {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json'
                },
                body: new URLSearchParams({
                    privacy: value
                })
            })
            .then(resp => resp.json())
            .then(data => {
                if(data){
                    if(data.error){
                        alert(data.error.message)
                    }
                }
                console.log(data)
            })
            .catch(err => alert(err));
            

        }
    }    

    useEffect(() => {
        const session_id = getCookie(SESSION_ID);
        if (session_id) {
            //Get profile data
            fetch(serverHost + "/profile?" + new URLSearchParams({ session_id }),
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(resp => resp.json())
                .then(data => {
                    console.log(data)
                    setUser(data.payload.user); 
                    setPrivacy(data.payload.user.privacy); 
                })
                .catch(err => alert(err));

        } else {
            navigate("/signin");
        }

    }, []);

    return (
        <div>
            {/* <NavBar /> */}
            <ToggleButtonGroup
                orientation="vertical"
                value={privacy}
                exclusive
                onChange={pivacyChangeHandler}> 

                <ToggleButton value="public" aria-label="public">
                    <PublicRoundedIcon />
                </ToggleButton>
                <ToggleButton value="private" aria-label="private">
                    <PeopleAltRoundedIcon />
                </ToggleButton>
            </ToggleButtonGroup>

        </div>
    );
}

export default ProfilePage;
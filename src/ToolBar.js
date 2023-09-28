import { useState,  useEffect } from "react";

import { AppBar, Toolbar, IconButton, Typography, Skeleton, Avatar, Menu, MenuItem, Badge, Stack, Divider } from "@mui/material";
import {getCookie, SESSION_ID, deleteCookie} from './cookies';
import { serverHost } from "./constants.js";
import {useNavigate} from 'react-router-dom';
import {buildImageUrl} from './util.js';
import {makeWebSocketConnection} from './webSocket.js';

import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';

//const ToolBar = ({setUser, setPosts, setFollowing}) => {
const ToolBar = (props) => {

    //Navigation
    const navigate = useNavigate(); 
    
    const [user, setUser] = useState();

    //Profile Icon
    const [profileAncorEl, setProfileAncorEl] = useState(null);
    const profileOpen = Boolean(profileAncorEl);
    const profileHandleClose = () =>  setProfileAncorEl(null);
    const handleProfileItemClick = (destination) => {

        profileHandleClose();        
        switch(destination){
            case 'profile':
              navigate("/profile");
            break;
    
            case 'signout': 
                const session_id = getCookie(SESSION_ID);
                if(!session_id){
                    navigate('/signin'); 
                    return;
                }

                fetch(serverHost + "/signout?" + new URLSearchParams({ session_id }), {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(resp => resp.json())
                .then(data => {
                    if(data){
                        if(data.error){
                            alert(data.error);
                        }                      
                    }
                })
                .catch(err => alert(err));                
                
                deleteCookie(SESSION_ID);
                navigate('/signin');
            break;
          }
    }
    const profileHadleClick = e => setProfileAncorEl(e.currentTarget);
    

    //Notification Icon
    const [newNotifications, setNewNotifications] = useState(5);
    const [notifications, setNotifications] = useState();
    const handleNotificationsClick = e => setNotificationsAncorEl(e.currentTarget)
    const [notificationsAncorEl, setNotificationsAncorEl] = useState(null);
    const notificationsHandleClose = (id) => {
        setNotificationsAncorEl(null);
        console.log(id);
    }

    const openNotifivations = Boolean(notificationsAncorEl);

    useEffect(() => {

        const session_id = getCookie(SESSION_ID);
        if(session_id){

            fetch(serverHost + "/user?" + new URLSearchParams({session_id}),{
            method: "GET",
            headers: {
                'Accept' : 'application/json'
            }
            })
           .then(resp=>resp.json())
           .then(data=>{
                if(!data){                   
                    throw new Error("Couldn't fetch data: No data prop");                     
                }
                if(data.error){
                    throw new Error(data.error.message);
                }
                if(!data.payload){
                    throw new Error("Couldn't fetch data: No payload prop");    
                }
                props.setUser(data.payload);
                setUser(data.payload);
                const socket = makeWebSocketConnection(session_id);
                socket.onmessage = (message) => {
                    console.log(`message: ${message.data}`)    
                    const m = JSON.parse(message.data);
                    const type = m.type;           
                    if(type === 'notification'){
                        //setRefreshNotifications(!refreshNotifications);
                    }    
                    if(type === 'approve_follower'){            
                        //updateFollowers();
                    }
                }
            })
           .catch(err => alert(err));

           //Get Posts
           fetch(serverHost + "/posts?" + new URLSearchParams({session_id}),{
            method: "GET",
            headers: {
                'Accept' : 'application/json'
            }
            })
           .then(resp=>resp.json())
           .then(data=>{
                if(!data){                   
                    throw new Error("Couldn't fetch data. No data prop");                     
                }
                if(data.error){
                    throw new Error(data.error.message);
                }
                if(!data.payload){
                    throw new Error("Couldn't fetch data.  No payload prop");    
                }
                props.setPosts(data.payload);
           })
           .catch(err => alert(err));

           //Get Following          
            fetch(serverHost+'/following?' + new URLSearchParams({ session_id }),{
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(resp => resp.json())
            .then(data => {
                if(!data){                   
                    throw new Error("Couldn't fetch data. No data prop");                     
                }
                if(data.error){
                    throw new Error(data.error.message);
                }
                if(!data.payload){
                    throw new Error("Couldn't fetch data. No payload prop");    
                }
                props.setFollowing(data.payload);                             
                
            })
            .catch(err => alert(err)); 

            //Get Notifications
            fetch(
                serverHost + "/notifications?" + new URLSearchParams({session_id}),
                    {
                        method: 'GET',
                        headers: {
                            'Accept' : 'application/json'
                        }
                    }   
                )
                .then(resp =>resp.json())
                .then(data => {                         
                        if(!data){                   
                            throw new Error("Couldn't fetch data. No data prop");                     
                        }
                        if(data.error){
                            throw new Error(data.error.message);
                        }
                        if(!data.payload){
                            throw new Error("Couldn't fetch data. No payload prop");    
                        }                        
                        setNotifications(data.payload)
                        setNewNotifications((data.payload.filter(item => !item.is_read)).length);                      
                    }
    
                )
                .catch(err => alert(err));

        }else{
            navigate("/signin");
        }
    },[]);

    console.log(notifications);

    return (   
        <AppBar position="static">
        <Toolbar>  

            <Typography variant="h6" sx={{width: '100%'}}>NAVIGATION</Typography>

            <Badge badgeContent={newNotifications} color='secondary' sx={{mr: 2}}>
                <IconButton sx={{background: '#eeeeee'}}
                    aria-label="notifications"
                    onClick={handleNotificationsClick}
                    aria-controls={openNotifivations ? 'notifications-menu': undefined }
                    aria-haspopup = 'true'
                    aria-expanded = {openNotifivations ? 'true' : undefined}
                    > 
                    <NotificationsRoundedIcon/>
                </IconButton>
            </Badge>

             <IconButton aria-label="user icon" sx={{width: '48px', height: '48px', background: '#eeeeee'}} onClick={profileHadleClick}>
                {
                    user
                    ?
                        <Avatar
                             alt="avatar"
                             sx={{width: '48px', height: '48px'}}
                             src={
                                user.avatar ? buildImageUrl(user.avatar) : ''
                              }>
                                {!user.avatar ? `${user.first_name.charAt(0)} ${user.last_name.charAt(0)}`: ''}
                              </Avatar>
                    :
                         <Skeleton variant="circular" width={48} height={48} />
                }
            </IconButton>            
        </Toolbar>

        <Menu
             open={profileOpen}
             anchorEl={profileAncorEl}
             onClose={profileHandleClose}
             anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}            
             >           
            
            <MenuItem onClick={() => handleProfileItemClick('profile')}>Profile</MenuItem>
            <MenuItem onClick={() => handleProfileItemClick('signout')}>Sign Out</MenuItem>
        </Menu>

        <Menu
             open={openNotifivations}
             anchorEl={notificationsAncorEl}
             onClose={notificationsHandleClose}
             anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
        >

                <Stack spacing={2} sx={{ml: 2, mr: 8}}>
                    <Typography variant="h5">
                        Notifications
                    </Typography>
                   
                </Stack>
                <Divider/> 

                    {notifications &&
                        notifications.map(noti => {
                            return <MenuItem onClick={() => notificationsHandleClose(noti.id)} key={noti.id}>{noti.content}</MenuItem>
                        })                    
                    }
        </Menu>

    </AppBar>
    )
}

export default ToolBar;
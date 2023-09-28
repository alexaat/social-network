import ProfileButton from "./ProfileButton";
import ProfileMenu from "./ProfileMenu";
import defaultAvatar from './assets/new_avatar_icon.svg';
import { serverHost } from "./constants";
import { useState, useEffect } from "react";
import {getCookie, SESSION_ID} from './cookies';
import {useNavigate} from 'react-router-dom';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import { IconButton, Menu, MenuItem, Stack, Typography, Divider, Badge, Dialog, DialogContent,DialogTitle, DialogActions, Button, setRef } from "@mui/material";
import { makeWebSocketConnection } from "./webSocket";

const NavBar = ({updateFollowers}) => {


    //Navigation
    const navigate = useNavigate();

    // const socket = makeWebSocketConnection();


    // if(socket!==null){
    //     socket.onmessage = (message) => {
    //         console.log(`message: ${message.data}`)
    
    //         const m = JSON.parse(message.data);
    //         const type = m.type;
           
    //         if(type === 'notification'){
    //             setRefreshNotifications(!refreshNotifications);
    //         }
    
    //         if(type === 'approve_follower'){            
    //             updateFollowers();
    //         }
    //     }
    // }




    const [showMenu, setShowMenu] = useState(false);
    const [user, setUser] = useState({avatar: defaultAvatar, name: ''});
    const [avatar, setAvatar] = useState(defaultAvatar);
    const [name, setName] = useState('');




    //Followers
    const [following, setFollowing] = useState();
    const [downloadFollowers, setDownloadFollowers] = useState(false);

    //Notification
    const [ancor, setAncor] = useState(null);
    const handleNotificationsClick = (event) => {
        setAncor(event.currentTarget);
    }
    const openNotifivations = Boolean(ancor);
    const handleCloseNotifications = () => {
        setAncor(null);
    }
    const [notifications, setNotifications] = useState();
    const [newNotifications, setNewNotifications] = useState(0);
    const handleClickNotification = (id) => {
        setOpenApprovalDialog(true);
        handleCloseNotifications();
    }
    const [refreshNotifications, setRefreshNotifications] = useState(false);

    //Approval of followes
    const [openApprovalDialog, setOpenApprovalDialog] = useState(false);

    const approveFollowerHandler = () => {
        sendApprovalRequest(true);
        setOpenApprovalDialog(false);

    }
    const rejectFollowerHandler = () => {
        sendApprovalRequest(false);
        setOpenApprovalDialog(false);
    }

    const sendApprovalRequest = (approve) => {
        const session_id = getCookie(SESSION_ID);
        if(session_id){

            let headers = new Headers();
            headers.append('Accept', 'application/json');
            headers.append('Content-Type','application/x-www-form-urlencoded');

            fetch(serverHost + "/followers?" + new URLSearchParams({session_id}), {
                method: 'POST',
                headers: headers,
                body: new URLSearchParams({
                    approve,
                    follower: 2
                })

            })
            .then(resp => resp.json())
            .then(data => console.log(data))
            .catch(err => alert(err));
        }else{
            navigate("/signin"); 
        }
    }



    //Get user
    useEffect(()=>{
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
                    throw new Error("Couldn't fetch data");                     
                }
                if(data.error){
                    throw new Error(data.error.message);
                }
                if(!data.payload){
                    throw new Error("Couldn't fetch data");    
                }
                setAvatar(data.payload.avatar);
                setName(data.payload.first_name + " " + data.payload.last_name);
           })
           .catch(err => alert(err));
        }else{
            navigate("/signin");
        }
    },[]);


    //Get Notifications
    useEffect(() => {
        const session_id = getCookie(SESSION_ID);
        if(session_id){
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
            .then(data =>
                { 
                    console.log(data)
                    if(data){
                        if(data.payload){
                            setNotifications(data.payload)
                            setNewNotifications((data.payload.filter(item => !item.is_read)).length)
                        }
                    }                  
                }

                )
            .catch(err => alert(err));
        }else{
            navigate("/signin");
        }
    },[refreshNotifications]);


    //Get Followers
    useEffect(() => {
        const session_id = getCookie(SESSION_ID);
        if(session_id){
            fetch(serverHost+'/following?' + new URLSearchParams({ session_id }),{
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(resp => resp.json())
            .then(data => {
                if(data){
                    console.log(`DATA: ${JSON.stringify(data)}`);
                    if(data.error){
                        throw new Error(`${data.error}`)
                    }
                    if(data.payload){
                        setFollowing(data.payload);
                    }                      
                }
            })
            .catch(err => alert(err));        
        } else {        
            navigate("/signin");
        }
    },[downloadFollowers]);




    return (        
        <div className="navigation-bar-container">
            Navigation
            <ProfileButton clickHandler={() => setShowMenu(!showMenu)} icon={avatar} tooltip="Menu"/>
            

            <Badge badgeContent={newNotifications} color='primary'>
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

            <Menu
                id="notifications-menu"
                open={openNotifivations}
                anchorEl={ancor}
                onClose={handleCloseNotifications}
                MenuListProps={{
                    'aria-labelledby' : 'notifications-button'
                }}              
                >   <Stack spacing={2} sx={{ml: 2, mr: 8}}>
                        <Typography variant="h5">
                             Notifications
                        </Typography>
                   
                    </Stack>
                    <Divider/> 
                    
                    {notifications &&
                        notifications.map(noti => {
                            return <MenuItem onClick={() => handleClickNotification(noti.id)} key={noti.id}>{noti.content}</MenuItem>
                        })                    
                    }
            </Menu>
           
            {showMenu && <ProfileMenu userName={name}/>}


            <Dialog open={openApprovalDialog}>
                <DialogTitle>Approve Follower</DialogTitle>
                <DialogContent>
                    Approve Bob                
                </DialogContent>
                <DialogActions>
                    <Button onClick={approveFollowerHandler}>Approve</Button>
                    <Button onClick={rejectFollowerHandler}>Reject</Button>
                </DialogActions>
            </Dialog>

        </div>    
     );
}
 
export default NavBar;
import {Dialog, DialogContent, Button, Typography, Stack, Box, Snackbar, Alert}  from '@mui/material';
import { AUTHORIZATION, serverHost } from './constants';
import { getCookie, SESSION_ID } from './cookies';
import { useNavigate } from 'react-router-dom';
import {useState} from 'react';



const UserDetailsDialog = ({open, setOpen, post, isFollowing, updateFollowers}) => {

    const nick = post.user.nick_name ?  post.user.nick_name :  post.user.first_name + ' ' + post.user.last_name;

    //Navigation
    const navigate = useNavigate();
   
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    
    const setFollow = () => {
        const session_id = getCookie(SESSION_ID);
        if(!session_id){
            navigate("/signin");
            return;
        }

        if (isFollowing === true){
            //Unfollow

            fetch(serverHost+'/following?' + new URLSearchParams({session_id,  follow: post.user.id}),
            {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(resp=>resp.json())
            .then(data => {
                if(data){                 
                    if(data.error){
                        console.log(data.error)
                    }else{
                        updateFollowers();
                    }                      
                }
            })
            .catch(err =>{
                alert(err);
            });

        }else if (isFollowing === undefined){
            fetch(serverHost+'/following?' + new URLSearchParams({session_id}),
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: new URLSearchParams({
                    follow: post.user.id
                })
            })
            .then(resp=>resp.json())
            .then(data => {
                if(data){
                    console.log(data)
                    if(data.error){
                        if(data.error.type === AUTHORIZATION){
                           setSnackBarOpen(true);
                           updateFollowers();
                        }else{
                            alert(data.error)
                        }
                    }
                    
                    if(!data.error){                     
                      updateFollowers();                    
                    }
                }
            })
            .catch(err =>{
                alert(err);
            });
        }

        setOpen(false);       
    }

    return (
        <>
            <Dialog open={open} >
                <DialogContent sx={{width: 350, height: 160 }}>
                    <Box>
                        <Typography varianr='h6'>{post.user.first_name}</Typography>                   
                    </Box>

                    <Stack direction='row' sx={{position: 'absolute', bottom: '8px', right: 0}}>
                       
                        {isFollowing === undefined && <Button onClick={setFollow} sx={{mr: 2}}>Follow</Button> }
                        {isFollowing === true && <Button onClick={setFollow} sx={{mr: 2}}>Unfollow</Button> }
                        {isFollowing === false && <Button onClick={setFollow} sx={{mr: 2}} disabled >Pending</Button> }                 


                        <Button onClick={() => setOpen(false)}  sx={{mr: 2}}>Close</Button>
                    </Stack>
                </DialogContent>
            </Dialog>

            <Snackbar
                open={snackBarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackBarOpen(false)}
                message={`Follow request is sent to ${nick}`}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackBarOpen(false)} severity="info" sx={{ width: '100%' }}>
                    {`Follow request has been sent to ${nick}`}
                </Alert>
            </Snackbar>
        </>
     );


}
 
export default UserDetailsDialog;
import { useEffect, useState } from "react";
import { INVALID_USER_FORMAT, NO_USER_FOUND } from "./constants";
import {Link} from 'react-router-dom';
import { serverHost } from "./constants";
import {SESSION_ID, setCookie} from './cookies';
import {useNavigate} from 'react-router-dom';
import {Button, Box, Divider, Stack, TextField, Card, CardContent, CardMedia, Skeleton} from '@mui/material';

const SignIn = () => {

    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [userError, setUserError] = useState('');
    const [signInError, setSignInError] = useState('');
    const [imageLoaded, setImageLoaded] = useState(false);
    const [img, setImg] = useState({});

    //Navigation
    const navigate = useNavigate();

    const clearErrors = () => {
        setUserError('');
        setSignInError('');
    }

    const signInHandler = () => {

        clearErrors();

        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type','application/x-www-form-urlencoded');

        fetch(serverHost + '/signin', {
            method: 'POST',
            headers: headers,
            body: new URLSearchParams({
                user, password
            })
        })
        .then(resp => resp.json())
        .then(data => {
            if(data.error){

                switch(data.error.type){
                    case INVALID_USER_FORMAT:
                        setUserError(data.error.message);
                        
                    break;
                    case NO_USER_FOUND:
                        setSignInError(data.error.message);
                        break;
                    default:
                        alert(data.error.message);
                }           
            }
            if(data.payload){
               
                const session_id = data.payload.session_id;                

                if(session_id){
                    setCookie(SESSION_ID, session_id, 1);
                    navigate("/");
                }else{
                    throw new Error('Could not obtain session id');
                }
            }
        })
        .catch(err => {
            alert(err);
        });
    }

    useEffect(() => {
        const image = new Image(); 
        image.onload = () => setImageLoaded(true);
        image.src = "https://source.unsplash.com/random";
        setImg(image);
    },[]); 


    return (
            <Card sx={{width: 350, backgroundColor: 'white', position: 'absolute', top: '10%', right: '15%'}}>
                
                {
                    imageLoaded ?
                    <CardMedia
                        height="140px"
                        component="img"
                        src='https://source.unsplash.com/random'
                        alt="sign in image"
                    /> 
                    :
                    <Skeleton variant="rectangular" height={140}/> 
                }

                <CardContent sx={{p:2}}>
                    <Stack direction="column" spacing={2}>            
                        <TextField label="Username or Email" onChange={e=> setUser(e.target.value)} value={user} required error={userError!=''} helperText={userError}/>
                        <TextField label="Password" value={password} onChange={e=>setPassword(e.target.value)} type="password" required error={signInError!=''} helperText={signInError}/>
                        <Button variant="contained" onClick={signInHandler} size="large">Sign In</Button>           
                        <Divider/>
                        <Box sx={{display: "flex", justifyContent: "center"}} >  
                            <Link to="/signup" >
                                <Button variant="contained" size="medium" color="success">Create New Account</Button>               
                            </Link>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

        // <div className="signin-container">
            
        //     <Box sx={{width: '100%', mb: 2}}>
        //     <div className="error-message" id="error-message-sign-in-user">{userError}</div>
        //     <input type="text" placeholder="username or email" onChange={e=> setUser(e.target.value)} value={user}></input>    
        //     <input type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)}></input> 
        //     <div className="error-message" >{signInError}</div>
        //     {/*<input type="button" value="Sign In" id="signin-submit" className="submit-button" onClick={signInHandler}></input> */}
        //     <Button variant="contained" onClick={signInHandler} size="large">Sign In</Button>
        //     </Box>
        //     <Divider/>
        //     <Box m="auto">  
        //     {/*<div className="button-container">*/}
        //         <Link to="/signup" >
        //             <Button variant="contained" size="medium" color="success">Create New Account</Button>
        //             {/*<input type="button" value="Create New Account" id="new-account-submit"></input>*/}
        //         </Link>
        //     </Box>
        //     {/*</div>*/}


        // </div>
      );
}
 
export default SignIn;
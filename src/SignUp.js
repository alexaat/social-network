import { useState, useEffect } from "react";
import icon from './assets/new_avatar_icon.svg';
import {Link} from 'react-router-dom';
import CropEasy from './crop/CropEasy';
import {INVALID_FIRST_NAME_FORMAT, INVALID_LAST_NAME_FORMAT, INVALID_NICK_NAME_FORMAT, INVALID_DATE_FORMAT, INVALID_EMAIL, INVALID_PASSWORD, INVALID_ABOUT_ME, IMAGE_UPLOAD_ERROR} from './constants';
import {SESSION_ID, setCookie} from './cookies';
import {useNavigate} from 'react-router-dom';
import { serverHost } from "./constants";
import { Card, CardContent, TextField, Stack, Button, Divider, Box, IconButton, Avatar, CardMedia, Skeleton} from "@mui/material";
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';

const SignUp = () => {
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [nickName, setNickName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [about, setAbout] = useState('');
    const [openCrop, setOpenCrop] = useState(false);
    const [photoURL, setPhotoURL] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);

    const [imageType, setImageType] = useState('');

    const [imageLoaded, setImageLoaded] = useState(false);
    const [img, setImg] = useState({});

    //Validation
    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [nickNameError, setNickNameError] = useState('');
    const [dateError, setDateError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [aboutMeError, setAboutMeError] = useState('');

    //Navigation
    const navigate = useNavigate();

    const signUpHandler = () => {     

        setFirstNameError('');
        setLastNameError('');
        setNickNameError('');
        setDateError('');
        setEmailError('');
        setPasswordError('');
        setAboutMeError('');


        let headers = new Headers();
        headers.append('Accept', 'application/json');
      
        const formData = new FormData();
        if(croppedImage){
            formData.append('image', croppedImage);  
        }    
        formData.append('firstName', firstName);  
        formData.append('lastName', lastName);  
        formData.append('nickName', nickName);  
        formData.append('dateOfBirth', dateOfBirth);  
        formData.append('email', email);  
        formData.append('password', password);  
        formData.append('about', about); 

        fetch(serverHost + '/signup', {
            method: 'POST',
            headers: headers,
            body: formData
        })
        .then(resp => resp.json())
        .then(data => {

            if(data.error){
                switch(data.error.type){
                    case IMAGE_UPLOAD_ERROR: 
                        alert(data.error.message);
                    break;
                    case INVALID_FIRST_NAME_FORMAT:
                        setFirstNameError(data.error.message); 
                    break;
                    case INVALID_LAST_NAME_FORMAT:
                        setLastNameError(data.error.message); 
                    break;
                    case INVALID_NICK_NAME_FORMAT:
                        setNickNameError(data.error.message); 
                    break;
                    case INVALID_DATE_FORMAT:
                        setDateError(data.error.message); 
                    break;
                    case INVALID_EMAIL:
                        setEmailError(data.error.message); 
                    break;
                    case INVALID_PASSWORD:
                        setPasswordError(data.error.message); 
                    break;
                    case INVALID_ABOUT_ME:
                        setAboutMeError(data.error.message); 
                    break;                    
                    default:
                        alert(data.error.type + ". " + data.error.message);
                }
                return;
            }           
            
            if(data.payload){
                const session_id = data.payload.session_id;
                if(session_id){
                    //Set cookie
                    setCookie(SESSION_ID, session_id, 1);

                    //Navigate to home page
                    navigate("/");

                }else{
                    throw new Error('Could not obtain session id');
                }                
            }
        })
        .catch(error=>alert(error));    
    }

    const selelectedImageHandler = (e) => {
        let file = e.target.files[0]
        let fileType = file.type;
        if(fileType === 'image/jpeg' || fileType === 'image/png' || fileType === 'image/webp'){
            setImageType(fileType);
            setPhotoURL(URL.createObjectURL(file));        
            setOpenCrop(true); 
        }else if (fileType === 'image/gif') {
            setCroppedImage(file);  
        }else{
            alert('error: Wrong image format')
        }
    }

    useEffect(() => {
        const image = new Image(); 
        image.onload = () => setImageLoaded(true);
        image.src = "https://source.unsplash.com/random";
        setImg(image);
    },[]); 


    return ( 
        
        <>
        <Card  sx={{width: 350, backgroundColor: 'white', position: 'absolute', top: '10%', right: '15%'}}>
            
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
            
            <CardContent>
                <Stack spacing={2}>
                    <IconButton
                         aria-label="user icon"
                         sx={{width: '72px', height: '72px', background: '#eeeeee'}}
                         onClick={() => {
                            let input = document.getElementById('input-avatar')
                            input.value = '';
                            input.click();
                        }}>
                         <input type="file" name="avatar"  accept="image/*" onChange={selelectedImageHandler} id="input-avatar"/>
                         {
                            (croppedImage &&  <Avatar alt="avatar" sx={{width: '72px', height: '72px'}} src={URL.createObjectURL(croppedImage)}/>) || <PersonAddAltRoundedIcon  sx={{width: '56px', height: '56px'}}/>
                         }             
                       
                    </IconButton>

                    <TextField label="First Name" onChange={e=> setFirstName(e.target.value)} value={firstName} required error={firstNameError!=''} helperText={firstNameError}/>
                    <TextField label="Last Name" onChange={e=> setLastName(e.target.value)} value={lastName} required error={lastNameError!=''} helperText={lastNameError}/> 
                    <TextField label="Nickname (Optional)" onChange={e=> setNickName(e.target.value)} value={nickName} error={nickNameError!=''} helperText={nickNameError}/>
                    <TextField label="Date of birth"
                               type="text"
                               onFocus={e => e.target.type='date'}
                               onBlur={e => e.target.type='text'}
                               onChange={e => setDateOfBirth(e.target.value)}                                
                               value={dateOfBirth}
                               error={dateError!=''}
                               helperText={dateError}
                               required/>
                    
                    <TextField label="Email" type='email' onChange={e=> setEmail(e.target.value)} value={email} error={emailError!=''} helperText={emailError} required/>
                    <TextField label="Password"  type="password" onChange={e=> setPassword(e.target.value)} value={password} error={passwordError!=''} helperText={passwordError} required/>
                    <TextField label="About me (optional)" onChange={e=> setAbout(e.target.value)} value={about} error={aboutMeError!=''} helperText={aboutMeError} multiline/>
                    <Button variant="contained" size="large" onClick={signUpHandler}>Sign Up</Button>
                    <Divider/>
                    <Box sx={{display: "flex", justifyContent: "center"}} >  
                            <Link to="/signin" >
                                <Button variant="contained" size="medium" color="success">Already Have Account</Button>               
                            </Link>
                        </Box>

                </Stack>
            </CardContent>
        </Card>
        <CropEasy {...{photoURL, setOpenCrop, setPhotoURL, setCroppedImage}} open={openCrop} setOpen={setOpenCrop} imageType={imageType}/>  
        
     
        {/* <div className="signup-container">     

            <input type="file" name="avatar" onChange={selelectedImageHandler} id="input-avatar"></input>
            <img src={(croppedImage && URL.createObjectURL(croppedImage)) || icon} alt="add avatar" onClick={() => {
                let input = document.getElementById('input-avatar')
                input.value = '';
                input.click();
            }}/>
            <div className="error-message">{firstNameError}</div>
            <input type="text" placeholder="First Name" onChange={e=> setFirstName(e.target.value)} value={firstName}></input>
            <div className="error-message">{lastNameError}</div>    
            <input type="text" placeholder="Last Name" onChange={e=> setLastName(e.target.value)} value={lastName}></input> 
            <div className="error-message">{nickNameError}</div>   
            <input type="text" placeholder="Nickname (Optional)" onChange={e=> setNickName(e.target.value)} value={nickName}></input> 

            <div className="input-label-container">
                <div className="error-message">{dateError}</div>   
                <div  className="input-label">Date of Birth</div>
            </div>
            <input type="date" onChange={e=> setDateOfBirth(e.target.value)} value={dateOfBirth}></input> 
           
            <div className="error-message">{emailError}</div>    
            <input type="email" placeholder="email" onChange={e=> setEmail(e.target.value)} value={email}></input> 
            <div className="error-message">{passwordError}</div>    
            <input type="password" placeholder="password" onChange={e=> setPassword(e.target.value)} value={password}></input> 
            <div className="error-message">{aboutMeError}</div>  
            <textarea placeholder="about me (optional)" onChange={e=> setAbout(e.target.value)} value={about}></textarea>
            <input type="button" value="Sign Up" id="signup-submit" onClick={signUpHandler}></input>  
            <hr/>
            <div className="button-container">
                <Link to="/signin">
                    <input type="button" value="Already Have Account" id="new-account-submit"></input>
                </Link>
            <CropEasy {...{photoURL, setOpenCrop, setPhotoURL, setCroppedImage}} open={openCrop} setOpen={setOpenCrop} imageType={imageType}/>            
            </div> 
        </div> */}
        </>
    );
}
 
export default SignUp;
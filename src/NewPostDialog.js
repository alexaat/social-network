import {Dialog, DialogContent, Button, Box, Stack, Typography, IconButton, Divider, TextField} from '@mui/material';
import ProfileButton from './ProfileButton';
import { serverHost, PRIVACY_PUBLIC, PRIVACY_FRIENDS, PRIVACY_SPECIFIC_FRIENDS } from "./constants";
import { useState } from 'react';
import SpeciificFriendsDialog from './SpecificFriendsDialog';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';

const NewPostDialog = ({open, closeDialogHandler, user }) => {

    const [content, setContent] = useState('');
    const [privacy, setPrivacy] = useState('public');
    const [image, setImage] = useState(null);
    const [showSpecificFriendsDialog, setShowSpecificFriendsDialog] = useState(false);
    const [specificFriendIds, setSpecificFriendIds] = useState([]);



    const nick = user.nick_name ? user.nick_name : `${user.first_name} ${user.last_name}`; 

    const setPrivacyHandler = (e) => {
        const privacy = e.target.value
        setPrivacy(privacy);
        if(privacy === PRIVACY_SPECIFIC_FRIENDS){
            setShowSpecificFriendsDialog(true);
        }
    }

    const submitPostHandler = () => {
        //Reset state
        setContent('');
        setPrivacy(PRIVACY_PUBLIC)
        setImage(null);
        setSpecificFriendIds([]);
        
        closeDialogHandler();

        let headers = new Headers();
        headers.append('Accept', 'application/json');
       
        const formData = new FormData();
        if(image){
            formData.append('image', image);  
        }    
        formData.append('content', content);  
        formData.append('privacy', privacy);
        formData.append('specific_friends', specificFriendIds);
        
        //Update this later
        formData.append('user_id', user.id);  

        fetch(serverHost+"/post",
        {
            method: 'POST',
            body: formData,
            headers: headers
        })
        .then(resp => resp.json())
        .then(data => {
            console.log(data);
        })
        .catch(err => alert(err));

    }

    const selelectedImageHandler = (e) => {      
        let file = e.target.files[0];
        let fileType = file.type;
        if(fileType.startsWith('image/')){
            const url = URL.createObjectURL(file);
            // const el = document.getElementById("new-post-image");
            // el.style.backgroundImage = `url("${url}")`;
            // el.style.backgroundSize='cover';
            // //Get image dimentions
            // var img = new Image;
            // img.onload = function() {              
            //     //Get element width
            //     const w = el.clientWidth;              
            //     //Calculate container height
            //     const h = img.height/img.width*w;
            //     el.style.height = `${h}px`;
            //     URL.revokeObjectURL(img.src);
            // };
            // img.src = url;
            setImage(file);
        }else{
            alert('error: Wrong image format')
        }
    }

    const closeDialogHanddlerLocal = () => {
        setImage(null);
        setContent('');
        closeDialogHandler();
    }


    //Specific Friends Dialog Handlers
    const cancelHandler=()=>{       
        setShowSpecificFriendsDialog(false);
        const el = document.querySelector('.post-privacy');
        el.value=PRIVACY_PUBLIC;
        setPrivacy(PRIVACY_PUBLIC);           
    };
    const saveHandler=(ids)=>{
        setShowSpecificFriendsDialog(false);
        setSpecificFriendIds(ids);    
    };

    return ( 
        <>
            <Dialog open={open}>
                <DialogContent
                    dividers
                    sx={{
                    padding: 0,   
                    background: 'white',
                    position: 'relative',
                    minHeight: 400,
                    width: '500px',
                    minWidth: { sm: 500 },
                }}>

                <Box sx={{mt: 1, mb: 2, width: '100%'}}>                    
                    <Stack direction="row" sx={{height: '56px'}}>
                        <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <Typography variant="h5" sx={{textAlign: 'center'}}>Create Post</Typography>
                        </Box>
                      
                        <IconButton onClick={closeDialogHanddlerLocal}  sx={{backgroundColor: '#eeeeee', width: '32px', height: '32px', mr: 1}}>
                            <CloseRoundedIcon/>
                        </IconButton>
                    </Stack>

                    <Divider/>

                    <Box sx={{px: 2}}>
                        <Box sx={{display: 'flex', alignItems: 'center', mt: 1}}>
                            <ProfileButton icon={user.avatar}/>  
                            <div className='new-post-user-info-container'>
                                <div className='name-label'>{nick}</div>
                                <div className="select-wrapper">   
                                    <select name="post-privacy" className='post-privacy'  onChange={setPrivacyHandler}>
                                        <option value={PRIVACY_PUBLIC} defaultValue >{PRIVACY_PUBLIC}</option>
                                        <option value={PRIVACY_FRIENDS}>{PRIVACY_FRIENDS}</option>
                                        <option value={PRIVACY_SPECIFIC_FRIENDS}>{PRIVACY_SPECIFIC_FRIENDS}</option>                                   
                                    </select>                                
                                </div> 
                            </div>                          
                        </Box> 
                        <Box sx={{
                                width: '100%',
                                minHeight: '170px',
                                background: '#eeeeee',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mt: 2,                            
                                border: 1,
                                borderRadius: '4px',
                                borderColor: '#dddddd',
                                '&:hover': {
                                    cursor: 'pointer',
                                    borderColor: '#555555',
                                }}}
                                onClick={() => {
                                    let input = document.getElementById('new-post-input-image')
                                    input.value = '';
                                    input.click();
                                }}                              
                                >
                                <input type="file" id='new-post-input-image' onChange={selelectedImageHandler} accept="image/*"/>
                               
                                {
                                    (image && <Box component='img' sx={{width: '100%', height: '100%', backgroundSize: 'cover'}} src={URL.createObjectURL(image)}></Box>) ||
                                    <IconButton  aria-label="post image" disableRipple>
                                        <ImageRoundedIcon sx={{width: '56px', height: '56px'}}/>                                   
                                    </IconButton>

                                }
                               
                                {/* <IconButton  aria-label="post image" disableRipple>
                                    {
                                      (image && <Box component='img' sx={{width: '100%', height: '100%', backgroundSize: 'cover'}} src={URL.createObjectURL(image)}></Box>) || <ImageRoundedIcon sx={{width: '56px', height: '56px'}}/>
                                    }
                                </IconButton> */}
                        </Box>

                        <TextField
                                sx={{width : '100%', mt: 2}}
                                placeholder={`What't on your mind, ${user.first_name}?`}
                                multiline
                                rows={7}
                                onChange={(e)=>{setContent(e.target.value)}}
                                value={content}
                                InputProps={{ sx: { borderRadius: '4px'} }}
                        />

                        <Button
                            variant="contained"
                            sx={{ width: 1, mt: 2 }} 
                            onClick={submitPostHandler}                                     
                        >
                            <Typography variant='h6'>Post</Typography>
                        </Button>
                    </Box>                    
                </Box>


                    {/* <Stack direction="row" sx={{mb: 2, mx: 1}}>
                        <Typography variant="h5" sx={{width: '100%', textAlign: 'center'}}>Create Post</Typography>
                        <IconButton onClick={closeDialogHandler}  sx={{backgroundColor: '#eeeeee', width: '32px', height: '32px'}}>
                            <CloseRoundedIcon onClick={closeDialogHandler}/>
                        </IconButton>
                    </Stack> */}
                    {/* <div className="dialog-header">
                        <div>Create Post</div>
                        <div className="icon-close" onClick={closeDialogHandler}></div>
                    </div> */}
                    {/* <Divider/> */}

                    {/* <Box sx={{p: 2}}> */}
                        {/* <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                            <ProfileButton icon={user.avatar}/>  
                            <div className='new-post-user-info-container'>
                                <div className='name-label'>{nick}</div>
                                <div className="select-wrapper">   
                                    <select name="post-privacy" className='post-privacy'  onChange={setPrivacyHandler}>
                                        <option value={PRIVACY_PUBLIC} defaultValue >{PRIVACY_PUBLIC}</option>
                                        <option value={PRIVACY_FRIENDS}>{PRIVACY_FRIENDS}</option>
                                        <option value={PRIVACY_SPECIFIC_FRIENDS}>{PRIVACY_SPECIFIC_FRIENDS}</option>                                   
                                    </select>                                
                                </div> 
                            </div>                          
                        </Box>                        */}

                        {/* <Box sx={{width: '100%', minHeight: '150px', background: '#eeeeee'}} >
                            <input type="file" id='new-post-input-image' onChange={selelectedImageHandler} accept="image/*"/>
                            <IconButton
                                aria-label="post image"                              
                                onClick={() => {
                                    let input = document.getElementById('new-post-input-image')
                                    input.value = '';
                                    input.click();
                            }}>
                                <input type="file" name="avatar"  accept="image/*" onChange={selelectedImageHandler} id="input-avatar"/>
                                {
                                 (image && <Box component='img' src={image}></Box> ) || <ImageRoundedIcon sx={{width: '56px', height: '56px'}}/>
                                //  (croppedImage &&  <Avatar alt="avatar" sx={{width: '72px', height: '72px'}} src={URL.createObjectURL(croppedImage)}/>) || <PersonAddAltRoundedIcon  sx={{width: '56px', height: '56px'}}/>
                                }             
                       
                            </IconButton> */}
                            {/* <div id='new-post-image' onClick={()=>{
                                let input = document.getElementById('new-post-input-image');
                                input.value = '';
                                input.click();
                            }}></div> */}

                            {/* <TextField
                                sx={{width : '100%'}}
                                placeholder={`What't on your mind, ${user.first_name}?`}
                                multiline
                                rows={7}
                                onChange={(e)=>{setContent(e.target.value)}}
                                value={content}
                                InputProps={{ sx: { borderRadius: '4px'} }}
                                /> */}

                            {/* <textarea
                                placeholder={`What't on your mind, ${user.first_name}?`}
                                className='input-textarea'
                                rows={7} 
                                onChange={(e)=>{setContent(e.target.value)}}
                                value={content}></textarea> */}
                        {/* </Box>                                       */}
                        
                        {/* <Button
                            variant="contained"
                            sx={{ width: 1, mt: 1 }} 
                            onClick={submitPostHandler}                                     
                        >
                            Post
                        </Button>
                    </Box> */}


                    
                </DialogContent>
            </Dialog>

            <SpeciificFriendsDialog
                open={showSpecificFriendsDialog} 
                onGoBackHandler={cancelHandler}
                onCancelHandler={cancelHandler}
                onSaveHandler={saveHandler}/>           
            </>
     );
}
 
export default NewPostDialog;
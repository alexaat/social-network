import ProfileButton from './ProfileButton';
import {Tooltip, Card, CardContent, Stack, TextField, IconButton, Avatar} from '@mui/material';
import {buildImageUrl} from './util.js';

const NewPostButton = ({user, clickHandler, tooltip}) => {
  
    const name = user.nick_name ? user.nick_name : user.first_name;

    return ( 
        <Tooltip title='New Post'>
            <Card onClick={clickHandler} sx={{width: '500px', height: '80px'}}>
                <CardContent>
                    <Stack direction='row' sx={{ width: '100%', alignItems: 'center'}}>
                        <IconButton aria-label="user icon" sx={{width: '48px', height: '48px', mr: 2}}>
                            <Avatar
                            alt="avatar"
                            sx={{width: '48px', height: '48px'}}
                            src={
                                user.avatar ? buildImageUrl(user.avatar) : ''
                            }>
                            {!user.avatar ? `${user.first_name.charAt(0)} ${user.last_name.charAt(0)}`: ''}
                            </Avatar>
                        </IconButton>


                        {/* <ProfileButton icon={user.avatar}/> */}
                        <TextField
                             placeholder={`What't on your mind, ${name}?`}
                             readOnly
                             sx={{width: '100%'}}
                             InputProps={{ sx: { borderRadius: '21px', height: '42px'} }}
                             ></TextField>
                        {/* <input type="text" placeholder={`What't on your mind, ${name}?`} readOnly className='input-text'/> */}
                    </Stack>

                </CardContent>
            </Card>
            {/* <div className="new-post-button" onClick={clickHandler}>
                <ProfileButton icon={user.avatar}/>
                <input type="text" placeholder={`What't on your mind, ${name}?`} readOnly className='input-text'/>
            </div> */}
        </Tooltip>
     );
} 
export default NewPostButton;
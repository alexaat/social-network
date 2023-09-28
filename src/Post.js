
import { Stack, Typography, Card, Tooltip, CardContent, IconButton, Avatar, Box} from "@mui/material";
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import {buildImageUrl} from './util.js';

import { useState } from "react";
import UserDetailsDialog from "./UserDetailsDialog";

const Post = ({post, isFollowing, updateFollowers}) => {

   const [openUserDetailsDialog, setOpenUserDetailsDialog] = useState(false);

    // To calculate the time difference of two dates
   const difference_in_time = Date.now() - parseInt(post.date);
      
    // To calculate the no. of days between two dates
   var difference_in_days = Math.trunc(difference_in_time / (1000 * 3600 * 24));

   let publicity = <Tooltip title="Pubic"><PublicRoundedIcon/></Tooltip>
   //let publicity = <PublicRoundedIcon/>

   if(post.privacy === "friends"){
      publicity = <Tooltip title="Friends"><PeopleRoundedIcon/></Tooltip>
   }
   if(post.specific_friends !== ""){
      publicity = <Tooltip title="Specific Friends"><PeopleOutlineRoundedIcon/></Tooltip>
   }

   const clickHandler = () => {     
      setOpenUserDetailsDialog(true);     
   }

   const toolTip = "Follow"

   return (    
      <Card sx={{width: '500px'}}>
         <CardContent>
         {/* <div className="post-container" data-id={post.id}> */}
            <Stack direction="column">
               <Stack direction="row">              
                  {/* <ProfileButton icon={post.user.avatar} clickHandler={clickHandler} tooltip={toolTip} /> */}
                  <IconButton aria-label="user icon" onClick={clickHandler} sx={{width: '48px', height: '48px', mr: 2}}>
                  <Avatar
                        alt="avatar"
                        sx={{width: '48px', height: '48px'}}
                        src={
                             post.user.avatar ? buildImageUrl(post.user.avatar) : ''
                        }>
                           {!post.user.avatar ? `${post.user.first_name.charAt(0)} ${post.user.last_name.charAt(0)}`: ''}
                        </Avatar>
                  </IconButton>
                  
                  <Stack direction="column">
                     <Typography variant="subtitle1">{post.user.nick_name ? post.user.nick_name : post.user.first_name + " " + post.user.last_name}</Typography>
                     <Stack direction="row">
                        <Typography variant="subtitle1" sx={{mr: 1}}>{difference_in_days} d</Typography>
                        {publicity}
                     </Stack>                 
                  </Stack>
               </Stack>  
               
               <Typography variant="body1" gutterBottom> {post.content}</Typography>
               {/* {post.image && <img src={buildImageUrl(post.image)}></img>} */}
               <Box component='img' src={post.image && buildImageUrl(post.image)}></Box>        
            </Stack>
            {/* <UserDetailsDialog
                open={openUserDetailsDialog}
                setOpen={setOpenUserDetailsDialog}
                post={post}
                isFollowing={isFollowing}
                updateFollowers={updateFollowers}/>              */}
        {/* // </div> */}
        </CardContent>
        </Card>
   
   
   );
}
 
export default Post;
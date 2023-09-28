import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import {serverHost} from "./constants";
import {IconButton, Tooltip, Box} from '@mui/material';

const ProfileButton = ({clickHandler, icon, tooltip}) => {
 
    const url = serverHost+"/image?id="+ icon;
      
    return ( 
      <Box onClick={clickHandler}>
        {icon ?
         <img className="image-button" id="profile-button" src={url} alt="profile button" />  :        
        <Tooltip title={tooltip}>
          <IconButton disableRipple>
            <AccountCircleRoundedIcon  sx={{height: 52, width: 52, ml: 1, mr: 1}}  />
          </IconButton>
        </Tooltip>
        }
      </Box>
        
      );
}
 
export default ProfileButton;
import { Dialog, DialogContent,Button } from '@mui/material';
import {useState} from 'react';

const SpeciificFriendsDialog = ({ open, onGoBackHandler, onCancelHandler, onSaveHandler }) => {

    const [specificFriendIds, setSpecificFriendIds] = useState([1,2,3]);


    const goBackHandler = () =>{
        onGoBackHandler();       
    }

    const cancelHandler = () => {
        onCancelHandler();
    }

    const saveHandler = () => {
        console.log("In specific "+ specificFriendIds);
        onSaveHandler(specificFriendIds);
    }

    return (
        <Dialog open={open}>
            <DialogContent
                dividers
                sx={{
                    padding: 0,
                    background: 'white',
                    position: 'relative',
                    minHeight: 500,
                    width: 'auto',
                    minWidth: { sm: 500 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'                    
                }}>

                <div className="dialog-header">
                    <div className="icon-back" onClick={goBackHandler}></div>
                    <div>Specific Friends</div>                    
                </div>                

                <div className="dialog-footer">
                    <Button variant="contained" sx={{mr: 1}} onClick={cancelHandler}>Cancel</Button>
                    <Button variant="contained" onClick={saveHandler}>Save changes</Button>
                </div>

            </DialogContent>

        </Dialog>
    );
}

export default SpeciificFriendsDialog;
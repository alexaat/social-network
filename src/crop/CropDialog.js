import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import {Box} from "@mui/material";
import { useState } from "react";
import Cropper from "react-easy-crop"; 
import {Slider} from "@mui/material";

const CropDialog = (props) => {

    const { open, setOpen, url } = props;

    const [crop, setCrop] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const cropComplete = (croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels)
  }


    return ( 
  

        <Dialog open={open} fullWidth         PaperProps={{
          sx: {
            minHeight: "60%"
          }
        }}>
            <DialogTitle> Image Crop </DialogTitle>
            
            <DialogContent dividers
              sx={{    

              }}
             
            >

           
              <Cropper
                image={url}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onZoomChange={setZoom}            
                onCropChange={setCrop}
                onCropComplete={cropComplete}                
                          
              />
           


            </DialogContent>
            
       
            <DialogActions>
                    
              <Slider
                  valueLabelDisplay='auto'
                  valueLabelFormat={zoomPercent}
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e,zoom)=>setZoom(zoom)}                    
              />
                    
              <Button onClick={() => setOpen(false)} >
                OK
              </Button>

            </DialogActions>
             

        </Dialog>


            
     );
}
 
export default CropDialog;

const zoomPercent = value =>{
  return `${Math.round(value*100)}%`
}
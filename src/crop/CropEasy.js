import { Cancel } from '@mui/icons-material';
import CropIcon from '@mui/icons-material/Crop';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Slider,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './utils/cropImage';
import Dialog from '@mui/material/Dialog';

const CropEasy = ({ photoURL, setOpenCrop, setPhotoURL, setCroppedImage, open, setOpen, imageType }) => {
  
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const cropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const cropImage = async () => {

    try {
      const { file, url } = await getCroppedImg(
        photoURL,
        croppedAreaPixels,
        imageType       
      );
      setPhotoURL(url);
      setCroppedImage(file);
      setOpenCrop(false);
    } catch (error) {

      console.log(error);
    }

  };

  return (   
      <Dialog open={open}>
        <DialogContent
            dividers
            sx={{
            background: '#333',
            position: 'relative',
            height: 400,
            width: 'auto',
            minWidth: { sm: 500 },
            }}
        >
            <Cropper
            image={photoURL}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onZoomChange={setZoom}
            onCropChange={setCrop}
            onCropComplete={cropComplete}
            />
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', mx: 3, my: 2 }}>
            <Box sx={{ width: '100%', mb: 1 }}>
            <Box>
                <Typography>Zoom: {zoomPercent(zoom)}</Typography>
                <Slider
                valueLabelDisplay="auto"
                valueLabelFormat={zoomPercent}
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e, zoom) => setZoom(zoom)}
                />
            </Box>
            </Box>
            <Box
            sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
            }}
            >
            <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => setOpenCrop(false)}                
            >
                Cancel
            </Button>
            <Button
                variant="contained"
                startIcon={<CropIcon />}
                onClick={cropImage}                
            >
                Crop
            </Button>
            </Box>
        </DialogActions>
      </Dialog>    
  );
};

export default CropEasy;

const zoomPercent = (value) => {
  return `${Math.round(value * 100)}%`;
};
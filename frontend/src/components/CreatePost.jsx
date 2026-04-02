import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { 
  Card, CardContent, TextField, Button, 
  IconButton, Box, CircularProgress, Typography 
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null; // Only logged in users can create posts

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text && !image) {
      setError('Please provide text or an image to post.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    if (text) formData.append('text', text);
    if (image) formData.append('image', image);

    try {
      const res = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      onPostCreated(res.data);
      setText('');
      setImage(null);
      setPreview('');
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Create a Post
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="What's on your mind?"
            variant="outlined"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError('');
            }}
            sx={{ mb: 2 }}
          />
          
          {preview && (
            <Box mb={2} sx={{ position: 'relative', display: 'inline-block' }}>
              <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }} />
              <Button 
                size="small" 
                variant="contained" 
                color="error" 
                sx={{ position: 'absolute', top: 8, right: 8, minWidth: '32px', p: 0.5 }}
                onClick={() => { setImage(null); setPreview(''); }}
              >
                X
              </Button>
            </Box>
          )}

          {error && <Typography color="error" variant="body2" sx={{ mb: 2 }}>{error}</Typography>}

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <label htmlFor="icon-button-file">
              <input accept="image/*" id="icon-button-file" type="file" style={{ display: 'none' }} onChange={handleImageChange} />
              <IconButton color="primary" aria-label="upload picture" component="span">
                <PhotoCamera />
              </IconButton>
              <Typography variant="caption" color="textSecondary">Add Image</Typography>
            </label>
            
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={loading}
              sx={{ px: 4, py: 1, borderRadius: 20 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Post'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreatePost;

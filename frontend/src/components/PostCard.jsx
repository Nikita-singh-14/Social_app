import React, { useState, useContext } from 'react';
import { 
  Card, CardHeader, CardContent, CardActions, CardMedia,
  Avatar, Typography, IconButton, Collapse, Box, TextField, Button,
  Divider, List, ListItem, ListItemAvatar, ListItemText, Chip
} from '@mui/material';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import { formatDistanceToNow } from 'date-fns';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const PostCard = ({ post: initialPost }) => {
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(initialPost);
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  const hasLiked = user && post.likes.includes(user.username);
  const imageUrl = post.imageUrl ? `http://localhost:5000${post.imageUrl}` : null;

  const handleLike = async () => {
    if (!user) return alert("Please login to like this post");

    // Optimistic UI update
    const previousLikes = [...post.likes];
    const newLikes = hasLiked 
      ? post.likes.filter(u => u !== user.username) 
      : [...post.likes, user.username];
    
    setPost({ ...post, likes: newLikes });

    try {
      const res = await api.post(`/posts/${post._id}/like`);
      setPost({ ...post, likes: res.data });
    } catch (err) {
      console.error("Like error", err);
      // Revert optimism on error
      setPost({ ...post, likes: previousLikes });
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) return alert("Please login to comment");

    setCommenting(true);
    try {
      const res = await api.post(`/posts/${post._id}/comment`, { text: commentText });
      setPost({ ...post, comments: res.data });
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setCommenting(false);
    }
  };

  return (
    <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
            {post.authorUsername.charAt(0).toUpperCase()}
          </Avatar>
        }
        title={<Typography fontWeight="bold">{post.authorUsername}</Typography>}
        subheader={formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
      />
      {post.text && (
        <CardContent sx={{ pt: 0 }}>
          <Typography variant="body1" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
            {post.text}
          </Typography>
        </CardContent>
      )}
      
      {imageUrl && (
        <CardMedia
          component="img"
          image={imageUrl}
          alt="Post Image"
          sx={{ maxHeight: 500, objectFit: 'cover' }}
        />
      )}
      
      <CardActions disableSpacing>
        <Box display="flex" alignItems="center">
          <IconButton aria-label="like" onClick={handleLike} color={hasLiked ? "error" : "default"}>
            <FavoriteIcon />
          </IconButton>
          <Typography variant="body2" mr={2}>
            {post.likes.length}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <IconButton aria-label="comment" onClick={() => setExpanded(!expanded)}>
            <CommentIcon />
          </IconButton>
          <Typography variant="body2">
            {post.comments.length}
          </Typography>
        </Box>
      </CardActions>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <CardContent sx={{ pb: 2 }}>
          {post.likes.length > 0 && (
            <Box mb={2}>
              <Typography variant="caption" color="textSecondary">Liked by: </Typography>
              {post.likes.map((liker, idx) => (
                <Chip key={idx} label={liker} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
              ))}
            </Box>
          )}

          <Typography variant="subtitle2" fontWeight="bold">Comments</Typography>
          <List dense sx={{ mb: 2, maxHeight: 200, overflow: 'auto' }}>
            {post.comments.length === 0 ? (
              <Typography variant="body2" color="textSecondary">No comments yet.</Typography>
            ) : (
              post.comments.map((comment, index) => (
                <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                      {comment.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" fontWeight="bold">
                          {comment.username}
                        </Typography>
                        <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                           {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </Typography>
                      </React.Fragment>
                    }
                    secondary={<Typography variant="body2">{comment.text}</Typography>}
                  />
                </ListItem>
              ))
            )}
          </List>

          {user && (
            <Box component="form" onSubmit={handleComment} display="flex" gap={1}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button type="submit" variant="contained" disabled={commenting || !commentText.trim()}>
                Post
              </Button>
            </Box>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default PostCard;

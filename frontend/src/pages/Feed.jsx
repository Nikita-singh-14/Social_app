import React, { useState, useEffect } from 'react';
import api from '../api';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import { Container, Typography, CircularProgress, Box, Pagination } from '@mui/material';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = async (pageNumber) => {
    setLoading(true);
    try {
      const res = await api.get(`/posts?page=${pageNumber}&limit=10`);
      setPosts(res.data.posts);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <CreatePost onPostCreated={handlePostCreated} />
      
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box mt={4}>
          {posts.length === 0 ? (
            <Typography textAlign="center" color="textSecondary">No posts yet. Be the first to post!</Typography>
          ) : (
            posts.map(post => <PostCard key={post._id} post={post} />)
          )}
        </Box>
      )}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4} mb={4}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(e, val) => setPage(val)} 
            color="primary" 
          />
        </Box>
      )}
    </Container>
  );
};

export default Feed;

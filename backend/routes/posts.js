const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const multer = require('multer');
const path = require('path');

// Multer Config for Images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
});

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Images Only!'));
  }
}

// @route   GET api/posts
// @desc    Get all posts (paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    const total = await Post.countDocuments();

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/posts
// @desc    Create a post
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    let imageUrl = '';

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    if (!text && !imageUrl) {
      return res.status(400).json({ error: 'Post must contain either text or an image' });
    }

    const newPost = new Post({
      authorId: req.user.id,
      authorUsername: req.user.username,
      text: text || '',
      imageUrl: imageUrl
    });

    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/posts/:id/like
// @desc    Like / Unlike a post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if post has already been liked by this user
    const username = req.user.username;
    const alreadyLiked = post.likes.includes(username);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(user => user !== username);
    } else {
      // Like
      post.likes.unshift(username);
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if(err.kind === 'ObjectId') {
        return res.status(404).json({ error: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/posts/:id/comment
// @desc    Comment on a post
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = {
      username: req.user.username,
      text: text
    };

    post.comments.push(newComment);
    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    if(err.kind === 'ObjectId') {
        return res.status(404).json({ error: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;

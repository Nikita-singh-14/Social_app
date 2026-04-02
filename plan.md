Social App Implementation Plan
We will build a full-stack social web app featuring account creation, creating posts (text/image), seeing a public feed, and liking/commenting on posts.

User Review Required
IMPORTANT

Image Uploads: I plan to use multer on the backend to store images locally in an uploads/ folder and serve them statically. Is this acceptable, or would you prefer users to just provide an Image URL? Authentication: Simple JWT-based authentication will be used. Passwords will be hashed using bcryptjs. Styling: I will use Material UI (MUI). As requested, TailwindCSS will not be used.

Proposed Changes
We will split the repository into two main directories: backend and frontend.

Backend (Node.js + Express + MongoDB)
We will set up an Express.js server connected to MongoDB using Mongoose.

Database Models (Strictly 2 Collections)
User Collection: Stores username, email, and password (hashed).
Post Collection: Stores authorId, authorUsername, text, imageUrl, timestamps, and embedded arrays for likes (array of usernames) and comments (array of objects with username, text, createdAt). This ensures we stick strictly to the 2 collection limit while supporting likes and comments!
API Endpoints
Auth: /api/auth/signup and /api/auth/login
Posts:
GET /api/posts?page=X&limit=Y (Feed with pagination)
POST /api/posts (Create post, handles multipart form data via Multer for images)
POST /api/posts/:id/like (Toggle like)
POST /api/posts/:id/comment (Add a comment)
Frontend (React.js + Vite + Material UI)
A modern, responsive single-page application.

Core Components
AuthPages: Clean signup and login forms with validation.
Navbar: Navigation, display current user, logout option.
Feed: Fetches posts dynamically. Supports infinite scroll or simple "Load More" pagination.
CreatePost: A clean UI to draft posts with text and un-mandatory image uploads.
PostCard: Displays individual posts.
Shows username, text, image, total likes, total comments.
Features instantaneous, optimistic UI updates when tweaking likes or adding comments.
Expendable section to view the list of people who liked, and read/add comments.
Open Questions
Which MongoDB connection approach do you want to use? Can we use a local MongoDB instance (e.g. mongodb://localhost:27017/socialapp) or do you have a MongoDB Atlas URI?
Just to confirm: keeping likes and comments inside the Post document as an array is perfect for standardizing under two collections. Please let me know if you are okay with this!
Verification Plan
Automated Tests
We will test the API endpoints using Node/Express mechanisms (or via the browser/Postman logic).
Manual Verification
Start both front-end and back-end servers.
Sign up with 2 distinct dummy accounts.
Make a post from Account A (text only).
Make a post from Account A (image + text).
Make a post from Account A (image only).
Verify empty post cannot be created.
Login as Account B, view the feed, and confirm Account A's posts are visible.
Account B likes a post -> UI updates instantly. Total likes increment, Account B's username is added.
Account B comments on a post -> UI updates instantly. Total comments increment.
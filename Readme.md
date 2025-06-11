# 🎵 Music Streaming API

A Node.js RESTful API for a music streaming service, supporting user authentication, artists, albums, songs, playlists, likes, and comments. Built with Express, MongoDB, Mongoose, JWT, and Cloudinary for media storage.

---

## 🚀 Features

- **User Authentication**: Register, login, JWT-based authentication, password reset via email.
- **Role-based Access**: User, artist, and admin roles with middleware protection.
- **Artists**: Artist profiles, follow/unfollow, top artists by followers.
- **Albums**: CRUD operations, cover image upload.
- **Songs**: CRUD operations, audio file upload, play/download count.
- **Playlists**: User-created playlists, add/remove songs.
- **Likes**: Like/unlike songs and albums.
- **Comments**: Comment on songs and albums.
- **Cloudinary Integration**: For profile pics, album covers, and audio files.
- **Validation**: ObjectId validation, duplicate prevention, and input checks.

---

## 🛠️ Installation

1. **Clone the repository**
   ```sh
   git clone <your-repo-url>
   cd Server
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Environment Variables**

   Create a `.env` file in the root directory with the following:

   ```
   MONGODB_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   PASS_MAIL=your_gmail_address
   PASS_KEY=your_gmail_app_password
   PORT=4000
   ```

4. **Start the server**
   ```sh
   npm run dev
   ```
   The server will run on `http://localhost:4000` by default.

---

## 📁 Project Structure

```
Server/
│
├── Controllers/         # Route handlers (business logic)
├── Database/            # DB and Cloudinary config
├── Middleware/          # Auth, role, upload, validation middleware
├── Models/              # Mongoose schemas
├── Routes/              # Express route definitions
├── Utils/               # Utility functions (mailer, etc.)
├── index.js             # Entry point
├── package.json
└── .env
```

---

## 🧑‍💻 API Endpoints

### Auth

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT
- `POST /api/auth/forgot-password` — Request password reset
- `POST /api/auth/reset-password/:id/:token` — Reset password

### Users

- `GET /api/user/` — Get all users (admin only)
- `GET /api/user/:id` — Get user by ID (auth required)
- `PUT /api/user/:id` — Update user (self or admin)
- `DELETE /api/user/:id` — Delete user (self or admin)

### Artists

- `POST /api/artist/` — Create artist (admin only)
- `GET /api/artist/` — List all artists
- `GET /api/artist/top` — Top artists by followers
- `GET /api/artist/:id` — Get artist by ID
- `PUT /api/artist/:id` — Update artist (artist only)
- `PUT /api/artist/:id/follow` — Follow artist (user only)
- `PUT /api/artist/:id/unfollow` — Unfollow artist (user only)
- `GET /api/artist/:id/followers` — Get followers (admin/artist only)

### Albums

- `POST /api/albums/` — Create album (artist only)
- `GET /api/albums/` — List all albums
- `GET /api/albums/:id` — Get album by ID
- `PUT /api/albums/:id` — Update album (artist only)
- `DELETE /api/albums/:id` — Delete album (admin only)

### Songs

- `POST /api/songs/` — Create song (artist only)
- `GET /api/songs/` — List all songs (search/sort supported)
- `PUT /api/songs/:id` — Update song (artist only)
- `DELETE /api/songs/:id` — Delete song (admin only)
- `POST /api/songs/:id/play` — Increment play count
- `POST /api/songs/:id/download` — Download song (auth required)

### Playlists

- `POST /api/playlist/` — Create playlist (user only)
- `GET /api/playlist/` — Get user's playlists
- `GET /api/playlist/:id` — Get playlist by ID
- `PUT /api/playlist/:id` — Update playlist (user only)
- `DELETE /api/playlist/:id` — Delete playlist (user only)
- `PUT /api/playlist/:id/song` — Add song to playlist
- `DELETE /api/playlist/:id/song/:songId` — Remove song from playlist

### Likes

- `POST /api/like/:id` — Like/unlike a song or album (auth required, pass `itemType` in body)

### Comments

- `POST /api/comment/:id` — Add comment to song/album (user only, pass `itemType` in body)
- `GET /api/comment/:itemType/:id` — Get comments for song/album
- `DELETE /api/comment/:id` — Delete comment (owner only)

---

## 🖼️ File Uploads

- **Profile Picture**: Field `profilePic` (Cloudinary)
- **Artist Image**: Field `image` (Cloudinary)
- **Album Cover**: Field `coverImage` (Cloudinary)
- **Song Audio**: Field `fileUrl` (Cloudinary, audio formats only)

---

## 🔒 Authentication & Authorization

- JWT-based authentication.
- Middleware for role checks (`adminMiddleware`, `artistMiddleware`, `authMiddleware`).
- Only authorized users can perform sensitive actions.

---

## 📬 Email (Password Reset)

- Uses Gmail SMTP via Nodemailer.
- Requires `PASS_MAIL` and `PASS_KEY` (App Password) in `.env`.

---

## 📝 Example .env

```
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PASS_MAIL=your_gmail@gmail.com
PASS_KEY=your_gmail_app_password
PORT=4000
```

---

## 🧪 Testing

- Use Postman or similar tools to test endpoints.
- Ensure to set the `Authorization: Bearer <token>` header for protected routes.

---

## 📦 Postman Collection

You can find the Postman collection for this API [here](<your-postman-collection-link>).

---
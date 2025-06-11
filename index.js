import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./Database/dbConfig.js";
import authRoute from "./Routes/authRoute.js";
import userRoute from "./Routes/userRoute.js";
import artistRoute from "./Routes/artistRoute.js";
import albumRoute from "./Routes/albumRoute.js";
import songRoute from "./Routes/songRoute.js";
import playlistRoute from "./Routes/playlistRoute.js";
import likeRoute from "./Routes/likeRouter.js";
import commentRoute from "./Routes/commentRoute.js";
import adminRoute from "./Routes/adminRoute.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the API for Music Streaming",
  });
});

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/artist", artistRoute);
app.use("/api/albums", albumRoute);
app.use("/api/songs", songRoute);
app.use("/api/playlist", playlistRoute);
app.use("/api/like", likeRoute);
app.use("/api/comment", commentRoute);
app.use("/api/admin", adminRoute);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

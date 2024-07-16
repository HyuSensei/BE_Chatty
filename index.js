import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/connectDB.js";
import router from "./routes/index.js";
import { app, server } from "./socket/index.js";
import passport from "passport";
import { saveUser } from "./services/authUser.js";
import { UserModal } from "./modals/UserModal.js";
import jwt from "jsonwebtoken";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";

dotenv.config();

const PORT = process.env.PORT || 8000;

const clientID = process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
const clientSecret =
  process.env.GOOGLE_CLIENT_SECRET || "YOUR_GOOGLE_CLIENT_SECRET";

app.use(
  cors({
    origin: process.env.FRONT_END_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // HTTPS, secure: true
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/v1", router);

passport.use(
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      await saveUser(profile, done);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  UserModal.findById(id).then((user) => {
    done(null, user);
  });
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google"),
  (req, res) => {
    const token = jwt.sign(
      {
        id: req.user._id,
        email: req.user.email,
      },
      process.env.JWT_SECREAT_KEY,
      {
        expiresIn: "3d",
      }
    );
    res.redirect(`${process.env.FRONT_END_URL}/wellcome?token=${token}`);
  }
);

server.listen(PORT, async () => {
  await connectDB();
  console.log(`Server listening at port ${PORT}`);
});

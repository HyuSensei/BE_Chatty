import { UserModal } from "../modals/UserModal.js";

export const saveUser = async (profile, done) => {
  try {
    const existingUser = await UserModal.findOne({
      googleId: profile.id,
    });
    if (existingUser) {
      return done(null, existingUser);
    }
    const newUser = new UserModal({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      profileImage: profile.photos[0].value,
      password: "Login-Google",
      gender: "male",
    });
    await newUser.save();
    done(null, newUser);
  } catch (error) {
    console.log(error);
  }
};

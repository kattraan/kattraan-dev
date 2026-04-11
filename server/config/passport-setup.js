const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const Role = require("../models/Role");
require("dotenv").config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/auth/google/callback", // Relative URL, proxy/router handles domain
            passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                const googleId = profile.id;

                // 1. Check if user exists by googleId
                let user = await User.findOne({ googleId });

                if (user) {
                    return done(null, user);
                }

                // 2. Check if user exists by email (link accounts)
                user = await User.findOne({ userEmail: email });

                if (user) {
                    user.googleId = googleId;
                    await user.save();
                    return done(null, user);
                }

                // 3. Create new user — learner role by UUID
                const learnerRole = await Role.findOne({ roleName: "learner" });
                if (!learnerRole) return done(new Error("Learner role not found"), null);

                user = await User.create({
                    userName: profile.displayName,
                    userEmail: email,
                    googleId: googleId,
                    password: `google_${googleId}_${Date.now()}`, // Dummy password, not usable
                    roles: [learnerRole.roleId],
                    status: "active",
                    isVerified: true
                });

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Serialization (for session support, though we mainly use JWT)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;

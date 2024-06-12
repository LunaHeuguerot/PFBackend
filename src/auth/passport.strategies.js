import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import userModel from '../dao/models/user.model.js';
import { isValidPassword } from '../utils.js';

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }
        if (!isValidPassword(password, user.password)) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport;
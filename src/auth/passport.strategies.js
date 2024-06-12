import passport from 'passport';
import local from 'passport-local';
import GitHubStrategy from 'passport-github2';
import userModel from '../dao/models/user.model.js';
import { isValidPassword, createHash } from '../utils.js';
import config from '../config.js';
import UsersManager from '../dao/user.manager.db.js';

const localStrategy = local.Strategy;
const manager = new UsersManager(userModel);

const initAuthStrategies = ()=>{
    passport.use('register', new LocalStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, username, password, done) => {
            try {
                const { first_name, last_name, age } = req.body;
                const foundUser = await manager.getOne({ email: username });
    
                if (foundUser) {
                    return done(null, false, { message: 'El usuario ya existe' });
                }
    
                const hashedPassword = createHash(password);
                const newUser = {
                    first_name,
                    last_name,
                    age,
                    email: username,
                    password: hashedPassword,
                };
    
                const createdUser = await manager.add(newUser);
                if (createdUser.status === 201) {
                    return done(null, createdUser.payload);
                } else {
                    return done(null, false, { message: createdUser.error });
                }
            } catch (err) {
                return done(err);
            }
        }
    ));

    passport.use('login', new localStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, email, password, done) => {
            try {
                const foundUser = await userModel.findOne({ email }).lean();
                if (foundUser && isValidPassword(password, foundUser.password)) {
                    return done(null, foundUser);
                } else {
                    return done(null, false, { message: 'Invalid credentials' });
                }
            } catch (err) {
                return done(err);
            }
        }
    ));

passport.use('ghlogin', new GitHubStrategy(
    {
        clientID: config.GITHUB_CLIENT_ID,
        clientSecret: config.GITHUB_CLIENT_SECRET,
        callbackURL: config.GITHUB_CALLBACK_URL
    },
    async (req, accessToken, refreshToken, profile, done) => {
        try {
            const email = profile._json?.email || null;

            if (email) {
                let foundUser = await manager.getOne({ email });

                if (!foundUser) {
                    const user = {
                        firstName: profile._json.name.split(' ')[0],
                        lastName: profile._json.name.split(' ')[1],
                        email,
                        password: 'none'
                    };

                    const process = await manager.add(user);

                    foundUser = process.payload;
                }

                return done(null, foundUser);
            } else {
                return done(new Error('Faltan datos de perfil'), null);
            }
        } catch (err) {
            return done(err, false);
        }
    }
));

passport.serializeUser((user, done) => {
    const userId = user._id || user.payload?._id;
    if (userId) {
        done(null, userId);
    } else {
        done(new Error('user id no encontrado'), null);
    }
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

}



export default initAuthStrategies;
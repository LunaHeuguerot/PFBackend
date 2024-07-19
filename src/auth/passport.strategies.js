import passport from 'passport';
import local from 'passport-local';
import GitHubStrategy from 'passport-github2';
import userModel from '../dao/models/user.model.js';
import { isValidPassword, createHash } from '../services/utils.js';
import config from '../services/config.js';
import UsersManager from '../controllers/managers/user.manager.db.js';
import cartModel from '../dao/models/cart.model.js';

const localStrategy = local.Strategy;
const manager = new UsersManager(userModel);

const initAuthStrategies = ()=>{
    passport.use('register', new localStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, username, password, done) => {
            try {
                const { first_name, last_name, age } = req.body;
                const foundUser = await manager.getOne({ email: username });
    
                if (foundUser) {
                    return done(null, false, { message: 'El usuario ya existe' });
                }

                const newCart = new cartModel();
                const savedCart = await newCart.save();
    
                const hashedPassword = createHash(password);
                const newUser = {
                    first_name,
                    last_name,
                    age,
                    email: username,
                    password: hashedPassword,
                    cart_id: savedCart._id
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
            callbackURL: config.GITHUB_CALLBACK_URL,
            scope: ['user:email']  
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails && profile.emails[0].value;
                if (!email) {
                    return done(new Error('No se proporcionó el correo electrónico desde GitHub'), null);
                }
    
                let foundUser = await manager.getOne({ email });
    
                if (!foundUser) {
                    const name = profile.displayName || profile._json.name || 'Usuario GitHub';
                    const nameParts = name.split(' ');
                    const user = {
                        first_name: nameParts[0] || '',
                        last_name: nameParts.slice(1).join(' ') || '',
                        email,
                        password: 'none',
                        age: 18
                    };
    
                    const process = await manager.add(user);
                    foundUser = process.payload;
                }
    
                return done(null, foundUser);
            } catch (err) {
                console.error('Error en GitHub Strategy:', err);
                return done(err, null);
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

};

export const passportCall = strategy => {
    return async (req, res, next) => {
        passport.authenticate(strategy, { session: false }, function (err, user, info) {
            if (err) return next(err);
            if (!user) return res.status(401).send({ origin: config.SERVER, payload: null, error: 'Usuario no autenticado' });

            req.user = user;
            next();
        })(req, res, next);
    }
};



export default initAuthStrategies;
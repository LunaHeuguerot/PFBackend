import passport from 'passport';
import userModel from '../../dao/models/user.model.js';
import { createHash, isValidPassword } from '../../services/utils.js';

async function register(req, res) {
    const { first_name, last_name, email, age, password } = req.body;

    try {
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = createHash(password);
        const newUser = new userModel({
            first_name,
            last_name,
            email, 
            age, 
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).send('User created');
    } catch (error) {
        res.status(500).json({ message: "Error registering user" });
        console.error("Error registering user:", error);
    }        
}

async function login(req, res, next) {
    passport.authenticate('local', async (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ message: info.message });
        }
        try {
            await userModel.findByIdAndUpdate(user._id, { last_connection: new Date() });
            req.logIn(user, (err) => {
                if (err) return next(err);
                return res.status(200).json({ message: 'Successful login', user });
            });
        } catch (updateError) {
            return next(updateError);
        }
    })(req, res, next);
}

async function logout(req, res) {
    console.log("Logout function called");
    try {
        if (req.user) {
            await userModel.findByIdAndUpdate(req.user._id, { last_connection: new Date() });
        }
        req.logout((err) => {
            if (err) {
                return res.status(500).json({ message: 'Logout error', error: err });
            }
            res.status(200).json({ message: 'Successful logout' });
        });
    } catch (error) {
        res.status(500).json({ message: "Error during logout" });
    }
}



export { register, login, logout };

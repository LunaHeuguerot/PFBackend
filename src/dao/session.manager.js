import userModel from './models/user.model.js'

async function register(req, res){
    const { first_name, last_name, email, age, password } = req.body;

    try {
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new userModel({
            first_name,
            last_name,
            email, 
            age, 
            password
        });

        await newUser.save();
        res.status(201).send('User created');
    } catch (error) {
        res.status(500).json({ message: "Error registering user" });
        console.error("Error registering user:", error);
    }        
};

async function login(req, res){    
    try {
        const { email, password } = req.body;

        console.log("Datos recibidos:", req.body);

        if (!email || !password) {
            console.log("Campos faltantes");
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            console.log("Usuario no encontrado");
            return res.status(404).json({ message: 'User not found' });
        }

        console.log("Usuario encontrado:", user);

        if (password !== user.password) {
            console.log("Contraseña incorrecta");
            return res.status(401).json({ message: 'Wrong password' });
        }

        if (!req.session) {
            console.log("La sesión no está definida");
            return res.status(500).json({ message: 'Session is not defined' });
        }

        const userRol = email === 'adminCoder@coder.com' && password === 'adminCod3r123'
            ? { email, first_name: user.first_name, last_name: user.last_name, isAdmin: true }
            : { email, first_name: user.first_name, last_name: user.last_name, isAdmin: false };

        req.session.user = userRol;

        console.log("Inicio de sesión exitoso:", userRol);
        res.status(200).json({ message: 'Successful login', user });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({ message: 'Failed to login' });
    }
};

async function logout(req, res) {
    req.session.destroy(error => {
        if (!error) {
            res.status(200).json({ message: 'Successful logout' });
        } else {
            res.status(500).json({ message: 'Logout error', error });
        }
    });
};

export { register, login, logout };

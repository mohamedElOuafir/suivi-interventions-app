import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


//function for handling the user authentification with jwt token :
export const handleAuthentification = (req, res, next) => {
    const token = req.headers["authorization"];

    if(!token)
        return res.status(401).json({message : "missed token"});

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err)
            return res.json({message : "invalid or expired token"});

        req.user = user;
        return next();
    })
}



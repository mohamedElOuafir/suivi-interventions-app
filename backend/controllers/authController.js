import {pool} from '../database/db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

//function for creating the first admin for the application:
export const createTheFirstAdmin = async () => {
    const connection = await pool.getConnection();

    const query = `INSERT INTO utilisateur(id, nom, prenom, tel, departement, email, motDePasse, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    try {
        const [result1] = await connection.query("SELECT * FROM utilisateur WHERE role = ?", ['Admin']);

        if(result1.length === 0){
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
            const result2 = await connection.query(query, [
                1,
                "elouafir",
                "mohamed",
                "0700000000",
                "Informatique",
                process.env.ADMIN_EMAIL,
                hashedPassword,
                "Admin"
            ]);
            console.log("admin added successfully");
            return;
        }
        
        console.log("admin already exists");
    }catch(e){
        console.error("server error!");
    }finally {
        connection.release();
    }
}



//user athentification with generating a jwt token :
export const userAuthentification = async (req, res) => {

    const { email, password } =  req.body;
    const connection = await pool.getConnection();

    try {
        
        const [result] = await connection.query(
            'SELECT * FROM utilisateur WHERE email = ?',
            [email]
        );

        //verfication of existing of the user email
        if (result.length === 0)
            return res.status(401).json({
                available : false,
                message : "user not found !"
            });
        
        //comparaison of the passwords :
        const user =result[0];
        const valid = await bcrypt.compare(password, result[0].motDePasse);

        if(!valid) 
            return res.status(401).json({available : false, message : "Wrong password !"});

        //generating a new jwt token for the user:
        const token = jwt.sign(user, process.env.JWT_SECRET_KEY, {expiresIn : "2h"});

        return res.json({
            available : true,
            token,
            userData : user,
        });

    }catch(e) {
        return res.status(500).json({error : e.message});
    }finally {
        connection.release();
    }
}


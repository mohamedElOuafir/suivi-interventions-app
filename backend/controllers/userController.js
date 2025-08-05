import {pool} from '../database/db.js';
import bcrypt from 'bcrypt';
import { getRandomPassword } from '../middlewares/randomPasswordGen.js';
import { sendPasswordViaMail } from '../middlewares/sendPasswordMail.js';

//get all users from DB:
export const getAllUsers = async (req , res) => {

    //Verification of the user's role:
    if(req.user.role.toLowerCase() !== 'admin')
        return res.json({message : "permission denied!"});

    const connection = await pool.getConnection();  
    try {
        
        const [result] = await connection.query('SELECT * FROM utilisateur');
        connection.release(); 

        return res.json(result.filter(u => u.id !== 1 && u.id !== req.user.id)); 

    } catch (e) {
        return res.status(500).json({ error: e.message });
    } finally {
        connection.release();
    }
}



//creating a new user with a hashed password :
export const addUser = async (req , res) => {

    //Verification of the user's role:
    if(req.user.role.toLowerCase() !== 'admin')
        return res.json({message : "permission denied!"});

    const {newUser} = req.body;
    //creating a random password:
    const password = getRandomPassword();
    const query = `INSERT INTO utilisateur(nom, prenom, tel, departement, email, motDePasse, role)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const connection = await pool.getConnection();
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await connection.query(query, [
            newUser.nom, 
            newUser.prenom, 
            newUser.tel, 
            newUser.departement, 
            newUser.email, 
            hashedPassword, 
            newUser.role
        ]);

        //sending the initial password to this new user:
        const valid = await sendPasswordViaMail(newUser, password);

        if(!valid)
            return res.json({
                userAdded : false,
                emailExist : false
            });

        return res.json({
            userAdded : true,
            result,
            emailExist : true
        });

    }catch(e) {
        return res.status(500).json({userAdded : false, message : e.message});
    }finally{
        connection.release();
    }
}



//getting a user by its Id :
export const getUserById = async (req , res) => {

    //Verification of the user's role:
    if(req.user.role.toLowerCase() !== 'admin')
        return res.json({message : "permission denied!"});

    const id = req.params.id;
    const connection = await pool.getConnection();

    try{
        
        const [result] = await connection.query('SELECT * FROM utilisateur WHERE id = ?', [id]);

        if(result.length > 0)
            return res.json({
                founded : true,
                userData : result[0]
            });
            
        return res.json({
            founded : false
        });
    }catch(e){
        return res.status(500).json({error : e.message});
    }finally{
        connection.release();
    }
}



//deleting a user by its Id:
export const deleteUser = async (req , res) => {

    //Verification of the user's role:
    if(req.user.role.toLowerCase() !== 'admin')
        return res.json({message : "permission denied!"});

    const id = Number(req.params.id);
    const connection = await pool.getConnection();

    try {
        const [result] = await connection.query('DELETE FROM utilisateur WHERE id = ?',
            [id]
        );
        return res.status(200).json({deleted : true, message : "user deleted !"});
    }catch(e) {
        return res.status(500).json({deleted : false, error : e.message});
    }finally{
        connection.release();
    }

}



//updating or modifying a user information by its Id:
export const editUser = async (req , res) => {

    //Verification of the user's role:
    if(req.user.role.toLowerCase() !== 'admin'){
        console.log(req.user.role.toLowerCase());
        return res.json({message : "permission denied!"});
    }
        

    const user = req.body;
    const query = `UPDATE utilisateur
                    SET nom = ?, prenom = ?, tel = ?, email = ?, departement = ?, role = ?
                    WHERE id = ?`;

    const connection = await pool.getConnection();

    try {
        const [result] = await connection.query(
            query,
            [user.nom, user.prenom, user.tel, user.email, user.departement, user.role, user.id]
        );

        return res.json({updated : true, message : "user updated"});
    }catch(e){
        return res.status(500).json({updated : false, error : e.message});
    }finally{
        connection.release();
    }

}


//set new password for the first login:
export const editUserPassword = async (req , res) => {
    const {oldPassword, newPassword} = req.body;
    const query = `UPDATE utilisateur 
        SET motDePasse = ?, firstLogin = false WHERE id = ?`;

    //is the old password field match the first password setted:
    const isTrueOldPassword = await bcrypt.compare(oldPassword, req.user.motDePasse);
    if(!isTrueOldPassword)
        return res.json({message : "Incorrect old password"});


    //is the new password as same as the old one:
    const samePassword = await bcrypt.compare(newPassword, req.user.motDePasse);
    if(samePassword)
        return res.json({message : "PLease choose a new password !"});


    const connection = await pool.getConnection();
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    try{
        
        const [result] = await connection.query(query, [
            hashedNewPassword,
            req.user.id
        ]);
        return res.status(200).json({updated : true});
    }catch(e) {
        return res.status(501).json({updated : false});
    }finally {
        connection.release();
    }
}


import express from 'express';
import {handleAuthentification} from '../middlewares/authMiddleware.js';
import {
    getAllUsers,
    addUser,
    getUserById,
    deleteUser,
    editUser,
    editUserPassword
} from '../controllers/userController.js';


const Router = express.Router();

Router.get('/get/users', handleAuthentification, getAllUsers);
Router.post('/user/add', handleAuthentification, addUser);
Router.get('/get/user/:id', handleAuthentification, getUserById);
Router.delete('/user/delete/:id', handleAuthentification, deleteUser);
Router.put('/user/edit', handleAuthentification, editUser);
Router.put('/edit/user/password', handleAuthentification, editUserPassword);

export default Router;
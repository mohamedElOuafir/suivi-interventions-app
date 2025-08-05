import express from 'express';
import {
    userAuthentification
} from '../controllers/authController.js';


const Router = express.Router();

Router.post('/user/authentification', userAuthentification);

export default Router;
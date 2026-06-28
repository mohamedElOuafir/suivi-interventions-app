import express from 'express';
import {handleAuthentification} from '../middlewares/authMiddleware.js';
import {upload} from '../middlewares/uploadRequestImage.js';
import {
    getRequestById,
    getAllRequests,
    getRequestsForTheCurrentUser,
    addRequest,
    deleteRequest,
    editRequest
} from '../controllers/requestController.js';

const Router = express.Router();

Router.get('/get/demande/:idDemande', handleAuthentification, getRequestById);
Router.get('/get/demandes', handleAuthentification, getAllRequests);
Router.get('/get/demandes/user', handleAuthentification, getRequestsForTheCurrentUser);
Router.post('/add/demande', handleAuthentification, upload.single("image"), addRequest);
Router.delete('/delete/demande/:idDemande', handleAuthentification, deleteRequest);
Router.put('/edit/demande/:idDemande', handleAuthentification, upload.single("image"), editRequest);


export default Router;
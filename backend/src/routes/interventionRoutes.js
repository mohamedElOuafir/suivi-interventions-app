import express from 'express';
import {handleAuthentification} from '../middlewares/authMiddleware.js';
import {
    addIntervention,
    getAllInterventions,
    getInterventionsByRequest,
    getInterventionById,
    editIntervention
} from '../controllers/interventionController.js';


const Router = express.Router();

Router.post('/demande/add/intervention/:idDemande', handleAuthentification, addIntervention);
Router.get('/get/interventions', handleAuthentification, getAllInterventions);
Router.get('/get/interventions/:idDemande', handleAuthentification, getInterventionsByRequest);
Router.get('/get/intervention/:idIntervention', handleAuthentification, getInterventionById);
Router.put('/demande/edit/intervention', handleAuthentification, editIntervention);

export default Router;
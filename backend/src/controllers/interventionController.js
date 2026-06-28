import {pool} from '../database/db.js';
import {updateTheRequestStatus} from '../middlewares/requestStatusUpdate.js';



//get all intervnetions:
export const getAllInterventions = async (req, res) => {
    
    //verification of the user's role:
    if (req.user.role.toLowerCase() !== 'admin')
        return res.json({message : "permission denied"});

    //query for recovering all the interventions data:
    const query = `SELECT * FROM intervention`;

    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query(query);

        return res.json({
            interventionsData : result
        })
    } catch (error) {
        return res.status(500).json({message : error.message});
    } finally{
        connection.release();
    }
}


//getting interventions for a request:
export const getInterventionsByRequest = async (req, res) => {

    //Verification of the user's role:
    if(req.user.role.toLowerCase() !== 'admin')
        return res.json({message : "permission denied!"});

    const idDemande = req.params.idDemande;
    const connection = await pool.getConnection();

    //query for selecting the intervention by its idDemande:
    const query = `SELECT 
        intervention.idIntervention as idIntervention,
        dateIntervention,
        description,
        idDemande,
        technicienNom,
        technicienPrenom,
        technicienTel,
        statusIntervention,
        technicienCost,
        totalCost,
        
        idPiece,
        nomPiece,
        quantite,
        unitPrice
        FROM intervention LEFT JOIN piece ON piece.idIntervention = intervention.idIntervention
        WHERE idDemande = ?`;
    
    try {
        const [result] = await connection.query(query, [idDemande]);

        const interventionsData = [];
        const interventionsMap = new Map();

        for (let i = 0; i < result.length; i++) {
            const row = result[i];
            const id = row.idIntervention;

            if (!interventionsMap.has(id)) {
                const intervention = {
                    idIntervention: id,
                    dateIntervention: row.dateIntervention.toLocaleDateString(),
                    timeIntervention: row.dateIntervention.toLocaleTimeString().slice(0, 5),
                    description: row.description,
                    statusIntervention: row.statusIntervention,
                    techNom: row.technicienNom,
                    techPrenom: row.technicienPrenom,
                    techTel: row.technicienTel,
                    techCost: row.technicienCost,
                    totalCost: row.totalCost,
                    piecesList: []
                };
                interventionsMap.set(id, intervention);
                interventionsData.push(intervention);
            }

            if (row.idPiece) {
                interventionsMap.get(id).piecesList.push({
                    idPiece: row.idPiece,
                    nomPiece: row.nomPiece,
                    quantite: row.quantite,
                    UnitPrice: row.unitPrice
                });
            }
        }

        return res.json({founded : true, interventionsData});
    } catch (error) {
        return res.status(500).json({message : error.message});
    }finally {
        connection.release();
    }

}



//getting an intervention by its ID:
export const getInterventionById = async (req, res) => {

    //Verification of the user's role:
    if(req.user.role.toLowerCase() !== 'admin')
        return res.json({message : "permission denied!"});

    const idIntervention = req.params.idIntervention;
    const connection = await pool.getConnection();

    //query to get intervention from the DB by its ID:
    const query = `SELECT
        intervention.idIntervention as idIntervention,
        dateIntervention,
        description,
        idDemande,
        technicienNom,
        technicienPrenom,
        technicienTel,
        statusIntervention,
        technicienCost,
        totalCost,

        idPiece,
        nomPiece,
        quantite,
        unitPrice
        FROM intervention LEFT JOIN piece ON intervention.idIntervention = piece.idIntervention 
        WHERE intervention.idIntervention = ?`;
    try {
        const [result] = await connection.query(query, [idIntervention]);

        if(result.length === 0)
            return res.status(401).json({founded : false});

        //get the intervention informations:
        const intervention = {
            idIntervention : result[0].idIntervention,
            dateIntervention : result[0].dateIntervention.toISOString().split('T')[0],
            timeIntervention :result[0].dateIntervention.toISOString().split('T')[1].slice(0, 5),
            description:result[0].description,
            statusIntervention:result[0].statusIntervention,
            techNom : result[0].technicienNom,
            techPrenom : result[0].technicienPrenom,
            techTel : result[0].technicienTel,
            techCost : result[0].technicienCost,
            totalCost : result[0].totalCost,
            idDemande : result[0].idDemande
        }

        //fill in the list of pieces:
        const piecesList = [];
        for (const p of result){
            if(p.idPiece) {
                const piece = {
                    idPiece : p.idPiece,
                    nomPiece : p.nomPiece,
                    quantite : p.quantite,
                    UnitPrice : p.unitPrice
                }
                piecesList.push(piece);
            }
        }

        return res.json({
            founded : true,
            interventionData : intervention,
            piecesList
        });
    } catch (error) {
        res.status(500).json({message : error.message});
    } finally {
        connection.release();
    }

}



//creating a new intervention for a request :
export const addIntervention = async (req, res) => {

    //Verification of the user's role:
    if(req.user.role.toLowerCase() !== 'admin')
        return res.json({message : "permission denied!"});

    const {intervention, piecesList} = req.body;
    const idDemande = req.params.idDemande;

    const interventionDateAndTime = new Date(`${intervention.dateIntervention}T${intervention.timeIntervention}`);
    const connection = await pool.getConnection();

    //query for adding a new intervention :
    const insertInterventionQuery = `INSERT INTO intervention(dateIntervention, description, idDemande, technicienNom, technicienPrenom, technicienTel, statusIntervention, technicienCost, totalCost)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    //query for adding all the intervention pieces :
    const insertInterventionsPiecesQuery = `INSERT INTO piece(nomPiece, quantite, idIntervention, unitPrice) 
        VALUES (?, ?, ?, ?)`;

    //query for update the request status if needed:
    const updateRequestStatusQuery = `UPDATE demande
        SET statusDemande = ? 
        WHERE idDemande = ?`;

    try {
        
        const [result1] = await connection.query(insertInterventionQuery,[
                interventionDateAndTime,
                intervention.description,
                idDemande,
                intervention.techNom, 
                intervention.techPrenom, 
                intervention.techTel, 
                intervention.statusIntervention,
                intervention.techCost,
                intervention.totalCost
            ]);
        
        const idIntervention = result1.insertId;
        
        //adding all the pieces for the added intervention:
        for (const p of piecesList) {
            await connection.query(insertInterventionsPiecesQuery,[
                p.nomPiece,
                p.quantite,
                idIntervention,
                p.UnitPrice
            ]);
        }

        
        //Checking if the request's status needs update:
        const statusDemande = await updateTheRequestStatus(idDemande);
        if(statusDemande){
            await connection.query(updateRequestStatusQuery, [
                statusDemande,
                idDemande
            ]);
        }


        return res.json({
            added : true,
            data : result1
        });


    }catch(e){
        return res.status(500).json({added : false, error : e.message});
    }finally{
        connection.release();
    }
}




//editing an existed intervention:
export const editIntervention = async (req, res) => {

    //verification of the user's role:
    if (req.user.role.toLowerCase() !== 'admin')
        return res.json({message : "permission denied!"});

    const {intervention, piecesList} = req.body;
    const dateAndTime = new Date(`${intervention.dateIntervention}T${intervention.timeIntervention}`);
    const connection = await pool.getConnection();

    //query for editing the current intervention:
    const queryUpdateIntervention = `UPDATE intervention 
        SET dateIntervention = ?, description = ?, technicienNom = ?, technicienPrenom = ?,technicienTel = ?,statusIntervention = ?, technicienCost = ?, totalCost = ? 
        WHERE idIntervention = ?`;

    //query for deleting the interventions pieces:
    const queryDeletePieces = `DELETE FROM piece 
        WHERE idIntervention = ?`;
    
    //query for updating the pieces for the current intervention:
    const queryInsertPieces = `INSERT INTO piece(nomPiece, quantite, idIntervention, unitPrice) 
        VALUES (?, ?, ?, ?)`;

    //query for update the request status if needed:
    const updateRequestStatusQuery = `UPDATE demande
        SET statusDemande = ? 
        WHERE idDemande = ?`;

    try {
        const [result1] = await connection.query(queryUpdateIntervention, [
            dateAndTime,
            intervention.description,
            intervention.techNom,
            intervention.techPrenom,
            intervention.techTel,
            intervention.statusIntervention,
            intervention.techCost,
            intervention.totalCost,
            intervention.idIntervention
        ]);

        const [result2] = await connection.query(queryDeletePieces, [intervention.idIntervention]);

        for(const p of piecesList){
            const [result] = await connection.query(queryInsertPieces, [
                p.nomPiece,
                p.quantite,
                intervention.idIntervention,
                p.UnitPrice
            ]);
        }


        //Checking if the request's status needs update:
        const statusDemande = await updateTheRequestStatus(intervention.idDemande);
        if(statusDemande){
            await connection.query(updateRequestStatusQuery, [
                statusDemande,
                intervention.idDemande
            ]);
        }

        return res.json({
            updated : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message
        });
    }finally {
        connection.release();
    }
    
} 


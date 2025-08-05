import {pool} from '../database/db.js';
import cloudinary from '../uploadImages/cloudinary.js';


//getting request by its Id:
export const getRequestById = async (req , res) => {
    const id = req.params.idDemande;
    
    //query for getting a request by Id:
    const query = 'SELECT idDemande, nomMateriel, description, dateDemande, statusDemande, imageUrl, imageId, nom, prenom, tel, email FROM demande INNER JOIN utilisateur ON demande.idUtilisateur = utilisateur.id WHERE idDemande = ?';

    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query(query, [id]);
        const demandeData = {
            idDemande : result[0].idDemande,
            nomMateriel : result[0].nomMateriel,
            description : result[0].description,
            dateDemande : result[0].dateDemande,
            statusDemande : result[0].statusDemande,
            imageUrl : result[0].imageUrl,
            imageId : result[0].imageId,
            employeeNom : result[0].nom,
            employeePrenom : result[0].prenom,
            employeeTel : result[0].tel,
            employeeEmail : result[0].email
        }

        return res.json({founded : true, demandeData});
    } catch (error) {
        return res.status(500).json({message : error.message});
    }finally {
        connection.release();
    }
}



//getting all the requests:
export const getAllRequests = async (req, res) => {
    const connection = await pool.getConnection();

    //Verification of the user's role:
    if(req.user.role.toLowerCase() !== 'admin')
        return res.json({message : "permission denied!"});
    
    //query for selecting all the requests from DB:
    const query = 'SELECT idDemande, nomMateriel, description, dateDemande, statusDemande, imageUrl, imageId, nom, prenom, tel, email FROM demande INNER JOIN utilisateur ON demande.idUtilisateur = utilisateur.id';
    
    try {
        const [result] = await connection.query(query);
        const demandesData = [];

        for (const d of result){
            const demande = {
                idDemande : d.idDemande,
                nomMateriel : d.nomMateriel,
                description : d.description,
                dateDemande : d.dateDemande,
                statusDemande : d.statusDemande,
                imageUrl : d.imageUrl,
                imageId : d.imageId,
                employeeNom : d.nom,
                employeePrenom : d.prenom,
                employeeTel : d.tel,
                employeeEmail : d.email
            }
            demandesData.push(demande);
        }

        return res.json({founded : true, demandesData});
    } catch (error) {
        return res.status(500).json({message : error.message});
    }finally {
        connection.release();
    }
}



//getting the requests for a specific user or employee:
export const getRequestsForTheCurrentUser = async (req, res) => {

    //verification of the user's role:
    if(req.user.role.toLowerCase() !== 'employee')
        return res.json({message : "can't fetch the requests for this user"});

    const idUser = req.user.id;
    //query for recovering all the requests by the user's ID:
    const query = `SELECT 
        demande.idDemande as idDemande,
        demande.description as demandeDescription,
        nomMateriel,
        dateDemande,
        statusDemande,
        imageUrl,
        imageId,

        idIntervention,
        dateIntervention,
        statusIntervention,
        intervention.description as interventionDescription,
        technicienNom,
        technicienPrenom,
        technicienTel,
        technicienCost,
        totalCost
        FROM demande LEFT JOIN intervention ON demande.idDemande = intervention.idDemande
        WHERE idUtilisateur = ?`;
    const connection = await pool.getConnection();

    try {
        const [result] = await connection.query(query, [idUser]);
        const demandesData = [];
        const demandesMap = new Map();

        for(const r of result){
            const idDemande = r.idDemande;

            if(!demandesMap.has(idDemande)) {
                const demande = {
                    idDemande : r.idDemande,
                    nomMateriel : r.nomMateriel,
                    description : r.demandeDescription,
                    dateDemande : r.dateDemande.toLocaleDateString(),
                    timeDemande : r.dateDemande.toLocaleTimeString().slice(0, 5),
                    statusDemande : r.statusDemande,
                    imageUrl : r.imageUrl,
                    imageId : r.imageId,
                    interventionsList : []
                }
                demandesMap.set(idDemande, demande);
                demandesData.push(demande);
            }

            if(r.idIntervention){
                const intervention = {
                    idIntervention: r.idIntervention,
                    dateIntervention: r.dateIntervention.toLocaleDateString(),
                    timeIntervention : r.dateIntervention.toLocaleTimeString().slice(0, 5),
                    description : r.interventionDescription,
                    techNom: r.technicienNom,
                    techPrenom: r.technicienPrenom,
                    techTel: r.technicienTel,
                    statusIntervention: r.statusIntervention,
                    techCost: r.technicienCost,
                    totalCost: r.totalCost
                }
                demandesMap.get(idDemande).interventionsList.push(intervention);
            }
        }

        return res.json({founded : true, demandesData});
    } catch (error) {
        return res.status(500).json({founded : false, message : error.message});
    } finally {
        connection.release();
    }
}



//add new request:
export const addRequest = async (req, res) => {

    //verification of the user's role:
    if (req.user.role.toLowerCase() !== 'employee')
        return res.json({message : "creating a request is not allowed"});


    const imageUrl = req.file.path || req.file.url;
    const imageId = req.file.filename;

    const {
        nomMateriel,
        description,
        statusDemande,
        dateDemande,
        timeDemande
    } = req.body;

    const dateAndTime = `${dateDemande}T${timeDemande}`;
    //query for adding a new request:
    const query = `INSERT INTO demande(nomMateriel, description, dateDemande, idUtilisateur, statusDemande, imageUrl, imageId)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const connection = await pool.getConnection();

    try {
        //excuting the sql request to insert this request:
        const [result] = await connection.query(query, [
            nomMateriel,
            description,
            dateAndTime,
            req.user.id,
            statusDemande,
            imageUrl,
            imageId
        ]);

        return res.json({
            added : true
        });
    } catch (error) {
        return res.status(500).json({message : error.message});
    }finally {
        connection.release();
    }
}



//delete a request by its ID:
export const deleteRequest = async (req, res) => {

    //verification of the user's role:
    if(req.user.role.toLowerCase() !== 'employee')
        return res.json({message : "this operation is not allowed"});

    const idDemande = req.params.idDemande;
    const {imageId} = req.body;
    const connection = await pool.getConnection();

    //query for deleteing a request by its Id:
    const query = `DELETE FROM demande WHERE idDemande = ?`;

    try {
        await cloudinary.uploader.destroy(imageId);
        await connection.query(query, [idDemande]);

        return res.json({
            deleted : true
        })
    } catch (error) {
        return res.status(500).json({
            message : "failed to delete",
            deleted : false
        });
    } finally {
        connection.release();
    }
}




//edit a request by its ID:
export const editRequest = async (req, res) => {

    //verification of the user's role:
    if(req.user.role.toLowerCase() !== 'employee')
        return res.json({message : "this operation is not allowed"});

    const idDemande = req.params.idDemande;
    const {
        nomMateriel,
        description,
        oldImageId
    } = req.body;
    const image = req.file;
    const connection = await pool.getConnection();

    try {
        if(image){
            //query for updating a request:
            const query = `UPDATE demande 
                SET nomMateriel = ?, description = ?, imageUrl = ?, imageId =?
                WHERE idDemande = ?`;

            //deleteing the old image from cloudinary:
            await cloudinary.uploader.destroy(oldImageId);
            
            const [queryResult] = await connection.query(query, [
                nomMateriel,
                description,
                req.file.path,
                req.file.filename,
                idDemande
            ]);
        }else {
            //query for updating a request:
            const query = `UPDATE demande 
                SET nomMateriel = ?, description = ?
                WHERE idDemande = ?`;

            const [queryResult] = await connection.query(query, [
                nomMateriel,
                description,
                idDemande
            ]);
        }

        return res.json({
            updated : true
        });
            
    
    } catch (error) {
        return res.status(500).json({
            updated : false,
            message : "failed to update"
        });
    } finally {
        connection.release();
    }
}
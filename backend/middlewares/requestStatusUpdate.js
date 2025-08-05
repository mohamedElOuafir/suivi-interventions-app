import {pool} from '../database/db.js';


export const updateTheRequestStatus = async (idDemande) => {

    const connection = await pool.getConnection();

    const query = `SELECT statusIntervention FROM intervention 
        WHERE idDemande = ?`;

    try {
        const [result] = await connection.query(query, [idDemande]);
        let statusDemande;

        if(result.length === 0)
            statusDemande = 'Pending';
        else if (result.every(r => r.statusIntervention.toLowerCase() === 'completed'))
            statusDemande = 'Done';
        else 
            statusDemande = 'In Progress';

        return statusDemande;

    }catch(e) {
        return null
    }finally {
        connection.release();
    }
}
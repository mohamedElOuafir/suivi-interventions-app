
export interface User {
    id? : string,
    nom : string,
    prenom : string,
    tel : string,
    departement : string,
    email : string,
    role : string,
    firstLogin? : boolean
}

export interface Demande {
    idDemande? : number,
    nomMateriel : string,
    description : string,
    dateDemande : string,
    timeDemande : string,
    imageUrl? : string,
    imageId? : string,
    statusDemande : string,
    employeeNom? : string,
    employeePrenom? : string,
    employeeTel? : string,
    employeeEmail? : string,
    interventionsList? : Intervention[]
}

export interface Intervention {
    idIntervention? : number,
    idDemande?: number,
    dateIntervention : string,
    timeIntervention : string,
    description : string,
    statusIntervention : string,
    techNom : string,
    techPrenom : string,
    techTel : string,
    techCost : number,
    totalCost : number,
    piecesList? : Piece[]
}

export interface Piece {
    idPiece? : number,
    nomPiece : string,
    quantite : number,
    UnitPrice : number
}


export interface ReqCardEmp {
    demande : Demande,
    onDelete: (bool : boolean) => void,
    onDeleteFailed : (bool : boolean) => void
    onUpdateMessage : (bool : boolean) => void
}

export interface UpdateReqCardEmp {
    demande : Demande,
    onUpdate : (bool : boolean) => void,
    onUpdateMessage : (bool : boolean) => void
}
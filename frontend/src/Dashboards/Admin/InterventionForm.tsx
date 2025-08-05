import { useEffect, useState, type FormEvent } from "react";
import '../../styles/InterventionForm.css';
import { useNavigate, useParams } from "react-router-dom";
import { type Intervention, type Piece } from "../../types/interfaces";
import { useProfile } from "../../context/ProfileContext";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

export default function InterventionForm() {

    //splitting between creating mode or updating mode:
    const {idIntervention, idDemande} = useParams();
    const editMode = Boolean(idIntervention);

    //states for :
    /*
        * submitting
        * the current Intervention's informations
        * the added piece
        * the list of pieces
        * error message 
    */
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newIntervention, setNewIntervention] = useState<Intervention>({
        dateIntervention : "",
        timeIntervention :"",
        description:"",
        statusIntervention:"Pending",
        techNom : "",
        techPrenom : "",
        techTel : "",
        techCost : 0,
        totalCost : 0
    });
    const [newPiece, setNewPiece] = useState<Piece>({
        nomPiece : "",
        quantite : 0,
        UnitPrice: 0
    });
    const [piecesList,setPiecesList] = useState<Piece[]>([]);
    const [errorMessage, setErrorMessage] = useState("");


    const {profile} = useProfile();

    const navigate = useNavigate();


    //function for handling the added piece:
    const handleAddPiece = () => {

        if (newPiece.nomPiece && newPiece.quantite !== 0 && newPiece.UnitPrice !== 0) {
            
            if(!piecesList.some(p => p.nomPiece === newPiece.nomPiece))
                setPiecesList(prev => [...prev, newPiece]);
        }
        setNewPiece({
            nomPiece : "",
            quantite : 0,
            UnitPrice: 0
        })
    }



    //function for handling the removed piece:
    const handleRemovePiece = (removedPiece : string) => {
        if (removedPiece)
            setPiecesList(prev => prev.filter(p => p.nomPiece !== removedPiece));
    }



    //function for calculating the total cost of the current intervention:
    const handleCalculateTotalCost = () => {
        let sum = 0;
        piecesList.forEach(p =>  {
            sum += p.quantite * p.UnitPrice;
        });
        return sum + newIntervention.techCost;
    }




    //function for submitting the intervention information when its the creating mode
    const handleSubmit = async (e : FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const intervention = {...newIntervention, totalCost:handleCalculateTotalCost()};
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3000/demande/add/intervention/${idDemande}`,{
                method : "POST",
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : token!
                },
                body : JSON.stringify({
                    intervention,
                    piecesList
                })
            });

            const data = await response.json();

            if (data.added){
                navigate(`/Dashboard/Admin/ViewRequests/ViewInterventions/${idDemande}`, {
                    state : {
                        isAdded : true
                    }
                });
            }else {
                setErrorMessage('failed to add intervention!');      
            }
            setIsSubmitting(false);
        }catch(e) {
            setErrorMessage('Network error. Please try again.');
            setIsSubmitting(false);
        }
        
    }



    //function for handling the edited intervention when its the edit mode:
    const handleEdit = async (e : FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const intervention = {...newIntervention, totalCost:handleCalculateTotalCost()};
        const token = localStorage.getItem('token');
        try {
            const response = await fetch("http://localhost:3000/demande/edit/intervention",{
                method : "PUT",
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : token!
                },
                body : JSON.stringify({
                    intervention,
                    piecesList
                })
            });

            const data = await response.json();

            if (data.updated){
                navigate(`/Dashboard/Admin/ViewRequests/ViewInterventions/${newIntervention.idDemande}`, {
                    state : {
                        isUpdated: true
                    }
                });
            }else {
                setErrorMessage('failed to edit intervention!');          
            }
            setIsSubmitting(false);
        }catch(e) {
            setErrorMessage('Network error. Please try again.');
            setIsSubmitting(false);
        }
        
    }



    //function for recovering the intervention data when its the edit mode:
    const fetchIntervnetionById = async (idIntervention : string) => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:3000/get/intervention/${idIntervention}`, {
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : token!
                }
            });
            const data = await response.json();

            if(data.founded){
                setNewIntervention(data.interventionData);
                setPiecesList(data.piecesList);
            }
        } catch (error) {
            setErrorMessage("can't find this intervention");
            setTimeout(() => {
                navigate(-1);
            },2000);
        }
    }




    useEffect(() => {
        if (editMode && idIntervention){
            fetchIntervnetionById(idIntervention);
        }
    },[]);


    useEffect(() => {
        const token = localStorage.getItem('token');
        if(!token && !(profile?.firstLogin)) {
            navigate('/');
        }
    },[]);



    useEffect(() => {
        const token = localStorage.getItem("token");

        if(token){
            const decodedJwt = jwtDecode(token);
            const expiredTime = decodedJwt.exp! * 1000;
            const timeLeft = expiredTime - Date.now();

            if(timeLeft <= 0){
                toast.error("Session Expired, Please Login Again");
                navigate('/');
            }else {
                const timer = setTimeout(() => {
                    toast.error("Session Expired, Please Login Again");
                    navigate('/');
                }, timeLeft);

                return () => clearInterval(timer);
            }
        }
    }, []);


    return (
        <div className="add-intervention-page">
            <div className="intervention-form-container">
                <div className="intervention-form">
                    <div className="form-header">
                        <h2>{editMode ? 
                            "Edit Intervention":
                            "New Intervention"
                        }
                        </h2>
                        <p>{editMode ? 
                        "Change what you want in the intervention details below":
                        "Fill in the intervention details below"
                        }
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="error-message">
                            <svg viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={editMode ? handleEdit : handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="date">Date</label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={newIntervention.dateIntervention}
                                    onChange={(e) => setNewIntervention({...newIntervention, dateIntervention : e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="time">Time</label>
                                <input
                                    type="time"
                                    id="time"
                                    name="time"
                                    value={newIntervention.timeIntervention}
                                    onChange={(e) => setNewIntervention({...newIntervention, timeIntervention : e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">Status</label>
                                <select
                                    id="status"
                                    value={newIntervention.statusIntervention} 
                                    onChange={(e) => setNewIntervention({...newIntervention, statusIntervention:e.target.value})}
                                    required
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <div className="form-group span-full">
                                <label htmlFor="description">Intervention Description</label>
                                <textarea 
                                    id="description"
                                    placeholder="Describe the intervention details..."
                                    value={newIntervention.description}
                                    onChange={(e) => setNewIntervention({...newIntervention, description:e.target.value})}
                                    required
                                    rows={4}
                                />
                            </div>

                            <div className="form-group span-full">
                                <h1 className="tech-details-title-intervention-form">Technician Details</h1>
                            </div>                        
                            <div className="form-group">
                                <label htmlFor="techNom">Technician First Name</label>
                                <input
                                    type="text"
                                    id="techNom"
                                    name="techNom"
                                    value={newIntervention.techNom}
                                    onChange={(e) => setNewIntervention({...newIntervention, techNom:e.target.value})}
                                    required
                                    placeholder="Name"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="techPrenom">Technician Last Name</label>
                                <input
                                    type="text"
                                    id="techPrenom"
                                    name="techPrenom"
                                    value={newIntervention.techPrenom}
                                    onChange={(e) => setNewIntervention({...newIntervention, techPrenom:e.target.value})}
                                    required
                                    placeholder="First Name"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="techTel">Technician Phone</label>
                                <input
                                    type="tel"
                                    id="techTel"
                                    name="techTel"
                                    value={newIntervention.techTel}
                                    onChange={(e) => setNewIntervention({...newIntervention, techTel:e.target.value})}
                                    required
                                    placeholder="+212 **** *** ***"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="techCost">Technician cost</label>
                                <input
                                    type="number"
                                    id="techCost"
                                    name="techCost"
                                    value={newIntervention.techCost}
                                    min={0}
                                    onChange={(e) => setNewIntervention({...newIntervention, techCost:Number(e.target.value)})}
                                    required
                                    placeholder="Price in DH"
                                />
                            </div>


                            <div className="pieces-form span-full">
                                <h4>Add Replacement Parts</h4>
                                <div className="pieces-input-group">
                                    <div className="form-group">
                                        <label htmlFor="pieceNom">Part Name</label>
                                        <input 
                                            type="text"
                                            id="pieceNom"
                                            name="pieceNom"
                                            placeholder="Piece"
                                            value={newPiece.nomPiece}
                                            onChange={(e) => setNewPiece({...newPiece, nomPiece : e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="pieceQte">Quantity</label>
                                        <input 
                                            type="number"
                                            id="pieceQte"
                                            name="pieceQte"
                                            placeholder="1"
                                            value={newPiece.quantite}
                                            onChange={(e) => setNewPiece({...newPiece, quantite : Number(e.target.value)})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="piecePrice">Unit Price</label>
                                        <input 
                                            type="number"
                                            min={0}
                                            id="pieceUnitPrice"
                                            name="pieceUnitPrice"
                                            placeholder="1"
                                            value={newPiece.UnitPrice}
                                            onChange={(e) => setNewPiece({...newPiece, UnitPrice : Number(e.target.value)})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <button
                                            type="button" 
                                            className="add-piece-btn"
                                            onClick={handleAddPiece}
                                            >
                                            Add Part
                                        </button>
                                    </div>     
                                </div>

                                <div className="pieces-list">
                                    {piecesList.length > 0 && <h4>Added Parts</h4>}
                                    <table>
                                        {piecesList.length > 0 && (
                                            <>
                                                <thead>
                                                    <tr>
                                                        <td>Part Name</td>
                                                        <td>Quantity</td>
                                                        <td>Unit Price</td>
                                                        <td>Action</td>
                                                    </tr>
                                                </thead>
                                            
                                                <tbody>
                                                    {piecesList.map((p, index)=> (
                                                    <tr 
                                                        className="piece-item-intervention-form"
                                                        key={index}
                                                    >
                                                        <td>{p.nomPiece}</td>
                                                        <td>{p.quantite}</td>
                                                        <td>{p.UnitPrice}DH</td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="remove-piece"
                                                                onClick={() => handleRemovePiece(p.nomPiece)}
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </>
                                        )}                                      
                                    </table>
                                </div>
                            </div>

                        </div>
                        
                        <div className="intervention-total-cost">
                            <div>
                                <span>Total Cost : </span>
                                <span>
                                    {handleCalculateTotalCost().toString()+ "DH"}
                                </span>
                            </div>  
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={
                                    () => navigate(-1)
                                }
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={isSubmitting}
                            >
                                {editMode ? "Update" : "Add Intervention"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>   
        
    )
}
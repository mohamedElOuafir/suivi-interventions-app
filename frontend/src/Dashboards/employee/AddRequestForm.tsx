import { useEffect, useState, type FormEvent } from "react";
import NavBar from "../../components/NavBar";
import '../../styles/AddRequestForm.css'
import { useActiveLink } from "../../context/activeLinkContext";
import { useProfile } from "../../context/ProfileContext";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

export default function AddRequestForm() {


    /* States for :
        * the name of the corrupted materiel.
        * the description of the materiel problem.
        * the image of the damage.
        * the submitting state.
        * the error message when the submitting fails.
        * the success message when the request is added.
    */

    const [nomMateriel, setNomMateriel] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isAdded, setIsAdded] = useState(false);


    const {updateActiveLink} = useActiveLink();
    const {profile} = useProfile();


    const navigate = useNavigate();

    

    //handling the request form submit:
    const handleSubmit = async (e : FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        //preparing the image for the upload:
        const formData = new FormData();

        formData.append("image", image!);
        formData.append("nomMateriel", nomMateriel);
        formData.append("description", description);
        formData.append("statusDemande", "Pending");
        formData.append("dateDemande", new Date().toLocaleDateString('en-CA'));
        formData.append("timeDemande", new Date().toLocaleTimeString('en-GB', {hour : '2-digit', minute :'2-digit'}));

        //recovering the jwt token:
        const token = localStorage.getItem('token');

        //submitting the request form:
        try {
            const response = await fetch("http://localhost:3000/add/demande", {
                method : "POST",
                headers : {
                    "Authorization" : token!
                },
                body : formData
            });        
            const data = await response.json();

            if (data.added){
                setIsAdded(true);
                setDescription("");
                setImage(null);
                setNomMateriel("");
            } 
            else{ 
                setErrorMessage('failed to add the request');
            }
        } catch (error : any) {
            setErrorMessage('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }


    useEffect(() => {
        setTimeout(() => {
            setIsAdded(false);
        }, 6000)
    },[isAdded]);


    useEffect(() => {
        updateActiveLink('/Dashboard/Employee/AddRequestForm');
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
        <>
            <NavBar />
            <div className="add-request-page">
                {isAdded && 
                    <div className="card" style={{display : isAdded ? "flex" : "none"}}>
                        <div className="icon-container">
                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            strokeWidth="0"
                            fill="currentColor"
                            stroke="currentColor"
                            className="icon"
                            >
                            <path
                                d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"
                            ></path>
                            </svg>
                        </div>
                        <div className="message-text-container">
                            <p className="message-text">Added Successfully</p>
                            <p className="sub-text">Everything seems great</p>
                        </div>
                        <button
                            onClick={() => setIsAdded(false)}
                        >
                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 15 15"
                            strokeWidth="0"
                            fill="none"
                            stroke="currentColor"
                            className="cross-icon"
                            >
                                <path
                                fill="currentColor"
                                d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                                clipRule="evenodd"
                                fillRule="evenodd"
                                ></path>
                            </svg>
                        </button>  
                    </div>
                }

                <div className="add-request-container">
                    <div className="form-card">
                        <div className="form-header">
                            <h2>Add New Request</h2>
                            <p>Fill in the request details below</p>
                        </div>

                        {errorMessage && (
                            <div className="error-message">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            <span>{errorMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="nomMateriel">Materiel Name</label>
                                    <input
                                    type="text"
                                    id="nomMateriel"
                                    name="nomMateriel"
                                    value={nomMateriel}
                                    onChange={(e) => setNomMateriel(e.target.value)}
                                    required
                                    placeholder="Materiel"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <textarea 
                                    id="description"
                                    placeholder="Describe the issue in details..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    rows={6}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="image">Upload Image</label>
                                    <div className="file-upload-container">
                                        <input
                                            type="file"
                                            id="demandeImage"
                                            accept="image/*"
                                            onChange={(e) => setImage(e.target.files?.[0] || null)}
                                            className="file-input"
                                            required
                                        />
                                        <label htmlFor="demandeImage" className="file-upload-label">
                                            <svg className="upload-icon" viewBox="0 0 24 24">
                                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                            </svg>
                                            <span>Choose an image</span>
                                            <span className="file-name">{image ? image.name : "No file selected"}</span>
                                        </label>
                                    </div>
                                </div>

                                {image &&
                                <div className="uploaded-image-container">
                                    <img src={URL.createObjectURL(image!)} alt={image?.name}/>
                                </div>
                                }
                            </div>
                            

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                    <>
                                        <span className="spinner"></span>
                                        Submitting...
                                    </>
                                    ) : "Add Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />               
        </>
    )
}
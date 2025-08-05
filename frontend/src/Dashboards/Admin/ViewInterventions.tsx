import { useLocation, useNavigate, useParams } from "react-router-dom";
import InterventionCard from "../../components/InterventionCard";
import '../../styles/ViewInterventions.css';
import { useEffect, useState } from "react";
import { type Demande, type Intervention } from "../../types/interfaces";
import { useProfile } from "../../context/ProfileContext";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

export default function ViewInterventions() {

    //recovering the request Id by the url params:
    const {idDemande} = useParams();


    /* States for:
        * the interventions for the current requests.
        * the data of the current requests.
        * the success message when an intervention is added.
        * the success message when an intervention is updated.
        * the image zoom for the current request.
    */

    const [interventionData, setInterventionData] = useState<Intervention[] | null>(null);
    const [demandeData, setDemandeData] = useState<Demande | null>(null);
    const [isInterventionAdded, setIsInterventionAdded] = useState(false);
    const [isInterventionUpdated, setIsInterventionUpdated] = useState(false);
    const [isImageZoomed, setIsImageZoomed] = useState(false);


    const {profile} = useProfile();

    const navigate = useNavigate();
    const location = useLocation();



    //Recovering the interventions data for the current request:
    const fetchInterventions = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:3000/get/interventions/${idDemande}`, {
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : token!
                }
            });
            const data = await response.json();
            setInterventionData(data.interventionsData);

        } catch (error) {
            console.error("problem fetching interventions");
        }
    }



    //Recovering the data of the current request:
    const fetchRequestById = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:3000/get/demande/${idDemande}`, {
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : token!
                }
            });
            const data = await response.json();

            setDemandeData(data.demandeData);
        } catch (error) {
            console.error("request not found");
        }
    }


    useEffect(() => {
        fetchRequestById();
        fetchInterventions();
        
        let clearNavigationStateTimer : number;
        //checking if the intervention form was on create mode or edit mode
        if(location.state?.isAdded){
            setIsInterventionAdded(true);
            setTimeout(() => {
                setIsInterventionAdded(false);
            },5000);

        }else if(location.state?.isUpdated){
            setIsInterventionUpdated(true);
            setTimeout(() => {
                setIsInterventionUpdated(false);
            },5000);

        }

        //clearing the location's state!
        if(location.state){
            clearNavigationStateTimer = setTimeout(() => {
                navigate(location.pathname, {replace : true});
            },100);
        }

        return () => clearInterval(clearNavigationStateTimer); 
            
    },[location, navigate, location.pathname]);



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
        
        <div className="interventions-page">
            <div className="interventions-header">
                <img className="logo" src="/src/assets/icons/Logo-ROUANDI.png"/>
                <div className="header-top-row">
                    <button className="back-button" onClick={() => navigate('/Dashboard/Admin/ViewRequests')}>
                        <svg className="back-icon" viewBox="0 0 24 24">
                            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        Back to Requests
                    </button>
                </div>


                {isImageZoomed && (
                    <div className="image-zoom-modal">
                        <div 
                            className="image-zoom-backdrop"
                            onClick={() => setIsImageZoomed(false)}
                            >
                            <button 
                                className="image-zoom-close"
                                onClick={() =>  setIsImageZoomed(false)}
                                aria-label="Close zoomed image"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="image-zoom-container">
                                <img 
                                    src={demandeData?.imageUrl} 
                                    alt="Zoomed request image" 
                                    className="zoomed-intervention-image"
                                />
                            </div>
                        </div>
                    </div>
                )}

                
                {demandeData && (

                    <>
                        <h1 className="view-interventions-employee-details-title">Request Details</h1>
                        <div className="view-interventions-request-details">
                            <div 
                                className="image-preview-section"
                                role="button"
                                onClick={() => setIsImageZoomed(true)}
                            >
                                <img 
                                    src={demandeData.imageUrl} 
                                    alt="request image issue" 
                                    className="intervention-image"
                                />
                            </div>

                            <div className="content-sections">
                                <div className="request-info-section">
                                    <h1 className="view-interventions-employee-details-title">Issue Details</h1>
                                    <div className="detail-pair">
                                        <span className="view-intervention-detail-label">Material:</span>
                                        <p className="view-interventions-materiel">{demandeData.nomMateriel}</p>
                                    </div>
                                
                                    <div className="detail-pair">
                                        <span className="view-intervention-detail-label">Description:</span>
                                        <p className="view-interventions-description">{demandeData.description}</p>
                                    </div>
                                
                                    <div className="detail-pair">
                                        <span className="view-intervention-detail-label">Request Date:</span>
                                        <p className="view-interventions-date-demande">
                                        {demandeData.dateDemande.toString().split('T')[0]+" at "+ demandeData.dateDemande.toString().split('T')[1].slice(0, 5)}
                                        </p>
                                    </div>
                                
                                    <div className="detail-pair">
                                        <span className="view-intervention-detail-label">Status:</span>
                                        <p className={`view-interventions-status ${demandeData.statusDemande.toLowerCase()
                                            .replace(/\s+/g, "")}`}>
                                        {demandeData.statusDemande}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="employee-info-section">
                                    <h1 className="employee-section-title">Employee Details</h1>
                                    
                                    <div className="detail-pair">
                                        <span className="view-intervention-detail-label">First Name:</span>
                                        <p className="view-interventions-employee-firstName">{demandeData.employeePrenom}</p>
                                    </div>
                                
                                    <div className="detail-pair">
                                        <span className="view-intervention-detail-label">Last Name:</span>
                                        <p className="view-interventions-employee-lastName">{demandeData.employeeNom}</p>
                                    </div>
                                
                                    <div className="detail-pair">
                                        <span className="view-intervention-detail-label">Phone:</span>
                                        <p className="view-interventions-employee-tel">{demandeData.employeeTel}</p>
                                    </div>
                                
                                    <div className="detail-pair">
                                        <span className="view-intervention-detail-label">Email:</span>
                                        <p className="view-interventions-employee-email">{demandeData.employeeEmail}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                <div className="intervention-content-bar">
                    <h1 className="page-title">Intervention Details</h1>
                    <button 
                        className="add-intervention-button" 
                        onClick={() => navigate(`/Dashboard/Admin/ViewRequests/ViewInterventions/InterventionForm/add/${idDemande}`)}
                    >
                        <svg className="add-icon" viewBox="0 0 24 24">
                            <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        Add New Intervention
                    </button>
                </div>
                
            </div>

            {!interventionData ? (
                <div className="loader-container-view-interventions">
                    <div className="loader">
                        <img 
                            src="/src/assets/icons/socit_rouandi_logo.jpeg" 
                            alt="Loading..." 
                            className="loader-logo" 
                        />
                    </div>
                </div>
                
            ) : interventionData.length > 0 ? (
                <div className="intervention-content-container">
                    {interventionData.map((intervention, index) => (
                        <InterventionCard 
                            key={index}
                            {...intervention}
                        />
                    ))}
                </div>
            ):(
                <div className="empty-interventions-container">
                    <div className="empty-interventions-content">
                        <img src="/src/assets/icons/repair-icon.png" />
                        <h2 className="empty-interventions-title">There is no interventions yet...</h2>
                        <p className="empty-interventions-description">When interventions are created, they will appear here</p>
                    </div>
                </div>
            )}


            {(isInterventionAdded || isInterventionUpdated) && 
                    <div className="card">
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
                            <p className="message-text">{isInterventionAdded ? "Added" : "Updated"} Successfully</p>
                            <p className="sub-text">Everything seems great</p>
                        </div>
                        <button
                            onClick={
                                () => isInterventionAdded ? setIsInterventionAdded(false) : setIsInterventionUpdated(false)
                            }
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
            
        </div>
        
    )
}
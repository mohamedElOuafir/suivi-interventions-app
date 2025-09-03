import { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import RequestCardEmp from "../../components/RequestCardEmp";
import type { Demande } from "../../types/interfaces";
import { useActiveLink } from "../../context/activeLinkContext";
import { useProfile } from "../../context/ProfileContext";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import '../../styles/MyRequests.css';


export default function MyRequests() {


    /* States for :
        * the user's requests :
        * the success message for deleting a request:
        * the delete error message when the deletion fails.
        * the success message for the request update.
    */

    const [requestData, setrequestData] = useState<Demande [] | null>([]);
    const [isRequestDeleted, setIsRequestDeleted] = useState(false);
    const [deleteErrorMessage, setDeleteErrorMessage] = useState(false);
    const [isRequestUpdated, setIsRequestUpdated] = useState(false);

    const {updateActiveLink} = useActiveLink();
    const {profile} = useProfile();


    const navigate = useNavigate();



    //Recovering all the current user's requests:
    const fetchRequestsForTheCurrentUser = async () => {
        const token = localStorage.getItem('token');

        try{
            const response = await fetch("http://localhost:3000/get/demandes/user", {
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : token!
                }
            });
            const data = await response.json();

            if(data.founded)
                setrequestData(data.demandesData);
            
        }catch(e) {
            console.error('problem fetching the requests data!');
        }
    }



    useEffect(() => {
        updateActiveLink('/Dashboard/Employee/MyRequests');
        fetchRequestsForTheCurrentUser();
        
        if(isRequestDeleted || isRequestUpdated){
            setTimeout(() => {
                setIsRequestDeleted(false);
                setIsRequestUpdated(false);
                setDeleteErrorMessage(false);
            }, 4500);
        }
            
    }, [isRequestDeleted, isRequestUpdated, deleteErrorMessage]);



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
    <div className="my-requests-page">
        <div className="dashboard-hero">
            <div className="hero-content">
                <div className="hero-text">
                    <h1 className="dashboard-title">
                        My Requests Dashboard
                    </h1>
                    <p className="dashboard-subtitle">
                        Track and manage all your material requests in one place
                    </p>
                </div>
                <div className="hero-stats">
                    <div className="stat-card">
                        <div className="stat-number">{requestData?.length || 0}</div>
                        <div className="stat-label">Total Requests</div>
                    </div>
                    <div className="stat-card pending">
                        <div className="stat-number pending">
                            {requestData?.filter(req => req.statusDemande.toLowerCase() === 'pending').length || 0}
                        </div>
                        <div className="stat-label pending">Pending</div>
                    </div>
                    <div className="stat-card in-progress">
                        <div className="stat-number in-progress">
                            {requestData?.filter(req => req.statusDemande.toLowerCase() === 'in progress').length || 0}
                        </div>
                        <div className="stat-label in-progress">In Progress</div>
                    </div>
                    <div className="stat-card done">
                        <div className="stat-number done">
                            {requestData?.filter(req => req.statusDemande.toLowerCase() === 'done').length || 0}
                        </div>
                        <div className="stat-label done">Completed</div>
                    </div>
                </div>
            </div>
        </div>

        <div className="dashboard-content">
            {!requestData ? (
                <div className="loader-container">
                    <div className="loader">
                        <div className="loader-spinner"></div>
                        <img 
                            src="/src/assets/icons/socit_rouandi_logo.jpeg" 
                            className="loader-logo" 
                            alt="Loading..."
                        />
                    </div>
                    <p className="loader-text">Loading your requests...</p>
                </div>
            ) : requestData.length > 0 ? (
                <div className="requests-section">
                    <div className="section-header">
                        <h2 className="section-title">Your Requests</h2>
                    </div>
                    
                    <div className="my-requests-list">
                        {requestData.map((req, index) => (
                            <RequestCardEmp
                                key={index}
                                demande={req}
                                onDelete={setIsRequestDeleted}
                                onDeleteFailed={setDeleteErrorMessage}
                                onUpdateMessage={setIsRequestUpdated}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-content">
                        <div className="empty-icon">
                            <svg viewBox="0 0 200 200" className="empty-illustration">
                                <defs>
                                    <linearGradient id="emptyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#911924"/>
                                        <stop offset="100%" stopColor="#b03f49"/>
                                    </linearGradient>
                                </defs>
                                <rect x="50" y="80" width="100" height="80" rx="8" fill="url(#emptyGradient)" opacity="0.1"/>
                                <rect x="60" y="90" width="80" height="4" rx="2" fill="url(#emptyGradient)" opacity="0.3"/>
                                <rect x="60" y="100" width="60" height="4" rx="2" fill="url(#emptyGradient)" opacity="0.3"/>
                                <rect x="60" y="110" width="70" height="4" rx="2" fill="url(#emptyGradient)" opacity="0.3"/>
                                <circle cx="100" cy="140" r="15" fill="url(#emptyGradient)" opacity="0.2"/>
                                <path d="M92 140h16m-8-8v16" stroke="#911924" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <h3 className="empty-title">No Requests Yet</h3>
                        <p className="empty-description">
                            You haven't created any material requests yet. Start by submitting your first request to see it here.
                        </p>
                        <button className="empty-action-btn">
                            <svg className="btn-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Create New Request
                        </button>
                    </div>
                </div>
            )}
        </div>

        {(isRequestDeleted || isRequestUpdated) && 
            <div className="notification success-notification">
                <div className="notification-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>
                </div>
                <div className="notification-content">
                    <div className="notification-title">
                        {isRequestDeleted ? "Request Deleted" : "Request Updated"}
                    </div>
                    <div className="notification-message">
                        Your request has been {isRequestDeleted ? "successfully deleted" : "updated successfully"}
                    </div>
                </div>
                <button
                    className="notification-close"
                    onClick={() => {setIsRequestDeleted(false); setIsRequestUpdated(false)}}
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        }

        {deleteErrorMessage && (
            <div className="notification error-notification">
                <div className="notification-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                </div>
                <div className="notification-content">
                    <div className="notification-title">Action Failed</div>
                    <div className="notification-message">Failed to cancel this request. Please try again.</div>
                </div>
                <button 
                    className="notification-close"
                    onClick={() => setDeleteErrorMessage(false)}
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        )}
    </div>
    <Footer />
</>
    )
}
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
            <div className="view-requests-page">
                <div className="management-users-header-container">
                    <h1 className="management-users-header">
                        My Requests Dashboard
                    </h1>
                    <p className="management-users-subheader">
                        Check all progress of requests
                    </p>
                </div>

                {!requestData ? (
                    <div className="loader-container-view-requests">
                        <div className="loader">
                            <img 
                                src="/src/assets/icons/socit_rouandi_logo.jpeg" 
                                className="loader-logo" 
                            />
                        </div>
                    </div>
                ) : requestData.length > 0 ? (
                    <div className="requests-grid">
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
                ):(
                    <div className="empty-requests-container">
                        <div className="empty-requests-content">
                            <img src="/src/assets/icons/box.png" />
                            <h2 className="empty-requests-title">There are no requests for the moment</h2>
                            <p className="empty-requests-description">
                                When you will create some requests, their informations will appear here
                            </p>
                        </div>
                    </div>
                )}


                {(isRequestDeleted || isRequestUpdated) && 
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
                            <p className="message-text">{isRequestDeleted ? "Deleted" : "Updated"} Successfully</p>
                            <p className="sub-text">Everything seems great</p>
                        </div>
                        <button
                            onClick={() => {setIsRequestDeleted(false); setIsRequestUpdated(false)}}
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

                {deleteErrorMessage && (
                    <div className="error">
                        <div className="error__icon">
                            <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m13 13h-2v-6h2zm0 4h-2v-2h2zm-1-15c-1.3132 0-2.61358.25866-3.82683.7612-1.21326.50255-2.31565 1.23915-3.24424 2.16773-1.87536 1.87537-2.92893 4.41891-2.92893 7.07107 0 2.6522 1.05357 5.1957 2.92893 7.0711.92859.9286 2.03098 1.6651 3.24424 2.1677 1.21325.5025 2.51363.7612 3.82683.7612 2.6522 0 5.1957-1.0536 7.0711-2.9289 1.8753-1.8754 2.9289-4.4189 2.9289-7.0711 0-1.3132-.2587-2.61358-.7612-3.82683-.5026-1.21326-1.2391-2.31565-2.1677-3.24424-.9286-.92858-2.031-1.66518-3.2443-2.16773-1.2132-.50254-2.5136-.7612-3.8268-.7612z" fill="#393a37"></path></svg>
                        </div>
                        <div className="error__title">Failed to cancel this request</div>
                        <div 
                            className="error__close"
                            role="button"
                            onClick={() => setDeleteErrorMessage(false)}
                        >
                            <svg height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
                                <path d="m15.8333 5.34166-1.175-1.175-4.6583 4.65834-4.65833-4.65834-1.175 1.175 4.65833 4.65834-4.65833 4.6583 1.175 1.175 4.65833-4.6583 4.6583 4.6583 1.175-1.175-4.6583-4.6583z" fill="#393a37"></path>
                            </svg>
                        </div>
                    </div>
                )}
                                
            </div>
            <Footer />
        </>
    )
}
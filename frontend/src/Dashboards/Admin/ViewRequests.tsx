import { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import { useActiveLink } from "../../context/activeLinkContext";
import '../../styles/ViewRequests.css';
import type { Demande } from "../../types/interfaces";
import RequestCardAdm from "../../components/RequestCardAdm";
import { useProfile } from "../../context/ProfileContext";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";


export default function ViewRequests() {

    /* States for :
        * All the requests data.
        * the filter controller.
    */

    const [requestData, setRequestData] = useState<Demande[] | null>(null);
    const [statusFilter, setStatusFilter] = useState("");

    const {updateActiveLink} = useActiveLink();
    const {profile} = useProfile();


    const navigate = useNavigate();



    //recovering all the requests
    const fetchAllRequests = async (status : string) => {
        const token = localStorage.getItem('token');

        try {
            
            const response = await fetch('http://localhost:3000/get/demandes', {
                headers : {"Authorization" : token!}
            });
            
            const data = await response.json();

            if(status) {
                const demandesDataFiltred = data.demandesData.filter((d : Demande) => d.statusDemande === status);
                setRequestData(demandesDataFiltred);
            }else {
                setRequestData(data.demandesData);
            }
        } catch (error) {
            console.error('problem while calling all the requests');
        }
    }



    useEffect(() => {
        updateActiveLink('/Dashboard/Admin/ViewRequests');
        fetchAllRequests(statusFilter);
    },[statusFilter]);
    


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
                <div className="requests-header">
                    <div>
                        <h1>Consultation Requests</h1>
                        <p className="management-users-subheader">
                            You can plan all the requests.
                        </p>
                    </div>
                    <div className="requests-controls">
                        <div className="search-filter">
                            <select 
                                className="filter-select-requests" 
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                    </div>
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
                            <RequestCardAdm
                                key={index}
                                {...req}
                            />
                        ))}
                    </div>
                ):(
                    <div className="empty-requests-container">
                        <div className="empty-requests-content">
                            <img src="/src/assets/icons/box.png" />
                            <h2 className="empty-requests-title">There are no requests for the moment</h2>
                            <p className="empty-requests-description">When new requests arrive, they will appear here</p>
                        </div>
                    </div>
                )}
                
            </div>
            <Footer />
        </>
    )
}
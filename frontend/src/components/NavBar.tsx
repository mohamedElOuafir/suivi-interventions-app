import { Link, useNavigate } from "react-router-dom";
import { useActiveLink } from "../context/activeLinkContext";
import { useProfile } from "../context/ProfileContext";
import '../styles/NavBar.css';


export default function NavBar() {

    const {activeLink, updateActiveLink} = useActiveLink();
    const {profile, updateProfile} = useProfile();

    const navigate = useNavigate();


    //handling the logout operation:
    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("token");
        updateProfile(null);
        navigate('/');
    }


    
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                   
                    <img className="logo" src="/src/assets/icons/Logo-ROUANDI.png"/>
                    
                </div>

                <svg className="hamburger-menu" viewBox="0 0 24 24">
                    <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                
                
                {profile && profile.role.toLowerCase() === "admin" ? (
                    <>
                        <ul className="navbar-links-admin">
                            <li onClick={() => updateActiveLink("/Dashboard/Admin")}>
                                <Link    
                                    to="/Dashboard/Admin" 
                                    className={`nav-link ${activeLink === '/Dashboard/Admin' ? "active" : ""}`}                            
                                >
                                    <img src="/src/assets/icons/dashboard-icon.png" height={25}/>
                                    <span>Dashboard</span>
                                </Link>
                            </li>
                            <li onClick={() => updateActiveLink("/Dashboard/Admin/ManageUsers")}>
                                <Link    
                                    to="/Dashboard/Admin/ManageUsers" 
                                    className={`nav-link ${activeLink === '/Dashboard/Admin/ManageUsers' ? "active" : ""}`}                            
                                >
                                    <svg className="nav-icon" viewBox="0 0 24 24">
                                        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                                    </svg>
                                    <span>Manage Users</span>
                                </Link>
                            </li>
                            <li onClick={() =>updateActiveLink("/Dashboard/Admin/ViewRequests")}>
                                <Link 
                                    to="/Dashboard/Admin/ViewRequests" 
                                    className={`nav-link ${activeLink === '/Dashboard/Admin/ViewRequests' ? "active" : ""}`}  
                                >
                                    <img src="/src/assets/icons/view-requests-icon.png" height={20}/>
                                    <span>View Requests</span>
                                </Link>
                            </li>
                            <li>
                                <div className="nav-link" 
                                    role="button" 
                                    onClick={handleLogout}
                                >
                                    <svg className="logout-icon" viewBox="0 0 24 24">
                                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                    </svg>
                                    <span>Log Out</span>
                                </div>
                            </li>
                        </ul>
                    </>
                ) : (
                    <>
                        <ul className="navbar-links">
                            <li onClick={() => updateActiveLink("/Dashboard/Employee/AddRequestForm")}>
                                <Link    
                                    to="/Dashboard/Employee/AddRequestForm" 
                                    className={`nav-link ${activeLink === '/Dashboard/Employee/AddRequestForm' ? "active" : ""}`}                            
                                >
                                    <img src="/src/assets/icons/add-request-icon.png" height={20}/>
                                    <span>Create Request</span>
                                </Link>
                            </li>
                            <li onClick={() =>updateActiveLink("/Dashboard/Employee/MyRequests")}>
                                <Link 
                                    to="/Dashboard/Employee/MyRequests"
                                    className={`nav-link ${activeLink === '/Dashboard/Employee/MyRequests' ? "active" : ""}`}  
                                >
                                    <img src="/src/assets/icons/request-icon.png" height={20}/>
                                    <span>My Requests</span>
                                </Link>
                            </li>
                            <li>
                                <div className="nav-link" 
                                    role="button" 
                                    onClick={handleLogout}
                                >
                                    <svg className="logout-icon" viewBox="0 0 24 24">
                                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                    </svg>
                                    <span>Log Out</span>
                                </div>
                            </li>
                        </ul>
                    </>
                )}
                
                
            
                
                <div className="navbar-user">
                {profile && (
                    <div className="user-menu">
                        <div className="user-info-section">
                            <div className="user-avatar" style={{position: "relative"}}>
                                <span className="status-dot"></span>
                                <img src="/src/assets/icons/user.png" height={40}/>
                            </div>
                            
                            <div className="user-info">
                                <span className="username">{profile.nom} {profile.prenom}</span>
                                
                            </div>
                            <svg className="dropdown-icon" viewBox="0 0 24 24">
                                <path d="M7 10l5 5 5-5z"/>
                            </svg>
                        </div>
                        
                        <div className="user-menu-dropdown" role="button" onClick={handleLogout}>
                            <div className="dropdown-item">
                                <svg className="logout-icon" viewBox="0 0 24 24">
                                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                </svg>
                                <span>Log Out</span>
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </nav>

    )
}
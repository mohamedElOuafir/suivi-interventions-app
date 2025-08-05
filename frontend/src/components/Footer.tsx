import { Link } from 'react-router-dom';
import '../styles/Footer.css';
import { useProfile } from '../context/ProfileContext';


export default function Footer() {

    const {profile} = useProfile();


    return (
        <footer className="app-footer">
            <div className="footer-container">
                <div className="footer-top">
                    <div className="brand-section">
                        <img src="/src/assets/icons/Logo-ROUANDI.png" alt="Rouandi Logo" className="logo" />
                        <span className="company-name">Rouandi Maintain</span>
                        <p className="description">
                            Simplifying maintenance and equipment tracking through smart digital solutions.
                        </p>
                        <div className="social">
                            <a 
                                href="https://www.linkedin.com/company/société-rouandi/?originalSubdomain=ma" 
                                aria-label="LinkedIn" 
                                className="linkedin-icon"
                                target='_blank'
                            >
                                <svg viewBox="0 0 24 24" className="icon">
                                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="footer-links">
                        <h4>Quick Links</h4>
                        {profile?.role.toLowerCase() === 'admin' ? (
                            <ul>
                                <li><Link to="/Dashboard/Admin">Dashboard</Link></li>
                                <li><Link to="/Dashboard/Admin/ManageUsers">Manage Users</Link></li>
                                <li><Link to="/Dashboard/Admin/ViewRequests">View Requests</Link></li>
                            </ul>
                        ) : (
                            <ul>
                                <li><Link to="/Dashboard/Employee/AddRequestForm">Create Request</Link></li>
                                <li><Link to="/Dashboard/Employee/MyRequests">My Requests</Link></li>
                            </ul>
                        )}
                        
                    </div>

                    <div className="footer-about">
                        <h4>About Us</h4>
                        <p>
                            Rouandi Maintain is dedicated to helping organizations manage technical interventions
                            and hardware maintenance with ease and efficiency.
                            <a href="https://rouandi.ma" target='_blank'>more...</a>
                        </p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} Rouandi. All rights reserved.</p>
                </div>
            </div>
        </footer>

    )
}
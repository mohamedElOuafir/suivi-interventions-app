import { useEffect, useState, type FormEvent } from "react";
import '../styles/Connexion.css';
import { useNavigate } from "react-router-dom";
import type { User } from "../types/interfaces";
import { useProfile } from "../context/ProfileContext";

export default function Connexion() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorAuthentification, setAuthentificationError] = useState("");
    const [inputType, setInputType] = useState("password");


    const navigate = useNavigate();

    const {updateProfile} = useProfile();


    const handlePasswordVisibility = () => {
        inputType === "password" ? setInputType("text") : setInputType("password");
    }

    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {

            const response = await fetch("http://localhost:3000/user/authentification",{
                    
                method : "POST",
                headers : {
                    "Content-Type" : "application/json"
                },  
                body : JSON.stringify({
                            email : email,
                            password : password
                        })
            });

            const data = await response.json();
            
            if (!data.available){
                setAuthentificationError("this user does not exist !");
                return;
            }

            const user : User = {
                id : data.userData.id,
                nom : data.userData.nom,
                prenom : data.userData.prenom,
                tel : data.userData.tel,
                departement : data.userData.departement,
                email : data.userData.email,
                role : data.userData.role, 
                firstLogin : Boolean(data.userData.firstLogin)
            }

            localStorage.setItem("currentUser", JSON.stringify(user));
            localStorage.setItem("token", data.token);
            updateProfile(user);

            if (user.role.toLowerCase() === "admin"){
                user.firstLogin ? navigate('/setNewPassword') : navigate('/Dashboard/Admin');
            }
            else{
                user.firstLogin ? navigate('/setNewPassword') : navigate('/Dashboard/Employee/AddRequestForm');
            }
        }catch(e : any) {
            console.log({error : e.message});
        }

    }

    
    useEffect(() => {
        const currentUser = localStorage.getItem('currentUser');
        const token = localStorage.getItem('token');

        if (token && currentUser){
            localStorage.removeItem('currentUser');
            localStorage.removeItem('token');
        }
    },[]);


    return (
        <div className="auth-container">
  
            <div className="auth-card">
                <div className="company-branding">
                    <img 
                        src="/src/assets/icons/Logo-ROUANDI.png" 
                        alt="Company Logo" 
                        className="company-logo"
                    />
                    
                </div>

                <div className="auth-header">
                    <h1>Login</h1>
                    <p>Please fill in the following field</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email</label>
                        <div className="input-with-icon">
                            <svg className="input-icon" viewBox="0 0 24 24">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="currentColor" strokeWidth="2"/>
                                <polyline points="22,6 12,13 2,6" fill="none" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <input
                                type="email"
                                name="email"
                                placeholder="your.name@example.com"
                                required
                                value={email}
                                onChange={(e) => {setEmail(e.target.value); setAuthentificationError("");}}
                            />
                        </div>
                    </div>

                    <div className="form-group" id="password-field">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <img src="/src/assets/icons/lock.png" className="input-icon"/>
                            <input
                                type={inputType}
                                placeholder="Enter your password"
                                name="password"
                                id="auth-password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => {setPassword(e.target.value); setAuthentificationError("")}}
                            />
                            <span className="password-toggle" onClick={handlePasswordVisibility}>
                                <svg 
                                className="eye-icon" 
                                viewBox="0 0 24 24" 
                                width="20" 
                                height="20"
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                                >
                                {inputType === "password" ? (
                                    <>
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                    </>
                                ) : (
                                    <>
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                    </>
                                )}
                                </svg>
                            </span>
                        </div>
                    </div>

                    {errorAuthentification && (
                        <div className="error-message">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            {errorAuthentification}
                        </div>
                    )}

                    <button type="submit" className="submit-button">
                        <span>Log In</span>
                        <svg className="arrow-icon" viewBox="0 0 24 24">
                            <path d="M5 12h14M12 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    )
}


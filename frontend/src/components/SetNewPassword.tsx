import { useEffect, useState, type FormEvent } from "react"
import { useProfile } from "../context/ProfileContext";
import { useNavigate } from "react-router-dom";
import "../styles/SetNewPassword.css";
import type { User } from "../types/interfaces";


export default function SetNewPassword() {

    /* States for:
        * the old password input.
        * the new password input.
        * the new password confirmation input.
        * the error message when the submitting fails.
        * the loading state when the form is submitting.
    */

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    /* States for:
        * the old password input type.
        * the new password input type.
        * the new password confirmation input type.
    */

    const [oldPasswordInputType, setOldPasswordInputType] = useState("password");
    const [newPasswordInputType, setNewPasswordInputType] = useState("password");
    const [newPasswordConfirmationInputType, setNewPasswordConfirmationInputType] = useState("password");


    const {profile, updateProfile} = useProfile();

    const navigate = useNavigate();


    //handling the show password button for each input:
    const handlePasswordVisibility = (inputField : string) => {

        if(inputField === "oldPassword") {
            const type = oldPasswordInputType === "password" ? "text" : "password";
            setOldPasswordInputType(type);
        }else if (inputField === "newPassword") {
            const type = newPasswordInputType === "password" ? "text" : "password";
            setNewPasswordInputType(type);
        }else {
            const type = newPasswordConfirmationInputType === "password" ? "text" : "password";
            setNewPasswordConfirmationInputType(type);
        }
    }




    //handling the submitting of the new password form:
    const handleSubmit = async (e : FormEvent) => {
        e.preventDefault();

        //verification of the difference between the old and the new password:
        if (newPassword !== newPasswordConfirmation) {
            setErrorMessage("The confirm password doesn't match the new password");
            return;
        }

        setIsLoading(true);


        //submitting the form:
        try {
            const response = await fetch("http://localhost:3000/edit/user/password", {
                method :"PUT",
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : localStorage.getItem("token")!
                },
                body : JSON.stringify({
                    oldPassword,
                    newPassword
                })
            });

            const data = await response.json();
            if (!data.updated){
                setErrorMessage(data.message);
            }else {
                //updating the first login attributs for the current user:
                const updatedProfile : User | null = {...profile!, firstLogin : false};
                updateProfile(updatedProfile);
                localStorage.setItem("currentUser", JSON.stringify(updatedProfile));

                //Redirection for the convenient dashbord by the user's role:
                if (updatedProfile.role.toLowerCase() === "admin"){
                    navigate('/Dashboard/Admin/ManageUsers');
                }
                else{
                    navigate('/Dashboard/Employee/AddRequestForm');
                }
            }
        }catch(e) {
            setErrorMessage("Netword problem, please try again !");
        }finally{
            setIsLoading(false);
        }
    }



    useEffect(() => {
        const token = localStorage.getItem('token');
        if(!token && !(profile?.firstLogin)) {
            navigate('/');
        }
    },[]);

    return (
        
            <div className="edit-user-password-form-container">
                <div className="edit-user-password-form-modal">
                    <div className="form-header">
                        <h2>Set New Password</h2>
                        <p>Fill in the fields below</p>
                    </div>
                    
                    {errorMessage && (
                        <div className="error-message">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="OldPassword">Old Password</label>
                                <input
                                    type={oldPasswordInputType}
                                    id="OldPassword"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                />
                                <span className="password-toggle" onClick={() => handlePasswordVisibility("oldPassword")}>
                                    <svg 
                                        className="eye-icon" 
                                        viewBox="0 0 24 24" 
                                        width="20" 
                                        height="20"
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2"
                                    >
                                        {oldPasswordInputType === "password" ? (
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

                            <div className="form-group">
                                <label htmlFor="NewPassword">New Password</label>
                                <input
                                    type={newPasswordInputType}
                                    id="NewPassword"
                                    minLength={8}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <span className="password-toggle" onClick={() => handlePasswordVisibility("newPassword")}>
                                    <svg 
                                        className="eye-icon" 
                                        viewBox="0 0 24 24" 
                                        width="20" 
                                        height="20"
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2"
                                    >
                                        {newPasswordInputType === "password" ? (
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

                            <div className="form-group">
                                <label htmlFor="NewPasswordConfirmation">New Password Confirmation</label>
                                <input
                                    type={newPasswordConfirmationInputType}
                                    id="NewPasswordConfirmation"
                                    minLength={8}
                                    value={newPasswordConfirmation}
                                    onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                                    required
                                />
                                <span className="password-toggle" onClick={() => handlePasswordVisibility("newPasswordConfirmation")}>
                                    <svg 
                                        className="eye-icon" 
                                        viewBox="0 0 24 24" 
                                        width="20" 
                                        height="20"
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2"
                                    >
                                        {newPasswordConfirmationInputType === "password" ? (
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

                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="confirm-edit-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="spinner" viewBox="0 0 50 50">
                                            
                                        </svg>
                                        Saving...
                                    </>
                                ) : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        
    )
}
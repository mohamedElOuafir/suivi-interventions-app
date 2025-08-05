import { useEffect, useState, type FormEvent } from "react"
import '../../styles/EditEmployeeInfo.css';
import { type User } from "../../types/interfaces";

export default function EditEmployeeInfo({id, onClose, onUpdate}:any) {

    /* States for :
        * the new user to add.*
        * the error message when the submit fails.
        * the loading state when submitting.
    */

    const [user, setUser] = useState<User>({
        nom : "",
        prenom : "",
        tel : "",
        departement : "",
        email : "",
        role : ""
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    

    //handling the submit of the new user form:
    const handleSubmit = async (e : FormEvent) => {
        e.preventDefault();

        //recovering the jwt token:
        const token = localStorage.getItem("token");
        setIsLoading(true);

        //submitting the new user's form:
        try {
            const response = await fetch("http://localhost:3000/user/edit", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization" : token!
                },
                body: JSON.stringify({
                    id : id,
                    nom: user.nom,
                    prenom: user.prenom,
                    tel: user.tel,
                    email: user.email,
                    departement: user.departement,
                    role: user.role
                })
            });

            const data = await response.json();

            if(data.updated) {
                onUpdate(true);
                onClose(false);
            } else {
                setErrorMessage("Failed to update user");
            }
        } catch (error) {
            setErrorMessage("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }




    //recovering the user's information by its Id:
    const fetchUserById = async () => {

        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:3000/get/user/${id}`, {
                headers : {"Authorization" : token!}
            });
            const data = await response.json();

            if(data.founded) {
                setUser(data.userData);
            }
        } catch (error) {
            setErrorMessage("Failed to load user data");
        }
    }



    
    useEffect(() => {
        fetchUserById();
    }, [id]);

    return (
        <div className="edit-user-form-container">
            <div className="edit-form-overlay">
                <div className="edit-form-modal">
                    <div className="form-header">
                        <h2>Edit User Information</h2>
                        <p>Update the details below</p>
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
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    value={user.nom}
                                    onChange={(e) => setUser(prev => ({...prev, nom: e.target.value}))}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    value={user.prenom}
                                    onChange={(e) => setUser(prev => ({...prev, prenom: e.target.value}))}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={user.tel}
                                    onChange={(e) => setUser(prev => ({...prev, tel: e.target.value}))}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={user.email}
                                    onChange={(e) => setUser(prev => ({...prev, email: e.target.value}))}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="department">Department</label>
                                <input
                                    type="text"
                                    id="departement"
                                    value={user.departement}
                                    onChange={(e) => setUser(prev => ({...prev, departement: e.target.value}))}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="role">Role</label>
                                <select
                                    id="role"
                                    value={user.role}
                                    onChange={(e) => setUser(prev => ({...prev, role: e.target.value}))}
                                    required
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Employee">Employee</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="cancel-btn"
                                onClick={() => onClose(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="confirm-edit-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="spinner" viewBox="0 0 50 50">
                                            <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="5"></circle>
                                        </svg>
                                        Saving...
                                    </>
                                ) : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
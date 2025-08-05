import { useState, type FormEvent } from "react"
import { type User } from "../../types/interfaces";
import '../../styles/AddEmployeeForm.css';

export default function AddEmployeeForm({onAdd, onClose}: any) {
    
    /* states for :
        * the user information.
        * the error message when the submit fails.
        * the error message when the email not found.
        * the submitting state.
    */
    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
    const [email, setEmail] = useState("");
    const [tel, setTel] = useState("");
    const [departement, setDepartement] = useState("");
    const [role, setRole] = useState("Employee");
    const [errorMessage, setErrorMessage] = useState('');
    const [emailErrorMessage, setEmailErrorMessage] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);



    //function for handling the form submitting:
    const handleSubmit = async (e : FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        
        const newUser : User = {
            nom : nom,
            prenom : prenom,
            tel : tel,
            departement : departement,
            email : email,
            role : role,
            firstLogin : true
        }

        setIsSubmitting(true);
        
        try {
            const response = await fetch("http://localhost:3000/user/add", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization" : token!
                },
                body: JSON.stringify({
                    newUser
                })
            });

            const data = await response.json();
            
            if (data.userAdded) {
                onAdd(true);
                onClose(false);

            } else if(!data.emailExist){
                setEmailErrorMessage(true);
            }else {
                setErrorMessage(data.message);
            }
        } catch (err) {
            setErrorMessage("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }


    
  return (
    <div className="add-employee-overlay">
        <div className="add-employee-container">
            <div className="form-card">
                <div className="form-header">
                    <h2>Add New Employee</h2>
                    <p>Fill in the employee details below</p>
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
                            <label htmlFor="nom">Last Name</label>
                            <input
                                type="text"
                                id="nom"
                                name="nom"
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                                required
                                placeholder="Name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="prenom">First Name</label>
                            <input
                                type="text"
                                id="prenom"
                                name="prenom"
                                value={prenom}
                                onChange={(e) => setPrenom(e.target.value)}
                                required
                                placeholder="First Name"
                            />
                        </div>

                        <div className="form-group">
                            {emailErrorMessage && 
                                <div className="email-not-found">
                                    This email doesn't match any account
                                </div>
                            }
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="your@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="tel">Phone Number</label>
                            <input
                                type="tel"
                                id="tel"
                                name="tel"
                                value={tel}
                                onChange={(e) => setTel(e.target.value)}
                                required
                                placeholder="+212 *** *** ***"
                            />
                        </div>

                            <div className="form-group">
                            <label htmlFor="departement">Department</label>
                            <input
                                type="text"
                                id="departement"
                                name="departement"
                                value={departement}
                                onChange={(e) => setDepartement(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="role">Role</label>
                            <select
                                id="role"
                                name="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                            >
                                <option value="Employee">Employee</option>
                                <option value="Admin">Administrator</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => onClose(false)}
                            disabled={isSubmitting}
                            >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                <span className="spinner"></span>
                                Adding...
                                </>
                            ) : "Add Employee"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
}

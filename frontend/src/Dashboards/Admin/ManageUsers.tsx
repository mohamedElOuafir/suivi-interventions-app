import { useEffect, useState } from "react";
import { type User } from "../../types/interfaces";
import "../../styles/ManageUsers.css";
import NavBar from "../../components/NavBar";
import { useActiveLink } from "../../context/activeLinkContext";
import EditEmployeeInfo from "./EditEmployeeInfo";
import AddEmployeeForm from "./AddEmployeeForm";
import { useProfile } from "../../context/ProfileContext";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

export default function ManageUsers() {


    //states for :
    /* 
        * all employees data
        * the searched employee
        * the user whos gonna be deleted
        * the user whos gonna be updated
        * the deleted confirmation dialog
        * the add employee form
        * the edit form for employee
        * the success message for update or add new employee
        * the search filter key
    */
    const [dataEmploye, setDataEmploye] = useState<User[]>([]);
    const [dashboardData, setDashboardData] = useState<User[]>([]);
    const [searchedEmployee, setSearchedEmployee] = useState("");
    const [deletedUser, setDeletedUser] = useState("");
    const [editedUser, setEditedUser] = useState("");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isAddEmployeeFormOpen, setisAddEmployeeFormOpen] = useState(false);
    const [isEditEmployeeInfoOpen, setIsEditEmployeeInfoOpen] = useState(false);
    const [isEmployeeUpdated, setIsEmployeeUpdated] = useState(false);
    const [isEmployeeAdded, setIsEmployeeAdded] = useState(false);
    const [searchKey, setSearchKey] = useState("Id");


    const {updateActiveLink} = useActiveLink();
    const {profile} = useProfile();


    const navigate = useNavigate();


    //function for filtering the user's data by the filter key:
    const filterByCondition = async <K extends keyof User>(
        searchKey? : K,
        condition? : string
        ) => {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:3000/get/users", {
                headers : {"Authorization" : token!}
            });
            const data = await response.json();
        
            let filtredData : User[] = [];

            if (searchKey && condition) {
                data.map((emp : User)=> {
                    if(emp[searchKey]!.toString().toLocaleLowerCase().startsWith(condition.toLocaleLowerCase()))
                        filtredData.push(emp);
                });
                 setDataEmploye(filtredData);
            }
            else{
                setDataEmploye(data);
                setDashboardData(data);
            }     
    }



    //function for deleting a user from the system:
    const handleDeleteUser = async () => {
        
        const id = deletedUser;
        const token = localStorage.getItem("token");
        
        const response = await fetch(`http://localhost:3000/user/delete/${id}`, {
            method : "DELETE",
            headers : {
                "Authorization" : token!
            }
        });
        const data = await response.json();

        if(data.deleted) {
            setDeletedUser("");
            setIsDeleteDialogOpen(false);
        }
    }

    

    //function for canceling the deleted user:
    const handleCancelDelete = () => {
        setDeletedUser("");
        setIsDeleteDialogOpen(false);
    }


    
    useEffect(() => {
        const value = searchKey.toLocaleLowerCase();
        filterByCondition(value as keyof User, searchedEmployee);
    },[searchedEmployee]);



    useEffect(() => {
        const timer = setTimeout(() => {
            isEmployeeUpdated ? setIsEmployeeUpdated(false) : setIsEmployeeAdded(false);
        },5000);
        return () => clearInterval(timer);
    },[isEmployeeUpdated, isEmployeeAdded]);



    useEffect (() => {
        updateActiveLink('/Dashboard/Admin/ManageUsers');
        filterByCondition();
    }, [deletedUser, isEmployeeAdded, isEmployeeUpdated]);
    


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
            <div className="users-dashboard">
                <div className="dashboard-header">
                    <div>
                    <h2 className="dashboard-title">User Management</h2>
                    <p className="dashboard-subtitle">Search, add, edit, and manage all system users</p>
                    </div>
                </div>

                <div className="users-summary-cards">
                    <div className="summary-card">
                        <div className="summary-icon total-users">
                            <svg viewBox="0 0 24 24">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" strokeWidth="2"/>
                                <circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75" fill="none" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </div>
                        <div className="summary-content">
                            <h3>Total Users</h3>
                            <span className="summary-value">{dashboardData.length + 1}</span>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon admins">
                            <img src="/src/assets/icons/admin.png" height={35}/>
                        </div>
                        <div className="summary-content">
                            <h3>Administrators</h3>
                            <span className="summary-value">
                                {dashboardData.filter(user => user.role.toLowerCase() === 'admin').length + 1}
                            </span>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon employees">
                            <svg viewBox="0 0 24 24">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </div>
                        <div className="summary-content">
                            <h3>Employees</h3>
                            <span className="summary-value">
                                {dashboardData.filter(user => user.role.toLowerCase() === 'employee').length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="users-controls">
                    <div className="search-container">
                        <svg className="search-icon" viewBox="0 0 24 24">
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <input 
                            type="text"
                            placeholder="Search users..."
                            className="search-input"
                            value={searchedEmployee}
                            onChange={(e) => setSearchedEmployee(e.target.value)}
                        />
                    </div>
                    <div className="users-dashboard-controls">
                        <div className="filter-container">
                            <svg className="filter-icon" viewBox="0 0 24 24">
                                <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" fill="none" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <select 
                                className="filter-select" 
                                onChange={(e) => setSearchKey(e.target.value)}
                            >
                                <option value="id">ID</option>
                                <option value="nom">Last Name</option>
                                <option value="prenom">First Name</option>
                                <option value="email">Email</option>
                                <option value="departement">Department</option>
                                <option value="role">Role</option>
                            </select>
                        </div>
                        <button 
                            className="add-user-button"
                            onClick={() => setisAddEmployeeFormOpen(true)}
                            >
                            <svg className="add-icon" viewBox="0 0 24 24">
                                <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Add New User
                        </button>
                    </div>  
                </div>

                <div className="users-table-container">
                    <div className="table-responsive">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Last Name</th>
                                    <th>First Name</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataEmploye.map(emp => (
                                    <tr key={emp.id}>
                                    <td>{emp.id}</td>
                                    <td>{emp.nom}</td>
                                    <td>{emp.prenom}</td>
                                    <td>{emp.tel}</td>
                                    <td className="email-cell">{emp.email}</td>
                                    <td>{emp.departement}</td>
                                    <td>
                                        <span className={`role-badge ${emp.role.toLowerCase()}`}>
                                        {emp.role}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button 
                                        className="edit-button"
                                        onClick={() => {
                                            setEditedUser(emp.id!); 
                                            setIsEditEmployeeInfoOpen(true);
                                        }}
                                        >
                                        <svg viewBox="0 0 24 24" width="18" height="18">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" fill="none"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" fill="none"/>
                                        </svg>
                                        </button>
                                        <button 
                                        className="delete-button"
                                        onClick={() => {
                                            setDeletedUser(emp.id!); 
                                            setIsDeleteDialogOpen(true);
                                        }}
                                        >
                                        <svg viewBox="0 0 24 24" width="18" height="18">
                                            <path d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" fill="none"/>
                                        </svg>
                                        </button>
                                    </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Keep your existing modals and success notifications here */}

                {isDeleteDialogOpen && (
                    <div className="delete-confirmation-modal">
            
                        <div className="modal-overlay"></div>
                        
                        <div className="confirmation-dialog">
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this user?</p>
                        <div className="confirmation-buttons">
                            <button className="cancel-button" onClick={handleCancelDelete}>
                            Cancel
                            </button>
                            <button className="confirm-button" onClick={handleDeleteUser}>
                            Delete
                            </button>
                        </div>
                        </div>
                    </div>
                )}

                {isAddEmployeeFormOpen && (
                    <AddEmployeeForm onAdd={setIsEmployeeAdded} onClose={setisAddEmployeeFormOpen}/>
                )}

                {isEditEmployeeInfoOpen && (
                    <div className="delete-confirmation-modal">
            
                        <div className="modal-overlay"></div>
                        <EditEmployeeInfo id={editedUser} onClose={setIsEditEmployeeInfoOpen} onUpdate={setIsEmployeeUpdated} />
                    </div>
                )}
                 

                 {(isEmployeeAdded || isEmployeeUpdated) && 
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
                            <p className="message-text">{isEmployeeAdded ? "Added" : "Updated"} Successfully</p>
                            <p className="sub-text">Everything seems great</p>
                        </div>
                        <button
                            onClick={isEmployeeAdded ? 
                                () => setIsEmployeeAdded(false) :
                                () => setIsEmployeeUpdated(false)
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
            <Footer />
        </>
    )
}
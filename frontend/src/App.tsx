import { useEffect, useState } from "react";
import Connexion from "./auth/Connexion";
import './styles/App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useProfile } from "./context/ProfileContext";
import ManageUsers from "./Dashboards/Admin/ManageUsers";
import ViewRequests from "./Dashboards/Admin/ViewRequests";
import ViewInterventions from "./Dashboards/Admin/ViewInterventions";
import InterventionForm from "./Dashboards/Admin/InterventionForm";
import AddRequestForm from "./Dashboards/employee/AddRequestForm";
import ScrollToTopPage from "./components/ScrollToTopPage";
import SetNewPassword from "./components/SetNewPassword";
import MyRequests from "./Dashboards/employee/MyRequests";
import DashboardAdm from "./Dashboards/Admin/DashboardAdm";
import NotFoundPage from "./components/NotFoundPage";
import NoInternetMessage from "./components/NoInternetMessage";
import { ToastContainer } from "react-toastify";




function App() {
  const [isOffline, setIsOffline] = useState(false);

  const {updateProfile} = useProfile();


  const handleOnline = () => setIsOffline(false);
  const handleOffline = () => setIsOffline(true);



  useEffect(() => {

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    const currentUser  = localStorage.getItem("currentUser");
    if(currentUser){
      updateProfile(JSON.parse(currentUser));
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    }

  },[]);



  return (
    <Router>
      <ToastContainer position="top-center" autoClose={4000} />

      <ScrollToTopPage />

      {isOffline && (
        <NoInternetMessage />
      )}

      <Routes>
            {/* Route for Login */}
          <Route path="/" element={<Connexion />}/>

            {/* Route for the First Login */}
          <Route path="/setNewPassword" element={<SetNewPassword />} />

            {/* Routes for Admin */}
          <Route path="/Dashboard/Admin" element={<DashboardAdm />} />
          <Route path="/Dashboard/Admin/ManageUsers" element={<ManageUsers />} />
          <Route path="/Dashboard/Admin/ViewRequests" element={<ViewRequests />} />
          <Route path="/Dashboard/Admin/ViewRequests/ViewInterventions/:idDemande" element={<ViewInterventions />} />
          {/* Route for updating an intervnetion */}
          <Route path="/Dashboard/Admin/ViewRequests/ViewInterventions/InterventionForm/edit/:idIntervention" element={<InterventionForm />} />
          {/* Route for creating an intervention */}
          <Route path="/Dashboard/Admin/ViewRequests/ViewInterventions/InterventionForm/add/:idDemande" element={<InterventionForm />} />
            {/* Routes for Employee */}
          <Route path="/Dashboard/Employee/AddRequestForm" element={<AddRequestForm />} />
          <Route path="/Dashboard/Employee/MyRequests" element={<MyRequests />} />
            {/* Route for Not Matched Route */}
          <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App

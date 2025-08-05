import { useNavigate } from 'react-router-dom';
import '../styles/RequestCardAdm.css';
import type { Demande } from '../types/interfaces';

export default function RequestCardAdm(demande : Demande) {

    const navigate = useNavigate();

    return (
        <div className="request-card-admin">
            <div className="request-image-container">
                <img 
                    src={demande.imageUrl} 
                    alt={demande.nomMateriel} 
                    className="request-image"
                />
                
            </div>
            <div className="request-content">
                <div className="request-main-info">
                    <h3 className="request-title">{demande.nomMateriel}</h3>
                    <p className="request-description">{demande.description}</p>
                    <div className="request-meta">
                        <span className="request-date">
                            <img src="/src/assets/icons/calender-icon.png" height={20} width={20}/>
                            {new Date(demande.dateDemande).toLocaleDateString()}
                        </span>
                        <span className={`request-status ${demande.statusDemande.replace(/\s+/g,'').toLowerCase()}`}>
                            {demande.statusDemande}
                        </span>
                    </div>
                </div>
                
                <div className="employee-details">
                    <h4 className="employee-title">Employee Information</h4>
                    <div className="employee-grid">
                        <div className="employee-field">
                            <span className="field-label">First Name:</span>
                            <span className="field-value">{demande.employeePrenom}</span>
                        </div>
                        <div className="employee-field">
                            <span className="field-label">Last Name:</span>
                            <span className="field-value">{demande.employeeNom}</span>
                        </div>
                        <div className="employee-field">
                            <span className="field-label">Tel:</span>
                            <span className="field-value">{demande.employeeTel}</span>
                        </div>
                        <div className="employee-field">
                            <span className="field-label">Email:</span>
                            <span className="field-value email">{demande.employeeEmail}</span>
                        </div>
                    </div>
                </div>

                <div className='see-button'>
                    <button onClick={() => navigate(`/Dashboard/Admin/ViewRequests/ViewInterventions/${demande.idDemande}`)}>
                        Plan
                    </button>
                </div>
                
            </div>

        </div>
    )
}
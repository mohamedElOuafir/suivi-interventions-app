import { useEffect, useState } from 'react';
import '../styles/RequestCardEmp.css';
import type { ReqCardEmp } from '../types/interfaces';
import EditRequestForm from '../Dashboards/employee/EditRequestForm';
import jsPDF from 'jspdf';
import { useProfile } from '../context/ProfileContext';


export default function RequestCardEmp({demande, onDelete, onDeleteFailed, onUpdateMessage}: ReqCardEmp) {

    const [progress, setProgress] = useState<number | null>(null);
    const [isCancelrequestDialogOpen, setIsCancelrequestDialogOpen] = useState(false);
    const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
    

    const {profile} = useProfile();


    //handling the cancel button when the delete dialog open:
    const handleCancel = () => {
        setIsCancelrequestDialogOpen(false);
    }



    //handling the deletion of the requests:
    const handleConfirm = async () => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:3000/delete/demande/${demande.idDemande}`, {
                method : "DELETE",
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : token!
                },
                body : JSON.stringify({imageId : demande.imageId})
            });
            const data = await response.json();

            if(data.deleted){
                onDelete(true);
            }else{
                onDeleteFailed(true);
            }
        }catch (error){
            onDeleteFailed(true);
        } finally {
            setIsCancelrequestDialogOpen(false);
        }
    }




    //the format of the request report after completing the traitement:
    const handleExportReport = () => {
        const doc = new jsPDF();

        const primaryColor = '#000000';
        const secondaryColor = '#444';
        const lightGray = '#999';

        // Header
        doc.addImage('/src/assets/icons/Logo-ROUANDI.png', 'PNG', 5, 3, 30, 10);
        doc.setFontSize(20);
        doc.setTextColor(primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text("Rapport de la Demande", 105, 20, { align: 'center' });

        doc.setFontSize(13);
        doc.setTextColor(secondaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text(`Demande ID: ${demande.idDemande}`, 14, 30);
        doc.text(`Généré le : ${new Date().toLocaleDateString()} à ${new Date().getHours()}:${new Date().getMinutes()}`, 14, 36);

        // Divider
        doc.setDrawColor(180);
        doc.line(14, 42, 196, 42);

        // Section Title
        let y = 60;
        doc.setFontSize(17);
        doc.setTextColor(primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text("Détails de la Demande", 14, y);
        doc.setLineWidth(0.5);
        doc.line(14, y + 1, 14 + doc.getTextWidth("Détails de la Demande"), y + 1);
        y += 15;

        // Helper row function
        const addRow = (label: string, value: string) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(secondaryColor);
            doc.text(`${label}`, 14, y);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor('#000');
            doc.text(`${value}`, 75, y);
            y += 10;
        };

        // Data rows
        addRow('Nom Employé:', `${profile?.prenom} ${profile?.nom}`);
        addRow('Matériel:', demande.nomMateriel);
        addRow('Nombre d\'interventions:', demande.interventionsList!.length.toString());
        addRow('Status Final:', demande.statusDemande);

        // Description
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(secondaryColor);
        doc.setFontSize(12);
        doc.text('Description du Problème:', 14, y);
        const descLines = doc.splitTextToSize(demande.description, 130);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor('#000');
        doc.text(descLines, 75, y);
        y += descLines.length * 6 + 15;

        // Signatures Section
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');
        doc.text("Signature de l'Employé", 14, 265);
        doc.text("............................", 14, 275);

        doc.text("Signature du Responsable IT", 140, 265);
        doc.text("............................", 140, 275);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(lightGray);
        doc.text('© 2025 ROUANDI', 105, 285, { align: 'center' });

        // Save PDF
        doc.save(`Demande_${demande.idDemande}.pdf`);

    }




    useEffect(() => {

        if(demande.statusDemande.toLowerCase() === 'in progress'){
            const interventionsCompleted = demande.interventionsList!
                .filter(i => i.statusIntervention.toLowerCase() === 'completed')
                .length;

            const total = demande.interventionsList!.length;
            setProgress(Math.floor(interventionsCompleted / total * 100));
        }
    }, []);



    return (
        <> 
        <div className="request-card-employee">
    <div className="request-card-inner">
        <div className="request-header">
            <div className="header-left">
                <span className="request-id">INT-{demande.idDemande}</span>
                <div className="request-timestamp">
                    <span className="timestamp-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {demande.dateDemande}
                    </span>
                    <span className="timestamp-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        {demande.timeDemande}
                    </span>
                </div>
            </div>
            <span className={`request-status-badge status-${demande.statusDemande.toLowerCase().replace(' ', '-')}`}>
                {demande.statusDemande}
            </span>
        </div>
        
        <div className="request-content">
            <div className="request-image-section">
                <div className="request-image-container">
                    <img 
                        src={demande.imageUrl}
                        alt={demande.nomMateriel}
                        className="request-image"
                    />
                </div>
            </div>
            
            <div className="request-details-section">
                <div className="request-body">
                    <h2 className="request-title">{demande.nomMateriel}</h2>
                    <p className="request-description">{demande.description}</p>
                    
                    {demande.statusDemande.toLowerCase() === "in progress" && (
                        <div className="progress-tracker">
                            <div className="progress-header">
                                <span className="progress-label">Request Progress</span>
                                <span className="progress-percentage">{progress}% Complete</span>
                            </div>
                            <div className="progress-bar-container">
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                            
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        <div className="request-actions">
            {demande.statusDemande.toLowerCase() === "in progress" ? (
                <div className="progress-actions">
                    <div className="status-indicator">
                        <span className="progress-text">Your request is being processed...</span>
                    </div>
                    
                </div>
            ) : demande.statusDemande.toLowerCase() === "pending" ? (
                <div className="pending-actions">
                    <button 
                        className="btn update"
                        onClick={() => setIsUpdateFormOpen(true)}
                    >
                        <svg className="btn-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                        Update Request
                    </button>
                    <button 
                        className="btn btn-secondary btn-cancel"
                        onClick={() => setIsCancelrequestDialogOpen(true)}
                    >
                        <svg className="btn-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Cancel Request
                    </button>
                </div>
            ) : (
                <div className="completed-actions">
                    <div className="completion-message">
                        <div className="success-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22,4 12,14.01 9,11.01"/>
                            </svg>
                        </div>
                        <div className="completion-text">
                            <h4>Request Completed Successfully</h4>
                            <p>Your material is ready for collection.</p>
                        </div>
                    </div>
                    <button 
                        className="btn export"
                        onClick={handleExportReport}
                    >
                        <svg className="btn-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Export a Report
                    </button>
                </div>
            )}
        </div>
    </div>
</div>

{isUpdateFormOpen && (
    <EditRequestForm 
        demande={demande}
        onUpdate={setIsUpdateFormOpen}
        onUpdateMessage={onUpdateMessage}
    />
)}

{isCancelrequestDialogOpen && (
    <div className="modal-overlay">
        <div className="confirmation-dialog">
            <div className="dialog-icon">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ef4444" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
            </div>
            <h3>Confirm Request Cancellation</h3>
            <p>Are you sure you want to cancel this request? This action cannot be undone and you'll need to create a new request if needed.</p>
            <div className="dialog-actions">
                <button className="btn btn-secondary" onClick={handleCancel}>
                    Keep Request
                </button>
                <button className="btn btn-danger" onClick={handleConfirm}>
                    Cancel Request
                </button>
            </div>
        </div>
    </div>
)}
</>
    )
}
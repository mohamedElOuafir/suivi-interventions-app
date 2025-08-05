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
                <div className={`request-header ${demande.statusDemande.toLowerCase().replace(/\s+/g, "")}`}>
                    <span className="request-id">INT-{demande.idDemande}</span>
                    <span className="request-status">{demande.statusDemande}</span>
                </div>
                <div className="request-image-container">
                    <img 
                        src={demande.imageUrl}
                        alt={demande.nomMateriel}
                        className="request-image"
                    />
                </div>
                <div className="request-body">
                    <div className="request-meta">
                    <div className="meta-item">
                        <img src="/src/assets/icons/calender-icon.png" height={20} />
                        <span>{demande.dateDemande}</span>
                    </div>
                    <div className="meta-item">
                        <img src="/src/assets/icons/time-icon.png" height={20} />
                        <span>{demande.timeDemande}</span>
                    </div>
                    </div>
                    
                    <h3 className="request-title">{demande.nomMateriel}</h3>
                    <p className="request-description">{demande.description}</p>
                    
                </div>
                {demande.statusDemande.toLowerCase() === "in progress" ? (
                    <div className="progress-tracker">
                        <span>Progression:</span>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="progress-text">{progress}% complete</span>
                    </div>
                ) : demande.statusDemande.toLowerCase() === "pending" ? (
                    <div className="card-actions-section">
                        <button 
                            className="update-button-intervention-card"
                            onClick={() => setIsUpdateFormOpen(true)}
                            >
                            <svg className="update-icon" viewBox="0 0 24 24">
                                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                                    stroke="currentColor" strokeWidth="2" fill="none"/>
                            </svg>
                            Update
                        </button>
                        <button 
                            className="btn request-cancel-btn"
                            onClick={() => setIsCancelrequestDialogOpen(true)}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="20" 
                                height="20" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            Cancel Request
                        </button>
                    </div>
                    ) : (
                    <div className="card-actions-section request-done">
                        <p className="request-complete-message">
                            Your request has been completed. You can collect your material.
                        </p>
                        <div className="card-actions-section">
                            <button 
                                className="export-button"
                                onClick={handleExportReport}
                            >
                                <svg className="export-icon" viewBox="0 0 24 24">
                                    <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" 
                                        stroke="currentColor" strokeWidth="2" fill="none"/>
                                </svg>
                                Export a report
                            </button>
                        </div>
                    </div>
                )}
                
            </div>


            {isUpdateFormOpen && (
                <EditRequestForm 
                    demande={demande}
                    onUpdate={setIsUpdateFormOpen}
                    onUpdateMessage={onUpdateMessage}
                />
            )}

            
            {isCancelrequestDialogOpen && (
                <div className="delete-confirmation-modal">
        
                    <div className="modal-overlay"></div>
                    
                    <div className="confirmation-dialog">
                        <h3>Confirm Canceling The Request</h3>
                        <p>Are you sure you want to cancel this request?</p>
                        <div className="confirmation-buttons">
                            <button className="cancel-button" onClick={handleCancel}>
                                Cancel
                            </button>
                            <button className="confirm-button" onClick={handleConfirm}>
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
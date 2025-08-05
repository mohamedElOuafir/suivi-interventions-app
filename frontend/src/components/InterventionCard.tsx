
import { useNavigate } from 'react-router-dom';
import '../styles/InterventionCard.css';
import type { Intervention} from '../types/interfaces';
import jsPDF from 'jspdf';

export default function InterventionCard(intervention : Intervention) {
    const piecesList = intervention.piecesList!;

    const navigate = useNavigate();

    //the format of the intervention report
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
        doc.text("Rapport d'intervention", 105, 20, { align: 'center' });

        doc.setFontSize(13);
        doc.setTextColor(secondaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text(`Rapport ID: ${intervention.idIntervention}`, 14, 30);
        doc.text(`Généré le : ${new Date().toLocaleDateString()} à ${new Date().getHours()}:${new Date().getMinutes()}`, 14, 36);

        // Divider
        doc.setDrawColor(180);
        doc.line(14, 42, 196, 42);

        // Section: Intervention Details
        let y = 60;
        doc.setFontSize(17);
        doc.setTextColor(primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text("Details d'intervention", 14, y);
        doc.setDrawColor(0); 
        doc.setLineWidth(0.5);
        doc.line(14, y + 1, 14 + doc.getTextWidth("Details d'intervention"), y + 1); 
        y += 15;

        const addRow = (label: string, value: string) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(secondaryColor);
            doc.text(`${label}`, 14, y);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor('#000');
            doc.text(`${value}`, 60, y);
            y += 10;
        };

        addRow('Date et Heure:', `${intervention.dateIntervention} à ${intervention.timeIntervention}`);
        addRow('Status:', intervention.statusIntervention);
        addRow('Technicien:', `${intervention.techPrenom} ${intervention.techNom}`);
        addRow('Contact:', intervention.techTel);

        // Description
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(secondaryColor);
        doc.setFontSize(12);
        doc.text('Description:', 14, y);
        const descLines = doc.splitTextToSize(intervention.description, 130);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        
        doc.text(descLines, 60, y);
        y += descLines.length * 6 + 5;

        addRow('Le coût du Tech:', intervention.techCost.toFixed(2).toString()+"DH");
        y += 10;


        if(piecesList.length > 0){
            // Section: Parts Replaced
            doc.setFontSize(17);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(primaryColor);
            doc.text('Pièces rechargées', 14, y);
            doc.setDrawColor(0); 
            doc.setLineWidth(0.5);
            doc.line(14, y + 1, 14 + doc.getTextWidth("Pièces rechargées"), y + 1); 
            y += 8;

            // Table header
        
            doc.setFillColor(primaryColor);
            doc.setTextColor(255);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(14);
            doc.rect(14, y, 182, 8, 'F');
            doc.text('Nom de la pièce', 16, y + 6);
            doc.text('Quantité', 110, y + 6);
            doc.text('Prix (DH)', 140, y + 6);
            doc.text('Total (DH)', 170, y + 6);
            y += 20;

            // Table rows
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            doc.setTextColor('#000');

            piecesList.forEach(p => {
                

                doc.text(p.nomPiece, 16, y);
                doc.text(String(p.quantite), 110, y);
                doc.text(`${p.UnitPrice.toFixed(2)} DH`, 140, y);
                doc.text(`${(p.quantite * p.UnitPrice).toFixed(2)} DH`, 170, y);

                y += 8;

                if (y > 260) {
                    doc.addPage();
                    y = 20;
                }
            });
        }


        // Total Summary
        doc.setDrawColor(180);
        doc.line(140, y + 10, 196, y + 10);
        y += 16;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor);
        doc.text('Total:', 140, y);
        doc.text(`${intervention.totalCost.toFixed(2)} DH`, 170, y);

        // Signatures Section
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');
        doc.text("Technicien Signature", 10, 265);
        doc.text("............................", 14, 275);

        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');
        doc.text("Responsable IT Signature", 140, 265);
        doc.text("............................", 140, 275);
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(lightGray);
        doc.text('© 2025 ROUANDI', 105, 285, { align: 'center' });

        // Save
        doc.save(`Intervention_Report_${intervention.idIntervention}.pdf`);
    }



    return (
        <div className="intervention-card">
            <div className="intervention-header">
                <div className="intervention-timeline">
                    <div className="date-badge">
                        <img src="/src/assets/icons/calender-icon.png" width={25} height={25} />
                        <span className="intervention-date">{intervention.dateIntervention}</span>
                    </div>
                    <div className="time-badge">
                        <img src="/src/assets/icons/time-icon.png" width={25} height={25} />
                        <span className="intervention-time">{intervention.timeIntervention}</span>
                    </div>
                </div>
                <span 
                    className={`status-badge ${intervention.statusIntervention === 'Pending' ? 'pending':'completed'}`}
                >
                    {intervention.statusIntervention}
                </span>
            </div>

            <div className="technicien-info">
                <h4 className="section-title">Technician Details</h4>
                <div className="detail-row">
                    <span className="detail-label">First Name:</span>
                    <span className="detail-value">{intervention.techPrenom}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Last Name:</span>
                    <span className="detail-value">{intervention.techNom}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{intervention.techTel}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Cost:</span>
                    <span className="detail-value">{intervention.techCost}DH</span>
                </div>
            </div>

            <div className="intervention-content">
                <h4 className="section-title">Intervention Details</h4>
                <p className="intervention-description">
                    {intervention.description}
                </p>
                
                {piecesList.length !== 0 && 
                <div className="pieces-list">
                    <h4 className="section-title">Replaced Parts</h4>
                    <ul className="piece-item">
                        {piecesList.map((p, index) => (
                            <li key={index}>
                                <img src="/src/assets/icons/piece-icon.png" height={25} width={25}/>
                                <span>{p.nomPiece}</span>
                                <span> x{p.quantite}</span>
                                <span>{p.UnitPrice.toFixed(2)}DH</span>
                            </li>
                        ))}
                    </ul>
                </div>}
            </div>

            <div className="intervention-card-total-cost">
                <span>{intervention.totalCost.toFixed(2)}DH</span>
            </div>

            <div className="intervention-card-buttons">
                <button 
                    className="update-button-intervention-card"
                    onClick={() => navigate(`/Dashboard/Admin/ViewRequests/ViewInterventions/InterventionForm/edit/${intervention.idIntervention}`)}
                    >
                    <svg className="update-icon" viewBox="0 0 24 24">
                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                            stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                    Update
                </button>
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
    )
}
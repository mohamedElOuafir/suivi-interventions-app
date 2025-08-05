import { useEffect, useState, type FormEvent } from "react";
import type { UpdateReqCardEmp } from "../../types/interfaces";


export default function EditRequestForm({demande, onUpdate, onUpdateMessage} : UpdateReqCardEmp) {
    
    /* States for :
        * the name of the corrupted materiel.
        * the description of the materiel problem.
        * the image of damage.
        * the submitting state.
        * the error message when the submitting fails.
    */

    const [nomMateriel, setNomMateriel] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    


    //handling the form submitting:
    const handleSubmit = async (e : FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        //preparing the new image to upload if it changed:
        const formData = new FormData();
        if(image)
            formData.append("image", image);

        //all the other request data:
        formData.append("nomMateriel", nomMateriel);
        formData.append("description", description);

        //the old image id for deleting if the image changed:
        formData.append("oldImageId", demande.imageId!);
        

        //recovering the jwt token:
        const token = localStorage.getItem("token");

        //submitting the request form:
        try {
            const response = await fetch(`http://localhost:3000/edit/demande/${demande.idDemande}`, {
                method : "PUT",
                headers : {
                    "Authorization" : token!
                },
                body : formData
            });
            const data = await response.json();

            if(data.updated){
                onUpdate(false);
                onUpdateMessage(true);
            }else {
                setErrorMessage("Failed to update the request");
            }
        } catch (error) {
            setErrorMessage("Network problem, please try again");
        } finally {
            setIsSubmitting(false);
        }

    }


     
    useEffect(() => {
        setNomMateriel(demande.nomMateriel);
        setDescription(demande.description);
    }, []);



    return (
        <div className="add-employee-overlay">
            <div className="add-employee-container">

            <div className="add-request-container">
                    <div className="form-card">
                        <div className="form-header">
                            <h2>Update Request</h2>
                            <p>Fill in the request details below</p>
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
                                    <label htmlFor="nomMateriel">Materiel Name</label>
                                    <input
                                    type="text"
                                    id="nomMateriel"
                                    name="nomMateriel"
                                    value={nomMateriel}
                                    onChange={(e) => setNomMateriel(e.target.value)}
                                    required
                                    placeholder="Materiel"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <textarea 
                                    id="description"
                                    placeholder="Describe the issue in details..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    rows={6}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="image">Upload Image</label>
                                    <div className="file-upload-container">
                                        <input
                                            type="file"
                                            id="demandeImage"
                                            accept="image/*"
                                            onChange={(e) => setImage(e.target.files?.[0] || null)}
                                            className="file-input"
                                        />
                                        <label htmlFor="demandeImage" className="file-upload-label">
                                            <svg className="upload-icon" viewBox="0 0 24 24">
                                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                            </svg>
                                            <span>Choose an image</span>
                                            <span className="file-name">{image ? image.name : demande.imageId}</span>
                                        </label>
                                    </div>
                                </div>

                                {image ? (
                                <div className="uploaded-image-container">
                                    <img src={URL.createObjectURL(image!)} alt={image?.name}/>
                                </div>
                                ) : (
                                    <div className="uploaded-image-container">
                                        <img src={demande.imageUrl}/>
                                    </div>
                                )
                                }
                            </div>
                            

                            <div className="form-actions">
                                <button
                                    className="cancel-btn"
                                    disabled={isSubmitting}
                                    onClick={() => onUpdate(false)}
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
                                        Submitting...
                                    </>
                                    ) : "Update"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
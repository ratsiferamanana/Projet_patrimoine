import React, { useState, useEffect } from "react";
import './editPossession.css';
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

export function ToggleEdit() {
    const edit = document.querySelector('.modification');
    if (edit) {
        edit.classList.toggle('toggledEdit');
    }
}

function EditPossession({ possessionToEdit, onUpdate }) {
    const [libelle, setLibelle] = useState('');
    const [dateFin, setDateFin] = useState('');

    useEffect(() => {
        if (possessionToEdit) {
            setLibelle(possessionToEdit.libelle || '');
            // Verification du type de dateFin avant d'appliquer substring
            if (typeof possessionToEdit.dateFin === 'string') {
                setDateFin(possessionToEdit.dateFin.substring(0, 10));
            } else if (possessionToEdit.dateFin instanceof Date) {
                setDateFin(possessionToEdit.dateFin.toISOString().substring(0, 10));
            } else {
                setDateFin('');
            }
        }
    }, [possessionToEdit]);

    const Edit = async () => {
        try {
            const response = await axios.put(`http://localhost:3500/possession/${possessionToEdit.libelle}`, { 
                dateFin, 
                newLibelle: libelle
            });

            if (response.status === 200) {
                onUpdate();
                ToggleEdit();
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la possession :', error);
        }
    };

    if (!possessionToEdit) {
        return null;
    }

    return (
        <>
            <div className="modification">
                <form>
                    <button type="button" className="btn btn-warning fermer2" onClick={ToggleEdit}>x</button>
                    <div className="mb-3">
                        <label htmlFor="libelle" className="form-label">Libelle</label>
                        <input
                            type="text"
                            className="form-control"
                            id="libelle"
                            value={libelle}
                            onChange={(e) => setLibelle(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="dateFin" className="form-label">Date de fin</label>
                        <input
                            type="date"
                            className="form-control"
                            id="dateFin"
                            value={dateFin}
                            onChange={(e) => setDateFin(e.target.value)}
                        />
                    </div>
                    <button type="button" className="btn btn-secondary" onClick={Edit}>Modifier</button>
                </form>
            </div>
        </>
    );
}

export default EditPossession;

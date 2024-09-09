// addPossession.jsx
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import './addPossession.css';
import axios from "axios";
import Possession from "../../../models/possessions/Possession";
import Flux from "../../../models/possessions/Flux";

export function ToggleAddPossession() {
    const formulaire = document.querySelector('.formulaire');
    formulaire.classList.toggle('toggledAddPossession');
}

export function AddPossession() {
    const [data, setData] = useState(null);
    const [possessions, setPossessions] = useState([]);
    const [libelle, setLibelle] = useState('');
    const [valeur, setValeur] = useState('');
    const [dateDebut, setDateDebut] = useState('');
    const [tauxAmortissement, setTauxAmortissement] = useState('');

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await axios.get('https://projet-patrimoine.onrender.com/possession');
                const newData = response.data.data;

                if (JSON.stringify(newData) !== JSON.stringify(data)) {
                    setData(newData);
                    if (newData && newData[1] && Array.isArray(newData[1].data.possessions)) {
                        instancing(newData[1].data.possessions);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        };

        getData();

        const intervalId = setInterval(getData, 1000);

        return () => clearInterval(intervalId);
    }, [data]);

    function instancing(possessionsData) {
        const newPossessions = possessionsData.map((oneData) => {
            if (oneData.libelle === "Alternance" || oneData.libelle === "Survie") {
                return new Flux(
                    oneData.possesseur.nom,
                    oneData.libelle,
                    oneData.valeur,
                    new Date(oneData.dateDebut),
                    oneData.dateFin,
                    oneData.tauxAmortissement || "0",
                    oneData.jour,
                    oneData.valeurConstante
                );
            }
            return new Possession(
                oneData.possesseur.nom,
                oneData.libelle,
                oneData.valeur,
                new Date(oneData.dateDebut),
                oneData.dateFin,
                oneData.tauxAmortissement || 0
            );
        });
        setPossessions(newPossessions);
    }

    function confirmAddPossession() {
        const newPossession = {
          libelle: libelle,
          valeur: valeur,
          dateDebut: dateDebut,
          taux: tauxAmortissement
        };
      
        axios.post("https://projet-patrimoine.onrender.com/possession", newPossession)
          .then(response => {
            console.log("Possession ajoutée avec succès", response.data);
          })
          .catch(error => {
            console.error("Erreur lors de l'ajout de la possession :", error);
          });
      }
      

    return (
        <div className="formulaire">
            <form onSubmit={confirmAddPossession}>
                <button type="button" className="btn btn-warning fermer" onClick={ToggleAddPossession}>x</button>
                <div className="topInput">
                    <div className="mb-3 oneInput">
                        <label htmlFor="Libelle" className="form-label">Libelle</label>
                        <input
                            type="text"
                            className="form-control"
                            id="Libelle"
                            value={libelle}
                            onChange={(e) => setLibelle(e.target.value)}
                        />
                        <div id="emailHelp" className="form-text indication">La libelle est le nom de votre possession</div>
                    </div>
                    <div className="mb-3 oneInput">
                        <label htmlFor="valeur" className="form-label">Valeur</label>
                        <input
                            type="text"
                            className="form-control"
                            id="valeur"
                            value={valeur}
                            onChange={(e) => setValeur(e.target.value)}
                        />
                    </div>
                </div>
                <div className="bottomInput">
                    <div className="mb-3 oneInput">
                        <label htmlFor="dateDebut" className="form-label">Date de début</label>
                        <input
                            type="date"
                            className="form-control"
                            id="dateDebut"
                            value={dateDebut}
                            onChange={(e) => setDateDebut(e.target.value)}
                        />
                    </div>
                    <div className="mb-3 oneInput">
                        <label htmlFor="tauxAmortissement" className="form-label">Taux d'amortissement</label>
                        <input
                            type="number"
                            className="form-control"
                            id="tauxAmortissement"
                            value={tauxAmortissement}
                            onChange={(e) => setTauxAmortissement(e.target.value)}
                        />
                    </div>
                </div>
                <button type="submit" className="btn btn-secondary">Ajouter</button>
            </form>
        </div>
    );
}

export default AddPossession;

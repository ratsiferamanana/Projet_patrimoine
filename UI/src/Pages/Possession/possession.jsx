import React, { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import Possession from '../../../../models/possessions/Possession.js';
import Flux from '../../../../models/possessions/Flux.js';
import axios from 'axios';
import EditPossession from '../../components/editPossession.jsx';
import "./possession.css";
import { AddPossession, ToggleAddPossession } from '../../components/addPossession.jsx';
import { ToggleEdit } from '../../components/editPossession.jsx';
import Patrimoine from '../../../../models/Patrimoine.js';

function PossessionPage() {
    const [data, setData] = useState(null);
    const [possessions, setPossessions] = useState([]);
    const [datePicker, setDatePicker] = useState("");
    const [patrimonyValue, setPatrimonyValue] = useState(null);
    const [arrayResult, setArrayResult] = useState([]);
    const [selectedPossession, setSelectedPossession] = useState(null);

    const getData = async () => {
        try {
            const response = await axios.get('http://localhost:3500/possession');
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

    useEffect(() => {
        getData();
        const intervalId = setInterval(getData, 1000);

        return () => clearInterval(intervalId);
    }, [data]);

    function instancing(possessionsData) {
        const newPossessions = possessionsData.map((oneData) => {
            const dateDebut = new Date(oneData.dateDebut);
            const dateFin = oneData.dateFin ? new Date(oneData.dateFin) : null;
    
            if (oneData.libelle === "Alternance" || oneData.libelle === "Survie") {
                const valeurConstante = Number(oneData.valeurConstante || 0);
                console.log('Instanciation Flux avec valeurConstante:', valeurConstante);
                const oneFlux = 
                 new Flux(
                    oneData.possesseur.nom,
                    oneData.libelle,
                    0,
                    dateDebut,
                    dateFin,
                    Number(oneData.tauxAmortissement || 0),
                    oneData.jour,
                    oneData.valeurConstante
                );

                oneFlux.valeurConstante = valeurConstante
                console.log(oneFlux)
                return oneFlux
            }
    
            return new Possession(
                oneData.possesseur.nom,
                oneData.libelle,
                oneData.valeur,
                dateDebut,
                dateFin,
                Number(oneData.tauxAmortissement || 0)
            );
        });
        setPossessions(newPossessions);
    }
    
    

    function getDatePicker(e) {
        setDatePicker(e.target.value);
    }

    function getNewValue() {
        console.log('Selected datePicker:', datePicker);
    
        if (!datePicker) {
            console.error('datePicker is not defined');
            return;
        }
    
        const date = new Date(datePicker);
    
        if (isNaN(date.getTime())) {
            console.error('Invalid date:', datePicker);
            return;
        }
    
        const formattedDate = date.toISOString().split('T')[0];
        console.log('Converted date:', formattedDate);
    
        axios.get(`http://localhost:3500/patrimoine/${formattedDate}`)
            .then(response => {
                const newValue = response.data;
                console.log('New value retrieved:', newValue);
    
                if (typeof newValue === 'number' || typeof newValue === 'string') {
                    setPatrimonyValue(newValue);
                } else if (newValue && newValue.valeur) {
                    setPatrimonyValue(newValue.valeur);
                } else {
                    console.error('Unexpected format of newValue:', newValue);
                }
            })
            .catch(error => {
                console.error('Error fetching new value:', error);
            });
    }
    
    

    function getActualValue() {
        const today = new Date();
        const results = possessions.map(possession => {
            if (possession instanceof Flux) {
                let month = 0;
                const daysToMonth = (today.getDate()-possession.dateDebut.getDate())/30;
                if(today.getFullYear() != possession.dateDebut.getFullYear()){
                    const difference = (today.getFullYear() - possession.dateDebut.getFullYear())*12;
                    month = today.getMonth() - possession.dateDebut.getMonth() + difference + daysToMonth
                } else{
                    month = today.getMonth() - possession.dateDebut.getMonth() + daysToMonth;
                }
                 
                console.log('je Calcule un flux avec la valeur constante :' , possession.valeurConstante)
                return (possession.valeur + (possession.valeurConstante) * month);
                
            } else if (possession instanceof Possession) {
                return possession.getValeurApresAmortissement(today);
            } else {
                console.warn('Unknown possession type:', possession);
            }
        });
        setArrayResult(results);
    }
    
    useEffect(() => {
        if (possessions.length > 0) {
            getActualValue();
        }
    }, [possessions]);
    

    function closePossession(libelle) {
        console.log(`Tentative de clôture de la possession : ${libelle}`);
        axios.put(`http://localhost:3500/possession/${libelle}/close`, { dateFin: new Date().toISOString() })
            .then(() => {
                console.log('Possession clôturée avec succès');
                getData(); // Recharger les données après la clôture
            })
            .catch(error => {
                console.error('Erreur lors de la clôture de la possession :', error);
            });
    }

    function ShowList({ possessions, arrayResult }) {
        return (
            <tbody>
                {possessions.map((possession, i) => (
                    <tr key={i}>
                        <td>{possession.libelle}</td>
                        <td>{possession.valeur}</td>
                        <td>{possession.dateDebut.toDateString()}</td>
                        <td>{possession.dateFin ? new Date(possession.dateFin).toDateString() : 'inconnue'}</td>
                        <td>{possession.tauxAmortissement}</td>
                        <td>{arrayResult[i]}</td>
                        <button type="button" className="btn btn-secondary modifier" onClick={() => {
                            setSelectedPossession(possession);
                            ToggleEdit();
                        }}>
                            modifier
                        </button>
                        <button type="button" className="btn btn-secondary cloture" onClick={() => closePossession(possession.libelle)}>clôture</button>
                    </tr>
                ))}
            </tbody>
        );
    }

    return (
        <>
            <div className="inputContainer">
                <div className="leftcontainer">
                    <div className="input-group mb-3 oneInput dateInput">
                        <span className="input-group-text oneSpan" id="inputGroup-sizing-default">Date Picker</span>
                        <input 
                            type="date" 
                            className="form-control" 
                            aria-label="Sizing example input" 
                            aria-describedby="inputGroup-sizing-default" 
                            onChange={getDatePicker}
                        />
                    </div>
                    <button 
                        type="button" 
                        className="btn btn-primary bouton" 
                        onClick={getNewValue}>
                        Calculer
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-primary bouton" 
                        onClick={ToggleAddPossession}>
                        Ajouter
                    </button>
                </div>
                
                <div className='resultats'>
                    RESULTAT: {patrimonyValue !== null ? `${patrimonyValue} Ariary` : '0 Ariary'}
                </div>
            </div>
            <table className="table table-dark tableau">
                <thead className='head'>
                    <tr className='tableHead'>
                        <th scope="col">Libelle</th>
                        <th scope="col">Valeur initiale</th>
                        <th scope="col">Date de début</th>
                        <th scope="col">Date de fin</th>
                        <th scope="col">Amortissement</th>
                        <th scope="col">Valeur actuelle</th>
                    </tr>
                </thead>
                <ShowList possessions={possessions} arrayResult={arrayResult} />
            </table>
            <AddPossession />
            {selectedPossession && 
                <EditPossession 
                    possessionToEdit={selectedPossession} 
                    onUpdate={getData}
                />
            }
        </>
    );
}

export default PossessionPage;

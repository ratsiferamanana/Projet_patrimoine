import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import Possession from "../../../models/possessions/Possession";
import Flux from "../../../models/possessions/Flux";
import "bootstrap/dist/css/bootstrap.min.css";
import "./chart.css";
import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function MyChart() {
    const [possessions, setPossessions] = useState([]);
    const [months, setMonths] = useState([]);
    const [values, setValues] = useState([]);
    const [dateDebut, setDateDebut] = useState("");
    const [dateFin, setDateFin] = useState("");
    const [day, setDay] = useState("1"); 

    useEffect(() => {
        axios.get('https://projet-patrimoine.onrender.com/possession')
            .then((response) => {
                const data = response.data.data;
                if (data && data[1] && Array.isArray(data[1].data.possessions)) {
                    instancing(data[1].data.possessions);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    function instancing(possessionsData) {
        const newPossessions = possessionsData.map((oneData) => {
            if (oneData.libelle === "Alternance" || oneData.libelle === "Survie") {
                return new Flux(
                    oneData.possesseur.nom,
                    oneData.libelle,
                    oneData.valeur,
                    new Date(oneData.dateDebut),
                    new Date(oneData.dateFin),
                    oneData.tauxAmortissement || 0,
                    oneData.jour,
                    oneData.valeurConstante
                );
            }
            return new Possession(
                oneData.possesseur.nom,
                oneData.libelle,
                oneData.valeur,
                new Date(oneData.dateDebut),
                new Date(oneData.dateFin),
                oneData.tauxAmortissement || 0
            );
        });
        setPossessions(newPossessions);
    }

    function datePickerDebut(e) {
        setDateDebut(e.target.value);
    }

    function datePickerFin(e) {
        setDateFin(e.target.value);
    }

    function dayPicker(e) {
        const selectedDay = e.target.value;
        console.log("Selected day:", selectedDay);
        setDay(selectedDay);
    }

    function getMonthsInRange(startDate, endDate) {
        const monthsArray = [];
        const current = new Date(startDate);

        while (current <= endDate) {
            const month = current.toLocaleString('default', { month: 'short' });
            const year = current.getFullYear();
            monthsArray.push(`${month} ${year}`);
            current.setMonth(current.getMonth() + 1);
        }

        return monthsArray;
    }
    function getValuePerMonth() {
        if (!dateDebut || !dateFin || !day) {
            console.error("Tous les paramètres doivent être définis.");
            return;
        }
    
        console.log("Date début:", dateDebut);
        console.log("Date fin:", dateFin);
        console.log("Jour sélectionné:", day);
    
        axios.get('https://projet-patrimoine.onrender.com/patrimoine/range', {
            params: {
                dateDebut: dateDebut,
                dateFin: dateFin,
                day: day
            }
        })
        .then(response => {
            const calculatedValues = response.data;
            const monthsInRange = getMonthsInRange(new Date(dateDebut), new Date(dateFin));
    
            
            setMonths(monthsInRange);
            setValues(calculatedValues.map(val => parseFloat(val))); 
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    }
    
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Valeurs du patrimoine par mois',
            },
        },
    };

    const chartData = {
        labels: months,
        datasets: [
            {
                label: "Valeurs calculées",
                data: values,
                borderColor: "rgb(182, 135, 35)",
                backgroundColor: "rgba(182, 135, 35, 0.5)",
            }
        ]
    };

    function ShowOption() {
        let options = [];
        for (let i = 1; i <= 31; i++) {
            options.push(
                <option key={i} value={i}>{i}</option>
            );
        }
        return options;
    }

    return (
        <>
            <div className="mainContainer">
                <div className="leftContainer">
                    <h1>GRAPHIQUE PATRIMOINE</h1>
                    <p className="explanation">Entrez les dates de début et de fin pour calculer la valeur totale de votre patrimoine pendant cette période.</p>

                    <div className="input-group mb-3 oneInput">
                        <span className="input-group-text">Date début</span>
                        <input type="date" className="form-control" onChange={datePickerDebut} />
                    </div>
                    <div className="input-group mb-3 oneInput">
                        <span className="input-group-text">Date fin</span>
                        <input type="date" className="form-control" onChange={datePickerFin} />
                    </div>

                    <select className="form-select form-select-sm selectDay" value={day} onChange={dayPicker}>
                        <ShowOption />
                    </select>

                    <input className="btn btn-primary bouton" type="button" value="Valider" onClick={getValuePerMonth} />
                </div>

                <div className="container">
                    <Line options={options} data={chartData} />
                </div>
            </div>
        </>
    );
}

export default MyChart;

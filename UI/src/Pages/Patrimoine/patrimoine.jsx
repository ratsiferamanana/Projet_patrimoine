import { useEffect, useState } from 'react';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import Possession from '../../../../models/possessions/Possession.js';
import Flux from '../../../../models/possessions/Flux.js';
import MyChart from '../../components/chart.jsx';

function PatrimoinePage() {
    const [possessions, setPossessions] = useState([]);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3500/possession')
            .then((response) => {
                const data = response.data;
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
        getChartData(newPossessions);
    }

    function getChartData(possessions) {
        const today = new Date();
        const results = possessions.map(possession => {
            if (possession.libelle === "Alternance" || possession.libelle === "Survie") {
                const month = today.getMonth() - possession.dateDebut.getMonth();
                return (possession.valeur + possession.valeurConstante * month);
            } else {
                return possession.getValeurApresAmortissement(today);
            }
        });
        setChartData(results);
    }

    return (
        <div>
            <MyChart data={chartData} />
        </div>
    );
}

export default PatrimoinePage;

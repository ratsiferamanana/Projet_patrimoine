import express from 'express';
import cors from 'cors';
import { readFile, writeFile } from '../data/index.js';
import Possession from '../models/possessions/Possession.js';
import Flux from '../models/possessions/Flux.js';
import Patrimoine from '../models/Patrimoine.js';
import { promises as fs } from 'fs';
import { log } from 'console';


const app = express();

app.use(cors());
app.use(express.json());

app.get("/possession", async (request, response) => {
  try {
    const data = await readFile("../UI/public/data.json");
    response.send(data);
  } catch (error) {
    response.status(500).send('Erreur');
  }
});

app.put("/possession/:libelle", async (request, response) => {
  const { libelle } = request.params;
  const { dateFin, newLibelle } = request.body;

  if (!dateFin || !newLibelle) {
    return response.status(400).json({ error: 'Date de fin et nouveau libelle requis' });
  }

  try {
    const result = await readFile("../UI/public/data.json");

    if (result.status === "ERROR") {
      return response.status(500).json({ error: 'Erreur lors de la lecture du fichier' });
    }

    const data = result.data;
    const possessions = data[1].data.possessions;


    const possessionIndex = possessions.findIndex(onePossession => onePossession.libelle === libelle);

    if (possessionIndex > -1) {
      
      possessions[possessionIndex].dateFin = dateFin;
      possessions[possessionIndex].libelle = newLibelle;

      const writeResult = await writeFile("../UI/public/data.json", data);

      if (writeResult.status === "ERROR") {
        return response.status(500).json({ error: 'Erreur lors de l\'écriture du fichier' });
      }

      return response.json(possessions[possessionIndex]);
    } else {
      return response.status(404).json({ error: 'Possession non trouvée' });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la possession :', error);
    return response.status(500).json({ error: 'Erreur lors de la mise à jour de la possession' });
  }
});


app.post("/possession", async (request, response) => {
  const { libelle, valeur, dateDebut, taux } = request.body;

  if (!libelle || !valeur || !dateDebut || taux === undefined) {
    return response.status(400).json({ error: 'Données incomplètes' });
  }

  try {
    const result = await readFile("../UI/public/data.json");

    if (result.status === "ERROR") {
      return response.status(500).json({ error: 'Erreur lors de la lecture du fichier' });
    }

    const data = result.data;

    const newPossession = {
      possesseur: { nom: "John Doe" },
      libelle,
      valeur,
      dateDebut,
      dateFin: null,
      tauxAmortissement: taux
    };

    const patrimoine = data.find(entry => entry.model === "Patrimoine");

    if (patrimoine) {
      patrimoine.data.possessions.push(newPossession);
    } else {
      data.push({
        model: "Patrimoine",
        data: {
          possesseur: { nom: "John Doe" },
          possessions: [newPossession]
        }
      });
    }

 
    const writeResult = await writeFile("../UI/public/data.json", data);

    if (writeResult.status === "ERROR") {
      return response.status(500).json({ error: 'Erreur lors de l\'écriture du fichier' });
    }

    return response.json(newPossession);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la possession :', error);
    return response.status(500).json({ error: 'Erreur lors de l\'ajout de la possession' });
  }
});

app.put("/possession/:libelle/close", async (request, response) => {
  const { libelle } = request.params;
  const { dateFin } = request.body;

  if (!dateFin) {
    return response.status(400).json({ error: 'Date de fin requise' });
  }

  try {
    const result = await readFile("../UI/public/data.json");

    if (result.status === "ERROR") {
      return response.status(500).json({ error: 'Erreur lors de la lecture du fichier' });
    }

    const data = result.data;
    const possessions = data[1].data.possessions;
    const possession = possessions.find(onePossession => onePossession.libelle === libelle);

    if (possession) {
         
      if (possession.dateFin === "inconnue" || !possession.dateFin) {
        possession.dateFin = dateFin;
        const writeResult = await writeFile("../UI/public/data.json", data);

        if (writeResult.status === "ERROR") {
          return response.status(500).json({ error: 'Erreur lors de l\'écriture du fichier' });
        }

        return response.json(possession);
      } else {
        return response.status(400).json({ error: 'La possession a déjà une date de fin' });
      }
    } else {
      return response.status(404).json({ error: 'Possession non trouvée' });
    }
  } catch (error) {
    console.error('Erreur lors de la clôture de la possession :', error);
    return response.status(500).json({ error: 'Erreur lors de la clôture de la possession' });
  }
});


   

function instancing(possessionsData) {
  return possessionsData.map((oneData) => {
      const dateDebut = new Date(oneData.dateDebut);
      const dateFin = oneData.dateFin ? new Date(oneData.dateFin) : null;
      const tauxAmortissement = Number(oneData.tauxAmortissement || 0);
      const valeurConstante = oneData.valeurConstante !== undefined ? Number(oneData.valeurConstante) : 0;

      if (oneData.libelle === "Alternance" || oneData.libelle === "Survie") {
          const newFlux =  new Flux(
              oneData.possesseur.nom,
              oneData.libelle,
              Number(oneData.valeur || 0),  
              dateDebut,
              dateFin,
              tauxAmortissement,
              oneData.jour,
              valeurConstante
          );
          newFlux.valeurConstante = valeurConstante;
          return newFlux
      }

      return new Possession(
          oneData.possesseur.nom,
          oneData.libelle,
          Number(oneData.valeur || 0),
          dateDebut,
          dateFin,
          tauxAmortissement
      );
  });
}

app.get("/patrimoine/range", async (request, response) => {
  const dateDebut = request.query.dateDebut;
  const dateFin = request.query.dateFin;
  const day = parseInt(request.query.day, 10);

  try {
    const file = await readFile("../UI/public/data.json");
    const possesseur = file.data[1].data.possesseur;
    const possessions = file.data[1].data.possessions;

    const instanced = instancing(possessions);
    const patrimoine = new Patrimoine(possesseur.nom, instanced);

    const startDate = new Date(dateDebut);
    const endDate = new Date(dateFin);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(day)) {
      console.error("Invalid parameters:", { startDate, endDate, day });
      return response.status(400).json({ error: "Invalid parameters" });
    }

    const yearToMonth = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    const months = endDate.getMonth() - startDate.getMonth();
    const totalMonths = months + yearToMonth;

    let resultsArray = [];
    const addMonths = (date, monthsToAdd) => {
      const resultDate = new Date(date);
      resultDate.setMonth(resultDate.getMonth() + monthsToAdd);
      return resultDate;
    };

    const isDayInRange = day >= startDate.getDate() && day <= endDate.getDate();

    let variantDate;
    if (isDayInRange) {
      variantDate = new Date(startDate.getFullYear(), startDate.getMonth(), day);
      for (let i = 0; i <= totalMonths; i++) {
        let nextDate = addMonths(variantDate, i);
        console.log("Calculating value for date:", nextDate.toString());
        let result = patrimoine.getValeur(nextDate);
        resultsArray.push(result);
      }
    } else {
      variantDate = new Date(endDate.getFullYear(), endDate.getMonth(), day);
      for (let i = 0; i < totalMonths; i++) {
        let nextDate = addMonths(variantDate, i);
        console.log("Calculating value for date:", nextDate.toString());
        let result = patrimoine.getValeur(nextDate);
        resultsArray.push(result);
      }
    }

    response.send(resultsArray);
  } catch (error) {
    console.error('Error:', error);
    response.status(500).json({ error: 'Erreur lors du traitement de la demande', details: error.message });
  }
});




app.get("/patrimoine/:date", async (request, response) => {
  const dateStr = request.params.date;
  const convertedDate = new Date(dateStr);

 
  if (isNaN(convertedDate.getTime())) {
      return response.status(400).json({ error: "Date invalide" });
  }

  try {
      const file = await readFile("../UI/public/data.json");
      const possesseur = file.data[1].data.possesseur;
      const possessions = file.data[1].data.possessions;

      console.log("File content:", file);

      if (!file || !file.data[1].data.possessions) {
          console.error("Invalid file structure");
          return response.status(500).json({ error: "Structure incorrecte du fichier" });
      }

      const instanced = instancing(possessions);
      console.log("Instanced Data:", instanced);

      const newPatrimoine = new Patrimoine(possesseur.nom, instanced);
      console.log("New Patrimoine:", newPatrimoine);

      const valeur = newPatrimoine.getValeur(convertedDate);

      response.json({valeur}); 
  } catch (error) {
      console.error('Error:', error);
      response.status(500).json({ error: 'Erreur lors de la récupération de la valeur du patrimoine', details: error.message });
  }
});






app.listen(3500, () => {
  console.log("serveur listening....");
});

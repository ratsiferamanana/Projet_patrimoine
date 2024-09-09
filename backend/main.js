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

// Autres routes ici...

const port = process.env.PORT || 3500;
app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}...`);
});


export default class Personne {
  constructor(nom) {
    this.nom = nom;
  }

  showUser(user) {
    console.log("mon nom est " + this.nom + this.prenom + "la date de naisssance est " + this.dateDeNaissance)
  }

  
}

module.exports = Personne;

let prompt = require("prompt-sync");

class Salaire{
    montant = 0;
    date_de_reception = new Date;
    constructor(montant,date_de_reception){
        this.montant = montant;
        this.date_de_reception = date_de_reception;
    }

    getMontant(){
        return this.montant;
    }

}

module.exports = Salaire;

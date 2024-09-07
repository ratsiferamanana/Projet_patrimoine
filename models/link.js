

const trainDeVie = require("./TrainDeVie.js");
const salaire = require("./salaire.js");


const TrainDeVie = new trainDeVie(20_000,"tsy aiko");
const Salaire = new salaire(80_000,"26/07/2024");

    let spentMoney = [];
    let i = 0;
    let revenuTotal = 0 ;

function seeSpent(){
        return spentMoney;
    }

function spend(trainDeVie){

    revenuTotal -= trainDeVie.getCout();
    i += 1;
    let date = new Date;
    let phrase = ("depense " + i + "=> motif : " + trainDeVie.getDescription() +" Montant :"+ 
    trainDeVie.getCout() +" Date : " + date)
    console.log(phrase)
    spentMoney.push(phrase)
    return "Vous avez depensé " + trainDeVie.getCout() + "Ar, il vous reste " + revenuTotal + "Ar \n Motif : " + 
    trainDeVie.getDescription()
}

 function paid(salaire){
    revenuTotal += salaire.getMontant();
    return "vous avez au total " + revenuTotal + "Ar"
}





console.log(TrainDeVie.getCout)
console.log(paid(Salaire))

console.log(spend(TrainDeVie))
console.log(seeSpent());

module.exports = {
    revenuTotal,
    i,
    spentMoney,
    paid, 
    spend
}

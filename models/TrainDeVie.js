
let prompt = require("prompt-sync");

class TrainDeVie{
    


    constructor(cout,description){
        this.cout= cout;
        this.description = description;
    }

    getCout(){
        return this.cout;
    }

    getDescription(){
        return this.description;
    }

    

}

module.exports = TrainDeVie;

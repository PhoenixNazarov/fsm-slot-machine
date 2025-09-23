export class TAutomatonsDispatcher {
    constructor(ui) {
        this.ui = ui; // теперь это экземпляр Environment
        this.z = [];
        this.x = [];
        this.y = [];
        this.e = [];
        this.Automatons = [];
    }

    AddAutomaton(A) {
        this.Automatons.push(A);
        A.atmDispatcher = this;
        this.y.push([]);
    }
}
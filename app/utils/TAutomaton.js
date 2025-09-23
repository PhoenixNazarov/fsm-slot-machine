export class TAutomaton {
    constructor(AutomatonName, AutomatonDescription) {
        this.IsRunning = false;
        this.Name = AutomatonName;
        this.Description = AutomatonDescription;
        this.State = 0;

        this.LogInput = false;
        this.LogOutput = false;
        this.LogWake = true;
        this.LogStateChange = true;
        this.LogSleep = true;
        this.LogError = true;

        this.atmDispatcher = null;
    }

    get y() {
        return this.State;
    }

    env() {
        return this.atmDispatcher.ui;
    }

    Wake(Event) {
        const d = this.atmDispatcher;
        if (this.LogWake) {
            this.Log(`Автомат A${this.Name} "${this.Description}" запущен в состоянии ${this.State} "${d?.y?.[this.Name]?.[this.State] ?? ''}" с событием e${Event} "${d?.e?.[Event] ?? ''}"`);
        }
        if (this.IsRunning) {
            this.Log(`Ошибка реентерабельности в автомате A${this.Name} "${this.Description}" в состоянии ${this.State} "${d?.y?.[this.Name]?.[this.State] ?? ''}" с событием e${Event} "${d?.e?.[Event] ?? ''}"`);
        }
        this.IsRunning = true;
        const OldState = this.State;
        this.HandleState(Event);
        if (OldState !== this.State) {
            if (this.LogStateChange) {
                this.Log(`Автомат A${this.Name} "${this.Description}" перешел из состояния ${OldState} в состояние ${this.State}`);
            }
            this.EnterState();
        }
        this.IsRunning = false;
        if (this.LogSleep) {
            this.Log(`Автомат A${this.Name} "${this.Description}" завершил обработку события e${Event} "${d?.e?.[Event] ?? ''}" в состоянии ${this.State} "${d?.y?.[this.Name]?.[this.State] ?? ''}"`);
        }
    }

    HandleState(_Event) {
    }

    EnterState() {
    }

    Log(AutomatonMessage) {
        const ts = new Date().toLocaleString();
        // ui = Environment; лог сохраняем на уровне Vue через ссылку ctx
        this.atmDispatcher?.ui?.ctx?.Log.push(`${ts}:`);
        this.atmDispatcher?.ui?.ctx?.Log.push(AutomatonMessage);
        this.atmDispatcher?.ui?.ctx?.Log.push('');
    }
}
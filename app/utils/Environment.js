// ============= Environment (СРЕДА) =============
// Вся реализация функций zXX, а также операции со "средой" перенесены сюда.
// Автоматы A0/A1/A2 больше НЕ вызывают методы Vue напрямую — они обращаются к Environment.
export class Environment {
    constructor(ctx) {
        this.ctx = ctx;
    }

    // Доступ к данным (геттеры/сеттеры) — чтобы автоматы могли читать x-переменные через env.*
    get BankCoinsCount() { return this.ctx.BankCoinsCount; }
    set BankCoinsCount(v) { this.ctx.BankCoinsCount = v; }

    get UserCoinsCount() { return this.ctx.UserCoinsCount; }
    set UserCoinsCount(v) { this.ctx.UserCoinsCount = v; }

    get JackPotCoinsCount() { return this.ctx.JackPotCoinsCount; }
    set JackPotCoinsCount(v) { this.ctx.JackPotCoinsCount = v; }

    get Stake() { return this.ctx.Stake; }
    set Stake(v) { this.ctx.Stake = v; }

    get IsTrayClosed() { return this.ctx.IsTrayClosed; }
    set IsTrayClosed(v) { this.ctx.IsTrayClosed = v; }

    // Индикаторы (строки)
    set edBank(v) { this.ctx.edBank = v; }
    set edStake(v) { this.ctx.edStake = v; }
    set edJackPot(v) { this.ctx.edJackPot = v; }

    // Барабаны и таймеры — читаем/пишем прямо в реактивные поля Vue
    get Barrel1() { return this.ctx.Barrel1; }
    get Barrel2() { return this.ctx.Barrel2; }
    get Barrel3() { return this.ctx.Barrel3; }

    get TimerSync1() { return this.ctx.TimerSync1; }
    get TimerSync2() { return this.ctx.TimerSync2; }
    get TimerSync3() { return this.ctx.TimerSync3; }

    get TimerB1() { return this.ctx.TimerB1; }
    get TimerB2() { return this.ctx.TimerB2; }
    get TimerB3() { return this.ctx.TimerB3; }

    get JackTimer() { return this.ctx.JackTimer; }

    // === API «формы» (перенесено из Vue-методов) ===
    MoneyTrayEnable(enable) {
        this.IsTrayClosed = !enable;
    }
    PayFromBank() {
        this.BankCoinsCount = Math.max(0, this.BankCoinsCount - 1);
        this.JackPotCoinsCount = Math.max(0, this.JackPotCoinsCount - 1);
        this.UserCoinsCount = this.UserCoinsCount + 1;
        this.JackTimer.Interval = 250;
        this.startJackTimer();
        this.UpdateCoinImages();
    }
    IsCoinOK() { return this.ctx.CoinOK; }
    RecieveMoney() {
        this.BankCoinsCount = this.BankCoinsCount + this.Stake;
        this.UpdateCoinImages();
    }
    ReturnMoney() {
        this.UserCoinsCount = this.UserCoinsCount + this.Stake;
        this.Stake = 0;
        this.ctx.CoinOK = true;
        this.UpdateCoinImages();
        this.z12();
    }
    SetJackPot() {
        const b1 = this.GetBarrelNumber(this.Barrel1);
        const b2 = this.GetBarrelNumber(this.Barrel2);
        const b3 = this.GetBarrelNumber(this.Barrel3);

        if ((b1 === b2) && (b2 === b3)) {
            if (b1 === 7) this.JackPotCoinsCount = 10 * this.Stake;
            else this.JackPotCoinsCount = 5 * this.Stake;
        } else if ((b1 + 1 === b2) && (b2 + 1 === b3)) {
            this.JackPotCoinsCount = 4 * this.Stake;
        } else if ((b1 === b2) || (b3 === b2) || (b3 === b2)) {
            this.JackPotCoinsCount = this.Stake + 1;
        } else if (b1 === 7) {
            this.JackPotCoinsCount = 1;
        } else if (Math.floor(b1 / 2) !== 0) {
            this.JackPotCoinsCount = 7 * this.Stake;
        } else {
            this.JackPotCoinsCount = 0;
        }
    }
    UpdateCoinImages() {
        this.edBank = String(this.BankCoinsCount);
        this.edStake = String(this.Stake);
        this.edJackPot = String(this.JackPotCoinsCount);
    }
    GetBarrelNumber(Barrel) {
        const fi = Barrel.FrameIndex;
        if (((fi > 0) && (fi < 4)) || ((fi >= 57) && (fi <= 60))) return 1;
        if ((fi >= 4) && (fi < 11)) return 2;
        if ((fi >= 11) && (fi <= 16)) return 3;
        if ((fi > 16) && (fi < 24)) return 4;
        if ((fi >= 24) && (fi <= 30)) return 5;
        if ((fi >= 30) && (fi <= 37)) return 6;
        if ((fi > 37) && (fi < 43)) return 7;
        if ((fi > 43) && (fi < 50)) return 8;
        return 9;
    }
    startJackTimer() {
        // Делегируем в Vue — там уже есть реализация таймера
        this.ctx.startJackTimer();
    }

    // === Реализация всех zXX — ТОЛЬКО здесь ===
    // A0:
    z02() { this.MoneyTrayEnable(false); }
    z03() { this.MoneyTrayEnable(true); }
    z04() { this.PayFromBank(); }
    z05() { this.JackPotCoinsCount = 0; this.z28(); }
    z12() { this.edStake = String(this.Stake); }
    z13() { this.Stake = 0; this.edStake = '0'; }
    z15() { this.edBank = String(this.BankCoinsCount); }
    z28() { this.edJackPot = String(this.JackPotCoinsCount); }

    // A2:
    z20() {
        this.TimerSync1.Interval = 10;
        this.TimerSync2.Interval = 1;
        this.TimerSync3.Interval = 6;
    }
    z21() { // "Запустить таймер первого барабана"
        if (this.TimerB1.Interval === 0) {
            this.TimerB1.Interval = 1000 + Math.floor(Math.random() * 1000);
        }
    }
    z23() { this.TimerB2.Interval = 1000 + Math.floor(Math.random() * 1000); }
    z25() { this.TimerB3.Interval = 1000 + Math.floor(Math.random() * 1000); }
    z27() { this.SetJackPot(); }
}
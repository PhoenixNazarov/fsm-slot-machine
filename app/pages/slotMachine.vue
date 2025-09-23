<template>
  <div class="app">
    <header class="header">
      <h1>FSM Slot Machine (A0/A1/A2) Оригинальные</h1>
      <div class="states">
        <div class="state-pill" :class="'s' + A0.State">A0: {{ y[0][A0.State] || A0.State }}</div>
        <div class="state-pill" :class="'s' + A1.State">A1: {{ y[1][A1.State] || A1.State }}</div>
        <div class="state-pill" :class="'s' + A2.State">A2: {{ y[2][A2.State] || A2.State }}</div>
      </div>
    </header>

    <section class="panel">
      <div class="meters">
        <div class="meter">
          <div class="label">Банк</div>
          <div class="value">{{ edBank }}</div>
        </div>
        <div class="meter">
          <div class="label">Пользователь</div>
          <div class="value">{{ UserCoinsCount }}</div>
        </div>
        <div class="meter">
          <div class="label">Ставка</div>
          <div class="value">{{ edStake }}</div>
        </div>
        <div class="meter">
          <div class="label">Выигрыш</div>
          <div class="value win">{{ edJackPot }}</div>
        </div>
        <div class="meter">
          <div class="label">Монетоприемник</div>
          <div class="value">
            <span :class="['tray', IsTrayClosed ? 'closed' : 'open']">{{ IsTrayClosed ? 'Закрыт' : 'Открыт' }}</span>
          </div>
        </div>
      </div>

      <div class="reels">
        <div class="reel" :class="{ spinning: TimerSync1.running }">
          <div class="symbol">{{ env.GetBarrelNumber(Barrel1) }}</div>
          <div class="caption">Барабан 1</div>
        </div>
        <div class="reel" :class="{ spinning: TimerSync2.running }">
          <div class="symbol">{{ env.GetBarrelNumber(Barrel2) }}</div>
          <div class="caption">Барабан 2</div>
        </div>
        <div class="reel" :class="{ spinning: TimerSync3.running }">
          <div class="symbol">{{ env.GetBarrelNumber(Barrel3) }}</div>
          <div class="caption">Барабан 3</div>
        </div>
      </div>

      <div class="controls">
        <div class="coin-controls">
          <button class="btn" @click="Image1Click" :disabled="UserCoinsCount<=0 || IsTrayClosed">Опустить жетон</button>
          <button class="btn ghost" @click="iBadCoinClick" :disabled="IsTrayClosed">Бракованный жетон</button>
<!--          <button class="btn ghost" @click="toggleTray">{{ IsTrayClosed ? 'Открыть' : 'Закрыть' }} монетоприемник</button>-->
        </div>
        <div class="main-controls">
          <button class="btn primary" @click="iPlayClick">Старт</button>
          <button class="btn" @click="iReturnClick">Возврат денег</button>
          <button class="btn danger" @click="btnTechResetClick">Тех. сброс</button>
        </div>
      </div>
    </section>

    <section class="logging">
      <h3>Лог</h3>
      <div class="log-settings">
        <div class="log-group">
          <div class="title">A0</div>
          <label><input type="checkbox" v-model="A0.LogWake" /> Wake</label>
          <label><input type="checkbox" v-model="A0.LogStateChange" /> StateChange</label>
          <label><input type="checkbox" v-model="A0.LogSleep" /> Sleep</label>
          <label><input type="checkbox" v-model="A0.LogInput" /> Input</label>
          <label><input type="checkbox" v-model="A0.LogOutput" /> Output</label>
          <label><input type="checkbox" v-model="A0.LogError" /> Error</label>
        </div>
        <div class="log-group">
          <div class="title">A1</div>
          <label><input type="checkbox" v-model="A1.LogWake" /> Wake</label>
          <label><input type="checkbox" v-model="A1.LogStateChange" /> StateChange</label>
          <label><input type="checkbox" v-model="A1.LogSleep" /> Sleep</label>
          <label><input type="checkbox" v-model="A1.LogInput" /> Input</label>
          <label><input type="checkbox" v-model="A1.LogOutput" /> Output</label>
          <label><input type="checkbox" v-model="A1.LogError" /> Error</label>
        </div>
        <div class="log-group">
          <div class="title">A2</div>
          <label><input type="checkbox" v-model="A2.LogWake" /> Wake</label>
          <label><input type="checkbox" v-model="A2.LogStateChange" /> StateChange</label>
          <label><input type="checkbox" v-model="A2.LogSleep" /> Sleep</label>
          <label><input type="checkbox" v-model="A2.LogInput" /> Input</label>
          <label><input type="checkbox" v-model="A2.LogOutput" /> Output</label>
          <label><input type="checkbox" v-model="A2.LogError" /> Error</label>
        </div>
      </div>
      <pre ref="logWindow" class="log-window"><code>{{ Log.join('\n') }}</code></pre>
    </section>
  </div>
</template>

<script>
// ============= Environment (СРЕДА) =============
// Вся реализация функций zXX, а также операции со "средой" перенесены сюда.
// Автоматы A0/A1/A2 больше НЕ вызывают методы Vue напрямую — они обращаются к Environment.
class Environment {
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

// ============= Dispatcher/Automata =============
class TAutomatonsDispatcher {
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

class TAutomaton {
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
  get y() { return this.State; }
  env() { return this.atmDispatcher.ui; } // быстрая ссылка на Environment

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

  HandleState(_Event) {}
  EnterState() {}
  Log(AutomatonMessage) {
    const ts = new Date().toLocaleString();
    // ui = Environment; лог сохраняем на уровне Vue через ссылку ctx
    this.atmDispatcher?.ui?.ctx?.Log.push(`${ts}:`);
    this.atmDispatcher?.ui?.ctx?.Log.push(AutomatonMessage);
    this.atmDispatcher?.ui?.ctx?.Log.push('');
    // Scroll log to bottom after adding new entries
    this.atmDispatcher?.ui?.ctx?.scrollLogToBottom();
  }
}

/* ===================== A0 ===================== */
class TAutomatonSlotMachine extends TAutomaton {
  constructor() { super(0, 'Игровая машина'); }

  // Получение состояний других автоматов
  GetY1() { return this.atmDispatcher.Automatons[1].y; }
  GetY2() { return this.atmDispatcher.Automatons[2].y; }
  get y1() { return this.GetY1(); }
  get y2() { return this.GetY2(); }

  // Опрос входных переменных
  GetX01() { return this.env().JackPotCoinsCount > 0; } // "Cумма выдачи выигрыша больше нуля"
  GetX02() { return this.env().BankCoinsCount > 0; }    // "В банке есть жетоны"
  get x01() { return this.GetX01(); }
  get x02() { return this.GetX02(); }

  // Вызовы автоматов
  A1(Event) { this.atmDispatcher.Automatons[1].Wake(Event); }
  A2(Event) { this.atmDispatcher.Automatons[2].Wake(Event); }

  HandleState(Event) {
    switch (this.State) {
      case 0: { // Ожидание
        if ((Event === 11) && (this.y1 === 1)) {
          this.State = 1;
        } else if ((Event === 11) && (this.y1 === 2)) {
          this.env().z02(); this.State = 3;
        }
        break;
      }
      case 1: { // Прием жетонов
        if ((Event === 11) && (this.y1 === 2)) {
          this.env().z02(); this.State = 3;
        } else if ((Event === 1) && (this.y1 === 1)) {
          this.A1(12); this.State = 2;
        } else if (Event === 2) {
          this.env().z02(); this.A1(2); this.State = 0;
        }
        break;
      }
      case 2: { // Игра
        this.A2(Event);
        if ((Event === 5) && this.x01 && this.x02) {
          this.env().z04(); this.State = 4;
        } else if ((Event === 5) && !this.x01) {
          this.State = 0;
        }
        break;
      }
      case 3: { // Ошибка
        if ((Event === 2) && (this.y1 === 2)) {
          this.A1(2); this.State = 0;
        } else if ((Event === 3) && (this.y1 !== 2)) {
          this.env().z05(); this.env().z28(); this.env().z15(); this.State = 0;
        }
        break;
      }
      case 4: { // Выдача жетона
        if ((Event === 6) && this.x01 && this.x02) {
          this.env().z04(); this.env().z28(); this.env().z15();
        } else if ((Event === 6) && this.x01 && !this.x02) {
          this.env().z28(); this.env().z15(); this.State = 3;
        } else if ((Event === 6) && !this.x01) {
          this.env().z28(); this.env().z15(); this.State = 0;
        }
        break;
      }
      default: {
        if (this.LogError) this.Log(`Ошибка в автомате A0 при обработке события e${Event}: неизвестное состояние ${this.State}`);
        break;
      }
    }
  }

  EnterState() {
    switch (this.State) {
      case 0: { this.env().z03(); this.env().z13(); this.env().z12(); break; }
      case 2: { this.A2(0); break; }
    }
  }
}

/* ===================== A1 ===================== */
class TAutomatonMoneyTray extends TAutomaton {
  constructor() { super(1, 'Монетоприемник'); }

  // Опрос входных переменных
  GetX11() { return this.env().IsCoinOK(); } // "Жетон подлинный"
  get x11() { return this.GetX11(); }

  // Вызовы автоматов
  A0(Event) { this.atmDispatcher.Automatons[0].Wake(Event); }

  HandleState(Event) {
    switch (this.State) {
      case 0: {
        if ((Event === 10) && this.x11) {
          this.env().z12(); this.State = 1;
        } else if ((Event === 10) && !this.x11) {
          this.env().z12(); this.State = 2;
        }
        break;
      }
      case 1: {
        console.log(Event)
        if (Event === 2) {
          this.env().ReturnMoney(); this.State = 0;
        } else if ((Event === 10) && this.x11) {
          this.env().z12();
        } else if ((Event === 10) && !this.x11) {
          this.env().z12(); this.State = 2;
        } else if (Event === 12) {
          this.env().z02(); this.env().RecieveMoney(); this.env().z15(); this.State = 0;
        }
        break;
      }
      case 2: {
        if (Event === 2) {
          this.env().ReturnMoney(); this.State = 0;
        }
        break;
      }
      default: {
        if (this.LogError) this.Log(`Ошибка в автомате A1 при обработке события e${Event}: неизвестное состояние ${this.State}`);
        break;
      }
    }
  }

  EnterState() {
    switch (this.State) {
      case 1: this.A0(11); break;
      case 2: this.A0(11); break;
    }
  }
}

/* ===================== A2 ===================== */
class TAutomatonBarrelsEngine extends TAutomaton {
  constructor() { super(2, 'Игровые барабаны'); }

  HandleState(Event) {
    switch (this.State) {
      case 0: {
        if (Event === 0) {
          this.env().z20(); this.State = 1;
        }
        break;
      }
      case 1: {
        if (Event === 22) {
          this.State = 2;
        } else if (Event === 1) {
          this.env().z21();
        }
        break;
      }
      case 2: {
        if (Event === 23) {
          this.State = 3;
        }
        break;
      }
      case 3: {
        if (Event === 5) {
          this.env().z27(); this.env().z28(); this.State = 0;
        }
        break;
      }
      default: {
        if (this.LogError) this.Log(`Ошибка в автомате A2 при обработке события e${Event}: неизвестное состояние ${this.State}`);
        break;
      }
    }
  }

  EnterState() {
    switch (this.State) {
      case 2: this.env().z23(); break;
      case 3: this.env().z25(); break;
    }
  }
}

export default {
  name: 'SlotMachine',

  data() {
    return {
      // Dispatcher/Automata/Environment
      env: null,
      AutomatonsDispatcher: null,
      A0: null,
      A1: null,
      A2: null,

      // Счетчики
      BankCoinsCount: 50,
      UserCoinsCount: 50,
      JackPotCoinsCount: 0,
      Stake: 0,
      IsTrayClosed: false,
      CoinOK: true,

      // Индикаторы
      edBank: '50',
      edStake: '0',
      edJackPot: '0',

      // Барабаны
      Barrel1: { FrameIndex: 40 },
      Barrel2: { FrameIndex: 40 },
      Barrel3: { FrameIndex: 40 },

      // Таймеры синхронного вращения
      TimerSync1: { Interval: 0, handle: null, running: false },
      TimerSync2: { Interval: 0, handle: null, running: false },
      TimerSync3: { Interval: 0, handle: null, running: false },

      // Таймеры остановки барабанов
      TimerB1: { Interval: 0, handle: null },
      TimerB2: { Interval: 0, handle: null },
      TimerB3: { Interval: 0, handle: null },

      // Таймер выдачи выигрыша
      JackTimer: { Interval: 0, handle: null },

      // Описания диспетчера
      z: [],
      x: [],
      y: [[], [], []],
      e: [],

      // Лог
      Log: []
    };
  },

  created() {
    // Среда
    this.env = new Environment(this);

    // Диспетчер и автоматы
    this.AutomatonsDispatcher = new TAutomatonsDispatcher(this.env);
    this.A0 = new TAutomatonSlotMachine();
    this.A1 = new TAutomatonMoneyTray();
    this.A2 = new TAutomatonBarrelsEngine();

    // Настройка логов по умолчанию
    this.A0.LogWake = this.A0.LogStateChange = this.A0.LogSleep = true;
    this.A1.LogWake = this.A1.LogStateChange = this.A1.LogSleep = true;
    this.A2.LogWake = this.A2.LogStateChange = this.A2.LogSleep = true;

    // Регистрация в диспетчере
    this.AutomatonsDispatcher.AddAutomaton(this.A0);
    this.AutomatonsDispatcher.AddAutomaton(this.A1);
    this.AutomatonsDispatcher.AddAutomaton(this.A2);

    // Названия состояний
    this.y[0] = ['Ожидание', 'Прием жетонов', 'Игра', 'Ошибка', 'Выдача жетона'];
    this.y[1] = ['Монетоприемник пуст', 'Жетон принят', 'Жетон не распознан'];
    this.y[2] = ['Барабаны остановлены', 'Барабаны запущены', 'Первый барабан остановлен', 'Второй барабан остановлен'];

    // Описания событий
    this.e = Array.from({ length: 24 }, () => '');
    this.e[0] = 'от А0: Начало игры';
    this.e[1] = 'Нажата кнопка "Старт"';
    this.e[2] = 'Нажата кнопка "Возврат денег"';
    this.e[3] = 'Нажата кнопка "Тех. Сброс"';
    this.e[5] = 'Сработал таймер третьего барабана';
    this.e[6] = 'Выдан жетон из банка';
    this.e[10] = 'Опущен жетон';
    this.e[11] = 'от A1: Опущен жетон';
    this.e[12] = 'от A0: Перевести деньги в банк';
    this.e[22] = 'Сработал таймер первого барабана';
    this.e[23] = 'Сработал таймер второго барабана';

    // Проброс в диспетчер
    this.AutomatonsDispatcher.y = this.y;
    this.AutomatonsDispatcher.e = this.e;
  },

  mounted() {
    // Инициализация индикаторов
    this.env.UpdateCoinImages();
    // Начальные кадры барабанов
    this.Barrel1.FrameIndex = 40;
    this.Barrel2.FrameIndex = 40;
    this.Barrel3.FrameIndex = 40;
    // Scroll log to bottom initially
    this.scrollLogToBottom();
  },

  beforeUnmount() {
    this.clearAllTimers();
  },

  methods: {
    // ========= Обработчики UI =========
    Image1Click() {
      if ((this.UserCoinsCount !== 0) && !this.IsTrayClosed) {
        this.CoinOK = true;
        this.UserCoinsCount = this.UserCoinsCount - 1;
        this.Stake = this.Stake + 1;
        this.A1.Wake(10);
        this.env.UpdateCoinImages();
      }
    },
    iBadCoinClick() {
      if (!this.IsTrayClosed) {
        this.CoinOK = false;
        this.A1.Wake(10);
        this.env.UpdateCoinImages();
      }
    },
    iReturnClick() {
      this.A0.Wake(2);
      this.env.UpdateCoinImages();
    },
    iPlayClick() {
      this.A0.Wake(1);
    },
    btnTechResetClick() {
      this.A0.Wake(3);
    },
    toggleTray() {
      this.env.MoneyTrayEnable(this.IsTrayClosed);
    },

    // ========= Таймеры синхронизации вращения =========
    setSyncInterval(timer, ms, tick) {
      if (timer.handle) {
        clearInterval(timer.handle);
        timer.handle = null;
        timer.running = false;
      }
      timer.Interval = ms;
      if (ms > 0) {
        timer.handle = setInterval(tick, ms);
        timer.running = true;
      }
    },
    stopSyncTimer(timer) {
      if (timer.handle) {
        clearInterval(timer.handle);
        timer.handle = null;
      }
      timer.Interval = 0;
      timer.running = false;
    },

    // ========= Таймеры остановки барабанов =========
    setOneShot(timer, ms, cb) {
      if (timer.handle) {
        clearTimeout(timer.handle);
        timer.handle = null;
      }
      timer.Interval = ms;
      if (ms > 0) {
        timer.handle = setTimeout(() => {
          timer.Interval = 0;
          timer.handle = null;
          cb();
        }, ms);
      }
    },

    // ========= Таймер выигрыша =========
    startJackTimer() {
      if (this.JackTimer.handle) return;
      if (this.JackTimer.Interval <= 0) return;
      this.JackTimer.handle = setInterval(() => {
        if ((this.BankCoinsCount === 0) || (this.JackPotCoinsCount === 0)) {
          clearInterval(this.JackTimer.handle);
          this.JackTimer.handle = null;
          this.JackTimer.Interval = 0;
        }
        this.A0.Wake(6);
        this.env.UpdateCoinImages();
      }, this.JackTimer.Interval);
    },

    // ========= Очистка =========
    clearAllTimers() {
      [this.TimerSync1, this.TimerSync2, this.TimerSync3].forEach(t => this.stopSyncTimer(t));
      [this.TimerB1, this.TimerB2, this.TimerB3].forEach(t => {
        if (t.handle) { clearTimeout(t.handle); t.handle = null; }
        t.Interval = 0;
      });
      if (this.JackTimer.handle) {
        clearInterval(this.JackTimer.handle);
        this.JackTimer.handle = null;
        this.JackTimer.Interval = 0;
      }
    },

    scrollLogToBottom() {
      if (this.$refs.logWindow) {
        this.$nextTick(() => {
          this.$refs.logWindow.scrollTop = this.$refs.logWindow.scrollHeight;
        });
      }
    },
  },

  watch: {
    // Синхронные таймеры запускаются по изменению Interval
    'TimerSync1.Interval'(ms) {
      this.setSyncInterval(this.TimerSync1, ms, () => {
        this.Barrel1.FrameIndex = this.Barrel1.FrameIndex === 60 ? 1 : this.Barrel1.FrameIndex + 1;
      });
    },
    'TimerSync2.Interval'(ms) {
      this.setSyncInterval(this.TimerSync2, ms, () => {
        this.Barrel2.FrameIndex = this.Barrel2.FrameIndex === 60 ? 1 : this.Barrel2.FrameIndex + 1;
      });
    },
    'TimerSync3.Interval'(ms) {
      this.setSyncInterval(this.TimerSync3, ms, () => {
        this.Barrel3.FrameIndex = this.Barrel3.FrameIndex === 60 ? 1 : this.Barrel3.FrameIndex + 1;
      });
    },

    // Таймеры остановки: при установке интервала — ставим one-shot
    'TimerB1.Interval'(ms) {
      if (ms > 0) {
        this.setOneShot(this.TimerB1, ms, () => {
          this.stopSyncTimer(this.TimerSync1);
          this.A2.Wake(22);
        });
      }
    },
    'TimerB2.Interval'(ms) {
      if (ms > 0) {
        this.setOneShot(this.TimerB2, ms, () => {
          this.stopSyncTimer(this.TimerSync2);
          this.A2.Wake(23);
        });
      }
    },
    'TimerB3.Interval'(ms) {
      if (ms > 0) {
        this.setOneShot(this.TimerB3, ms, () => {
          this.stopSyncTimer(this.TimerSync3);
          this.A0.Wake(5);
        });
      }
    },

    // Watch for changes in the Log array to auto-scroll to bottom
    Log() {
      this.scrollLogToBottom();
    }
  }
};
</script>

<style scoped>
:root {
  --bg: #0b0e16;
  --panel: #121827;
  --panel-2: #1b2338;
  --text: #e6ecff;
  --muted: #98a2b3;
  --accent: #7c4dff;
  --accent-2: #00e5ff;
  --danger: #ff5a7a;
  --success: #2dd4bf;
}

* { box-sizing: border-box; }

.app {
  min-height: 100vh;
  background:
      radial-gradient(900px 400px at 80% -10%, rgba(124,77,255,.18), transparent),
      radial-gradient(700px 500px at -10% 110%, rgba(0,229,255,.14), transparent),
      var(--bg);
  color: var(--text);
  padding: 24px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
.header h1 {
  margin: 0;
  font-weight: 800;
  letter-spacing: .4px;
  background: linear-gradient(90deg, #c86bfa, #8a7dff, #4de3ff);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.states { display: flex; gap: 8px; flex-wrap: wrap; }
.state-pill {
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--panel-2);
  border: 1px solid rgba(255,255,255,.08);
  font-weight: 700; font-size: 12px;
}
.state-pill.s0 { box-shadow: 0 0 0 1px rgba(45,212,191,.25) inset; }
.state-pill.s1 { box-shadow: 0 0 0 1px rgba(255,209,102,.25) inset; }
.state-pill.s2 { box-shadow: 0 0 0 1px rgba(0,229,255,.25) inset; }
.state-pill.s3 { box-shadow: 0 0 0 1px rgba(255,90,122,.25) inset; }
.state-pill.s4 { box-shadow: 0 0 0 1px rgba(124,77,255,.25) inset; }

.panel {
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,.4);
}

.meters {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}
.meter {
  background: var(--panel);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 12px;
  padding: 10px 12px;
}
.meter .label { color: var(--muted); font-size: 12px; }
.meter .value { font-size: 22px; font-weight: 800; }
.meter .value .tray {
  padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 800;
}
.tray.open { background: rgba(45,212,191,.14); color: #8ff3e7; }
.tray.closed { background: rgba(255,90,122,.14); color: #ff9fb1; }

.reels {
  margin: 16px 0 10px;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  background: rgba(0,0,0,.25);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 14px;
  padding: 12px;
}
.reel {
  height: 140px;
  background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.02));
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 12px;
  display: grid; place-items: center; gap: 6px;
}
.reel.spinning { box-shadow: inset 0 0 0 1px rgba(0,229,255,.2), 0 0 22px rgba(0,229,255,.15); }
.symbol {
  font-size: 64px;
  font-weight: 900;
  text-shadow: 0 6px 16px rgba(0,0,0,.35);
}
.caption { color: var(--muted); font-size: 12px; }

.controls {
  display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center;
}
.coin-controls { display: flex; gap: 8px; flex-wrap: wrap; }
.main-controls { display: flex; gap: 8px; flex-wrap: wrap; }

.btn {
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.12);
  color: var(--text);
  cursor: pointer;
  font-weight: 800;
  letter-spacing: .3px;
}
.btn:hover { transform: translateY(-1px); }
.btn.primary { background: linear-gradient(90deg, #8b5cf6, #06b6d4); border: none; }
.btn.danger { background: linear-gradient(90deg, #ff5a7a, #f59e0b); border: none; }
.btn.ghost { background: transparent; }

.logging { margin-top: 16px; }
.log-settings { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 8px; }
.log-group { background: var(--panel); border: 1px solid rgba(255,255,255,.1); border-radius: 12px; padding: 8px 10px; }
.log-group .title { font-weight: 900; margin-bottom: 6px; color: #b8c1ff; }
.log-group label { display: inline-flex; align-items: center; gap: 6px; margin-right: 10px; font-size: 12px; color: var(--muted); }

.log-window {
  border-radius: 12px;
  padding: 12px;
  max-height: 260px;
  overflow: auto;
}
</style>

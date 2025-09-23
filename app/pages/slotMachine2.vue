<template>
  <SlotMachineBase
    title="FSM Slot Machine (A0/A1/A2) Измененные"
    :edBank="edBank"
    :userCoinsCount="UserCoinsCount"
    :edStake="edStake"
    :edJackPot="edJackPot"
    :isTrayClosed="IsTrayClosed"
    :barrel1="Barrel1"
    :barrel2="Barrel2"
    :barrel3="Barrel3"
    :timerSync1Running="TimerSync1.running"
    :timerSync2Running="TimerSync2.running"
    :timerSync3Running="TimerSync3.running"
    :logText="Log.join('\n')"
    :getBarrelNumber="env.GetBarrelNumber"
    @insert-coin="Image1Click"
    @bad-coin="iBadCoinClick"
    @play="iPlayClick"
    @return="iReturnClick"
    @tech-reset="btnTechResetClick"
  >
    <template #states>
      <div class="state-pill" :class="'s' + A0.State">A0: {{ stateDescriptions[0][A0.State] || A0.State }}</div>
      <div class="state-pill" :class="'s' + A1.State">A1: {{ stateDescriptions[1][A1.State] || A1.State }}</div>
      <div class="state-pill" :class="'s' + A2.State">A2: {{ stateDescriptions[2][A2.State] || A2.State }}</div>
    </template>

    <template #log-settings>
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
    </template>
  </SlotMachineBase>
</template>

<script setup>
import {onBeforeUnmount, watch} from 'vue';
import { TAutomaton } from "~/utils/TAutomaton.js";
import SlotMachineBase from "~/components/SlotMachineBase.vue";
import { useSlotMachine } from "~/composables/useSlotMachine.js";

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
        if ((Event === 5) && this.x01 && this.x02 && this.y2 === 0) {
          this.env().z04(); this.State = 4;
        } else if ((Event === 5 && this.y2 === 0) && !this.x01) {
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
      case 0: { this.env().z03(); this.env().z13(); this.env().z12(); this.A1(14); break; }
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
      case 0: { // Монетоприемник пуст
        if ((Event === 10) && this.x11) {
          this.env().z12(); this.State = 1;
        } else if ((Event === 10) && !this.x11) {
          this.env().z12(); this.State = 2;
        }
        break;
      }
      case 1: { // Жетон принят
        if (Event === 2) {
          this.env().ReturnMoney(); this.State = 0;
        } else if ((Event === 10) && this.x11) {
          this.env().z12();
        } else if ((Event === 10) && !this.x11) {
          this.env().z12(); this.State = 2;
        } else if (Event === 12) {
          this.env().z02(); this.env().RecieveMoney(); this.env().z15(); this.State = 3;
        }
        break;
      }
      case 2: { // Жетон не распознан
        if (Event === 2) {
          this.env().ReturnMoney(); this.State = 0;
        }
        break;
      }
      case 3: { // Монетоприемник закрыт
        if (Event === 14) {
          this.State = 0;
        }
        break
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

// Create automaton instances
const A0 = new TAutomatonSlotMachine();
const A1 = new TAutomatonMoneyTray();
const A2 = new TAutomatonBarrelsEngine();
const automatons = { A0, A1, A2 };

// State descriptions
const stateDescriptions = [
  ['Ожидание', 'Прием жетонов', 'Игра', 'Ошибка', 'Выдача жетона'],
  ['Монетоприемник пуст', 'Жетон принят', 'Жетон не распознан', 'Монетоприемник закрыт'],
  ['Барабаны остановлены', 'Барабаны запущены', 'Первый барабан остановлен', 'Второй барабан остановлен']
];

// Event descriptions
const eventDescriptions = Array.from({ length: 24 }, () => '');
eventDescriptions[0] = 'от А0: Начало игры';
eventDescriptions[1] = 'Нажата кнопка "Старт"';
eventDescriptions[2] = 'Нажата кнопка "Возврат денег"';
eventDescriptions[3] = 'Нажата кнопка "Тех. Сброс"';
eventDescriptions[5] = 'Сработал таймер третьего барабана';
eventDescriptions[6] = 'Выдан жетон из банка';
eventDescriptions[10] = 'Опущен жетон';
eventDescriptions[11] = 'от A1: Опущен жетон';
eventDescriptions[12] = 'от A0: Перевести деньги в банк';
eventDescriptions[22] = 'Сработал таймер первого барабана';
eventDescriptions[23] = 'Сработал таймер второго барабана';

// Use the slot machine composable
const {
  env,
  automatonsDispatcher,
  userCoinsCount: UserCoinsCount,
  isTrayClosed: IsTrayClosed,
  edBank,
  edStake,
  edJackPot,
  barrel1: Barrel1,
  barrel2: Barrel2,
  barrel3: Barrel3,
  timerSync1: TimerSync1,
  timerSync2: TimerSync2,
  timerSync3: TimerSync3,
  timerB1: TimerB1,
  timerB2: TimerB2,
  timerB3: TimerB3,
  log: Log,
  insertCoin: Image1Click,
  badCoin: iBadCoinClick,
  returnCoins: iReturnClick,
  play: iPlayClick,
  techReset: btnTechResetClick,
  setOneShot,
  stopSyncTimer,
  startJackTimer,
  clearAllTimers
} = useSlotMachine(automatons, stateDescriptions, eventDescriptions);

onBeforeUnmount(() => {
  clearAllTimers();
});

// Set up watchers for barrel stop timers
watch(() => TimerB1.Interval, (ms) => {
  if (ms > 0) {
    setOneShot(TimerB1, ms, () => {
      stopSyncTimer(TimerSync1);
      A2.Wake(22);
    });
  }
});

watch(() => TimerB2.Interval, (ms) => {
  if (ms > 0) {
    setOneShot(TimerB2, ms, () => {
      stopSyncTimer(TimerSync2);
      A2.Wake(23);
    });
  }
});

watch(() => TimerB3.Interval, (ms) => {
  if (ms > 0) {
    setOneShot(TimerB3, ms, () => {
      stopSyncTimer(TimerSync3);
      A0.Wake(5);
    });
  }
});
</script>

<style scoped>
</style>

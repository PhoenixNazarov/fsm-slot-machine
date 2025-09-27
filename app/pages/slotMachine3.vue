<template>
  <SlotMachineBase
    title="FSM Slot Machine (A0 * A1 * A2) перемноженный"
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
    </template>

    <template #log-settings>
      <div class="log-group">
        <div class="title">A (Перемноженный автомат)</div>
        <div class="log-list">
          <label><input type="checkbox" v-model="A0.LogWake" /> Вести протокол запуска</label>
          <label><input type="checkbox" v-model="A0.LogStateChange" /> Вести протокол изменения состояния</label>
          <label><input type="checkbox" v-model="A0.LogSleep" /> Вести протокол завершения</label>
          <label><input type="checkbox" v-model="A0.LogInput" /> Вести протокол входных параметров</label>
          <label><input type="checkbox" v-model="A0.LogOutput" /> Вести протокол выходных параметров</label>
          <!--        <label><input type="checkbox" v-model="A0.LogError" /> Error</label>-->
        </div>
      </div>
    </template>
  </SlotMachineBase>
</template>

<script setup>
import {onBeforeUnmount, watch} from 'vue';
import { TAutomaton } from "~/utils/TAutomaton.js";
import SlotMachineBase from "~/components/SlotMachineBase.vue";
import { useSlotMachine } from "~/composables/useSlotMachine.js";

// Define the automaton class
class TAutomatonMultiply extends TAutomaton {
  constructor() { super(0, 'Игровая машина x Монетоприемник x Игровые барабаны'); }

  // Опрос входных переменных
  GetX01() { return this.env().JackPotCoinsCount > 0; }
  GetX02() { return this.env().BankCoinsCount > 0; }
  GetX11() { return this.env().IsCoinOK(); } // "Жетон подлинный"

  get x01() { return this.GetX01(); }
  get x02() { return this.GetX02(); }
  get x11() { return this.GetX11(); }

  HandleState(Event) {
    switch (this.State) {
      case 0: { // Ожидание - Монетоприемник пуст - Барабаны остановлены
        if ((Event === 10) && this.x11) {
          this.env().z12(); this.State = 1;
        } else if ((Event === 10) && !this.x11) {
          this.env().z02(); this.env().z12(); this.State = 2;
        }
        break
      }
      case 1: { // Прием жетонов - Жетон принят - Барабаны остановлены
        // Жетон принят
        if (Event === 2) {
          this.env().z02(); this.env().ReturnMoney(); this.State = 0;
        } else if ((Event === 10) && this.x11) {
          this.env().z12();
        } else if ((Event === 10) && !this.x11) {
          this.env().z12(); this.State = 2;
        } else if (Event === 1) {
          this.env().z02(); this.env().RecieveMoney(); this.env().z15(); this.env().z20(); this.State = 3;
        }
        break
      }
      case 2: { // Ошибка - Жетон не распознан - Барабаны остановлены
        if (Event === 2) {
          this.env().ReturnMoney(); this.State = 0;
        }
        break
      }
      case 3: { // Игра - Монетоприемник закрыт - Барабаны запущены
        if (Event === 22) {
          this.State = 4;
        } else if (Event === 1) {
          this.env().z21();
        }
        break
      }
      case 4: { // Игра - Монетоприемник закрыт - Первый барабан остановлен
        if (Event === 23) {
          this.State = 5;
        }
        break
      }
      case 5: { // Игра - Монетоприемник закрыт - Второй барабан остановлен
        if (Event === 5) { // TODO: change
          this.env().z27(); this.env().z28();
        }
        if ((Event === 5) && this.x01 && this.x02) {
          this.env().z04(); this.State = 6;
        } else if (Event === 5 && !this.x01) {
          this.State = 0;
        }
        break
      }
      case 6: { // Выдача жетона - Монетоприемник закрыт - Барабаны остановлены
        if ((Event === 6) && this.x01 && this.x02) {
          this.env().z04(); this.env().z28(); this.env().z15();
        } else if ((Event === 6) && this.x01 && !this.x02) {
          this.env().z28(); this.env().z15(); this.State = 7;
        } else if ((Event === 6) && !this.x01) {
          this.env().z28(); this.env().z15(); this.State = 0;
        }
        break
      }
      case 7: { // Ошибка - Монетоприемник закрыт - Барабаны остановлены
        if (Event === 3) {
          this.env().z05(); this.env().z28(); this.env().z15(); this.State = 0;
        }
        break
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
      case 4: { this.env().z23(); break; }
      case 5: { this.env().z25(); break; }
    }
  }
}

// Create automaton instance
const A0 = new TAutomatonMultiply();
const automatons = { A0 };

// State descriptions
const stateDescriptions = [
  [
    'Ожидание - Монетоприемник пуст - Барабаны остановлены',
    'Прием жетонов - Жетон принят - Барабаны остановлены',
    'Ошибка - Жетон не распознан - Барабаны остановлены',
    'Игра - Монетоприемник закрыт - Барабаны запущены',
    'Игра - Монетоприемник закрыт - Первый барабан остановлен',
    'Игра - Монетоприемник закрыт - Второй барабан остановлен',
    'Выдача жетона - Монетоприемник закрыт - Барабаны остановлены',
    'Ошибка - Монетоприемник закрыт - Барабаны остановлены',
  ],
  [],
  []
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
      A0.Wake(22);
    });
  }
});

watch(() => TimerB2.Interval, (ms) => {
  if (ms > 0) {
    setOneShot(TimerB2, ms, () => {
      stopSyncTimer(TimerSync2);
      A0.Wake(23);
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

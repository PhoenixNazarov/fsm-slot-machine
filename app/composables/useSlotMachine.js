import { ref, reactive, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { Environment } from '~/utils/Environment.js';
import { TAutomatonsDispatcher } from '~/utils/TAutomatonsDispatcher.js';

export function useSlotMachine(automatons, stateDescriptions, eventDescriptions) {
  // Common reactive state
  const env = ref(null);
  const automatonsDispatcher = ref(null);

  // Counters
  const bankCoinsCount = ref(50);
  const userCoinsCount = ref(50);
  const jackPotCoinsCount = ref(0);
  const stake = ref(0);
  const isTrayClosed = ref(false);
  const coinOK = ref(true);

  // Indicators (computed from counters)
  const edBank = ref();
  const edStake = ref();
  const edJackPot = ref();

  // Barrels
  const barrel1 = reactive({ FrameIndex: 40 });
  const barrel2 = reactive({ FrameIndex: 40 });
  const barrel3 = reactive({ FrameIndex: 40 });

  // Timers
  const timerSync1 = reactive({ Interval: 0, handle: null, running: false });
  const timerSync2 = reactive({ Interval: 0, handle: null, running: false });
  const timerSync3 = reactive({ Interval: 0, handle: null, running: false });

  const timerB1 = reactive({ Interval: 0, handle: null });
  const timerB2 = reactive({ Interval: 0, handle: null });
  const timerB3 = reactive({ Interval: 0, handle: null });

  const jackTimer = reactive({ Interval: 0, handle: null });

  // Log
  const log = ref([]);

    env.value = new Environment({
      BankCoinsCount: bankCoinsCount,
      UserCoinsCount: userCoinsCount,
      JackPotCoinsCount: jackPotCoinsCount,
      Stake: stake,
      IsTrayClosed: isTrayClosed,
      CoinOK: coinOK,
      edBank,
      edStake,
      edJackPot,
      Barrel1: barrel1,
      Barrel2: barrel2,
      Barrel3: barrel3,
      TimerSync1: timerSync1,
      TimerSync2: timerSync2,
      TimerSync3: timerSync3,
      TimerB1: timerB1,
      TimerB2: timerB2,
      TimerB3: timerB3,
      JackTimer: jackTimer,
      Log: log,
      startJackTimer: startJackTimer
    });

    // Create dispatcher
    automatonsDispatcher.value = new TAutomatonsDispatcher(env.value);

    // Register automatons
    Object.values(automatons).forEach(automaton => {
      automatonsDispatcher.value.AddAutomaton(automaton);

      // Set default log settings
      automaton.LogWake = automaton.LogStateChange = automaton.LogSleep = true;
    });

    // Set state and event descriptions
    automatonsDispatcher.value.y = stateDescriptions;
    automatonsDispatcher.value.e = eventDescriptions;

    // Initialize UI
    env.value.UpdateCoinImages();


  // UI event handlers
  function insertCoin() {
    if (userCoinsCount.value !== 0 && !isTrayClosed.value) {
      coinOK.value = true;
      userCoinsCount.value = userCoinsCount.value - 1;
      stake.value = stake.value + 1;

      // Different behavior based on component
      if (automatons.A1) {
        automatons.A1.Wake(10);
      } else if (automatons.A0) {
        automatons.A0.Wake(10);
      }

      env.value.UpdateCoinImages();
    }
  }

  function badCoin() {
    if (!isTrayClosed.value) {
      coinOK.value = false;

      // Different behavior based on component
      if (automatons.A1) {
        automatons.A1.Wake(10);
      } else if (automatons.A0) {
        automatons.A0.Wake(10);
      }

      env.value.UpdateCoinImages();
    }
  }

  function returnCoins() {
    automatons.A0.Wake(2);
    env.value.UpdateCoinImages();
  }

  function play() {
    automatons.A0.Wake(1);
  }

  function techReset() {
    automatons.A0.Wake(3);
  }

  // Timer management
  function setSyncInterval(timer, ms, tick) {
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
  }

  function stopSyncTimer(timer) {
    if (timer.handle) {
      clearInterval(timer.handle);
      timer.handle = null;
    }
    timer.Interval = 0;
    timer.running = false;
  }

  function setOneShot(timer, ms, cb) {
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
  }

  function startJackTimer() {
    if (jackTimer.handle) return;
    if (jackTimer.Interval <= 0) return;
    jackTimer.handle = setInterval(() => {
      if (bankCoinsCount.value === 0 || jackPotCoinsCount.value === 0) {
        clearInterval(jackTimer.handle);
        jackTimer.handle = null;
        jackTimer.Interval = 0;
      }
      automatons.A0.Wake(6);
      env.value.UpdateCoinImages();
    }, jackTimer.Interval);
  }

  function clearAllTimers() {
    [timerSync1, timerSync2, timerSync3].forEach(t => stopSyncTimer(t));
    [timerB1, timerB2, timerB3].forEach(t => {
      if (t.handle) {
        clearTimeout(t.handle);
        t.handle = null;
      }
      t.Interval = 0;
    });
    if (jackTimer.handle) {
      clearInterval(jackTimer.handle);
      jackTimer.handle = null;
      jackTimer.Interval = 0;
    }
  }

  // Set up watchers for timer intervals
  watch(() => timerSync1.Interval, (ms) => {
    setSyncInterval(timerSync1, ms, () => {
      barrel1.FrameIndex = barrel1.FrameIndex === 60 ? 1 : barrel1.FrameIndex + 1;
    });
  });

  watch(() => timerSync2.Interval, (ms) => {
    setSyncInterval(timerSync2, ms, () => {
      barrel2.FrameIndex = barrel2.FrameIndex === 60 ? 1 : barrel2.FrameIndex + 1;
    });
  });

  watch(() => timerSync3.Interval, (ms) => {
    setSyncInterval(timerSync3, ms, () => {
      barrel3.FrameIndex = barrel3.FrameIndex === 60 ? 1 : barrel3.FrameIndex + 1;
    });
  });

  // Return everything needed by the components
  return {
    // State
    env,
    automatonsDispatcher,
    bankCoinsCount,
    userCoinsCount,
    jackPotCoinsCount,
    stake,
    isTrayClosed,
    coinOK,
    edBank,
    edStake,
    edJackPot,
    barrel1,
    barrel2,
    barrel3,
    timerSync1,
    timerSync2,
    timerSync3,
    timerB1,
    timerB2,
    timerB3,
    jackTimer,
    log,

    // Methods
    insertCoin,
    badCoin,
    returnCoins,
    play,
    techReset,
    setSyncInterval,
    stopSyncTimer,
    setOneShot,
    clearAllTimers
  };
}

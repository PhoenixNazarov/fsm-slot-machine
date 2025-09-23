<template>
  <div class="app">
    <header class="header">
      <h1>{{ title }}</h1>
      <div class="states">
        <slot name="states"></slot>
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
          <div class="value">{{ userCoinsCount }}</div>
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
            <span :class="['tray', isTrayClosed ? 'closed' : 'open']">{{ isTrayClosed ? 'Закрыт' : 'Открыт' }}</span>
          </div>
        </div>
      </div>

      <div class="reels">
        <div class="reel" :class="{ spinning: timerSync1Running }">
          <div class="symbol">{{ getBarrelNumber(barrel1) }}</div>
          <div class="caption">Барабан 1</div>
        </div>
        <div class="reel" :class="{ spinning: timerSync2Running }">
          <div class="symbol">{{ getBarrelNumber(barrel2) }}</div>
          <div class="caption">Барабан 2</div>
        </div>
        <div class="reel" :class="{ spinning: timerSync3Running }">
          <div class="symbol">{{ getBarrelNumber(barrel3) }}</div>
          <div class="caption">Барабан 3</div>
        </div>
      </div>

      <div class="controls">
        <div class="coin-controls">
          <button class="btn" @click="onInsertCoin" :disabled="userCoinsCount <= 0 || isTrayClosed">Опустить жетон</button>
          <button class="btn ghost" @click="onBadCoin" :disabled="isTrayClosed">Бракованный жетон</button>
        </div>
        <div class="main-controls">
          <button class="btn primary" @click="onPlay">Старт</button>
          <button class="btn" @click="onReturn">Возврат денег</button>
          <button class="btn danger" @click="onTechReset">Тех. сброс</button>
        </div>
      </div>
    </section>

    <section class="logging">
      <h3>Лог</h3>
      <div class="log-settings">
        <slot name="log-settings"></slot>
      </div>
      <pre ref="logWindow" class="log-window"><code>{{ logText }}</code></pre>
    </section>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';

// Props
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  edBank: {
    type: String,
    required: true
  },
  userCoinsCount: {
    type: Number,
    required: true
  },
  edStake: {
    type: String,
    required: true
  },
  edJackPot: {
    type: String,
    required: true
  },
  isTrayClosed: {
    type: Boolean,
    required: true
  },
  barrel1: {
    type: Object,
    required: true
  },
  barrel2: {
    type: Object,
    required: true
  },
  barrel3: {
    type: Object,
    required: true
  },
  timerSync1Running: {
    type: Boolean,
    required: true
  },
  timerSync2Running: {
    type: Boolean,
    required: true
  },
  timerSync3Running: {
    type: Boolean,
    required: true
  },
  logText: {
    type: String,
    required: true
  },
  getBarrelNumber: {
    type: Function,
    required: true
  }
});

// Emits
const emit = defineEmits([
  'insert-coin',
  'bad-coin',
  'play',
  'return',
  'tech-reset',
  'log-scroll'
]);

// Refs
const logWindow = ref(null);

// Methods
function onInsertCoin() {
  emit('insert-coin');
}

function onBadCoin() {
  emit('bad-coin');
}

function onPlay() {
  emit('play');
}

function onReturn() {
  emit('return');
}

function onTechReset() {
  emit('tech-reset');
}

function scrollLogToBottom() {
  if (logWindow.value) {
    nextTick(() => {
      logWindow.value.scrollTop = logWindow.value.scrollHeight;
      emit('log-scroll');
    });
  }
}

// Watchers
watch(() => props.logText, () => {
  scrollLogToBottom();
});

// Lifecycle hooks
onMounted(() => {
  scrollLogToBottom();
});
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

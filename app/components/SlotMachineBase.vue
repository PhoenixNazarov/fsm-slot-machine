<template>
  <div class="win32-app">
    <div class="win32-window">
      <div class="win32-title-bar">
        <div class="win32-title">{{ title }}</div>
      </div>

      <div class="win32-content">
        <!-- Left side: Slot machine and tokens -->
        <div class="left-panel">
          <!-- Slot machine panel -->
          <div class="slot-panel">
            <!-- Reels -->
            <div style="display: flex; gap: 20px;">
              <div class="reels">
                <div class="reel" :class="{ spinning: timerSync1Running }">
                  <div class="symbols-container">
                    <div class="symbol">{{ getBarrelNumber(barrel1) }}</div>
                    <div class="symbol add">{{ getBarrelNumber(barrel1) }}</div>
                    <div class="symbol add">{{ getBarrelNumber(barrel1) }}</div>
                    <div class="symbol add">{{ getBarrelNumber(barrel1) }}</div>
                    <div class="symbol add">{{ getBarrelNumber(barrel1) }}</div>
                  </div>
                </div>
                <div class="reel" :class="{ spinning: timerSync2Running }">
                  <div class="symbols-container">
                    <div class="symbol">{{ getBarrelNumber(barrel2) }}</div>
                    <div class="symbol add">{{ getBarrelNumber(barrel2) }}</div>
                    <div class="symbol add">{{ getBarrelNumber(barrel2) }}</div>
                    <div class="symbol add">{{ getBarrelNumber(barrel2) }}</div>
                    <div class="symbol add">{{ getBarrelNumber(barrel2) }}</div>
                  </div>
                </div>
                <div class="reel" :class="{ spinning: timerSync3Running }">
                  <div class="symbols-container">
                    <div class="symbol">{{ getBarrelNumber(barrel3) }}</div>
                    <div class="symbol add">{{ getBarrelNumber(barrel3) }}</div>
                    <div class="symbol add">{{ getBarrelNumber(barrel3) }}</div>
                    <div class="symbol add">{{ getBarrelNumber(barrel3) }}</div>
                    <div class="symbol add">{{ getBarrelNumber(barrel3) }}</div>
                  </div>
                </div>
              </div>
              <div class="meter">
                <div class="label">Банк</div>
                <div class="value">{{ edBank }}</div>
              </div>
              <div class="meter">
                <div class="label">Ставка:</div>
                <div class="value">{{ edStake }}</div>
              </div>
            </div>

            <div style="display: flex; gap: 37px;">
              <button class="btn game" style="height: 50px" @click="onPlay">Игра</button>
              <button class="btn return" @click="onReturn">Возврат</button>
              <div class="meter">
                <div class="label">Выигрыш</div>
                <div class="value">{{ edJackPot }}</div>
              </div>
            </div>
            <button class="btn tech-reset" @click="onTechReset">Тех. сброс</button>
            <div style="position:absolute; height: 60px; width: 10px; bottom: calc(50% + 14px); right: 5px; transform: translateY(50%);"
                 :style="{
                    'background-color': isTrayClosed ? '#777777' : '#fefefe',
                 }"
            >
            </div>

          </div>

          <!-- Tokens panel -->
          <div class="tokens-panel">
            <div>
              <div class="tokens-row" v-for="i in Math.floor(userCoinsCount / 30)">
                <div class="token" v-for="i in 30" :key="'token1-'+i" @click.prevent="onInsertCoin"  style="cursor: pointer">5</div>
              </div>
              <div class="tokens-row">
                <div class="token" v-for="i in userCoinsCount % 30" :key="'token2-'+i" @click.prevent="onInsertCoin" style="cursor: pointer">5</div>
              </div>
            </div>

<!--            <div class="coin-controls">-->
<!--              <button class="btn insert-coin" @click="onInsertCoin" :disabled="userCoinsCount <= 0 || isTrayClosed">Опустить жетон</button>-->
<!--              <button class="btn bad-coin" @click="onBadCoin" :disabled="isTrayClosed">Фальшивый жетон</button>-->
<!--            </div>-->

            <div style="display: flex; gap: 20px;justify-content: flex-end;">
              <div class="player-meter">
                <div class="label">Игрок:</div>
                <div class="value">{{ userCoinsCount }}</div>
              </div>

              <div class="fake-token-container" @click="onBadCoin" :style="{'opacity': isTrayClosed ? '0.5' : '1.0', 'cursor': isTrayClosed ? 'default' : 'pointer'}">
                <div class="token fake">1р</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right side: Log and protocol settings -->
        <div class="right-panel">
          <!-- Log window -->
          <div class="log-container">
            <pre ref="logWindow" class="log-window"><code style="white-space: break-spaces;">{{ logText }}</code></pre>
          </div>

          <!-- Protocol settings -->
          <div class="protocol-settings">
            <div class="log-settings">
              <slot name="log-settings"></slot>
            </div>
          </div>
        </div>
      </div>

      <!-- Status bar with automaton states -->
      <div class="win32-status-bar">
        <slot name="states"></slot>
      </div>
    </div>
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
* { box-sizing: border-box; }

/* Win32 App Container */
.win32-app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f0f0f0;
  padding: 20px;
  display: flex;
  justify-content: center;
}

/* Win32 Window */
.win32-window {
  background-color: #d4d0c8;
  border: 2px solid #808080;
  border-top-color: #ffffff;
  border-left-color: #ffffff;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

/* Win32 Title Bar */
.win32-title-bar {
  background: linear-gradient(to right, #000080, #1084d0);
  color: white;
  padding: 4px 8px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.win32-title {
  font-size: 14px;
}

/* Win32 Content */
.win32-content {
  padding: 10px;
  display: flex;
  gap: 10px;
}

/* Left Panel (Slot Machine + Tokens) */
.left-panel {
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Slot Machine Panel */
.slot-panel {
  position: relative;
  background-color: black;
  padding-top: 20px;
  padding-left: 10px;
  padding-bottom: 10px;
}

/* Reels */
.reels {
  display: flex;
  width: fit-content;
  gap: 2px;
}

.reel {
  height: 70px;
  width: 50px;
  background: linear-gradient(180deg, #eee 0%, #bbb 100%);
  border: 2px solid #222;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 8px #333 inset;
  overflow: hidden;
  position: relative;
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

.add {
  display: none;
}

.reel.spinning .symbols-container {
  display: flex;
  flex-direction: column;
  animation: spinInfinite 0.2s linear infinite;
}

.reel.spinning .add{
  display: block;
}

@keyframes spinInfinite {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-240px); /* 5 символов по 90px высотой */
  }
}

.symbol {
  font-size: 48px;
  color: #222;
  line-height: 90px;
  text-shadow: 0 2px 2px #888;
  transition: transform 1s cubic-bezier(0.6, 0.1, 0.4, 1.4);
}

.meter {
  width: 60px;
  display: flex;
  flex-direction: column;
}

.meter .label {
  font-size: 14px;
  margin-right: 5px;
  color: #eeeeee;
  margin-bottom: 14px;
}

.meter .value {
  background-color: #c0c0c0;
  border: 1px inset #808080;
  padding: 2px 5px;
  min-width: 50px;
  text-align: left;
}

/* Controls */
.controls {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 15px;
}

.btn {
  padding: 5px 10px;
  border: 2px solid #808080;
  border-top-color: #ffffff;
  border-left-color: #ffffff;
  background-color: #d4d0c8;
  cursor: pointer;
  font-size: 14px;
  min-width: 80px;
  text-align: center;
}

.btn:active {
  border: 2px solid #808080;
  border-bottom-color: #ffffff;
  border-right-color: #ffffff;
}
.btn:active {
  transform: translateY(2px);
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);
}

.btn.game {
  background: linear-gradient(135deg, #2e7d32, #66bb6a);
  border-color: #4caf50;
  color: #f8e09b;
  text-shadow: 1px 1px 2px #000;
  font-weight: bold;
  font-size: 16px;
  width: 90px;
  margin-top: 30px;
}

.btn.return {
  background: linear-gradient(135deg, #c62828, #ef5350);
  border-color: #d32f2f;
  color: #f8e09b;
  text-shadow: 1px 1px 2px #000;
  font-weight: bold;
  font-size: 16px;
  width: 90px;
  margin-top: 30px;
}

.btn.tech-reset {
  padding: 0 !important;
  font-size: 12px;
  min-width: 60px;
  position: absolute;
  bottom: 0;
  right: 0;
}

.tokens-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.token:first-child {
  margin-left: 0;
}

.token {
  width: 30px;
  height: 30px;
  background-color: #ffcc00;
  border: 1px solid #cc9900;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: bold;
  margin-left: -20px;
}

.token.fake {
  background-color: #ffaa00;
  border-color: #cc6600;
}

.fake-token-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fake-token-label {
  font-size: 12px;
}

.coin-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.player-meter {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.player-meter .label {
  font-size: 14px;
  margin-right: 5px;
}

.player-meter .value {
  background-color: #c0c0c0;
  border: 1px inset #808080;

}

/* Right Panel (Log + Protocol Settings) */
.right-panel {
  flex: 1;
  display: flex;
  gap: 10px;
}

/* Log Container */
.log-container {
  height: 400px;
  width: 500px;
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #c0c0c0;
  border: 2px solid #808080;
  border-bottom-color: #ffffff;
  border-right-color: #ffffff;
}

.win32-panel-title {
  background-color: #d4d0c8;
  padding: 5px 8px;
  font-weight: bold;
  border-bottom: 1px solid #808080;
  font-size: 14px;
}

.log-window {
  background-color: #ffffff;
  border: 1px inset #808080;
  padding: 8px;
  height: 100%;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  margin: 0;
  color: #000000;
}

/* Protocol Settings */
.protocol-settings {
}

.log-settings {
}


/* Win32 Status Bar */
.win32-status-bar {
  background-color: #d4d0c8;
  border-top: 1px solid #808080;
  padding: 3px 5px;
  display: flex;
  gap: 10px;
}

.state-pill {
  font-size: 12px;
  padding: 1px 5px;
  border: 1px solid #808080;
  background-color: #f0f0f0;
}

.state-pill.s0 { background-color: #e0ffe0; }
.state-pill.s1 { background-color: #ffffd0; }
.state-pill.s2 { background-color: #e0e0ff; }
.state-pill.s3 { background-color: #ffe0e0; }
.state-pill.s4 { background-color: #e0ffff; }

/* Button states */
.btn:disabled {
  color: #808080;
  background-color: #c0c0c0;
}

.insert-coin, .bad-coin {
  font-size: 12px;
  padding: 2px 5px;
  min-width: 60px;
}

.tokens-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
</style>

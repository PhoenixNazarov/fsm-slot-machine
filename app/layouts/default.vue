<script setup lang="ts">

</script>

<template>
  <div>
    <div class="navigation">
      <NuxtLink to="/slotMachine" class="nav-button">Оригинальные автоматы</NuxtLink>
      <NuxtLink to="/slotMachine2" class="nav-button">Измененные автоматы</NuxtLink>
      <NuxtLink to="/slotMachine3" class="nav-button">Перемноженный автомат</NuxtLink>
    </div>
    <NuxtPage/>
  </div>
</template>

<style scoped>
.navigation {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.nav-button {
  padding: 10px 20px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.12);
  color: #333333;
  text-decoration: none;
  font-weight: 800;
  letter-spacing: 0.3px;
  transition: transform 0.2s, background-color 0.2s;
}

.nav-button:hover {
  transform: translateY(-2px);
  background: rgba(0, 0, 0, 0.1);
}

.nav-button.router-link-active {
  background: linear-gradient(90deg, #8b5cf6, #06b6d4);
  border: none;
}
</style>

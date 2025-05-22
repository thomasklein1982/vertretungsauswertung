<template>
  <div>
    <h1>Auswertung von Vertretungsstatistiken</h1>
    <Button @click="createNewProject()" label="Neues Projekt anlegen"/>
    <Button @click="openProject()" label="Bestehendes Projekt öffnen"/>
  </div>
</template>

<script>
import Button from "primevue/button";
export default{
  components: {
    Button
  },
  methods: {
    createNewProject(){
      this.$emit("create-new-project");
    }
  }
};
</script>
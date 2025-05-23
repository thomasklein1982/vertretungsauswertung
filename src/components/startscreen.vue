<template>
  <div>
    <h1>Auswertung von Vertretungsstatistiken v{{ version }}</h1>
    <Button @click="createNewProject()" label="Neues Projekt anlegen"/>
    <Button @click="openProject()" label="Bestehendes Projekt öffnen"/>
  </div>
</template>

<script>
import Button from "primevue/button";
import {version} from "../../package.json";
export default{
  components: {
    Button
  },
  data(){
    return {
      version
    }
  },
  methods: {
    createNewProject(){
      this.$emit("create-new-project");
    }
  }
};
</script>
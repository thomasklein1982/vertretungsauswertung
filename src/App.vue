<template>
  <startscreen 
    v-show="screen==='start'"
    @create-new-project="createNewProject()"
  />
  <ProjectScreen v-if="project" :project="project" v-show="screen==='project'"/>
</template>

<script>
import startscreen from "./components/startscreen.vue";
import ProjectScreen from "./components/project-screen.vue";
import Project from "./classes/Project.js";

export default{
  components: {
    startscreen, ProjectScreen
  },
  data(){
    return {
      screen: 'start',
      project: null
    };
  },
  methods: {
    createNewProject(){
      let name=prompt("Name des neuen Projekts:");
      this.project=new Project(name);
      this.screen="project";
    }
  }
}
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

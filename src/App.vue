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
      screen: 'project',
      project: new Project("Vertretung")
    };
  },
  methods: {
    createNewProject(){
      let name=prompt("Name des neuen Projekts:");
      this.project=new Project(name)
      this.screen="project";
    }
  }
}
</script>


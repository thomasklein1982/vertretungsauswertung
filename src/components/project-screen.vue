<template>
  <div>
    <h1>Vertretungsstatistiken {{ project.name }}</h1>
    <Button @click="uploadMonth()" label="Excel-Tabelle hochladen"/>
  </div>
</template>

<script>
import Button from "primevue/button";
import {uploadExcel} from "../functions/helper.js";
import ExcelReader from "../classes/ExcelReader.js";

const excelReader=new ExcelReader();

export default{
  components: {
    Button
  },
  props: {
    project: Object
  },
  data(){
    return {

    }
  },
  methods: {
    async uploadMonth(){
      let f= await uploadExcel();
      console.log(f);
      this.project.importExcel(f);
    }
  }
}
</script>
<template>
  <div class="screen">
    <h1>Vertretungsstatistiken v {{ version }}</h1>
    <Button @click="uploadMonth()" label="Excel-Tabellen hochladen"/>
    <div v-if="project.lehrkraefte.length>0">
      <div>
        Von <DatePicker v-model="from" date-format="yy-m" view="month"/> bis <DatePicker v-model="to" date-format="yy-m" view="month"/>
        <Select v-model="displayedData" :options="options.displayedData" option-label="name"/>
        <MultiSelect v-model="selectedLehrkraefte" :option-label="(lk)=>{return lk.name+' ('+lk.kuerzel+')';}" :options="project.lehrkraefte"/> <Select v-model="sort" :options="options.sort"/>
      </div>
      <table class="overview">
        <tr><th>Stunden</th><th>Lehrkräfte</th></tr>
        <template v-for="(d,i) in statistic.data">
        <tr v-if="d">
          <td>{{d.sum}}</td>
          <td><Button @click="showLehrkraftDetails(lk)" text v-for="(lk,j) in d.lehrkraefte" :label="lk.name"/></td>
        </tr>
        </template>
      </table>
    </div>
    <div v-else>
      Noch keine Daten vorhanden
    </div>
    <Dialog :header="lehrkraftDetails?.name+' ('+lehrkraftDetails?.kuerzel+')'" v-model:visible="dialog.lehrkraftDetails">
      <p>Summierte Werte von {{ from }} bis {{ to }}:</p>
      <table class="details" v-if="lehrkraftDetails">
        <tr>
          <th>Art</th><th>Anzahl Stunden</th>
        </tr>
        <tr>
          <td>Vertretungen (zählend)</td><td>{{lehrkraftDetails.cumulatedData.vertretungen.zaehlen}}</td>
        </tr>
        <tr>
          <td>Vertretungen (nicht zählend)</td><td>{{lehrkraftDetails.cumulatedData.vertretungen.nichtZaehlen}}</td>
        </tr>
        <tr>
          <td>Entfälle (zählend)</td><td>{{lehrkraftDetails.cumulatedData.entfaelle.zaehlen}}</td>
        </tr>
        <tr>
          <td>Entfälle (nicht zählend)</td><td>{{lehrkraftDetails.cumulatedData.entfaelle.nichtZaehlen}}</td>
        </tr>
        <tr>
          <td>Bilanz (zählend)</td><td>{{lehrkraftDetails.cumulatedData.vertretungen.zaehlen-lehrkraftDetails.cumulatedData.entfaelle.zaehlen}}</td>
        </tr>
        <tr>
          <td>Bilanz (alles)</td><td>{{lehrkraftDetails.cumulatedData.vertretungen.zaehlen+lehrkraftDetails.cumulatedData.vertretungen.nichtZaehlen-lehrkraftDetails.cumulatedData.entfaelle.zaehlen-lehrkraftDetails.cumulatedData.entfaelle.nichtZaehlen}}</td>
        </tr>
      </table>
    </Dialog>
  </div>
</template>

<script>
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";
import MultiSelect from './multi-select.vue';
import Dialog from "primevue/dialog";

import Select from "primevue/select";
import {uploadExcel} from "../functions/helper.js";
import ExcelReader from "../classes/ExcelReader.js";
import Statistic from "../classes/Statistic.js";
import {version} from "../../package.json";

const excelReader=new ExcelReader();

let displayedData=[
  { name: "Vertretungen - Entfälle (nur zählend)", type: 0},
  { name: "Vertretungen - Entfälle (alle)", type: 1}, 
  { name: "Vertretungen (nur zählend)", type: 2},
  { name: "Vertretungen (alle)", type: 3}, 
  { name: "Entfälle (nur zählend)", type: 4}, 
  { name: "Entfälle (alle)", type: 5}
];

export default{
  components: {
    Button, DatePicker, Select, MultiSelect, Dialog
  },
  watch: {
    from(){
      this.updateStatistic();
    },
    to(){
      this.updateStatistic();
    },
    sort(){
      this.updateStatistic();
    },
    selectedLehrkraefte(){
      this.updateStatistic();
    },
    displayedData(){
      this.updateStatistic();
    },

  },
  props: {
    project: Object
  },
  data(){
    return {
      version: version,
      statistic: new Statistic(this.project),
      from: new Date(),
      to: new Date(),
      lehrkraftDetails: null,
      dialog: {
        lehrkraftDetails: false
      },
      sort: "absteigend",
      selectedLehrkraefte: [],
      displayedData: displayedData[0],
      options: {
        displayedData: displayedData,
        sort: ["aufsteigend","absteigend"]
      }
    }
  },
  methods: {
    async uploadMonth(){
      let f= await uploadExcel();
      for(let i=0;i<f.length;i++){
        this.project.importExcel(f[i]);
      }
      this.updateStatistic();
    },
    updateStatistic(){
      this.statistic.update(this.displayedData.type,this.from,this.to,this.selectedLehrkraefte, this.sort==="aufsteigend");
    },
    showLehrkraftDetails(lk){
      this.lehrkraftDetails=lk;
      this.dialog.lehrkraftDetails=true;
    }
  }
}
</script>

<style scoped>
.lehrkraft{
  
}
.details{
  border-collapse: collapse;
}

.details th, .details td{
  border: 1pt solid black;
  padding: 0.5rem;
}
.details th{
  text-align: left;
}

.overview{
  border-collapse: collapse;
}
.overview tr{
  border-bottom: 1pt solid black;
}
.overview th,td{
  padding: 0.5rem;
}

</style>
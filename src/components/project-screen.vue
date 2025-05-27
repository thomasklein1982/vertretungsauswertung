<template>
  <div class="screen">
    <h1>Vertretungsstatistiken v{{ version }}</h1>
    <p>Von Thomas Klein (<a href="https://mathe-info.com/tools-schule/" target="_blank">Website</a>)</p>
    <p>Mit diesem Tool können Exporte aus Untis analysiert werden. Die Dateien müssen den Monatsnamen, gefolgt von der vierstelligen Jahreszahl im Namen haben (z. B. <code>Vertretungsstatistik_Maerz2025</code>).</p>
    <p v-if="project.monate.length>0">
      Importierte Monate:
      <template v-for="(m,i) in project.monate">
        {{ i>0? ', ':'' }} {{m}}
      </template>
    </p>
    <Button @click="uploadMonth()" label="Excel-Tabellen importieren"/>
    <div v-if="importErrors.length>0">
      <Message v-for="(e,i) in importErrors" severity="error">
        {{ e.message }}
        <Button icon="pi pi-trash" text @click="importErrors.splice(i,1)"/>
      </Message>
    </div>
    
    <div v-if="project.lehrkraefte.length>0">
      <div>
        <DatePicker @date-select="updateStatistic()" selectionMode="range" v-model="dates" date-format="yy-m" view="month"/>
        <Select v-model="displayedData" :options="options.displayedData" option-label="name"/>
        <MultiSelect v-model="selectedLehrkraefte" :option-label="(lk)=>{return lk.name+' ('+lk.kuerzel+')';}" :options="project.lehrkraefte"/> <Select v-model="sort" :options="options.sort"/>
      </div>
      <div >
        <table class="overview">
          <tr><th v-for="(m,i) in statistic.months">{{ m.monthName }}</th><th>Gesamt</th></tr>
          <tr>
            <td style="vertical-align: top" v-for="(m,i) in statistic.months">
              <div>
                <div class="flex-row" v-for="(c,j) in m.data">
                  <div class="count">({{ c.count }})</div>
                  <div class="expand">
                    <Button @click="showLehrkraftDetails(lk,m)" text v-for="(lk,j) in c.lehrkraefte" :label="lk.name"/>
                  </div>
                </div>
              </div>
            </td>
            <td style="vertical-align: top">
              <div>
                <div class="flex-row" v-for="(s,j) in statistic.sums">
                  <div class="count">({{ s.count }})</div>
                  <div class="expand">
                    <Button @click="showLehrkraftDetails(lk.lk)" text v-for="(lk,j) in s.lehrkraefte" :label="lk.lk.name"/>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          <!-- <template v-for="(d,i) in statistic.data">
          <tr v-if="d">
            <td>{{d.sum}}</td>
            <td><Button @click="showLehrkraftDetails(lk)" text v-for="(lk,j) in d.lehrkraefte" :label="lk.name"/></td>
          </tr>
          </template> -->
        </table>
      </div>
    </div>
    <div v-else>
      Noch keine Daten vorhanden
    </div>
    <Dialog :header="lehrkraftDetails?.name+' ('+lehrkraftDetails?.kuerzel+')'" v-model:visible="dialog.lehrkraftDetails">
      <p v-if="monthDetails">Werte für {{ monthDetails.monthName }} {{ monthDetails.year }}</p>
      <p v-else-if="dates.length>1">Summierte Werte von {{ months[dates[0].getMonth()] }} {{ dates[0].getFullYear() }} bis {{ months[dates[1].getMonth()] }} {{ dates[1].getFullYear() }}:</p>
      <p v-else>Werte für {{ months[dates[0].getMonth()] }} {{ dates[0].getFullYear() }}</p>
      <table class="details" v-if="lehrkraftDetails">
        <tr>
          <th>Art</th><th>Anzahl Stunden</th>
        </tr>
        <tr>
          <td>Vertretungen (zählend)</td><td>{{monthDetails? lehrkraftDetails.getData(monthDetails.year,monthDetails.month,2) : lehrkraftDetails.cumulatedData.vertretungen.zaehlen}}</td>
        </tr>
        <tr>
          <td>Vertretungen (nicht zählend)</td><td>{{monthDetails? lehrkraftDetails.getData(monthDetails.year,monthDetails.month,6) : lehrkraftDetails.cumulatedData.vertretungen.nichtZaehlen}}</td>
        </tr>
        <tr>
          <td>Entfälle (zählend)</td><td>{{monthDetails? lehrkraftDetails.getData(monthDetails.year,monthDetails.month,4) : lehrkraftDetails.cumulatedData.entfaelle.zaehlen}}</td>
        </tr>
        <tr>
          <td>Entfälle (nicht zählend)</td><td>{{monthDetails? lehrkraftDetails.getData(monthDetails.year,monthDetails.month,7) : lehrkraftDetails.cumulatedData.entfaelle.nichtZaehlen}}</td>
        </tr>
        <tr>
          <td>Bilanz (zählend)</td><td>{{monthDetails? lehrkraftDetails.getData(monthDetails.year,monthDetails.month,0) : lehrkraftDetails.cumulatedData.vertretungen.zaehlen-lehrkraftDetails.cumulatedData.entfaelle.zaehlen}}</td>
        </tr>
        <tr>
          <td>Bilanz (alles)</td><td>{{monthDetails? lehrkraftDetails.getData(monthDetails.year,monthDetails.month,1) : lehrkraftDetails.cumulatedData.vertretungen.zaehlen+lehrkraftDetails.cumulatedData.vertretungen.nichtZaehlen-lehrkraftDetails.cumulatedData.entfaelle.zaehlen-lehrkraftDetails.cumulatedData.entfaelle.nichtZaehlen}}</td>
        </tr>
      </table>
      <template #footer>
        <Button @click="setFilter(lehrkraftDetails)" label="nur diese Lehrkraft anzeigen"/>
      </template>
    </Dialog>
  </div>
</template>

<script>
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";
import MultiSelect from './multi-select.vue';
import Dialog from "primevue/dialog";
import Message from "primevue/message";

import Select from "primevue/select";
import {uploadExcel} from "../functions/helper.js";
import ExcelReader from "../classes/ExcelReader.js";
import Statistic from "../classes/Statistic.js";
import {version} from "../../package.json";
import months from "../functions/months.js";

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
    Button, DatePicker, Select, MultiSelect, Dialog, Message
  },
  computed: {
    from(){
      return this.dates[0];
    },
    to(){
      if(this.dates.length>1 && this.dates[1]) return this.dates[1]; else return this.dates[0];
    },
    type(){
      return this.displayedData.type;
    }
  },
  watch: {
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
      months: months,
      version: version,
      importErrors: [],
      statistic: new Statistic(this.project),
      dates: [new Date()],
      lehrkraftDetails: null,
      monthDetails: null,
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
    setFilter(lk){
      this.selectedLehrkraefte=[lk];
      this.dialog.lehrkraftDetails=false;
    },
    async uploadMonth(){
      let f= await uploadExcel();
      for(let i=0;i<f.length;i++){
        try{
          this.project.importExcel(f[i]);
        }catch(e){
          this.importErrors.push({message: e});
        }
      }
      let m=this.project.getMinAndMaxMonth();
      if(m){
        if(m[0]===m[1]){
          this.dates=[new Date(m[0])];
        }else{
          this.dates=[new Date(m[0]), new Date(m[1])];
        }
      }
      this.updateStatistic();
    },
    updateStatistic(){
      this.statistic.update(this.displayedData.type,this.from,this.to,this.selectedLehrkraefte, this.sort==="aufsteigend");
    },
    showLehrkraftDetails(lk,month){
      this.lehrkraftDetails=lk;
      this.monthDetails=month;
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
.count{
  padding-top: var(--p-button-padding-y);
}
</style>
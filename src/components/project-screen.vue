<template>
  <div class="screen">
    <h1>Vertretungsstatistiken v{{ version }}</h1>
    <p>Von Thomas Klein (<a href="https://mathe-info.com/tools-schule/" target="_blank">Website</a>)</p>
    <p>Mit diesem Tool können Exporte aus Untis analysiert werden.</p>
    <h2>Import der Untis-Daten</h2>
    <p>Die Dateien (Excel oder PDF) müssen den Monatsnamen, gefolgt von der vierstelligen Jahreszahl im Namen haben (z. B. <code>Vertretungsstatistik_Maerz2025</code>).</p>
    <p v-if="project.monate.length>0">
      Importierte Monate:
      <template v-for="(m,i) in project.monate">
        {{ i>0? ', ':'' }} {{m}}
      </template>
    </p>
    <Button @click="uploadMonth()" label="Excel-Tabellen importieren"/>
    <Button @click="uploadMonthPDF()" label="PDF-Dateien importieren"/>
    <h2>Import-Fehler</h2>
    <div v-if="importErrors.length>0">
      <Message v-for="(e,i) in importErrors" severity="error">
        {{ e.message }}
        <Button icon="pi pi-trash" text @click="importErrors.splice(i,1)"/>
      </Message>
    </div>
    <div v-else>
      keine
    </div>
    
    <div v-if="project.lehrkraefte.length>0">
      <h2>Auswertung</h2>
      <p>
        <Button @click="view=0" :severity="view===0? 'primary':'secondary'" label="Übersicht nach Einsätzen"/>
        <Button @click="view=1" :severity="view===1? 'primary':'secondary'" label="Übersicht nach Lehrkräften"/>
      </p>
      <div>
        <DatePicker @date-select="updateStatistic()" selectionMode="range" v-model="dates" date-format="yy-m" view="month"/>
        <Select v-model="displayedData" :options="options.displayedData" option-label="name"/>
        <MultiSelect v-model="selectedLehrkraefte" :option-label="(lk)=>{return lk.name+' ('+lk.kuerzel+')';}" :options="project.lehrkraefte"/> <Select v-model="sort" :options="options.sort"/>
      </div>
      <div >
        <table class="overview" v-if="view===0">
          <tbody>
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
          </tbody>
        </table>
        <table class="overview" v-if="view===1">
          <tbody>
          <tr><th>Lehrkraft</th><th v-for="(m,i) in statistic.months">{{ m.monthName }}</th><th>Gesamt</th></tr>
          <tr v-for="(lk,j) in selectedLehrkraefte">
            <td>{{ lk.getFullName() }}</td>
            <td style="vertical-align: top" v-for="(m,i) in statistic.months">
              <Button @click="showLehrkraftDetails(lk,m)" text :label="lk.getStatistic(m,displayedData)"/>
            </td>
            <td style="vertical-align: top">
              <Button @click="showLehrkraftDetails(lk)" text :label="lk.getStatistic(null,displayedData)"/>
            </td>
          </tr>
          </tbody>
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
        <tbody>
        <tr>
          <th>Art</th><th>Anzahl Stunden</th><th></th>
        </tr>
        <tr>
          <td>Vertretungen (zählend)</td><td>{{monthDetails? lehrkraftDetails.getData(monthDetails.year,monthDetails.month,2) : lehrkraftDetails.cumulatedData.vertretungen.zaehlen}}</td><td><Button icon="pi pi-info-circle" @click="showEinsaetzeDetails(true,false,true,false)"/></td>
        </tr>
        <tr>
          <td>Vertretungen (nicht zählend)</td><td>{{monthDetails? lehrkraftDetails.getData(monthDetails.year,monthDetails.month,6) : lehrkraftDetails.cumulatedData.vertretungen.nichtZaehlen}}</td><td><Button icon="pi pi-info-circle" @click="showEinsaetzeDetails(true,false,false,true)"/></td>
        </tr>
        <tr>
          <td>Entfälle (zählend)</td><td>{{monthDetails? lehrkraftDetails.getData(monthDetails.year,monthDetails.month,4) : lehrkraftDetails.cumulatedData.entfaelle.zaehlen}}</td><td><Button icon="pi pi-info-circle" @click="showEinsaetzeDetails(false,true,true,false)"/></td>
        </tr>
        <tr>
          <td>Entfälle (nicht zählend)</td><td>{{monthDetails? lehrkraftDetails.getData(monthDetails.year,monthDetails.month,7) : lehrkraftDetails.cumulatedData.entfaelle.nichtZaehlen}}</td><td><Button icon="pi pi-info-circle" @click="showEinsaetzeDetails(false,true,false,true)"/></td>
        </tr>
        <tr>
          <td>Bilanz (zählend)</td><td>{{monthDetails? lehrkraftDetails.getData(monthDetails.year,monthDetails.month,0) : lehrkraftDetails.cumulatedData.vertretungen.zaehlen-lehrkraftDetails.cumulatedData.entfaelle.zaehlen}}</td><td><Button icon="pi pi-info-circle" @click="showEinsaetzeDetails(true,true,true,false)"/></td>
        </tr>
        <tr>
          <td>Bilanz (alles)</td><td>{{monthDetails? lehrkraftDetails.getData(monthDetails.year,monthDetails.month,1) : lehrkraftDetails.cumulatedData.vertretungen.zaehlen+lehrkraftDetails.cumulatedData.vertretungen.nichtZaehlen-lehrkraftDetails.cumulatedData.entfaelle.zaehlen-lehrkraftDetails.cumulatedData.entfaelle.nichtZaehlen}}</td><td><Button icon="pi pi-info-circle" @click="showEinsaetzeDetails(true,true,true,true)"/></td>
        </tr>
        </tbody>
      </table>
      <Button @click="" label="Details anzeigen"/>
      <template #footer>
        
        <Button @click="setFilter(lehrkraftDetails)" label="nur diese Lehrkraft anzeigen"/>
      </template>
    </Dialog>
    <DialogEinsaetzeDetails ref="dialogEinsaetzeDetails"/>
  </div>
</template>

<script>
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";
import MultiSelect from './multi-select.vue';
import Dialog from "primevue/dialog";
import Message from "primevue/message";

import Select from "primevue/select";
import {uploadExcel, uploadPDF} from "../functions/helper.js";
import ExcelReader from "../classes/ExcelReader.js";
import Statistic from "../classes/Statistic.js";
import {version} from "../../package.json";
import months from "../functions/months.js";
import DialogEinsaetzeDetails from "./dialog-einsaetze-details.vue";

const excelReader=new ExcelReader();

export let displayedData=[
  { name: "Vertretungen - Entfälle (nur zählend)", type: 0, calc: (data)=>{return data.vertretungen.zaehlen-data.entfaelle.zaehlen;}},
  { name: "Vertretungen - Entfälle (alle)", type: 1, calc: (data)=>{return data.vertretungen.zaehlen+data.vertretungen.nichtZaehlen-data.entfaelle.zaehlen-data.entfaelle.nichtZaehlen;}}, 
  { name: "Vertretungen (nur zählend)", type: 2, calc: (data)=>{return data.vertretungen.zaehlen;}},
  { name: "Vertretungen (alle)", type: 3, calc: (data)=>{return data.vertretungen.zaehlen+data.vertretungen.nichtZaehlen;}}, 
  { name: "Entfälle (nur zählend)", type: 4, calc: (data)=>{return data.entfaelle.zaehlen;}}, 
  { name: "Entfälle (alle)", type: 5, calc: (data)=>{return data.entfaelle.zaehlen+data.entfaelle.nichtZaehlen;}}
];

export default{
  components: {
    Button, DatePicker, Select, MultiSelect, Dialog, Message, DialogEinsaetzeDetails
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
      view: 0,
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
    showEinsaetzeDetails(showVertretungen,showEntfaelle,showZaehlend,showNichtZaehlend){
      let dates=[];
      if(this.monthDetails){
        dates.push(this.monthDetails);
      }else{
        for(let i=0;i<this.dates.length;i++){
          let d=this.dates[i];
          let m={
            year: d.getFullYear(),
            month: d.getMonth()
          };
          dates.push(m);
        }
        dates=this.dates;
      }
      this.$refs.dialogEinsaetzeDetails.open(this.lehrkraftDetails,dates,showVertretungen,showEntfaelle,showZaehlend,showNichtZaehlend);
    },
    setFilter(lk){
      this.selectedLehrkraefte=[lk];
      this.dialog.lehrkraftDetails=false;
    },
    async uploadMonthPDF(){
      let f= await uploadPDF();
      for(let i=0;i<f.length;i++){
        try{
          await this.project.importPDF(f[i]);
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
      console.log("update statistic");
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
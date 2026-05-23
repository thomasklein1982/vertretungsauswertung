<template>
  <Dialog :header="header" v-model:visible="show">
    <template v-if="lehrkraft">
      <p v-if="dates.length===1">Zeitraum: {{ months[dates[0].month] }} {{ dates[0].year }}</p>
      <p v-else-if="dates.length>1">Zeitraum: {{ months[dates[0].month] }} {{ dates[0].year }} bis {{ months[dates[1].month] }} {{ dates[1].year }}:</p>
      <p>Vertretungen: {{showVertretungen}}, Entfälle: {{ showEntfaelle }}, Zählend: {{ showZaehlend }}, Nicht-Zählend: {{ showNichtZaehlend }}</p>
      <table class="details">
        <tbody>
        <tr>
          <th>Datum</th><th>Stunde</th><th>Art</th><th>Wert</th><th>Weitere Infos</th>
        </tr>
        <tr v-for="(e,i) in einsaetze">
          <td>{{e.datum}}</td><td>{{ e.stunde }}</td><td>{{ e.art }}</td><td>{{ e.wert }}</td><td>{{ e.infos }}</td>
        </tr>
        </tbody>
      </table>
    </template>
    <template #footer>
    </template>
  </Dialog>
</template>

<script>
import Lehrkraft from '../classes/Lehrkraft';
import months from '../functions/months';
import Dialog from "primevue/dialog";

export default{
  components: {
    Dialog
  },
  props: {
    
  },
  computed: {
    header(){
      let text;
      if(!this.lehrkraft) return "";
      if(this.showVertretungen){
        if(this.showEntfaelle){
          text="Vertretungen & Entfälle";
        }else{
          text="Vertretungen";
        }
      }else{
        if(this.showEntfaelle){
          text="Entfälle";
        }else{
          text="Fehler";
        }
      }
      text+=" für "+this.lehrkraft.getFullName();
      return text;
    },
    einsaetze(){
      if(!this.lehrkraft) return null;
      return this.lehrkraft.getEinsaetze(this.dates[0],this.dates[1],this.showVertretungen,this.showEntfaelle,this.showZaehlend,this.showNichtZaehlend);
    }
  },
  data(){
    return {
      show: false,
      months: months,
      lehrkraft: null,
      dates: null,
      showVertretungen: false,
      showEntfaelle: false,
      showZaehlend: false,
      showNichtZaehlend: false
    }
  },
  methods: {
    open(lehrkraft, dates, showVertretungen, showEntfaelle, showZaehlend, showNichtZaehlend){
      this.lehrkraft=lehrkraft;
      this.dates=[];
      for(let i=0;i<dates.length;i++){
        let d=dates[i];
        if(d instanceof Date){
          d={
            month: d.getMonth(),
            year: d.getFullYear()
          };
        }
        this.dates.push(d);
      }
      this.showVertretungen=showVertretungen;
      this.showEntfaelle=showEntfaelle;
      this.showZaehlend=showZaehlend;
      this.showNichtZaehlend=showNichtZaehlend;
      this.show=true;
    }
  }
}

</script>
import { dateBetween } from "../functions/dateBetween";

export default class Lehrkraft{
  constructor(kuerzel,name){
    this.name=name;
    this.kuerzel=kuerzel.toUpperCase();
    this.data={};
    this.cumulatedData={
      vertretungen: {
        zaehlen: 0,
        nichtZaehlen: 0
      },
      entfaelle: {
        zaehlen: 0,
        nichtZaehlen: 0
      }
    };
  }
  getFullName(){
    return this.name+ " ["+this.kuerzel+"]";
  }
  getStatistic(month, type){
    let data;
    if(!month) data=this.cumulatedData;
    else data=this.data[month.year][month.month];
    return type.calc(data);
  }
  getEinsaetze(from,to,vertretungen,entfaelle,zaehlend,nichtZaehlend){
    if(!to) to=from;
    let einsaetze=[];
    for(let a in this.data){
      let dataJahr=this.data[a];
      for(let i=0;i<dataJahr.length;i++){
        let month=dataJahr[i];
        if(!month) continue;
        if(!dateBetween({year: a*1, month: i}, from, to)) continue;
        for(let j=0;j<month.einsaetze.length;j++){
          let e=month.einsaetze[j];
          let zaehlt=e.isZaehlend();
          if(!zaehlend && zaehlt) continue;
          if(!nichtZaehlend && !zaehlt) continue;
          if(vertretungen && entfaelle){
            //alles durchlassen
          }else{
            if(vertretungen && !e.isVertretung()) continue;
            if(entfaelle && !e.isEntfall()) continue;
          }
          einsaetze.push(e);
        }
      }
    }
    return einsaetze;
  }
  createDataIfNecessary(jahr, monat){
    if(!this.data[jahr]){
      this.data[jahr]=[];
    }
    if(!this.data[jahr][monat]){
      this.data[jahr][monat]={
        einsaetze: [],
        vertretungen: {
          zaehlen: 0,
          nichtZaehlen: 0,
        },
        entfaelle: {
          zaehlen: 0,
          nichtZaehlen: 0,
        }
      };
    }
  }
  addEinsatz(jahr, monat, einsatz){
    this.createDataIfNecessary(jahr,monat);
    this.data[jahr][monat].einsaetze.push(einsatz);
  }
  setData(jahr,monat,data){
    this.createDataIfNecessary(jahr,monat);
    let d=this.data[jahr][monat];
    d.vertretungen.zaehlen=data[0];
    d.vertretungen.nichtZaehlen=data[1];
    d.entfaelle.zaehlen=data[2];
    d.entfaelle.nichtZaehlen=data[3];
  }
  getData(year, month, type){
    let d=this.data[year];
    if(!d) return 0;
    d=d[month];
    if(!d) return 0;
    if(type===0){
      //differenz zaehlen:
      return d.vertretungen.zaehlen-d.entfaelle.zaehlen;
    }else if(type===1){
      return d.vertretungen.zaehlen+d.vertretungen.nichtZaehlen-d.entfaelle.zaehlen-d.entfaelle.nichtZaehlen;
    }else if(type===2){
      return d.vertretungen.zaehlen;
    }else if(type===3){
      return d.vertretungen.zaehlen+d.vertretungen.nichtZaehlen;
    }else if(type===4){
      return d.entfaelle.zaehlen;
    }else if(type===5){
      return d.entfaelle.zaehlen+d.entfaelle.nichtZaehlen;
    }else if(type===6){
      return d.vertretungen.nichtZaehlen;
    }else if(type===7){
      return d.entfaelle.nichtZaehlen;
    }else{
      throw "invalid type "+type;
    }
  }
  updateCumulatedData(fromYear, fromMonth, toYear, toMonth, type){
    let sum=0;
    this.cumulatedData.vertretungen.zaehlen=0;
    this.cumulatedData.vertretungen.nichtZaehlen=0;
    this.cumulatedData.entfaelle.zaehlen=0;
    this.cumulatedData.entfaelle.nichtZaehlen=0;

    for(let y=fromYear;y<=toYear;y++){
      let start=0;
      let stop=11;
      if(y===fromYear) start=fromMonth;
      if(y===toYear) stop=toMonth;
      for(let m=start;m<=stop;m++){
        this.cumulatedData.vertretungen.zaehlen+=this.getData(y,m,2);
        this.cumulatedData.vertretungen.nichtZaehlen+=this.getData(y,m,6);
        this.cumulatedData.entfaelle.zaehlen+=this.getData(y,m,4);
        this.cumulatedData.entfaelle.nichtZaehlen+=this.getData(y,m,7);
        sum+=this.getData(y,m,type);
      }
    }
    return sum;
  }
}
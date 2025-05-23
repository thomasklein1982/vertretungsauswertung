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
  setData(jahr,monat,data){
    if(!this.data[jahr]){
      this.data[jahr]=[];
    }
    this.data[jahr][monat]={
      vertretungen: {
        zaehlen: data[0],
        nichtZaehlen: data[1],
      },
      entfaelle: {
        zaehlen: data[2],
        nichtZaehlen: data[3],
      }
    };
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
      return d.vertretungen.zaehlen+d.vertretungen.nichtZaehlen-d.entfaelle.zaehlen-d.vertretungen.nichtZaehlen;
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
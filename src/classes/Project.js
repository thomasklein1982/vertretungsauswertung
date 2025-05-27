import ExcelReader from "./ExcelReader";
import Lehrkraft from "./Lehrkraft";
import months from "../functions/months";

export default class Project{
  constructor(name){
    this.name=name;
    this.lehrkraefte=[];
    this.monate=[];
  }

  getLehrkraftByKuerzel(kuerzel){
    kuerzel=kuerzel.toUpperCase();
    for(let i=0;i<this.lehrkraefte.length;i++){
      let lk=this.lehrkraefte[i];
      if(lk.kuerzel===kuerzel){
        return lk;
      }
    }
    return null;
  }

  getMinAndMaxMonth(){
    let min=null;
    let max=null;
    for(let a in this.monate){
      let m=this.monate[a];
      if(min===null || m<min){
        min=m;
      }
      if(max===null || m>max){
        max=m;
      }
    }
    if(min===null) return null;
    return [min,max];
  }

  importExcel(file){
    const reader=new ExcelReader(file.sheets[0].rows);
    let s=/(Januar|Februar|Maerz|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)(\d\d\d\d)/.exec(file.name);
    let monat;
    let jahr;
    if(s){
      if(s[1]==="Maerz") s[1]="März";
      monat=months.indexOf(s[1]);
      jahr=s[2]*1;
    }else{
      throw "Dateiname '"+file.name+"'enthält keine Monatsbezeichnung gefolgt von einer vierstelligen Jahreszahl (z. B. Januar2025 oder Maerz2024)";
    }
    
    let monatfull=jahr+"-"+(monat+1);
    if(this.monate.indexOf(monatfull)>=0){
      throw ("Für den Monat "+monatfull+" wurden bereits Daten hochgeladen.");
    }
    this.monate.push(monatfull);
    while(true){
      let c;
      //naechste Lehrkraft finden:
      let hasVertretungen=true;
      let ok=this.readToNextVertretungenEntfaelle(reader);
      if(!ok) break;
      c=reader.getCurrentCellContent();
      if(c.startsWith("0")){
        hasVertretungen=false;
      }
      ok=reader.moveUntilNotEmpty(0,-1);
      if(!ok) throw "Keine Lehrkraft gefunden";
      c=reader.getCurrentCellContent();
      let lk=this.getLehrkraftByKuerzel(c);
      if(!lk){
        reader.move(1,0);
        let name=reader.getCurrentCellContent();
        
        reader.move(-1,0);
        lk=new Lehrkraft(c,name);
        if(name){
          this.lehrkraefte.push(lk);
        }
      }
      let data;
      if(hasVertretungen){
        ok=reader.gotoCell("Vertretungen:");
        if(!ok){
          throw "Keine Vertretungen gefunden";
        }
        data=[];
        let s,w;
        for(let i=0;i<4;i++){
          c=reader.getCurrentCellContent();
          s=c.split(":");
          w=s[1]*1;
          data.push(w);
          reader.move(0,1);
        }
      }else{
        reader.moveUntilNotEmpty(0,1);
        reader.move(0,1);
        data=[0,0,0,0];
      }
      lk.setData(jahr,monat,data);
    }
  }

  readToNextVertretungenEntfaelle(reader){
    let ok=reader.gotoCell(/^.*Vertretungen \/ Entfälle/);
    return ok;
  }

  /**
   * 
   * @param {ExcelReader} reader 
   */
  readToNextTeacher(reader){
    let ok=this.readToNextVertretungenEntfaelle(reader);
    if(!ok) return false;
    ok=reader.moveUntilNotEmpty(0,-1);
    if(!ok) return false;
    return true;
  }
}
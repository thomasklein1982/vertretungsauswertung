import ExcelReader from "./ExcelReader";
import Lehrkraft from "./Lehrkraft";

export default class Project{
  constructor(name){
    this.name=name;
    this.lehrkraefte=[];
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

  importExcel(file){
    const reader=new ExcelReader(file.sheets[0].rows);
    let s=/(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)(\d\d\d\d)/.exec(file.name);
    let monat;
    let jahr;
    if(s){
      monat=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"].indexOf(s[1]);
      jahr=s[2]*1;
    }else{
      throw "Dateiname enthält keine Monatsbezeichnung gefolgt von der Jahreszahl";
    }
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
        this.lehrkraefte.push(lk);
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
    console.log(this.lehrkraefte);
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
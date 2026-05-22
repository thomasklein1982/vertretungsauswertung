import ExcelReader from "./ExcelReader";
import Lehrkraft from "./Lehrkraft";
import months from "../functions/months";
import { formatDate } from "../functions/formatDate";
import { readPDF } from "../functions/readPDF";
import { Einsatz } from "./Einsatz";

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

  async importPDF(file){
    let text=await readPDF(file.code);
    let {jahr, monat, monatfull}=this.getFileMetaData(file);
    this.monate.push(monatfull);
    //export-Datum finden => steht immer direkt vor dem Kürzel:
    let res=/\d{1,2}\.\d{1,2}\.\d{4}/.exec(text);
    let exportDate;
    if(!res){
      throw "Kein Exportdatum gefunden";
    }
    exportDate=res[0];
    let reExportDate=new RegExp(exportDate,"g");
    let heading=text.substring(0,res.index).trim();
    text=text.replace(new RegExp(heading,"g"),"");
    text=text.replace(/EZEnde/g,"");
    console.log("Export-Date:",exportDate);
    let rest=text;
    while(true){
      let c;
      //naechste Lehrkraft finden:
      let hasVertretungen=true;
      let pos=rest.indexOf("Vertretungen / Entfälle");
      if(pos<0) break;
      let vor=rest.substring(0,pos);
      let pos2=vor.lastIndexOf(exportDate);
      if(pos2<0){
        throw "Error: Export-Datum nicht gefunden bei "+rest.substring(0,30)+" ...";
      }
      vor=vor.substring(pos2+exportDate.length).trim();
      if(vor.endsWith(" 0")){
        hasVertretungen=false;
        vor=vor.substring(0,vor.length-2).trim();
      }
      pos2=vor.indexOf(" ");
      let kuerzel=vor.substring(0,pos2).trim();
      let name=vor.substring(pos2+1).trim();
      if(!kuerzel){
        kuerzel=name;
        name="?";
      }
      console.log("Kürzel:",kuerzel, "Name:", name);
      rest=rest.substring(pos);
      let lk=this.getLehrkraftByKuerzel(kuerzel);
      if(!lk){
        lk=new Lehrkraft(kuerzel,name);
        this.lehrkraefte.push(lk);
      }
      //naechsten lehrer finden:
      pos=rest.indexOf("Vertretungen / Entfälle",1);
      let lehrer;
      if(pos>=0){
        let temp=rest.substring(0,pos);
        pos2=temp.lastIndexOf(exportDate);
        lehrer=rest.substring(0,pos2);
        rest=rest.substring(pos2);
      }else{
        lehrer=rest;
        rest="";
      }
      lehrer=lehrer.replace(reExportDate,"");
      if(!hasVertretungen){
        lk.setData(jahr,monat,[0,0,0,0]);
        continue;
      }
      pos=lehrer.lastIndexOf("Vertretungen: ");
      if(pos<0){
        throw "Keine Vertretungen gefunden";
      }
      let einsaetze=lehrer.substring(0,pos);
      let captions="Datum Stunde Art Wert Zähler Fach Klasse(n) Grund Text";
      pos=einsaetze.indexOf(captions);
      if(pos<0){
        throw "Überschriften nicht gefunden";
      }
      einsaetze=einsaetze.substring(pos+captions.length).trim();
      //einsaetze zeilenweise parsen: jede Zeile beginnt mit Datum, es ist aber auch ein datums-bereich möglich
      let re=/(\d{1,2}\.\d{1,2}\.(?:\s*-\s*\d{1,2}\.\d{1,2}\.)?)( (Mo|Di|Mi|Do|Fr|Sa|So)\/(\d+))?/;
      res=re.exec(einsaetze);
      while(res){
        let datum=res[1];
        let wochentag=res[3];
        let stunde=res[4];
        einsaetze=einsaetze.substring(res[0].length).trim();
        pos=einsaetze.indexOf(" ");
        let art=einsaetze.substring(0,pos).trim();
        einsaetze=einsaetze.substring(pos).trim();
        res=/(-?\d+)/.exec(einsaetze);
        if(!res){
          throw "Wert nicht gefunden";
        }
        let wert=res[0]*1;
        einsaetze=einsaetze.substring(res.index+res[0].length).trim();
        res=re.exec(einsaetze);
        let infos;
        if(!res){
          infos=einsaetze;
          einsaetze="";
        }else{
          infos=einsaetze.substring(0,res.index).trim();
          einsaetze=einsaetze.substring(res.index).trim();
        }
        lk.addEinsatz(jahr,monat,new Einsatz(datum,wochentag,stunde,art,wert,infos));
      }
      let summen=lehrer.substring(pos);
      
      res=/Vertretungen: (\d+) .*Vertretung nicht zu zählen: (\d+) .*Entfälle: (\d+) .*Entfall nicht zu zählen: (\d+) .*Summe: (-?\d+)/.exec(summen);
      if(!res){
        throw "Summierte Werte nicht lesbar "+kuerzel;
      }
      let v=res[1]*1;
      let vn=res[2]*1;
      let e=res[3]*1;
      let en=res[4]*1;
      let s=res[5]*1;
      if(v-e!==s){
        throw "Summe stimmt nicht "+kuerzel;
      }
      let data=[v,vn,e,en];
      lk.setData(jahr,monat,data);
    }
  }

  getFileMetaData(file){
    let s=/(Januar|Februar|Maerz|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\D*(\d\d\d\d)/.exec(file.name);
    let monat;
    let jahr;
    if(s){
      if(s[1]==="Maerz") s[1]="März";
      monat=months.indexOf(s[1]);
      jahr=s[2]*1;
    }else{
      throw "Dateiname '"+file.name+"'enthält keine Monatsbezeichnung gefolgt von einer vierstelligen Jahreszahl (z. B. Januar2025 oder Maerz2024)";
    }
    
    let monatfull=formatDate(jahr,monat+1);
    if(this.monate.indexOf(monatfull)>=0){
      throw ("Für den Monat "+monatfull+" wurden bereits Daten hochgeladen.");
    }
    return {
      jahr, monat, monatfull
    }
  }

  importExcel(file){
    const reader=new ExcelReader(file.sheets[0].rows);
    let {jahr, monat, monatfull}=this.getFileMetaData(file);
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
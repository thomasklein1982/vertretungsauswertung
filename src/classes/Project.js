import ExcelReader from "./ExcelReader";
import Lehrkraft from "./Lehrkraft";

export default class Project{
  constructor(name){
    this.name=name;
    this.lehrkraefte={};

  }

  importExcel(file){
    const reader=new ExcelReader(file.sheets[0].rows);
    while(true){
      let ok=this.readToNextTeacher(reader);
      if(!ok) break;
      let c=reader.getCurrentCellContent();
      if(!this.lehrkraefte[c]){
        reader.move(1,0);
        let name=reader.getCurrentCellContent();
        reader.move(-1,0);
        this.lehrkraefte[c]=new Lehrkraft(c,name);
      }
      ok=reader.gotoCell("Vertretungen:");
      if(!ok){
        throw "Keine Vertretungen gefunden";
      }
      reader.move(0,1);
    }
    console.log(this.lehrkraefte);
  }

  readToNextVertretungenEntfaelle(reader){
    let ok=reader.gotoCell("Vertretungen / Entfälle");
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
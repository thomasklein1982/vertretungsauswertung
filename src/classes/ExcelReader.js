export default class ExcelReader{
  constructor(rows){
    if(!rows) return;
    this.openSheet(rows);
  }
  openSheet(rows){
    this.rows=rows;
    this.currentRow=0;
    this.currentCol=0;
    this.saveStates={};
    this.updateValue();
  }
  getCurrentCellContent(){
    if(this.currentRow>=this.rows.length) return null;
    let r=this.rows[this.currentRow];
    if(this.currentCol>=r.length) return null;
    let c=this.rows[this.currentRow][this.currentCol];
    if(!c){
      return "";
    }else{
      if(c.trim){
        return c.trim();
      }else{
        return c+"";
      }
    }
  }
  updateValue(){
    this.value=this.getCurrentCellContent();
  }
  saveColum(name){
    this.saveStates[name]={
      col: this.currentCol
    };
  }
  saveRow(name){
    this.saveStates[name]={
      row: this.currentRow
    };
  }
  saveCell(name){
    this.saveStates[name]={
      row: this.currentRow,
      col: this.currentCol
    };
  }
  goto(name){
    let v=this.saveStates[name];
    if(!v) return;
    if(v.row!==undefined) this.currentRow=v.row;
    if(v.col!==undefined) this.currentCol=v.col;
    this.updateValue();
    return this.value;
  }
  move(dx,dy){
    this.currentRow+=dy;
    this.currentCol+=dx;
    this.updateValue();
    return this.value;
  }
  moveDown(){
    return this.move(0,1);
  }
  /**gehe ganz nach links an den Anfang der aktuellen Zeile */
  gotoLeft(){
    this.currentCol=0;
    this.updateValue();
  }
  /** 
   * gehe ganz nach oben in der aktuellen Spalte */
  gotoTop(){
    this.currentRow=0;
    this.updateValue();
  }
  /**
   * gehe nach ganz links oben (Zelle A1)
   */
  gotoTopLeft(){
    this.gotoLeft();
    this.gotoTop();
    this.updateValue();
  }
  /**
   * Läuft in der angegebene Richtung bis der erste nicht-leere Wert gefunde wird
   * @param {*} dx 
   * @param {*} dy 
   * @returns true: Wert wurde gefunden, false: kein Wert gefunden
   */
  moveUntilNotEmpty(dx,dy){
    while(true){
      this.move(dx,dy);
      let c=this.getCurrentCellContent();
      if(c===null) return false;
      if(c.length>0) return true;
    }
  }
  /**
   * Geht zur nächsten Zelle, die dem Suchwort entspricht. Bleibt an aktueller Position, falls nichts gefunden wird.
   * @param {String|RegExp} search String oder regulärer Ausdruck, nach dem gesucht wird
   * @param {Boolean|undefined} goRight Bei true: es wird in der aktuellen Zeile gesucht (nach rechts), sonst: in aktueller Spalte (nach unten)
   * @returns true: Zelle wurde gefunden, false: Zelle wurde nicht gefunden
   */
  gotoCell(search,goRight){
    let startRow=this.currentRow;
    let startCol=this.currentCol;
    if(!goRight) goRight=false;
    let useRegex=search.substring===undefined;
    let searching=true;
    while(searching){
      this.updateValue();
      if(this.value===null){
        this.currentRow=startRow;
        this.currentCol=startCol;
        this.updateValue();
        return false;
      }
      if(useRegex){
        if(this.value.match(search)){
          return true;
        }
      }else{
        if(this.value.startsWith(search)){
          return true;
        }
      }
      if(goRight){
        this.currentCol++;
      }else{
        this.currentRow++;
      }
    }
    this.currentRow=startRow;
    this.currentCol=startCol;
    this.updateValue();
    return false;
  }

}
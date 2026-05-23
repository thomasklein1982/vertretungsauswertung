export class Einsatz{
  constructor(datum,stunde,art,wert,infos){
    this.datum=datum;
    this.stunde=stunde;
    this.art=art;
    this.wert=wert*1;
    this.infos=infos;
  }
  isZaehlend(){
    return this.wert!==0;
  }
  isVertretung(){
    if(this.isZaehlend()) return this.wert>0;
    return this.art.toLowerCase().indexOf("v")>=0;
  }
  isEntfall(){
    if(this.isZaehlend()) return this.wert<0;
    return this.art.toLowerCase().indexOf("e")>=0;
  }
}
export class Einsatz{
  constructor(datum,wochentag,stunde,art,wert,infos){
    this.datum=datum;
    this.wochentag=wochentag;
    this.stunde=stunde;
    this.art=art;
    this.wert=wert;
    this.infos=infos;
    console.log("Einsatz",this);
  }
}
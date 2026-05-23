/**
 * Datum als {month, year}, beides Zahlen (month: 0-11, year: yyyy)
 * @param {*} from 
 * @param {*} to 
 * @param {*} date 
 */
export function dateBetween(date,from,to){
  return isBefore(from,date) && isBefore(date,to);
}

function isBefore(date1,date2){
  if(date1.year>date2.year) return false;
  if(date1.year<date2.year) return true;
  return date1.month<=date2.month;
}
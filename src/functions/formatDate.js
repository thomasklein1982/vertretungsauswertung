export function formatDate(year,month){
  month+="";
  if(month.length<2) month="0"+month;
  return year+"-"+month;
}
import monthNames from "../functions/months";

export default class Statistic{
  constructor(project){
    this.project=project;
    this.months=[];
    this.sums=[];
  }
  update(type,from,to,lehrkraefte, ascendingOrder){
    if(!lehrkraefte) return;
    from={
      year: from.getFullYear(),
      month: from.getMonth()
    };
    to={
      year: to.getFullYear(),
      month: to.getMonth(),
      value: to
    };
    this.months=[];
    let current=new Date(from.year,from.month);
    let orderFunc;
    if(ascendingOrder){
      orderFunc=(a,b)=>{
        return a.count-b.count;
      };
    }else{
      orderFunc=(a,b)=>{
        return b.count-a.count;
      };
    }
    while(current<=to.value){
      let month={
        year: current.getFullYear(),
        month: current.getMonth(),
        temp: {},
        monthName: monthNames[current.getMonth()]
      };
      for(let i=0;i<lehrkraefte.length;i++){
        let lk=lehrkraefte[i];
        let d=lk.getData(current.getFullYear(),current.getMonth(),type);
        if(!month.temp[d]){
          month.temp[d]={
            count: d,
            lehrkraefte: []
          };
        }
        month.temp[d].lehrkraefte.push(lk);
      }
      month.data=[];
      for(let a in month.temp){
        month.data.push(month.temp[a]);
      }
      month.data.sort(orderFunc);
      this.months.push(month);
      let y=current.getFullYear();
      let m=current.getMonth();
      if(m===11){
        m=0;
        y++;
      }else{
        m++;
      }
      current=new Date(y,m);
    }
    let minSum=0;
    this.sums=[];
    let data={};
    for(let i=0;i<lehrkraefte.length;i++){
      let lk=lehrkraefte[i];
      let sum=lk.updateCumulatedData(from.year,from.month,to.year,to.month,type);
      if(!data[sum]){
        data[sum]={
          count: sum,
          lehrkraefte: []
        };
      }
      data[sum].lehrkraefte.push({lk});
      if(sum<minSum) minSum=sum;
    }
    for(let a in data){
      this.sums.push(data[a]);
    }
    this.sums.sort(orderFunc);
  }
}
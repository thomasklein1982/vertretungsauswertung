export default class Statistic{
  constructor(project){
    this.project=project;
    this.data=[];
    
  }
  update(type,from,to,lehrkraefte, ascendingOrder){
    if(!lehrkraefte) return;
    from={
      year: from.getFullYear(),
      month: from.getMonth()
    };
    to={
      year: to.getFullYear(),
      month: to.getMonth()
    };
    let minSum=0;
    let sums=[];
    for(let i=0;i<lehrkraefte.length;i++){
      let lk=lehrkraefte[i];
      let sum=lk.updateCumulatedData(from.year,from.month,to.year,to.month,type);
      sums.push(sum);
      if(sum<minSum) minSum=sum;
    }
    this.data=[];
    for(let i=0;i<lehrkraefte.length;i++){
      let lk=lehrkraefte[i];
      let sum=sums[i];
      let index=sum-minSum;
      if(!this.data[index]){
        this.data[index]={
          sum: sum,
          lehrkraefte: []
        };
      }
      this.data[index].lehrkraefte.push(lk);
    }
    if(!ascendingOrder){
      this.data.reverse();
    }
  }
}
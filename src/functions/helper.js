import readExcelFile from 'read-excel-file';
import {readSheetNames} from 'read-excel-file';


export function download(data,filename,mime,noDownload){
  window.URL =  window.URL || window.webkitURL;
  if(!filename) filename="Download.txt";
  if(!mime || !mime.substring){
    var split=filename.split(".");
    if(split.length>0){
      var extension=split[split.length-1];
      mime="text/"+extension;
    }else{
      var extension="txt";
      mime="text";
      filename+=extension;
    }
  }else{
    if(mime.substring(0,4).toLowerCase()!="text"){
      /*dataurl*/
      var bin = atob(data.split(',')[1]);
      var arrayBuffer=new ArrayBuffer(bin.length),
      data=new Uint8Array(arrayBuffer);
      for(var i=0;i<bin.length;i++) data[i]=bin.charCodeAt(i);
    }
  }
  var blob = new Blob([data], {type: mime});
  var downloadAnchor=document.createElement("a");
  downloadAnchor.style.display="none";
  document.body.appendChild(downloadAnchor);
  if(noDownload!==true){
    downloadAnchor.download = filename;
  }else{
    downloadAnchor.target="_blank";
  }
  let objectURL=window.URL.createObjectURL(blob);
  downloadAnchor.href=objectURL;
  downloadAnchor.dataset.downloadurl = [mime, downloadAnchor.download, downloadAnchor.href].join(':');
  downloadAnchor.click();
  setTimeout(function(){
    window.URL.revokeObjectURL(objectURL);
  },200);
  document.body.removeChild(downloadAnchor);
}

async function uploadExcelSheet(file, sheet){
  let p=new Promise((resolve,reject)=>{
    readExcelFile(file, {sheet}).then((rows)=>{
      resolve(rows);
    }).catch((e)=>{
      resolve({
        error: e
      });
    });
  });
  let rows=await p;
  return rows;
}

export async function uploadExcel(options){
  let fi=document.createElement("input");
  fi.type="file";
  fi.accept=".xlsx,.xls";
  fi.name="files[]";
  fi.multiple=true;
  fi.style.display="none";
  document.body.appendChild(fi);
  let p=new Promise(async (resolve,reject)=>{
    fi.addEventListener("change",async (e)=>{
      let files=[];
      for(let i=0;i<fi.files.length;i++){
        let file=fi.files[i];
        let excel=await uploadExcelFile(file);
        files.push(excel);
      }
      document.body.removeChild(fi);
      resolve(files);
    },false);
    fi.addEventListener("blur",(e)=>{
      console.log("cancel");
      resolve(null);
    });
    fi.click();
  });
  var q=await p;
  return q;
}

async function uploadExcelFile(file){
  let p=new Promise(async (resolve,reject)=>{
    readSheetNames(file).then(async (sheetnames)=>{
      let excel={
        name: file.name,
        sheets: []
      };
      for(let i=0;i<sheetnames.length;i++){
        let rows=await uploadExcelSheet(file, sheetnames[i]);
        if(rows.error){
          rows.name=sheetnames[i];
          resolve(rows);
          return;
        }
        excel.sheets.push({
          name: sheetnames[i],
          rows: rows
        });
      }
      resolve(excel);
    });
  });
  let excel=await p;
  return excel;
}

function uploadCallback(callback,options){
  //alert("upload callback");
  var fi=document.createElement("input");
  fi.type="file";
  if(options && options.accept) fi.accept=options.accept;
  fi.name="files[]";
  fi.style.display="none";
  document.body.appendChild(fi);
  if(options && options.multi){fi.multiple=true;}
  
  fi.handleCallback=()=>{
    //alert("handle callback");
    var fileReader=new FileReader();
    var file=fi.files[0];
    fileReader.addEventListener("load",(e)=>{
      document.body.removeChild(fi);
      var code=e.target.result;
      callback(code,file.name,file.type);
      //alert("called callback");
    },false);
    if(options &&options.dataURL){
      fileReader.readAsDataURL(file);
    }else{
      fileReader.readAsText(file);
    }
  };

  fi.addEventListener("change",(e)=>{
    //alert("on change");
    fi.handleCallback();
  },false);
  fi.click();
  //
}

export async function upload(options){
  var p=new Promise(function(resolve,reject){
    uploadCallback(function(code,fileName,mime){
      resolve({
        code: code,
        fileName: fileName,
        mime: mime
      });
    },options);
  });
  var q=await p;
  return q;
}

export async function saveLocally(key,data){
  var s=JSON.stringify(data);
  //var c=LZString.compress(s);
  //let c=s;
  await localforage.setItem(key,s);
}

export async function loadLocally(key){
  var c=await localforage.getItem(key);
  if(c===undefined || c===null){
    return null;
  }
  //var s=LZString.decompress(c);
  try{
    var data=JSON.parse(c);
  }catch(e){
    c=LZString.decompress(c);
    data=JSON.parse(c);
  }
  return data;
}

export function splitArrayEvenly(array,arrayCount){
  let listen=[];
  let anzahl=Math.ceil(array.length/arrayCount);
  let offset=0;
  for(let i=0;i<arrayCount;i++){
    let liste=[];
    if(i===arrayCount-1){
      anzahl=array.length-(arrayCount-1)*anzahl;
    }
    for(let j=0;j<anzahl;j++){
      liste.push(array[offset]);
      offset++;
    }
    listen.push(liste);
  }
  return listen;
}

export function random(min,max){
  return Math.floor(Math.random()*(max-min+1))+min;
};

export function randomFrom(array){
  return array[random(0,array.length-1)];
}

export const vornamen=["Alan","Berta","Caesar","Daniela","Emma","Felicitas","Gustav","Hannah","Ida","Johannes","Konrad","Lea","Magnus","Nora","Oli","Petra","Quentin","Sandra","Thomas","Uwe","Valerie","Walpurga","Xaver","Yvy", "Zora"];

export const nachnamen=["Klein","Groß","Mittel","Lang","Breit","Kurz","Schmal","Hoch","Weit","Berg","Tal","Schnee","Test123","Riesig","Alle","Computer","Notebook","Handy","Tablet"];
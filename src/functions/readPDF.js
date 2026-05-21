import { extractText, getDocumentProxy } from "unpdf";

export async function readPDF(arrayBuffer){
  const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer))
  const { totalPages, text } = await extractText(pdf, { mergePages: true })
  return text;
}

// export class PDFReader{
//   constructor(){
//     this.lehrkraefte
    
//   }
//   async readPDF(arrayBuffer){

//     const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer))
//     const { totalPages, text } = await extractText(pdf, { mergePages: true })
//     console.log(text);
//     let info=/\d{1,2}\.\d{1,2}\.\d\d\d\d/.exec(text);
//     this.exportDate=info[0];
//     console.log(this.exportDate);

//     nextLehrkraft();
//   }



// }
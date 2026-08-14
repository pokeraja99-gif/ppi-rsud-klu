import * as xlsx from "xlsx";

const filePath = "C:\\Users\\mhafi\\Downloads\\REKAP DATABASE.xlsx";
const workbook = xlsx.readFile(filePath);
console.log("Sheet Names:", workbook.SheetNames);

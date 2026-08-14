import * as xlsx from "xlsx";

const filePath = "C:\\Users\\mhafi\\Downloads\\REKAP DATABASE.xlsx";
const workbook = xlsx.readFile(filePath);

const sheetsToInspect = ["HH", "APD", "IDO", "CHKVAP"];

for (const sheetName of sheetsToInspect) {
  if (workbook.Sheets[sheetName]) {
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    console.log(`\n--- Sheet: ${sheetName} ---`);
    console.log("Total Rows:", data.length);
    if (data.length > 0) {
      console.log("Columns:", Object.keys(data[0]));
      console.log("First Row Data:", JSON.stringify(data[0], null, 2));
    }
  } else {
    console.log(`\n--- Sheet: ${sheetName} (NOT FOUND) ---`);
  }
}

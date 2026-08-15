const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('C:/Users/mhafi/Desktop/LOGBOOK KEGIATAN HARIAN IPCN RSUD KABUPATEN LOMBOK UTARA.pdf');

pdf(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(err => console.error(err));

const Airtable = require('airtable');
const fs = require('fs');

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(process.env.AIRTABLE_BASE_ID);

async function updatePredictions() {
    const records = [];
    
    await base('Previsioni').select({
        sort: [{field: 'Data', direction: 'desc'}],
        maxRecords: 100
    }).eachPage((page, fetchNextPage) => {
        page.forEach(record => {
            records.push({
                data: record.fields['Data'],
                giornata: record.fields['Giornata'],
                squadra1: record.fields['Squadra1'],
                squadra2: record.fields['Squadra2'],
                tua_previsione_marcatori: record.fields['Tua_Previsione_Marcatori'],
                confienza: record.fields['Confienza'] || 3,
                note: record.fields['Note']
            });
        });
        fetchNextPage();
    });
    
    let html = fs.readFileSync('predictions.html', 'utf8');
    const dataScript = `const PREDICTIONS_DATA = ${JSON.stringify(records)};`;
    html = html.replace(/const PREDICTIONS_DATA = window\.PREDICTIONS_DATA \|\| \[\];/, dataScript);
    fs.writeFileSync('predictions.html', html);
    console.log(`✅ Updated ${records.length} predictions`);
}

updatePredictions().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});

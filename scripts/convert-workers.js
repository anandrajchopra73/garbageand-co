const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

try {
  console.log('🔄 Converting workers Excel data to JSON...\n');
  
  // Read the Excel file
  const excelPath = path.join(__dirname, '../public/workers data.xlsx');
  console.log(`📂 Reading Excel file: ${excelPath}`);
  
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  console.log(`📋 Sheet name: ${sheetName}`);

  // Convert to JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`\n📊 Found ${jsonData.length} workers in Excel file\n`);

  // Add default password if not present and normalize field names
  const workersWithPassword = jsonData.map((worker, index) => {
    // Normalize field names (handle different column name variations)
    const normalized = {
      id: worker.id || worker.ID || worker.worker_id || worker.WorkerID || `W${String(index + 1).padStart(3, '0')}`,
      name: worker.name || worker.Name || worker.worker_name || worker.WorkerName || `Worker ${index + 1}`,
      phone: worker.phone || worker.Phone || worker.mobile || worker.Mobile || worker.contact || '',
      email: worker.email || worker.Email || '',
      status: worker.status || worker.Status || 'Active',
      password: worker.password || worker.Password || 'worker123'
    };
    
    console.log(`  ✓ ${normalized.id} - ${normalized.name} (${normalized.phone})`);
    return normalized;
  });

  // Write to public folder
  const outputPath = path.join(__dirname, '../public/workers.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(workersWithPassword, null, 2)
  );

  console.log('\n✅ Workers data converted successfully!');
  console.log(`📁 File saved to: public/workers.json`);
  console.log(`\n👷 Summary:`);
  console.log(`   Total Workers: ${workersWithPassword.length}`);
  console.log(`   Default Password: worker123`);
  console.log(`\n🔐 Login credentials:`);
  workersWithPassword.slice(0, 5).forEach(w => {
    console.log(`   Worker ID: ${w.id} | Password: ${w.password}`);
  });
  if (workersWithPassword.length > 5) {
    console.log(`   ... and ${workersWithPassword.length - 5} more workers`);
  }
  
} catch (error) {
  console.error('❌ Error converting workers data:', error.message);
  console.error('\n💡 Make sure:');
  console.error('   1. The Excel file exists at: public/workers data.xlsx');
  console.error('   2. The xlsx package is installed (npm install xlsx)');
  console.error('   3. The Excel file is not open in another program');
  process.exit(1);
}
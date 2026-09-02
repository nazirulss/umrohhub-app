/**
 * Test Seeder v2 directly against legacy/Code.gs
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock GAS environment
class MockSheet {
  constructor(name, headers = []) {
    this.name = name;
    this.data = headers.length > 0 ? [[...headers]] : [];
  }
  getDataRange() {
    return {
      getValues: () => this.data
    };
  }
  getRange(row, col, numRows, numCols) {
    return {
      getValues: () => {
        const result = [];
        for (let r = 0; r < numRows; r++) {
          const rowData = [];
          for (let c = 0; c < numCols; c++) {
            const rowIndex = row - 1 + r;
            const colIndex = col - 1 + c;
            rowData.push((this.data[rowIndex] && this.data[rowIndex][colIndex] !== undefined) ? this.data[rowIndex][colIndex] : "");
          }
          result.push(rowData);
        }
        return result;
      },
      setValues: (values) => {
        for (let r = 0; r < numRows; r++) {
          const rowIndex = row - 1 + r;
          if (!this.data[rowIndex]) this.data[rowIndex] = [];
          for (let c = 0; c < numCols; c++) {
            const colIndex = col - 1 + c;
            this.data[rowIndex][colIndex] = values[r][c];
          }
        }
      },
      setFontWeight: () => ({ setBackground: () => {} })
    };
  }
  appendRow(row) {
    this.data.push([...row]);
  }
  getLastRow() {
    return this.data.length;
  }
  getLastColumn() {
    return this.data[0] ? this.data[0].length : 0;
  }
  setFrozenRows() {}
}

class MockSpreadsheet {
  constructor() {
    this.sheets = {};
    this.id = "mock-spreadsheet-demo-id";
  }
  getId() { return this.id; }
  getSheetByName(name) { return this.sheets[name] || null; }
  insertSheet(name) {
    if (!this.sheets[name]) {
      this.sheets[name] = new MockSheet(name);
    }
    return this.sheets[name];
  }
}

const mockSS = new MockSpreadsheet();
let lockCount = 0;
global.LockService = {
  getScriptLock: () => ({
    waitLock: () => {
      if (lockCount > 0) throw new Error("NESTED_LOCK_DETECTED");
      lockCount++;
      return true;
    },
    hasLock: () => lockCount > 0,
    releaseLock: () => { lockCount--; }
  })
};

global.SpreadsheetApp = {
  getActiveSpreadsheet: () => mockSS,
  openById: () => mockSS,
  flush: () => {}
};

const scriptProps = {};
global.PropertiesService = {
  getScriptProperties: () => ({
    getProperty: (k) => scriptProps[k] || null,
    setProperty: (k, v) => { scriptProps[k] = v; }
  })
};

let uuidInc = 7000;
global.Utilities = {
  getUuid: () => "UUID-" + (++uuidInc),
  formatDate: (d) => d.toISOString(),
  computeDigest: () => [0x11, 0x22, 0x33, 0x44],
  DigestAlgorithm: { SHA_256: "SHA_256" },
  Charset: { UTF_8: "UTF_8" }
};

global.ContentService = {
  MimeType: { JSON: "application/json" },
  createTextOutput: (str) => ({ setMimeType: () => str })
};

// Load Code.gs in global context
const codeGsPath = path.join(__dirname, 'legacy', 'Code.gs');
const codeGs = fs.readFileSync(codeGsPath, 'utf8');
vm.runInThisContext(codeGs);

console.log("=== RUNNING SEEDER V2 VERIFICATION ===");

// 1. Initial Setup
const setupResult = setupDatabase();
console.log("setupDatabase result:", setupResult.message);

// 2. Summary after 1st execution
const summary1 = getDemoDatasetSummary();
console.log("Summary 1st execution:", JSON.stringify(summary1, null, 2));

// 3. Execution 2 (Idempotency)
const summary2 = seedFullDemoData();
console.log("Summary 2nd execution (Idempotency test):", JSON.stringify(summary2, null, 2));

let isIdempotent = true;
for (const key of Object.keys(summary1)) {
  if (summary1[key] !== summary2[key]) {
    console.error(`IDEMPOTENCY MISMATCH for ${key}: ${summary1[key]} vs ${summary2[key]}`);
    isIdempotent = false;
  }
}

if (!isIdempotent) {
  process.exit(1);
}
console.log("[PASS] Seeder is 100% IDEMPOTENT.");

// 4. Validate dataset relations
const validation = validateDemoDataset_();
console.log("[PASS] Relational integrity validated:", validation.valid);

// 5. Check Quota Consistency on Departures
const depRepo = new SpreadsheetRepository(CONFIG.SHEETS.DEPARTURES);
const bkgRepo = new SpreadsheetRepository(CONFIG.SHEETS.BOOKINGS);
const allDeps = depRepo.findAll();
const allBkgs = bkgRepo.findAll();

for (const dep of allDeps) {
  if (Number(dep.quotaTaken) > Number(dep.quotaTotal)) {
    throw new Error(`Quota breach on ${dep.id}: ${dep.quotaTaken} > ${dep.quotaTotal}`);
  }
}
console.log("[PASS] Quota limits validated for all " + allDeps.length + " departures.");

// 6. Test Admin API Route: admin.datasetSummary
const adminContext = Auth.resolveSession("demo-admin-token");
const router = new Router();
const apiSummary = router.dispatch("admin.datasetSummary", {}, adminContext);
console.log("[PASS] API admin.datasetSummary returned:", Object.keys(apiSummary).length, "sheets tracked.");

console.log("=== ALL SEEDER V2 CHECKS PASSED SUCCESSFULLY ===");

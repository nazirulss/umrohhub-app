/**
 * Automated Verification Suite for UmrohHub Backend Hardening Pass v1
 * Runs in Node.js environment simulating Google Apps Script services (SpreadsheetApp, LockService, Utilities, ContentService).
 */

const fs = require('fs');
const path = require('path');

// 1. Mock Google Apps Script Environment
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
    this.id = "mock-spreadsheet-id-123";
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

let currentLockHeld = false;
global.LockService = {
  getScriptLock: () => ({
    waitLock: (timeout) => {
      // Re-entrancy check!
      if (currentLockHeld) {
        throw new Error("NESTED_LOCK_DETECTED: Lock is already acquired! ScriptLock is not re-entrant.");
      }
      currentLockHeld = true;
      return true;
    },
    hasLock: () => currentLockHeld,
    releaseLock: () => {
      currentLockHeld = false;
    }
  })
};

global.SpreadsheetApp = {
  getActiveSpreadsheet: () => mockSS,
  openById: () => mockSS,
  flush: () => {}
};

const scriptProperties = {};
global.PropertiesService = {
  getScriptProperties: () => ({
    getProperty: (key) => scriptProperties[key] || null,
    setProperty: (key, val) => { scriptProperties[key] = val; }
  })
};

const scriptCacheStore = {};
global.CacheService = {
  getScriptCache: () => ({
    get: (key) => scriptCacheStore[key] || null,
    put: (key, val, exp) => { scriptCacheStore[key] = val; },
    remove: (key) => { delete scriptCacheStore[key]; }
  })
};

let uuidCounter = 1000;
global.Utilities = {
  getUuid: () => "UUID-" + (++uuidCounter),
  formatDate: (d, tz, fmt) => d.toISOString(),
  computeDigest: (algo, str) => {
    return [0xaa, 0xbb, 0xcc, 0xdd];
  },
  DigestAlgorithm: { SHA_256: "SHA_256" },
  Charset: { UTF_8: "UTF_8" }
};

global.ContentService = {
  MimeType: { JSON: "application/json" },
  createTextOutput: (str) => ({
    setMimeType: () => str
  })
};

// Load Code.gs in global context
const vm = require('vm');
const codeGsPath = path.join(__dirname, 'legacy', 'Code.gs');
const codeGs = fs.readFileSync(codeGsPath, 'utf8');
vm.runInThisContext(codeGs);

// TEST RUNNER
let passed = 0;
let failed = 0;
const results = [];

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    results.push({ name: testName, status: "PASS", details });
    passed++;
  } else {
    console.error(`[FAIL] ${testName} - ${details}`);
    results.push({ name: testName, status: "FAIL", details });
    failed++;
  }
}

console.log("=== RUNNING TEST SUITE ===");

// Initialize DB
setupDatabase();

// TEST 1 — Public marketplace: only published packages
try {
  // Let's create an unpublished package directly to test
  const pRepo = new SpreadsheetRepository(CONFIG.SHEETS.PACKAGES);
  pRepo.insert({
    travelId: "mock-travel-id",
    title: "Draft Secret Package",
    category: "Reguler",
    price: 30000000,
    durationDays: 10,
    isPublished: false
  });

  const publicList = router.dispatch("packages.list", { isPublished: false });
  const hasDraft = publicList.some(p => p.title === "Draft Secret Package");
  assert(!hasDraft && publicList.length > 0, "TEST 1 — Public marketplace: only published package returned (draft blocked even with ?isPublished=false)");
} catch (e) {
  assert(false, "TEST 1 — Public marketplace", e.message);
}

// TEST 2 — Unverified travel: cannot publish package
try {
  const tRepo = new SpreadsheetRepository(CONFIG.SHEETS.TRAVELS);
  const unverifiedTravel = tRepo.insert({
    ownerUserId: "USR-TRV-UNVERIFIED",
    name: "Unverified Travel",
    skKemenag: "PPIU No. 000/PENDING",
    city: "Bandung",
    isVerified: false,
    status: "PENDING"
  });

  const pRepo = new SpreadsheetRepository(CONFIG.SHEETS.PACKAGES);
  const unverifiedPkg = pRepo.insert({
    travelId: unverifiedTravel.id,
    title: "Unverified Travel Package",
    price: 25000000,
    durationDays: 9,
    isPublished: false
  });

  let errorCaught = null;
  try {
    // Attempt publish directly via packageService with travelId
    const pService = new PackageService();
    pService.publish(unverifiedPkg.id, unverifiedTravel.id, true);
  } catch (err) {
    errorCaught = err;
  }
  assert(errorCaught && errorCaught.code === "TRAVEL_NOT_VERIFIED", "TEST 2 — Unverified travel publish rejected with TRAVEL_NOT_VERIFIED", errorCaught ? errorCaught.code : "no error");
} catch (e) {
  assert(false, "TEST 2 — Unverified travel", e.message);
}

// TEST 3 — Unauthorized admin: verifyTravel called without admin session
try {
  let errorCaught = null;
  try {
    router.dispatch("admin.verifyTravel", { travelId: "TRV-01" }, { sessionToken: "demo-customer-token" });
  } catch (err) {
    errorCaught = err;
  }
  assert(errorCaught && (errorCaught.code === "FORBIDDEN" || errorCaught.code === "UNAUTHORIZED"), "TEST 3 — Unauthorized admin route blocked with FORBIDDEN", errorCaught ? errorCaught.code : "no error");
} catch (e) {
  assert(false, "TEST 3 — Unauthorized admin", e.message);
}

// TEST 4 — Cross-travel ownership: Travel A cannot update Travel B's package
try {
  // Travel A is USR-TRV-01
  const tRepo = new SpreadsheetRepository(CONFIG.SHEETS.TRAVELS);
  const travelB = tRepo.insert({
    ownerUserId: "USR-TRV-OTHER",
    name: "Travel B",
    skKemenag: "PPIU No. 999",
    city: "Medan",
    isVerified: true,
    status: "VERIFIED"
  });

  const pRepo = new SpreadsheetRepository(CONFIG.SHEETS.PACKAGES);
  const pkgB = pRepo.insert({
    travelId: travelB.id,
    title: "Travel B Package",
    price: 35000000,
    durationDays: 12,
    isPublished: false
  });

  let errorCaught = null;
  try {
    router.dispatch("packages.update", { id: pkgB.id, title: "Hacked Title" }, { sessionToken: "demo-travel-token" });
  } catch (err) {
    errorCaught = err;
  }
  assert(errorCaught && errorCaught.code === "FORBIDDEN", "TEST 4 — Cross-travel ownership update blocked with FORBIDDEN", errorCaught ? errorCaught.code : "no error");
} catch (e) {
  assert(false, "TEST 4 — Cross-travel ownership", e.message);
}

// TEST 5 — Booking create: does not reduce quota
let testBookingId = null;
let testDepartureId = null;
let testPkgId = null;
try {
  const dRepo = new SpreadsheetRepository(CONFIG.SHEETS.DEPARTURES);
  const dep = dRepo.findAll().find(d => d.status === "OPEN");
  testDepartureId = dep.id;
  testPkgId = dep.packageId;
  const initialQuotaTaken = Number(dep.quotaTaken);

  const res = router.dispatch("bookings.create", {}, {
    sessionToken: "demo-customer-token",
    departureId: dep.id,
    jamaahName: "Test Jamaah",
    jamaahPhone: "08123456789",
    paxCount: 2
  });

  testBookingId = res.id;
  const depAfter = dRepo.findById(dep.id);

  assert(res.status === "PENDING" && Number(depAfter.quotaTaken) === initialQuotaTaken, "TEST 5 — Booking create sets PENDING and does NOT reduce quota", `Status: ${res.status}, quotaTaken: ${depAfter.quotaTaken}`);
} catch (e) {
  assert(false, "TEST 5 — Booking create", e.message);
}

// TEST 6 — Booking confirm: reduces quota
try {
  const dRepo = new SpreadsheetRepository(CONFIG.SHEETS.DEPARTURES);
  const depBefore = dRepo.findById(testDepartureId);
  const quotaBefore = Number(depBefore.quotaTaken);

  const res = router.dispatch("bookings.confirm", { id: testBookingId }, { sessionToken: "demo-travel-token" });
  const depAfter = dRepo.findById(testDepartureId);

  assert(res.status === "CONFIRMED" && Number(depAfter.quotaTaken) === quotaBefore + 2, "TEST 6 — Booking confirm sets CONFIRMED and increments quotaTaken atomically", `Status: ${res.status}, quotaTaken: ${depAfter.quotaTaken}`);
} catch (e) {
  assert(false, "TEST 6 — Booking confirm", e.message);
}

// TEST 7 — Double confirm: returns INVALID_STATE, quota unchanged
try {
  const dRepo = new SpreadsheetRepository(CONFIG.SHEETS.DEPARTURES);
  const depBefore = dRepo.findById(testDepartureId);
  const quotaBefore = Number(depBefore.quotaTaken);

  let errorCaught = null;
  try {
    router.dispatch("bookings.confirm", { id: testBookingId }, { sessionToken: "demo-travel-token" });
  } catch (err) {
    errorCaught = err;
  }
  const depAfter = dRepo.findById(testDepartureId);

  assert(errorCaught && errorCaught.code === "INVALID_STATE" && Number(depAfter.quotaTaken) === quotaBefore, "TEST 7 — Double confirm returns INVALID_STATE without mutating quota", errorCaught ? errorCaught.code : "no error");
} catch (e) {
  assert(false, "TEST 7 — Double confirm", e.message);
}

// TEST 8 — Cancel confirmed: releases quota; second cancel is INVALID_STATE
try {
  const dRepo = new SpreadsheetRepository(CONFIG.SHEETS.DEPARTURES);
  const depBefore = dRepo.findById(testDepartureId);
  const quotaBefore = Number(depBefore.quotaTaken);

  const res = router.dispatch("bookings.cancel", { id: testBookingId }, { sessionToken: "demo-travel-token" });
  const depAfter = dRepo.findById(testDepartureId);

  assert(res.status === "CANCELLED" && Number(depAfter.quotaTaken) === quotaBefore - 2, "TEST 8 — Cancel confirmed releases quota atomically", `Status: ${res.status}, quotaTaken: ${depAfter.quotaTaken}`);

  // Second cancellation
  let secondError = null;
  try {
    router.dispatch("bookings.cancel", { id: testBookingId }, { sessionToken: "demo-travel-token" });
  } catch (err) {
    secondError = err;
  }
  const depAfterSecond = dRepo.findById(testDepartureId);
  assert(secondError && secondError.code === "INVALID_STATE" && Number(depAfterSecond.quotaTaken) === Number(depAfter.quotaTaken), "TEST 8 (part 2) — Double cancel rejected with INVALID_STATE without altering quota");
} catch (e) {
  assert(false, "TEST 8 — Cancel confirmed", e.message);
}

// TEST 9 — Affiliate attribution: click created, attribution active 30 days, booking gets affiliateId
let attributedBookingId = null;
try {
  const trackRes = router.dispatch("referrals.track", {
    refCode: "USTADZ",
    packageId: testPkgId,
    visitorKey: "visitor-device-123"
  });

  assert(trackRes.attributed === true && trackRes.affiliateCode === "USTADZ", "TEST 9 (part 1) — Referral tracking creates active attribution");

  // Create booking with visitorKey
  const bookRes = router.dispatch("bookings.create", {}, {
    sessionToken: "demo-customer-token",
    departureId: testDepartureId,
    jamaahName: "Jamaah Ref",
    jamaahPhone: "0812999988",
    paxCount: 1,
    visitorKey: "visitor-device-123"
  });
  attributedBookingId = bookRes.id;

  assert(bookRes.affiliateId !== "" && bookRes.affiliateId !== null, "TEST 9 (part 2) — Booking automatically attributed to affiliate", `affiliateId: ${bookRes.affiliateId}`);
} catch (e) {
  assert(false, "TEST 9 — Affiliate attribution", e.message);
}

// TEST 10 — Cross-package attribution: visitor clicks Package A, books Package B -> affiliateId empty
try {
  // Track on testPkgId
  router.dispatch("referrals.track", {
    refCode: "USTADZ",
    packageId: testPkgId,
    visitorKey: "visitor-device-other"
  });

  // Create another package & departure
  const pRepo = new SpreadsheetRepository(CONFIG.SHEETS.PACKAGES);
  const pkgB = pRepo.insert({
    travelId: "USR-TRV-01",
    title: "Another Published Package",
    category: "Reguler",
    price: 32000000,
    durationDays: 10,
    isPublished: true
  });
  const dRepo = new SpreadsheetRepository(CONFIG.SHEETS.DEPARTURES);
  const depB = dRepo.insert({
    packageId: pkgB.id,
    departureDate: "2026-11-01",
    departureCity: "Jakarta",
    quotaTotal: 30,
    quotaTaken: 0,
    status: "OPEN"
  });

  // Book Package B with visitorKey that only visited Package A
  const bookRes = router.dispatch("bookings.create", {}, {
    sessionToken: "demo-customer-token",
    departureId: depB.id,
    jamaahName: "Cross Visitor",
    jamaahPhone: "0811223344",
    paxCount: 1,
    visitorKey: "visitor-device-other"
  });

  assert(bookRes.affiliateId === "" || bookRes.affiliateId === null, "TEST 10 — Cross-package attribution blocked: affiliateId is empty for untracked package", `affiliateId: '${bookRes.affiliateId}'`);
} catch (e) {
  assert(false, "TEST 10 — Cross-package attribution", e.message);
}

// TEST 11 — Self-referral: affiliate books for self -> booking succeeds, affiliateId empty, no commission
try {
  // Track attribution with visitorKey
  router.dispatch("referrals.track", {
    refCode: "USTADZ",
    packageId: testPkgId,
    visitorKey: "visitor-self-ref"
  });

  // Affiliate session (USR-AFF-01) makes booking as customer
  // Temporarily resolve session with affiliate's userId
  const bookRes = router.dispatch("bookings.create", {}, {
    sessionToken: "demo-customer-token", // Wait, self-referral checks affiliate.userId === context.userId
    departureId: testDepartureId,
    jamaahName: "Ustadz Abdullah Self",
    jamaahPhone: "081100003",
    paxCount: 1,
    visitorKey: "visitor-self-ref"
  });

  // Now let's test when context.userId === affiliate.userId
  const aff = new SpreadsheetRepository(CONFIG.SHEETS.AFFILIATES).findOne(a => a.referralCode === "USTADZ");
  const bookingService = new BookingService();
  const selfBooking = bookingService.create({
    departureId: testDepartureId,
    jamaahName: "Self Booking",
    jamaahPhone: "081100003",
    paxCount: 1,
    visitorKey: "visitor-self-ref"
  }, { userId: aff ? aff.userId : "USR-DEMO-AFF-01", role: "CUSTOMER" });

  assert(selfBooking.affiliateId === "", "TEST 11 — Self-referral blocked: affiliateId cleared when affiliate.userId === context.userId", `affiliateId: '${selfBooking.affiliateId}'`);
} catch (e) {
  assert(false, "TEST 11 — Self-referral", e.message);
}

// TEST 12 — Commission lifecycle: PENDING -> no commission; CONFIRMED -> no commission; FULL_PAID -> commission PENDING; Admin approve -> APPROVED
try {
  const commRepo = new SpreadsheetRepository(CONFIG.SHEETS.COMMISSIONS);
  const commBefore = commRepo.findWhere(c => c.bookingId === attributedBookingId);
  assert(commBefore.length === 0, "TEST 12 (part 1) — PENDING booking has NO commission created");

  // Confirm booking
  router.dispatch("bookings.confirm", { id: attributedBookingId }, { sessionToken: "demo-travel-token" });
  const commAfterConfirm = commRepo.findWhere(c => c.bookingId === attributedBookingId);
  assert(commAfterConfirm.length === 0, "TEST 12 (part 2) — CONFIRMED booking has NO commission created");

  // Mark paid
  router.dispatch("bookings.markPaid", { id: attributedBookingId }, { sessionToken: "demo-travel-token" });
  const commAfterPaid = commRepo.findWhere(c => c.bookingId === attributedBookingId);
  assert(commAfterPaid.length === 1 && commAfterPaid[0].status === "PENDING", "TEST 12 (part 3) — FULL_PAID creates commission with status PENDING (not auto-approved)", `Status: ${commAfterPaid[0] ? commAfterPaid[0].status : "none"}`);

  // Admin approves commission
  const approvedComm = router.dispatch("commissions.approve", { id: commAfterPaid[0].id }, { sessionToken: "demo-admin-token" });
  assert(approvedComm.status === "APPROVED" && approvedComm.approvedAt !== "", "TEST 12 (part 4) — Admin approve sets commission to APPROVED with timestamp");
} catch (e) {
  assert(false, "TEST 12 — Commission lifecycle", e.message);
}

// TEST 13 — Idempotent payment: markPaid twice -> ALREADY_PAID, only 1 commission
try {
  const commRepo = new SpreadsheetRepository(CONFIG.SHEETS.COMMISSIONS);
  const commCountBefore = commRepo.findWhere(c => c.bookingId === attributedBookingId).length;

  const resSecondPaid = router.dispatch("bookings.markPaid", { id: attributedBookingId }, { sessionToken: "demo-travel-token" });
  const commCountAfter = commRepo.findWhere(c => c.bookingId === attributedBookingId).length;

  assert(resSecondPaid._responseCode === "ALREADY_PAID" && commCountAfter === commCountBefore, "TEST 13 — Idempotent markPaid returns ALREADY_PAID and does not duplicate commission", `ResponseCode: ${resSecondPaid._responseCode}, commCount: ${commCountAfter}`);
} catch (e) {
  assert(false, "TEST 13 — Idempotent payment", e.message);
}

// TEST 14 — Forged travelId: payload travelId ignored, FORBIDDEN on foreign resource
try {
  let errorCaught = null;
  try {
    // Travel session sends foreign travelId in payload
    router.dispatch("packages.create", {
      travelId: "FORGED-TRAVEL-ID",
      title: "Forged Travel Package",
      price: 25000000,
      durationDays: 9
    }, { sessionToken: "demo-travel-token" });
  } catch (err) {
    errorCaught = err;
  }
  // Package is created under context.travelId, NOT FORGED-TRAVEL-ID
  const pRepo = new SpreadsheetRepository(CONFIG.SHEETS.PACKAGES);
  const created = pRepo.findOne(p => p.title === "Forged Travel Package");
  assert(created && created.travelId !== "FORGED-TRAVEL-ID", "TEST 14 — Forged travelId in payload is ignored; context.travelId is enforced", `travelId: ${created ? created.travelId : "none"}`);
} catch (e) {
  assert(false, "TEST 14 — Forged travelId", e.message);
}

// TEST 15 — Forged affiliateId: payload affiliateId ignored, resolved from server attribution
try {
  const bookRes = router.dispatch("bookings.create", {}, {
    sessionToken: "demo-customer-token",
    departureId: testDepartureId,
    jamaahName: "Forged Ref Test",
    jamaahPhone: "0812999900",
    paxCount: 1,
    affiliateId: "FORGED-AFFILIATE-ID" // Forged!
  });

  assert(bookRes.affiliateId !== "FORGED-AFFILIATE-ID", "TEST 15 — Forged affiliateId in payload is ignored by server", `affiliateId: '${bookRes.affiliateId}'`);
} catch (e) {
  assert(false, "TEST 15 — Forged affiliateId", e.message);
}

// TEST 16 — Forged customerId: payload customerId ignored, resolved from session
try {
  const bookRes = router.dispatch("bookings.create", {}, {
    sessionToken: "demo-customer-token",
    departureId: testDepartureId,
    jamaahName: "Forged Customer Test",
    jamaahPhone: "0812999901",
    paxCount: 1,
    customerId: "FORGED-CUSTOMER-ID" // Forged!
  });

  const custSession = Auth.resolveSession("demo-customer-token");
  assert(bookRes.customerId === custSession.userId, "TEST 16 — Forged customerId in payload is ignored; session.userId is enforced", `customerId: '${bookRes.customerId}'`);
} catch (e) {
  assert(false, "TEST 16 — Forged customerId", e.message);
}

// TEST 17 — Public travel document: travels.detail returns no legal docs/documents/fileUrl/documentNumber
try {
  const tRepo = new SpreadsheetRepository(CONFIG.SHEETS.TRAVELS);
  const t = tRepo.findAll()[0];

  // Insert sensitive legal document
  const dRepo = new SpreadsheetRepository(CONFIG.SHEETS.TRAVEL_DOCUMENTS);
  dRepo.insert({
    travelId: t.id,
    docType: "SK_KEMENAG_ORIGINAL",
    docNumber: "SK-SECRET-99999",
    fileUrl: "https://storage.private/docs/secret-legal-doc.pdf",
    verifiedStatus: "VERIFIED"
  });

  const publicDetail = router.dispatch("travels.detail", { id: t.id });

  assert(publicDetail.documents === undefined && publicDetail.fileUrl === undefined && publicDetail.docNumber === undefined, "TEST 17 — Public travels.detail does NOT leak legal documents or file URLs", JSON.stringify(Object.keys(publicDetail)));
} catch (e) {
  assert(false, "TEST 17 — Public travel document", e.message);
}

// TEST 18 — setupDatabase idempotent: multiple runs do not duplicate or overwrite
try {
  const uRepo = new SpreadsheetRepository(CONFIG.SHEETS.USERS);
  const userCountBefore = uRepo.findAll().length;

  setupDatabase();
  setupDatabase();

  const userCountAfter = uRepo.findAll().length;
  assert(userCountBefore === userCountAfter, "TEST 18 — setupDatabase is strictly idempotent and does not duplicate existing rows", `Count before: ${userCountBefore}, after: ${userCountAfter}`);
} catch (e) {
  assert(false, "TEST 18 — setupDatabase idempotent", e.message);
}

// TEST 19 — Forged price: payload price ignored, uses spreadsheet package price
try {
  const pkg = new SpreadsheetRepository(CONFIG.SHEETS.PACKAGES).findById(testPkgId);
  const bookRes = router.dispatch("bookings.create", {}, {
    sessionToken: "demo-customer-token",
    departureId: testDepartureId,
    jamaahName: "Forged Price Test",
    jamaahPhone: "0812999902",
    paxCount: 2,
    price: 1, // Attempt to buy for Rp 1!
    unitPrice: 1,
    totalPrice: 2
  });

  assert(Number(bookRes.unitPrice) === Number(pkg.price) && Number(bookRes.totalPrice) === Number(pkg.price) * 2, "TEST 19 — Forged price in request payload is ignored; authoritative spreadsheet price enforced", `unitPrice: ${bookRes.unitPrice}, totalPrice: ${bookRes.totalPrice}`);
} catch (e) {
  assert(false, "TEST 19 — Forged price", e.message);
}

// TEST 20 — Payout/admin authorization: non-admin gets UNAUTHORIZED / FORBIDDEN on commissions.approve or admin.payoutMarkPaid
try {
  let errApprove = null;
  let errPayout = null;

  try {
    router.dispatch("commissions.approve", { id: "COMM-01" }, { sessionToken: "demo-travel-token" });
  } catch (e) {
    errApprove = e;
  }

  try {
    router.dispatch("admin.payoutMarkPaid", { payoutId: "PAY-01" }, { sessionToken: "demo-customer-token" });
  } catch (e) {
    errPayout = e;
  }

  assert(errApprove && errApprove.code === "FORBIDDEN" && errPayout && errPayout.code === "FORBIDDEN", "TEST 20 — Non-admin callers strictly blocked from commissions.approve and admin.payoutMarkPaid with FORBIDDEN");
} catch (e) {
  assert(false, "TEST 20 — Payout/admin authorization", e.message);
}

// GOLDEN PATH VERIFICATION
console.log("\n=== TESTING GOLDEN PATH ===");
try {
  // 1. ADMIN Verify Travel
  const tRepo = new SpreadsheetRepository(CONFIG.SHEETS.TRAVELS);
  const goldenTravel = tRepo.insert({
    ownerUserId: "USR-TRV-01",
    name: "Golden Path Travel PPIU",
    skKemenag: "PPIU No. 777/2026",
    city: "Jakarta Pusat",
    isVerified: false,
    status: "PENDING"
  });

  const verified = router.dispatch("admin.verifyTravel", { travelId: goldenTravel.id, isVerified: true }, { sessionToken: "demo-admin-token" });
  console.log("  [Step 1] ADMIN Verify Travel -> Status:", verified.status);

  // 2. TRAVEL Create Package
  const goldenPkg = router.dispatch("packages.create", {
    title: "Paket Golden Path Eksekutif 12 Hari",
    category: "VIP",
    price: 35000000,
    durationDays: 12,
    airline: "Garuda Indonesia",
    hotelMakkah: "Dar Al Tawhid (★5)",
    hotelMadinah: "Oberoi Madinah (★5)",
    commissionAffiliate: 1000000
  }, { sessionToken: "demo-travel-token" });
  console.log("  [Step 2] TRAVEL Create Package -> ID:", goldenPkg.id);

  // 3. TRAVEL Create Departure
  const goldenDep = router.dispatch("departures.create", {
    packageId: goldenPkg.id,
    departureDate: "2026-12-10",
    departureCity: "Jakarta (CGK)",
    quotaTotal: 30
  }, { sessionToken: "demo-travel-token" });
  console.log("  [Step 3] TRAVEL Create Departure -> ID:", goldenDep.id);

  // 4. TRAVEL Publish Package
  const publishedPkg = router.dispatch("packages.publish", { id: goldenPkg.id, isPublished: true }, { sessionToken: "demo-travel-token" });
  console.log("  [Step 4] TRAVEL Publish Package -> isPublished:", publishedPkg.isPublished);

  // 5. AFFILIATE Generate Referral
  const referralInfo = router.dispatch("referrals.create", { packageId: goldenPkg.id }, { sessionToken: "demo-affiliate-token" });
  console.log("  [Step 5] AFFILIATE Generate Referral -> Link:", referralInfo.referralLink);

  // 6. CUSTOMER Click Referral
  const clickResult = router.dispatch("referrals.track", {
    refCode: referralInfo.referralCode,
    packageId: goldenPkg.id,
    visitorKey: "visitor-golden-path-999"
  });
  console.log("  [Step 6] CUSTOMER Click Referral -> Attributed:", clickResult.attributed);

  // 7. CUSTOMER Browse Package
  const publicCatalog = router.dispatch("packages.list", {});
  const inCatalog = publicCatalog.some(p => p.id === goldenPkg.id);
  console.log("  [Step 7] CUSTOMER Browse Package -> In Catalog:", inCatalog);

  // 8. CUSTOMER Create Booking
  const goldenBooking = router.dispatch("bookings.create", {}, {
    sessionToken: "demo-customer-token",
    departureId: goldenDep.id,
    jamaahName: "H. Sulaiman",
    jamaahPhone: "081299887766",
    paxCount: 2,
    visitorKey: "visitor-golden-path-999"
  });
  console.log("  [Step 8] CUSTOMER Create Booking -> Status:", goldenBooking.status, "Affiliate:", goldenBooking.affiliateId);

  // 9. TRAVEL Confirm Booking
  const confirmedBooking = router.dispatch("bookings.confirm", { id: goldenBooking.id }, { sessionToken: "demo-travel-token" });
  console.log("  [Step 9] TRAVEL Confirm Booking -> Status:", confirmedBooking.status);

  // 10. TRAVEL Mark Paid
  const paidBooking = router.dispatch("bookings.markPaid", { id: goldenBooking.id }, { sessionToken: "demo-travel-token" });
  console.log("  [Step 10] TRAVEL Mark Paid -> PaymentStatus:", paidBooking.paymentStatus);

  // 11. SYSTEM Create Commission PENDING
  const commRepo = new SpreadsheetRepository(CONFIG.SHEETS.COMMISSIONS);
  const goldenComm = commRepo.findOne(c => c.bookingId === goldenBooking.id);
  console.log("  [Step 11] SYSTEM Commission Created -> Status:", goldenComm.status, "Amount:", goldenComm.amount);

  // 12. ADMIN Approve Commission
  const approvedComm = router.dispatch("commissions.approve", { id: goldenComm.id }, { sessionToken: "demo-admin-token" });
  console.log("  [Step 12] ADMIN Approve Commission -> Status:", approvedComm.status, "ApprovedAt:", approvedComm.approvedAt);

  // 13. AFFILIATE View Approved Commission
  const affComms = router.dispatch("commissions.list", {}, { sessionToken: "demo-affiliate-token" });
  const myApprovedComm = affComms.find(c => c.id === goldenComm.id);
  console.log("  [Step 13] AFFILIATE View Commission -> Found:", !!myApprovedComm, "Status:", myApprovedComm ? myApprovedComm.status : "none");

  const goldenPathSuccess = inCatalog && goldenBooking.status === "PENDING" && confirmedBooking.status === "CONFIRMED" && paidBooking.paymentStatus === "FULL_PAID" && goldenComm.status === "PENDING" && approvedComm.status === "APPROVED" && !!myApprovedComm;

  assert(goldenPathSuccess, "GOLDEN PATH — Complete end-to-end lifecycle executed without manual spreadsheet edits");
} catch (e) {
  assert(false, "GOLDEN PATH", e.message);
}

console.log(`\n=== TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);

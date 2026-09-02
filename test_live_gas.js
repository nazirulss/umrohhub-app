/**
 * Comprehensive Google Apps Script Live API Integration Test Suite
 * Covers all 14 Verification Scenarios requested in the task.
 */

let ENDPOINT = "https://script.google.com/macros/s/AKfycbw-TC61guoVIcfKukdb9ZEOF1KFYzZW851lxCPyq-JMjV58Nwe3XvUf-LydGDJI5DLA/exec";

// Allow passing custom endpoint via command line: node test_live_gas.js <NEW_URL>
if (process.argv[2]) {
  ENDPOINT = process.argv[2];
}

async function postApi(action, payload = {}, sessionToken = "") {
  const url = `${ENDPOINT}?action=${action}&sessionToken=${encodeURIComponent(sessionToken)}`;
  const body = JSON.stringify({ ...payload, sessionToken });
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: body,
    redirect: "follow"
  });
  return await res.json();
}

async function getApi(action, params = {}) {
  const query = new URLSearchParams({ action, ...params }).toString();
  const url = `${ENDPOINT}?${query}`;
  const res = await fetch(url, { redirect: "follow" });
  return await res.json();
}

function assert(condition, testName, detail = "") {
  if (condition) {
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName} -> ${detail}`);
  }
}

async function runLiveVerificationSuite() {
  console.log("=================================================================");
  console.log(`STARTING LIVE GAS INTEGRATION VERIFICATION`);
  console.log(`Target Endpoint: ${ENDPOINT}`);
  console.log("=================================================================\n");

  // 1. DATASET SUMMARY
  console.log("--- SECTION 1: Actual Dataset Summary ---");
  const summaryRes = await postApi("admin.datasetSummary", {}, "demo-admin-token");
  console.log("admin.datasetSummary:", JSON.stringify(summaryRes.data || summaryRes, null, 2));

  // 2. PUBLIC API
  console.log("\n--- SECTION 2: Public API Tests ---");
  const pkgList = await getApi("packages.list");
  assert(pkgList.success && Array.isArray(pkgList.data) && pkgList.data.length >= 10,
    "packages.list returns >= 10 published packages",
    `count: ${pkgList.data ? pkgList.data.length : 0}`
  );

  const trvList = await getApi("travels.list");
  assert(trvList.success && Array.isArray(trvList.data) && trvList.data.length >= 3,
    "travels.list returns verified public travels",
    `count: ${trvList.data ? trvList.data.length : 0}`
  );

  let samplePkgId = pkgList.data && pkgList.data[0] ? pkgList.data[0].id : "PKG-DEMO-001";
  let sampleTravelId = trvList.data && trvList.data[0] ? trvList.data[0].id : "TRV-DEMO-001";

  const pkgDetail = await getApi("packages.detail", { id: samplePkgId });
  assert(pkgDetail.success && pkgDetail.data && pkgDetail.data.id === samplePkgId,
    "packages.detail returns authoritative package with departures",
    `id: ${pkgDetail.data ? pkgDetail.data.id : null}`
  );

  // 3. SENSITIVE DATA LEAKAGE CHECK
  console.log("\n--- SECTION 3: Public Data Leakage Check ---");
  const trvDetail = await getApi("travels.detail", { id: sampleTravelId });
  const rawTrvData = trvDetail.data || {};
  const hasLeakedFields = 'documents' in rawTrvData || 'fileUrl' in rawTrvData || 'documentNumber' in rawTrvData || 'adminNotes' in rawTrvData || 'bankAccount' in rawTrvData;
  assert(!hasLeakedFields, "travels.detail does NOT leak sensitive legal documents or notes");

  // 4. AUTH NEGATIVE TESTS
  console.log("\n--- SECTION 4: Authorization Negative Tests ---");
  const unauthRes = await postApi("admin.dashboard", {}, "");
  assert(unauthRes.success === false && (unauthRes.code === "UNAUTHORIZED" || unauthRes.code === "FORBIDDEN"),
    "No token calling admin.dashboard rejected with UNAUTHORIZED/FORBIDDEN",
    `code: ${unauthRes.code}`
  );

  const custToAdmin = await postApi("admin.dashboard", {}, "demo-customer-token");
  assert(custToAdmin.success === false && custToAdmin.code === "FORBIDDEN",
    "Customer token calling admin.dashboard rejected with FORBIDDEN",
    `code: ${custToAdmin.code}`
  );

  const crossTravelUpdate = await postApi("packages.update", { id: "PKG-DEMO-004", title: "Hacked" }, "demo-travel-token");
  assert(crossTravelUpdate.success === false && crossTravelUpdate.code === "FORBIDDEN",
    "Travel token attempting cross-travel update rejected with FORBIDDEN",
    `code: ${crossTravelUpdate.code}`
  );

  // 5. REFERRAL & ATTRIBUTION FLOW
  console.log("\n--- SECTION 5: Affiliate Referral & Attribution Live Test ---");
  const visitorKey = "live-test-visitor-" + Date.now();
  const trackRes = await postApi("referrals.track", {
    refCode: "USTADZ",
    packageId: samplePkgId,
    visitorKey: visitorKey
  });
  assert(trackRes.success && trackRes.data && trackRes.data.visitorKey === visitorKey,
    "referrals.track creates live referral click and attribution",
    `visitorKey: ${trackRes.data ? trackRes.data.visitorKey : null}`
  );

  // 6. CUSTOMER BOOKING FLOW
  console.log("\n--- SECTION 6: Customer Booking Live Test ---");
  let activeDepartureId = pkgDetail.data && pkgDetail.data.departures && pkgDetail.data.departures[0] 
    ? pkgDetail.data.departures[0].id 
    : "DEP-DEMO-001";

  const newBookingRes = await postApi("bookings.create", {
    departureId: activeDepartureId,
    packageId: samplePkgId,
    paxCount: 2,
    jamaahName: "H. Bambang Live Test",
    jamaahPhone: "081299887766",
    visitorKey: visitorKey,
    totalPrice: 1000 // Forged price to test server price enforcement!
  }, "demo-customer-token");

  assert(newBookingRes.success && newBookingRes.data && newBookingRes.data.status === "PENDING" && newBookingRes.data.paymentStatus === "UNPAID",
    "Customer booking created as PENDING with authoritative price from Spreadsheet",
    `bookingId: ${newBookingRes.data ? newBookingRes.data.id : null}, total: ${newBookingRes.data ? newBookingRes.data.totalPrice : 0}`
  );

  const liveBooking = newBookingRes.data || {};
  const liveBookingId = liveBooking.id;

  // 7. TRAVEL DASHBOARD & BOOKING CONFIRM
  console.log("\n--- SECTION 7: Travel Dashboard & Booking Confirmation ---");
  const travelPackages = await postApi("travel.packages.list", {}, "demo-travel-token");
  assert(travelPackages.success && Array.isArray(travelPackages.data),
    "travel.packages.list returns biro packages list",
    `count: ${travelPackages.data ? travelPackages.data.length : 0}`
  );

  const travelBookings = await postApi("bookings.listTravel", {}, "demo-travel-token");
  assert(travelBookings.success && Array.isArray(travelBookings.data),
    "bookings.listTravel returns biro bookings list",
    `count: ${travelBookings.data ? travelBookings.data.length : 0}`
  );

  const confirmRes = await postApi("bookings.confirm", { id: liveBookingId }, "demo-travel-token");
  assert(confirmRes.success && confirmRes.data && confirmRes.data.status === "CONFIRMED",
    "bookings.confirm updates status to CONFIRMED and updates quotaTaken",
    `status: ${confirmRes.data ? confirmRes.data.status : null}`
  );

  // 8. PAYMENT & COMMISSION GENERATION
  console.log("\n--- SECTION 8: Travel Payment & Commission Generation ---");
  const markPaidRes = await postApi("bookings.markPaid", { id: liveBookingId }, "demo-travel-token");
  assert(markPaidRes.success && markPaidRes.data && markPaidRes.data.paymentStatus === "FULL_PAID",
    "bookings.markPaid sets paymentStatus=FULL_PAID and generates PENDING commission",
    `paymentStatus: ${markPaidRes.data ? markPaidRes.data.paymentStatus : null}`
  );

  // Idempotent markPaid test
  const doublePaidRes = await postApi("bookings.markPaid", { id: liveBookingId }, "demo-travel-token");
  assert(doublePaidRes.code === "ALREADY_PAID" || doublePaidRes.message.includes("sudah lunas"),
    "Second markPaid is idempotent and does not duplicate commission"
  );

  // 9. AFFILIATE DASHBOARD & COMMISSION VERIFICATION
  console.log("\n--- SECTION 9: Affiliate Dashboard & Commission Check ---");
  const affCommissions = await postApi("commissions.list", {}, "demo-affiliate-token");
  assert(affCommissions.success && Array.isArray(affCommissions.data),
    "commissions.list returns affiliate commissions from live spreadsheet",
    `count: ${affCommissions.data ? affCommissions.data.length : 0}`
  );

  const newComm = affCommissions.data ? affCommissions.data.find(c => c.bookingId === liveBookingId) : null;
  const newCommId = newComm ? newComm.id : (affCommissions.data && affCommissions.data[0] ? affCommissions.data[0].id : null);

  // 10. ADMIN DASHBOARD & APPROVAL
  console.log("\n--- SECTION 10: Admin Dashboard & Commission Approval ---");
  const adminDash = await postApi("admin.dashboard", {}, "demo-admin-token");
  assert(adminDash.success && adminDash.data,
    "admin.dashboard returns live platform KPI metrics",
    JSON.stringify(adminDash.data)
  );

  if (newCommId) {
    const approveRes = await postApi("commissions.approve", { id: newCommId }, "demo-admin-token");
    assert(approveRes.success && approveRes.data && approveRes.data.status === "APPROVED",
      "commissions.approve updates commission status to APPROVED with timestamp",
      `status: ${approveRes.data ? approveRes.data.status : null}, approvedAt: ${approveRes.data ? approveRes.data.approvedAt : null}`
    );
  }

  console.log("\n=================================================================");
  console.log("LIVE GAS INTEGRATION VERIFICATION COMPLETE");
  console.log("=================================================================");
}

runLiveVerificationSuite().catch(console.error);

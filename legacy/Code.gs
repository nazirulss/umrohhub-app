/**
 * ==============================================================================
 * SANTRIMAN OMNIBUILDER V4.0 / BACKEND ENGINE (HARDENED PASS V1)
 * UMROHHUB BACKEND - GOOGLE APPS SCRIPT REST-LIKE API (MODULAR BUNDLE)
 * ==============================================================================
 * Bundel file ini mencakup seluruh lapisan backend yang telah diperkuat:
 * 1. Config.gs                - Skema Database, Konstanta Bisnis & Status
 * 2. AppError.gs              - Standardized Exception Handling
 * 3. Utils.gs                 - UUID, Hash, Serializer Tanggal & Respon JSON
 * 4. Auth.gs                  - Prototype Demo Session Token & Context Guard
 * 5. SpreadsheetRepository.gs - Pure ORM/Data Access Layer (No Nested Lock)
 * 6. UserService.gs           - Manajemen User & Profil
 * 7. TravelService.gs         - Biro Travel PPIU, Public Whitelist DTO & Admin Detail
 * 8. PackageService.gs        - Paket Umroh, Public Filter Server-Enforced & Publish Guard
 * 9. AffiliateService.gs      - 30-Day Attribution Window (Scoped visitorKey + packageId)
 * 10. CommissionService.gs     - Komisi Afiliasi (Idempotent, Full-Paid Triggered, Admin Approve)
 * 11. BookingService.gs        - Booking State Machine, Atomic Quota & Server Pricing
 * 12. AdminService.gs         - Pengawasan Platform, Legalitas & Audit Log
 * 13. Router.gs               - Request Dispatcher & Strict Role/Ownership Guards
 * 14. Code.gs                 - HTTP Gateway (doGet, doPost, Idempotent setupDatabase)
 * ==============================================================================
 */

// ==============================================================================
// 1. CONFIG.GS
// ==============================================================================
const CONFIG = Object.freeze({
  APP_NAME: "Umrohpedia API Backend",
  VERSION: "1.1.0-hardened",
  TIMEZONE: "Asia/Jakarta",
  CURRENCY: "IDR",
  AFFILIATE_ATTRIBUTION_DAYS: 30,
  DEFAULT_PAGE_SIZE: 50,
  
  SHEETS: Object.freeze({
    USERS: "USERS",
    TRAVELS: "TRAVELS",
    TRAVEL_DOCUMENTS: "TRAVEL_DOCUMENTS",
    PACKAGES: "PACKAGES",
    DEPARTURES: "DEPARTURES",
    BOOKINGS: "BOOKINGS",
    AFFILIATES: "AFFILIATES",
    REFERRAL_CLICKS: "REFERRAL_CLICKS",
    ATTRIBUTIONS: "ATTRIBUTIONS",
    COMMISSIONS: "COMMISSIONS",
    PAYOUTS: "PAYOUTS",
    REVIEWS: "REVIEWS",
    AUDIT_LOGS: "AUDIT_LOGS"
  }),

  SCHEMAS: Object.freeze({
    USERS: ["id", "email", "fullName", "phoneNumber", "role", "status", "createdAt", "updatedAt"],
    TRAVELS: ["id", "ownerUserId", "name", "skKemenag", "city", "address", "rating", "isVerified", "status", "createdAt", "updatedAt"],
    TRAVEL_DOCUMENTS: ["id", "travelId", "docType", "docNumber", "fileUrl", "verifiedStatus", "createdAt", "updatedAt"],
    PACKAGES: ["id", "travelId", "title", "category", "price", "durationDays", "airline", "hotelMakkah", "hotelMadinah", "commissionAffiliate", "isPublished", "createdAt", "updatedAt"],
    DEPARTURES: ["id", "packageId", "departureDate", "returnDate", "departureCity", "quotaTotal", "quotaTaken", "status", "createdAt", "updatedAt"],
    BOOKINGS: ["id", "bookingCode", "departureId", "packageId", "travelId", "customerId", "jamaahName", "jamaahPhone", "paxCount", "unitPrice", "totalPrice", "affiliateId", "status", "paymentStatus", "createdAt", "updatedAt"],
    AFFILIATES: ["id", "userId", "referralCode", "bankName", "bankAccount", "bankHolder", "status", "createdAt", "updatedAt"],
    REFERRAL_CLICKS: ["id", "affiliateId", "packageId", "ipHash", "userAgent", "createdAt"],
    ATTRIBUTIONS: ["id", "visitorKey", "affiliateId", "packageId", "expiresAt", "createdAt"],
    COMMISSIONS: ["id", "bookingId", "affiliateId", "amount", "status", "approvedAt", "createdAt", "updatedAt"],
    PAYOUTS: ["id", "affiliateId", "amount", "proofUrl", "status", "createdAt", "updatedAt"],
    REVIEWS: ["id", "bookingId", "packageId", "customerId", "rating", "comment", "createdAt"],
    AUDIT_LOGS: ["id", "actorId", "action", "entity", "entityId", "payload", "createdAt"]
  }),

  STATUS: Object.freeze({
    TRAVEL: { PENDING: "PENDING", VERIFIED: "VERIFIED", REJECTED: "REJECTED", SUSPENDED: "SUSPENDED" },
    PACKAGE: { DRAFT: "DRAFT", PUBLISHED: "PUBLISHED", ARCHIVED: "ARCHIVED" },
    DEPARTURE: { OPEN: "OPEN", FULL: "FULL", COMPLETED: "COMPLETED", CANCELLED: "CANCELLED" },
    BOOKING: { PENDING: "PENDING", CONFIRMED: "CONFIRMED", COMPLETED: "COMPLETED", CANCELLED: "CANCELLED" },
    PAYMENT: { UNPAID: "UNPAID", FULL_PAID: "FULL_PAID", REFUNDED: "REFUNDED" },
    COMMISSION: { PENDING: "PENDING", APPROVED: "APPROVED", PAID: "PAID", VOID: "VOID" },
    PAYOUT: { PENDING: "PENDING", PAID: "PAID", REJECTED: "REJECTED" }
  })
});

// ==============================================================================
// 2. APPERROR.GS (CENTRALIZED EXCEPTION CLASS)
// ==============================================================================
class AppError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "AppError";
    this.code = code || "INTERNAL_ERROR";
  }
}

// ==============================================================================
// 3. UTILS.GS
// ==============================================================================
const Utils = {
  generateUUID() {
    return Utilities.getUuid();
  },

  generateBookingCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "UH-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  nowISO() {
    return new Date().toISOString();
  },

  formatDate(dateObj) {
    if (!dateObj) return "";
    const d = new Date(dateObj);
    return Utilities.formatDate(d, CONFIG.TIMEZONE, "yyyy-MM-dd HH:mm:ss");
  },

  addDays(dateObj, days) {
    const result = new Date(dateObj);
    result.setDate(result.getDate() + days);
    return result;
  },

  createResponse(success, data = null, message = "OK", code = "OK") {
    let finalCode = code;
    let finalMessage = message;
    let finalData = data;

    // Handle custom response code/message embedded in data
    if (data && typeof data === "object" && data._responseCode) {
      finalCode = data._responseCode;
      if (data._responseMessage) finalMessage = data._responseMessage;
      const copy = { ...data };
      delete copy._responseCode;
      delete copy._responseMessage;
      finalData = copy;
    }

    const responsePayload = {
      success: !!success,
      code: finalCode,
      message: finalMessage,
      data: finalData,
      timestamp: this.nowISO()
    };
    return ContentService.createTextOutput(JSON.stringify(responsePayload))
      .setMimeType(ContentService.MimeType.JSON);
  },

  validateRequired(payload, requiredFields = []) {
    const missing = [];
    for (const field of requiredFields) {
      if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
        missing.push(field);
      }
    }
    if (missing.length > 0) {
      throw new AppError("VALIDATION_ERROR", `Field wajib tidak boleh kosong: [${missing.join(", ")}]`);
    }
  },

  validateAndPickPayload(payload, allowedFields, ignoredFields = ["id", "action", "sessionToken", "token"]) {
    const sanitized = {};
    for (const key of Object.keys(payload)) {
      if (ignoredFields.includes(key)) continue;
      if (!allowedFields.includes(key)) {
        throw new AppError("VALIDATION_ERROR", `Field '${key}' tidak diizinkan untuk diubah atau dibuat.`);
      }
      sanitized[key] = payload[key];
    }
    return sanitized;
  },

  hashString(str) {
    if (!str) return "";
    const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str, Utilities.Charset.UTF_8);
    return rawHash.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  },

  normalizeCellValue(val) {
    if (val === null || val === undefined) return "";
    if (val instanceof Date) return val.toISOString();
    return val;
  },

  invalidatePublicCache() {
    try {
      const cache = CacheService.getScriptCache();
      cache.remove("UH_PUB_PACKAGES_LIST");
      cache.remove("UH_PUB_TRAVELS_LIST");
    } catch (e) {}
  }
};

// ==============================================================================
// 4. AUTH.GS (PROTOTYPE DEMO SESSION TOKEN & CONTEXT GUARD)
// ==============================================================================
const DEMO_SESSIONS = Object.freeze({
  "demo-admin-token": {
    userId: "USR-DEMO-ADMIN-01",
    role: "ADMIN"
  },
  "demo-travel-token": {
    userId: "USR-DEMO-TRAVEL-01",
    role: "TRAVEL"
  },
  "demo-affiliate-token": {
    userId: "USR-DEMO-AFF-01",
    role: "AFFILIATE"
  },
  "demo-customer-token": {
    userId: "USR-DEMO-CUST-01",
    role: "CUSTOMER"
  },
  // Legacy aliases
  "demo-admin-token-legacy": {
    userId: "USR-ADMIN-01",
    role: "ADMIN"
  },
  "demo-travel-token-legacy": {
    userId: "USR-TRV-01",
    role: "TRAVEL"
  },
  "demo-affiliate-token-legacy": {
    userId: "USR-AFF-01",
    role: "AFFILIATE"
  },
  "demo-customer-token-legacy": {
    userId: "USR-CUST-01",
    role: "CUSTOMER"
  }
});

const Auth = {
  /**
   * Resolve sessionToken menjadi authenticated context.
   * Identitas Travel dan Affiliate diturunkan secara dinamis dari database.
   */
  resolveSession(sessionToken) {
    if (!sessionToken) return null;
    const session = DEMO_SESSIONS[sessionToken];
    if (!session) return null;

    const context = {
      userId: session.userId,
      role: session.role,
      token: sessionToken,
      travelId: null,
      affiliateId: null,
      referralCode: null
    };

    // Dinamis resolve travelId dari TRAVELS.ownerUserId jika role TRAVEL
    if (session.role === "TRAVEL") {
      try {
        const travelRepo = new SpreadsheetRepository(CONFIG.SHEETS.TRAVELS);
        const travel = travelRepo.findOne(t => t.ownerUserId === session.userId);
        if (travel) {
          context.travelId = travel.id;
        }
      } catch (e) {
        // Fallback jika database belum setup
      }
    }

    // Dinamis resolve affiliateId dari AFFILIATES.userId jika role AFFILIATE
    if (session.role === "AFFILIATE") {
      try {
        const affRepo = new SpreadsheetRepository(CONFIG.SHEETS.AFFILIATES);
        const aff = affRepo.findOne(a => a.userId === session.userId);
        if (aff) {
          context.affiliateId = aff.id;
          context.referralCode = aff.referralCode;
        }
      } catch (e) {
        // Fallback jika database belum setup
      }
    }

    return context;
  },

  requireUser(context) {
    if (!context || !context.userId) {
      throw new AppError("UNAUTHORIZED", "Sesi tidak valid atau belum diautentikasi.");
    }
    return context;
  },

  requireRole(context, allowedRoles = []) {
    this.requireUser(context);
    if (!allowedRoles.includes(context.role)) {
      throw new AppError("FORBIDDEN", `Akses ditolak untuk role '${context.role}'. Diperlukan role: [${allowedRoles.join(", ")}].`);
    }
    return context;
  },

  requireTravelOwnership(context, targetTravelId) {
    this.requireRole(context, ["TRAVEL"]);
    if (!context.travelId || String(context.travelId) !== String(targetTravelId)) {
      throw new AppError("FORBIDDEN", "Anda tidak memiliki hak kepemilikan atas biro travel ini.");
    }
  }
};

// ==============================================================================
// 5. SPREADSHEET REPOSITORY (PURE DATA ACCESS LAYER / ORM - NO NESTED LOCK)
// ==============================================================================
let _globalCachedSpreadsheet = null;

class SpreadsheetRepository {
  constructor(sheetName) {
    this.sheetName = sheetName;
    this.schema = CONFIG.SCHEMAS[sheetName];
    if (!this.schema) {
      throw new AppError("CONFIGURATION_ERROR", `Skema tabel tidak terdaftar untuk sheet: ${sheetName}`);
    }
  }

  getSpreadsheet_() {
    if (_globalCachedSpreadsheet) return _globalCachedSpreadsheet;
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) {
      _globalCachedSpreadsheet = active;
      return _globalCachedSpreadsheet;
    }
    
    const props = PropertiesService.getScriptProperties();
    const storedId = props.getProperty("SPREADSHEET_ID");
    if (storedId) {
      _globalCachedSpreadsheet = SpreadsheetApp.openById(storedId);
      return _globalCachedSpreadsheet;
    }
    throw new AppError("CONFIGURATION_ERROR", "Spreadsheet database belum dikonfigurasi. Jalankan setupDatabase() terlebih dahulu.");
  }

  getSheet_() {
    const ss = this.getSpreadsheet_();
    let sheet = ss.getSheetByName(this.sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(this.sheetName);
      sheet.appendRow(this.schema);
      sheet.setFrozenRows(1);
    }
    return sheet;
  }

  _rowToObject(headers, rowData) {
    const obj = {};
    headers.forEach((header, index) => {
      const val = rowData[index];
      obj[header] = Utils.normalizeCellValue(val);
    });
    return obj;
  }

  _objectToRow(headers, obj) {
    return headers.map(header => {
      const val = obj[header];
      return val === undefined || val === null ? "" : val;
    });
  }

  findAll() {
    const sheet = this.getSheet_();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    const headers = data[0];
    const rows = data.slice(1);
    return rows
      .filter(row => row[0] !== "" && row[0] !== null)
      .map(row => this._rowToObject(headers, row));
  }

  findById(id) {
    if (!id) return null;
    const all = this.findAll();
    return all.find(item => String(item.id) === String(id)) || null;
  }

  findWhere(predicateFn) {
    const all = this.findAll();
    return all.filter(predicateFn);
  }

  findOne(predicateFn) {
    const all = this.findAll();
    return all.find(predicateFn) || null;
  }

  /**
   * Insert operasi murni spreadsheet.
   * Lock dimiliki oleh Business Transaction layer (Service) untuk mencegah nested lock.
   */
  insert(entity) {
    const sheet = this.getSheet_();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    const record = { ...entity };
    if (!record.id) record.id = Utils.generateUUID();
    const now = Utils.nowISO();
    if (!record.createdAt) record.createdAt = now;
    if (!record.updatedAt) record.updatedAt = now;

    const rowValues = this._objectToRow(headers, record);
    sheet.appendRow(rowValues);
    SpreadsheetApp.flush();
    return record;
  }

  /**
   * Update operasi murni spreadsheet.
   * Lock dimiliki oleh Business Transaction layer (Service) untuk mencegah nested lock.
   */
  updateById(id, patch) {
    const sheet = this.getSheet_();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return null;

    const headers = data[0];
    const idColIndex = headers.indexOf("id");
    if (idColIndex === -1) throw new AppError("EXECUTION_ERROR", "Header 'id' tidak ditemukan pada sheet.");

    let targetRowIndex = -1;
    for (let r = 1; r < data.length; r++) {
      if (String(data[r][idColIndex]) === String(id)) {
        targetRowIndex = r + 1; // 1-based index sheet
        break;
      }
    }

    if (targetRowIndex === -1) return null;

    const currentRecord = this._rowToObject(headers, data[targetRowIndex - 1]);
    const updatedRecord = { ...currentRecord, ...patch, id: id, updatedAt: Utils.nowISO() };
    const rowValues = this._objectToRow(headers, updatedRecord);

    sheet.getRange(targetRowIndex, 1, 1, headers.length).setValues([rowValues]);
    SpreadsheetApp.flush();
    return updatedRecord;
  }
}

// ==============================================================================
// 6. USER SERVICE
// ==============================================================================
class UserService {
  constructor() {
    this.repo = new SpreadsheetRepository(CONFIG.SHEETS.USERS);
  }

  getById(id) {
    return this.repo.findById(id);
  }

  getByEmail(email) {
    return this.repo.findOne(u => u.email.toLowerCase() === String(email).toLowerCase());
  }

  createUser(payload) {
    Utils.validateRequired(payload, ["email", "fullName", "role"]);
    const existing = this.getByEmail(payload.email);
    if (existing) throw new AppError("VALIDATION_ERROR", "Email pengguna sudah terdaftar.");

    return this.repo.insert({
      email: payload.email,
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber || "",
      role: payload.role,
      status: "ACTIVE"
    });
  }
}

// ==============================================================================
// 7. TRAVEL SERVICE
// ==============================================================================
class TravelService {
  constructor() {
    this.repo = new SpreadsheetRepository(CONFIG.SHEETS.TRAVELS);
    this.docRepo = new SpreadsheetRepository(CONFIG.SHEETS.TRAVEL_DOCUMENTS);
  }

  list(filters = {}) {
    const hasCustomFilters = (filters.city && filters.city !== "") || (filters.status && filters.status !== "");
    const cache = CacheService.getScriptCache();
    const cacheKey = "UH_PUB_TRAVELS_LIST";
    if (!hasCustomFilters) {
      const cached = cache.get(cacheKey);
      if (cached) {
        try { return JSON.parse(cached); } catch (e) {}
      }
    }

    const result = this.repo.findWhere(t => {
      if (filters.isVerified !== undefined && String(t.isVerified) !== String(filters.isVerified)) return false;
      if (filters.status && t.status !== filters.status) return false;
      if (filters.city && !t.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
      return true;
    }).map(t => this._toPublicDTO(t));

    if (!hasCustomFilters && result.length > 0) {
      try { cache.put(cacheKey, JSON.stringify(result), 600); } catch (e) {}
    }
    return result;
  }

  /**
   * Public travel detail DTO — strict whitelist.
   * TIDAK membocorkan dokumen legal, nomor berkas, fileUrl, atau private notes.
   */
  getPublicDetail(id) {
    const travel = this.repo.findById(id);
    if (!travel) throw new AppError("NOT_FOUND", "Biro Travel tidak ditemukan.");
    return this._toPublicDTO(travel);
  }

  /**
   * Admin-only travel detail yang menyertakan dokumen legalitas Kemenag.
   */
  getAdminDetail(id) {
    const travel = this.repo.findById(id);
    if (!travel) throw new AppError("NOT_FOUND", "Biro Travel tidak ditemukan.");
    const docs = this.docRepo.findWhere(d => String(d.travelId) === String(id));
    return { ...travel, documents: docs };
  }

  _toPublicDTO(travel) {
    return {
      id: travel.id,
      name: travel.name,
      skKemenag: travel.skKemenag,
      city: travel.city,
      address: travel.address,
      rating: travel.rating,
      isVerified: travel.isVerified === true || travel.isVerified === "true",
      status: travel.status
    };
  }

  create(payload, context) {
    Utils.validateRequired(payload, ["name", "skKemenag", "city"]);
    const existingSK = this.repo.findOne(t => t.skKemenag === payload.skKemenag);
    if (existingSK) throw new AppError("VALIDATION_ERROR", "Nomor SK Kemenag / PPIU sudah terdaftar.");

    return this.repo.insert({
      ownerUserId: context.userId,
      name: payload.name,
      skKemenag: payload.skKemenag,
      city: payload.city,
      address: payload.address || "",
      rating: 5.0,
      isVerified: false,
      status: CONFIG.STATUS.TRAVEL.PENDING
    });
  }

  /**
   * Update dengan strict allowlist. Reject jika membawa payload terlarang.
   */
  update(id, payload, context) {
    Auth.requireTravelOwnership(context, id);

    const allowedFields = ["name", "city", "province", "phone", "email", "description", "logo", "address"];
    const sanitized = Utils.validateAndPickPayload(payload, allowedFields);

    const updated = this.repo.updateById(id, sanitized);
    if (!updated) throw new AppError("NOT_FOUND", "Gagal memperbarui travel: Data tidak ditemukan.");
    return this._toPublicDTO(updated);
  }
}

// ==============================================================================
// 8. PACKAGE SERVICE
// ==============================================================================
class PackageService {
  constructor() {
    this.packageRepo = new SpreadsheetRepository(CONFIG.SHEETS.PACKAGES);
    this.departureRepo = new SpreadsheetRepository(CONFIG.SHEETS.DEPARTURES);
    this.travelRepo = new SpreadsheetRepository(CONFIG.SHEETS.TRAVELS);
  }

  /**
   * Endpoint Publik: SELALU paksa isPublished === true.
   * Parameter filters.isPublished dari client diabaikan secara tegas di server.
   */
  listPublic(filters = {}) {
    const hasCustomFilters = (filters.category && filters.category !== "") || (filters.travelId && filters.travelId !== "");
    const cache = CacheService.getScriptCache();
    const cacheKey = "UH_PUB_PACKAGES_LIST";
    
    if (!hasCustomFilters) {
      const cached = cache.get(cacheKey);
      if (cached) {
        try { return JSON.parse(cached); } catch (e) {}
      }
    }

    const packages = this.packageRepo.findWhere(p => {
      const isPub = p.isPublished === true || p.isPublished === "true";
      if (!isPub) return false;
      if (filters.category && p.category !== filters.category) return false;
      if (filters.travelId && String(p.travelId) !== String(filters.travelId)) return false;
      return true;
    });

    const departures = this.departureRepo.findAll();
    const travels = this.travelRepo.findAll();

    const result = packages.map(pkg => {
      const pkgDepartures = departures.filter(d => String(d.packageId) === String(pkg.id) && d.status === CONFIG.STATUS.DEPARTURE.OPEN);
      const travel = travels.find(t => String(t.id) === String(pkg.travelId));
      return {
        ...pkg,
        travelName: travel ? travel.name : "Travel Resmi",
        travelSK: travel ? travel.skKemenag : "",
        isTravelVerified: travel ? (travel.isVerified === true || travel.isVerified === "true") : false,
        departures: pkgDepartures
      };
    });

    if (!hasCustomFilters && result.length > 0) {
      try {
        cache.put(cacheKey, JSON.stringify(result), 300); // Cache 5 menit
      } catch (e) {}
    }

    return result;
  }

  /**
   * Endpoint Private Travel: Melihat paket milik biro travel authenticated (termasuk DRAFT).
   */
  listTravelPackages(travelId) {
    const packages = this.packageRepo.findWhere(p => String(p.travelId) === String(travelId));
    const departures = this.departureRepo.findAll();

    return packages.map(pkg => {
      const pkgDepartures = departures.filter(d => String(d.packageId) === String(pkg.id));
      return {
        ...pkg,
        departures: pkgDepartures
      };
    });
  }

  getDetail(id) {
    const pkg = this.packageRepo.findById(id);
    if (!pkg) throw new AppError("NOT_FOUND", "Paket Umroh tidak ditemukan.");
    const travel = this.travelRepo.findById(pkg.travelId);
    const departures = this.departureRepo.findWhere(d => String(d.packageId) === String(id));

    return {
      ...pkg,
      travel: travel ? {
        id: travel.id,
        name: travel.name,
        skKemenag: travel.skKemenag,
        city: travel.city,
        address: travel.address,
        rating: travel.rating,
        isVerified: travel.isVerified === true || travel.isVerified === "true"
      } : null,
      departures: departures
    };
  }

  create(payload, travelId) {
    Utils.validateRequired(payload, ["title", "price", "durationDays"]);
    const price = Number(payload.price);
    const durationDays = Number(payload.durationDays);

    if (isNaN(price) || price <= 0) throw new AppError("VALIDATION_ERROR", "Harga paket harus lebih dari 0.");
    if (isNaN(durationDays) || durationDays <= 0) throw new AppError("VALIDATION_ERROR", "Durasi hari harus lebih dari 0.");

    const inserted = this.packageRepo.insert({
      travelId: travelId, // Ditentukan dari auth context, BUKAN payload
      title: payload.title,
      category: payload.category || "Reguler",
      price: price,
      durationDays: durationDays,
      airline: payload.airline || "Saudia Airlines",
      hotelMakkah: payload.hotelMakkah || "Bintang 4",
      hotelMadinah: payload.hotelMadinah || "Bintang 4",
      commissionAffiliate: Number(payload.commissionAffiliate || 0),
      isPublished: false
    });
    Utils.invalidatePublicCache();
    return inserted;
  }

  /**
   * Update paket dengan strict allowlist.
   */
  update(id, payload, travelId) {
    const pkg = this.packageRepo.findById(id);
    if (!pkg) throw new AppError("NOT_FOUND", "Paket tidak ditemukan.");
    if (String(pkg.travelId) !== String(travelId)) {
      throw new AppError("FORBIDDEN", "Anda tidak memiliki hak akses mengubah paket travel lain.");
    }

    const allowedFields = ["title", "category", "price", "durationDays", "airline", "hotelMakkah", "hotelMadinah", "commissionAffiliate"];
    const sanitized = Utils.validateAndPickPayload(payload, allowedFields);

    if (sanitized.price !== undefined && Number(sanitized.price) <= 0) {
      throw new AppError("VALIDATION_ERROR", "Harga paket harus lebih dari 0.");
    }
    if (sanitized.durationDays !== undefined && Number(sanitized.durationDays) <= 0) {
      throw new AppError("VALIDATION_ERROR", "Durasi harus lebih dari 0.");
    }

    const updated = this.packageRepo.updateById(id, sanitized);
    Utils.invalidatePublicCache();
    return updated;
  }

  /**
   * Publish Paket — Validasi Ketat:
   * 1. Travel pemilik harus VERIFIED oleh Kemenag
   * 2. Kepemilikan package sesuai context.travelId
   * 3. Judul tidak kosong, price > 0, durationDays > 0
   * 4. Minimal 1 departure tersedia dan berstatus OPEN
   */
  publish(id, travelId, isPublished = true) {
    const pkg = this.packageRepo.findById(id);
    if (!pkg) throw new AppError("NOT_FOUND", "Paket tidak ditemukan.");
    if (String(pkg.travelId) !== String(travelId)) {
      throw new AppError("FORBIDDEN", "Anda tidak memiliki hak akses atas paket ini.");
    }

    // Validasi verifikasi travel
    const travel = this.travelRepo.findById(travelId);
    if (!travel) throw new AppError("NOT_FOUND", "Biro travel tidak ditemukan.");
    const isVerified = travel.isVerified === true || travel.isVerified === "true" || travel.status === CONFIG.STATUS.TRAVEL.VERIFIED;
    if (!isVerified) {
      throw new AppError("TRAVEL_NOT_VERIFIED", "Biro Travel belum terverifikasi Kemenag. Tidak diizinkan mempublikasikan paket.");
    }

    if (isPublished) {
      if (!pkg.title || !String(pkg.title).trim()) {
        throw new AppError("VALIDATION_ERROR", "Judul paket tidak boleh kosong.");
      }
      if (Number(pkg.price) <= 0) {
        throw new AppError("INVALID_PRICE", "Harga paket harus lebih dari 0.");
      }
      if (Number(pkg.durationDays) <= 0) {
        throw new AppError("VALIDATION_ERROR", "Durasi perjalanan harus lebih dari 0.");
      }

      const departures = this.departureRepo.findWhere(d => String(d.packageId) === String(id));
      if (!departures || departures.length === 0) {
        throw new AppError("NO_DEPARTURES", "Paket harus memiliki minimal 1 jadwal keberangkatan sebelum dipublikasikan.");
      }
      const hasOpenDeparture = departures.some(d => d.status === CONFIG.STATUS.DEPARTURE.OPEN);
      if (!hasOpenDeparture) {
        throw new AppError("NO_DEPARTURES", "Paket harus memiliki minimal 1 jadwal keberangkatan berstatus OPEN.");
      }
    }

    const updated = this.packageRepo.updateById(id, { isPublished: !!isPublished });
    Utils.invalidatePublicCache();
    return updated;
  }

  listDepartures(packageId) {
    return this.departureRepo.findWhere(d => !packageId || String(d.packageId) === String(packageId));
  }

  createDeparture(payload, travelId) {
    Utils.validateRequired(payload, ["packageId", "departureDate", "departureCity", "quotaTotal"]);
    const pkg = this.packageRepo.findById(payload.packageId);
    if (!pkg) throw new AppError("NOT_FOUND", "Paket induk tidak ditemukan.");
    if (String(pkg.travelId) !== String(travelId)) {
      throw new AppError("FORBIDDEN", "Anda tidak berhak menambahkan keberangkatan pada paket travel lain.");
    }

    const quotaTotal = Number(payload.quotaTotal);
    if (isNaN(quotaTotal) || quotaTotal <= 0) {
      throw new AppError("VALIDATION_ERROR", "Jumlah kuota total harus lebih dari 0.");
    }

    const inserted = this.departureRepo.insert({
      packageId: payload.packageId,
      departureDate: payload.departureDate,
      returnDate: payload.returnDate || "",
      departureCity: payload.departureCity,
      quotaTotal: quotaTotal,
      quotaTaken: 0,
      status: CONFIG.STATUS.DEPARTURE.OPEN
    });
    Utils.invalidatePublicCache();
    return inserted;
  }
}

// ==============================================================================
// 9. AFFILIATE SERVICE (30-DAY ATTRIBUTION WINDOW - SCOPED TO VISITOR + PACKAGE)
// ==============================================================================
class AffiliateService {
  constructor() {
    this.affiliateRepo = new SpreadsheetRepository(CONFIG.SHEETS.AFFILIATES);
    this.clickRepo = new SpreadsheetRepository(CONFIG.SHEETS.REFERRAL_CLICKS);
    this.attrRepo = new SpreadsheetRepository(CONFIG.SHEETS.ATTRIBUTIONS);
    this.packageRepo = new SpreadsheetRepository(CONFIG.SHEETS.PACKAGES);
  }

  register(payload) {
    Utils.validateRequired(payload, ["userId", "referralCode", "bankName", "bankAccount", "bankHolder"]);
    const code = String(payload.referralCode).toUpperCase().trim();
    const existing = this.affiliateRepo.findOne(a => a.referralCode === code);
    if (existing) throw new AppError("VALIDATION_ERROR", `Kode referral '${code}' sudah digunakan.`);

    return this.affiliateRepo.insert({
      userId: payload.userId,
      referralCode: code,
      bankName: payload.bankName,
      bankAccount: payload.bankAccount,
      bankHolder: payload.bankHolder,
      status: "ACTIVE"
    });
  }

  getByCode(code) {
    if (!code) return null;
    return this.affiliateRepo.findOne(a => a.referralCode === String(code).toUpperCase().trim()) || null;
  }

  getById(id) {
    return this.affiliateRepo.findById(id);
  }

  /**
   * Track referral link click (PUBLIC).
   * 1. Validasi referralCode & status ACTIVE
   * 2. Validasi packageId & status PUBLISHED
   * 3. Catat klik
   * 4. Scope atribusi 30 hari ke (visitorKey + packageId)
   */
  trackClick(payload) {
    const refCode = payload.refCode || payload.referralCode;
    Utils.validateRequired({ refCode, packageId: payload.packageId, visitorKey: payload.visitorKey }, ["refCode", "packageId", "visitorKey"]);

    const affiliate = this.getByCode(refCode);
    if (!affiliate || affiliate.status !== "ACTIVE") {
      throw new AppError("NOT_FOUND", "Kode referral tidak valid atau mitra afiliasi tidak aktif.");
    }

    const pkg = this.packageRepo.findById(payload.packageId);
    if (!pkg || !(pkg.isPublished === true || pkg.isPublished === "true")) {
      throw new AppError("NOT_FOUND", "Paket umroh tidak ditemukan atau belum dipublikasikan.");
    }

    // 1. Catat Log Klik
    this.clickRepo.insert({
      affiliateId: affiliate.id,
      packageId: pkg.id,
      ipHash: Utils.hashString(payload.visitorKey || ""),
      userAgent: payload.userAgent || ""
    });

    // 2. Set/Perbarui Atribusi 30 Hari (Scoped: visitorKey + packageId)
    const expiresAt = Utils.addDays(new Date(), CONFIG.AFFILIATE_ATTRIBUTION_DAYS).toISOString();
    const existingAttr = this.attrRepo.findOne(a => 
      a.visitorKey === payload.visitorKey && String(a.packageId) === String(pkg.id)
    );

    if (existingAttr) {
      this.attrRepo.updateById(existingAttr.id, {
        affiliateId: affiliate.id,
        expiresAt: expiresAt
      });
    } else {
      this.attrRepo.insert({
        visitorKey: payload.visitorKey,
        affiliateId: affiliate.id,
        packageId: pkg.id,
        expiresAt: expiresAt
      });
    }

    return { attributed: true, affiliateCode: affiliate.referralCode, expiresAt };
  }

  /**
   * Cek atribusi aktif — WAJIB terikat pada visitorKey dan packageId yang sama,
   * serta afiliasi harus berstatus ACTIVE dan belum expired.
   */
  getActiveAttribution(visitorKey, packageId) {
    if (!visitorKey || !packageId) return "";

    const attr = this.attrRepo.findOne(a => 
      a.visitorKey === visitorKey && String(a.packageId) === String(packageId)
    );

    if (attr) {
      const now = new Date();
      const exp = new Date(attr.expiresAt);
      if (exp > now) {
        const aff = this.affiliateRepo.findById(attr.affiliateId);
        if (aff && aff.status === "ACTIVE") {
          return aff.id;
        }
      }
    }

    return "";
  }

  listMarketplacePackages() {
    const packages = this.packageRepo.findWhere(p => p.isPublished === true || p.isPublished === "true");
    return packages.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      commissionAffiliate: p.commissionAffiliate,
      category: p.category
    }));
  }
}

// ==============================================================================
// 10. COMMISSION SERVICE (COMMISSION LIFECYCLE & APPROVAL)
// ==============================================================================
class CommissionService {
  constructor() {
    this.repo = new SpreadsheetRepository(CONFIG.SHEETS.COMMISSIONS);
    this.affRepo = new SpreadsheetRepository(CONFIG.SHEETS.AFFILIATES);
    this.bookingRepo = new SpreadsheetRepository(CONFIG.SHEETS.BOOKINGS);
  }

  list(filters = {}) {
    return this.repo.findWhere(c => {
      if (filters.affiliateId && String(c.affiliateId) !== String(filters.affiliateId)) return false;
      if (filters.status && c.status !== filters.status) return false;
      return true;
    });
  }

  /**
   * Buat komisi untuk booking yang telah lunas (FULL_PAID).
   * Menjamin keunikan (maksimal 1 komisi aktif per booking) dan idempotensi.
   * Komisi awal berstatus PENDING (TIDAK langsung APPROVED).
   */
  createForBooking(booking, commissionPerPax) {
    if (!booking.affiliateId || Number(commissionPerPax) <= 0) return null;

    // Cek duplikasi komisi
    const existing = this.repo.findOne(c => String(c.bookingId) === String(booking.id));
    if (existing) {
      return existing; // Idempoten: reuse existing
    }

    const totalCommission = Number(commissionPerPax) * Number(booking.paxCount);
    return this.repo.insert({
      bookingId: booking.id,
      affiliateId: booking.affiliateId,
      amount: totalCommission,
      status: CONFIG.STATUS.COMMISSION.PENDING,
      approvedAt: ""
    });
  }

  /**
   * Admin Approval untuk Komisi (Role ADMIN).
   */
  approve(commissionId) {
    const commission = this.repo.findById(commissionId);
    if (!commission) throw new AppError("NOT_FOUND", "Data komisi tidak ditemukan.");
    if (commission.status === CONFIG.STATUS.COMMISSION.APPROVED) return commission;

    return this.repo.updateById(commissionId, {
      status: CONFIG.STATUS.COMMISSION.APPROVED,
      approvedAt: Utils.nowISO()
    });
  }
}

// ==============================================================================
// 11. BOOKING SERVICE (ATOMIC QUOTA & STATE MACHINE)
// ==============================================================================
class BookingService {
  constructor() {
    this.bookingRepo = new SpreadsheetRepository(CONFIG.SHEETS.BOOKINGS);
    this.departureRepo = new SpreadsheetRepository(CONFIG.SHEETS.DEPARTURES);
    this.packageRepo = new SpreadsheetRepository(CONFIG.SHEETS.PACKAGES);
    this.affiliateService = new AffiliateService();
    this.commissionService = new CommissionService();
  }

  /**
   * Customer Create Booking:
   * 1. Status awal PENDING, paymentStatus UNPAID
   * 2. TIDAK mengurangi kuota kursi keberangkatan
   * 3. Server-authoritative pricing (mengabaikan price payload client)
   * 4. Customer ID diturunkan dari context.userId
   * 5. Self-referral protection (affiliate === customer -> komisi dibatalkan)
   * 6. TIDAK membuat komisi saat create
   */
  create(payload, context) {
    Utils.validateRequired(payload, ["departureId", "jamaahName", "jamaahPhone", "paxCount"]);
    const paxCount = parseInt(payload.paxCount, 10);
    if (isNaN(paxCount) || paxCount <= 0) throw new AppError("VALIDATION_ERROR", "Jumlah jamaah (pax) tidak valid.");

    // Validasi Keberangkatan & Ketersediaan Kuota (awal)
    const departure = this.departureRepo.findById(payload.departureId);
    if (!departure) throw new AppError("NOT_FOUND", "Jadwal keberangkatan tidak ditemukan.");
    if (departure.status !== CONFIG.STATUS.DEPARTURE.OPEN) throw new AppError("INVALID_STATE", "Keberangkatan ini sudah ditutup.");

    const availableQuota = Number(departure.quotaTotal) - Number(departure.quotaTaken);
    if (availableQuota < paxCount) {
      throw new AppError("QUOTA_NOT_AVAILABLE", `Sisa kuota tidak mencukupi. Tersedia: ${availableQuota} kursi.`);
    }

    // Ambil Paket Induk & Validasi Harga Server-Authoritative
    const pkg = this.packageRepo.findById(departure.packageId);
    if (!pkg) throw new AppError("NOT_FOUND", "Paket umroh tidak ditemukan.");

    const unitPrice = Number(pkg.price);
    const totalPrice = unitPrice * paxCount;

    // Evaluasi Atribusi Afiliasi (Scoped: visitorKey + packageId)
    let attributedAffiliateId = this.affiliateService.getActiveAttribution(
      payload.visitorKey || "",
      pkg.id
    );

    // Self-Referral Protection: Affiliate tidak boleh mendapat komisi dari booking dirinya sendiri
    if (attributedAffiliateId) {
      const aff = this.affiliateService.getById(attributedAffiliateId);
      if (aff && aff.userId === context.userId) {
        attributedAffiliateId = ""; // Abaikan atribusi
      }
    }

    // Simpan Record Booking (PENDING, UNPAID, Kuota belum terpotong)
    const bookingRecord = this.bookingRepo.insert({
      bookingCode: Utils.generateBookingCode(),
      departureId: departure.id,
      packageId: pkg.id,
      travelId: pkg.travelId,
      customerId: context.userId, // Dari session, bukan payload
      jamaahName: payload.jamaahName,
      jamaahPhone: payload.jamaahPhone,
      paxCount: paxCount,
      unitPrice: unitPrice, // Authoritative
      totalPrice: totalPrice, // Authoritative
      affiliateId: attributedAffiliateId,
      status: CONFIG.STATUS.BOOKING.PENDING,
      paymentStatus: CONFIG.STATUS.PAYMENT.UNPAID
    });

    return bookingRecord;
  }

  listCustomer(customerId) {
    return this.bookingRepo.findWhere(b => String(b.customerId) === String(customerId));
  }

  listTravel(travelId) {
    return this.bookingRepo.findWhere(b => String(b.travelId) === String(travelId));
  }

  /**
   * Konfirmasi Booking oleh Travel (Role TRAVEL):
   * Berada dalam ScriptLock untuk transaksi atomik.
   * State Machine: PENDING -> CONFIRMED.
   * Kuota dipotong secara atomik: quotaTaken += paxCount.
   */
  confirm(bookingId, context) {
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(20000);

      // Reload data terbaru setelah lock didapat
      const booking = this.bookingRepo.findById(bookingId);
      if (!booking) throw new AppError("NOT_FOUND", "Booking tidak ditemukan.");

      Auth.requireTravelOwnership(context, booking.travelId);

      if (booking.status === CONFIG.STATUS.BOOKING.CONFIRMED) {
        throw new AppError("INVALID_STATE", "Booking sudah dalam status CONFIRMED.");
      }
      if (booking.status !== CONFIG.STATUS.BOOKING.PENDING) {
        throw new AppError("INVALID_STATE", `Booking dengan status '${booking.status}' tidak dapat dikonfirmasi.`);
      }

      const departure = this.departureRepo.findById(booking.departureId);
      if (!departure) throw new AppError("NOT_FOUND", "Jadwal keberangkatan tidak ditemukan.");

      const paxCount = Number(booking.paxCount);
      const remainingQuota = Number(departure.quotaTotal) - Number(departure.quotaTaken);
      if (remainingQuota < paxCount) {
        throw new AppError("QUOTA_NOT_AVAILABLE", `Sisa kuota tidak mencukupi untuk konfirmasi. Tersedia: ${remainingQuota} kursi.`);
      }

      // Potong kuota atomik
      const newQuotaTaken = Number(departure.quotaTaken) + paxCount;
      const isFull = newQuotaTaken >= Number(departure.quotaTotal);
      this.departureRepo.updateById(departure.id, {
        quotaTaken: newQuotaTaken,
        status: isFull ? CONFIG.STATUS.DEPARTURE.FULL : CONFIG.STATUS.DEPARTURE.OPEN
      });

      // Update status booking menjadi CONFIRMED
      const updated = this.bookingRepo.updateById(bookingId, {
        status: CONFIG.STATUS.BOOKING.CONFIRMED
      });

      Utils.invalidatePublicCache();
      return updated;
    } finally {
      if (lock.hasLock()) lock.releaseLock();
    }
  }

  /**
   * Tandai Lunas oleh Travel (Role TRAVEL):
   * State Machine: paymentStatus UNPAID -> FULL_PAID.
   * Idempoten: Jika sudah FULL_PAID, kembalikan ALREADY_PAID tanpa error dan tanpa duplicate komisi.
   * Trigger Komisi: Membuat komisi PENDING (belum approved).
   */
  markPaid(bookingId, context) {
    const booking = this.bookingRepo.findById(bookingId);
    if (!booking) throw new AppError("NOT_FOUND", "Booking tidak ditemukan.");

    Auth.requireTravelOwnership(context, booking.travelId);

    if (booking.status !== CONFIG.STATUS.BOOKING.CONFIRMED) {
      throw new AppError("INVALID_STATE", `Booking harus dikonfirmasi terlebih dahulu sebelum ditandai lunas (Status saat ini: ${booking.status}).`);
    }

    // Idempotensi: Jika sudah FULL_PAID
    if (booking.paymentStatus === CONFIG.STATUS.PAYMENT.FULL_PAID) {
      return {
        ...booking,
        _responseCode: "ALREADY_PAID",
        _responseMessage: "Booking sudah berstatus lunas."
      };
    }

    const updated = this.bookingRepo.updateById(bookingId, {
      paymentStatus: CONFIG.STATUS.PAYMENT.FULL_PAID
    });

    // Buat komisi afiliasi (Status PENDING) jika booking terafiliasi
    if (booking.affiliateId) {
      const pkg = this.packageRepo.findById(booking.packageId);
      if (pkg && Number(pkg.commissionAffiliate) > 0) {
        this.commissionService.createForBooking(booking, pkg.commissionAffiliate);
      }
    }

    return updated;
  }

  /**
   * Pembatalan Booking (Atomic dalam ScriptLock):
   * - PENDING -> CANCELLED: Tidak ada perubahan kuota.
   * - CONFIRMED -> CANCELLED: Mengembalikan kuota (quotaTaken -= paxCount) secara atomik.
   * - CANCELLED -> CANCELLED: INVALID_STATE (tidak mengurangi kuota lagi).
   * - FULL_PAID -> CANCELLED: Ditolak, membutuhkan intervensi admin.
   */
  cancel(bookingId, context) {
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(20000);

      const booking = this.bookingRepo.findById(bookingId);
      if (!booking) throw new AppError("NOT_FOUND", "Booking tidak ditemukan.");

      // Validasi hak pembatalan: Customer pemilik, Travel pemilik, atau Admin
      if (context.role === "CUSTOMER") {
        if (String(booking.customerId) !== String(context.userId)) {
          throw new AppError("FORBIDDEN", "Anda tidak berhak membatalkan booking milik pelanggan lain.");
        }
      } else if (context.role === "TRAVEL") {
        Auth.requireTravelOwnership(context, booking.travelId);
      } else if (context.role !== "ADMIN") {
        throw new AppError("FORBIDDEN", "Anda tidak memiliki akses membatalkan booking ini.");
      }

      if (booking.status === CONFIG.STATUS.BOOKING.CANCELLED) {
        throw new AppError("INVALID_STATE", "Booking sudah dalam status dibatalkan (CANCELLED).");
      }

      if (booking.paymentStatus === CONFIG.STATUS.PAYMENT.FULL_PAID) {
        throw new AppError("INVALID_STATE", "Booking yang sudah lunas tidak dapat dibatalkan secara mandiri. Hubungi Admin.");
      }

      // Jika sebelumnya CONFIRMED, kembalikan kuota keberangkatan
      if (booking.status === CONFIG.STATUS.BOOKING.CONFIRMED) {
        const departure = this.departureRepo.findById(booking.departureId);
        if (departure) {
          const paxCount = Number(booking.paxCount);
          const newQuotaTaken = Math.max(0, Number(departure.quotaTaken) - paxCount);
          this.departureRepo.updateById(departure.id, {
            quotaTaken: newQuotaTaken,
            status: CONFIG.STATUS.DEPARTURE.OPEN
          });
        }
      }

      const updated = this.bookingRepo.updateById(bookingId, {
        status: CONFIG.STATUS.BOOKING.CANCELLED
      });

      Utils.invalidatePublicCache();
      return updated;
    } finally {
      if (lock.hasLock()) lock.releaseLock();
    }
  }

  /**
   * Selesaikan Booking (Role TRAVEL):
   * Hanya diizinkan jika status CONFIRMED dan paymentStatus FULL_PAID.
   */
  complete(bookingId, context) {
    const booking = this.bookingRepo.findById(bookingId);
    if (!booking) throw new AppError("NOT_FOUND", "Booking tidak ditemukan.");

    Auth.requireTravelOwnership(context, booking.travelId);

    if (booking.status !== CONFIG.STATUS.BOOKING.CONFIRMED || booking.paymentStatus !== CONFIG.STATUS.PAYMENT.FULL_PAID) {
      throw new AppError("INVALID_STATE", "Booking hanya dapat diselesaikan jika sudah CONFIRMED dan FULL_PAID.");
    }

    const updated = this.bookingRepo.updateById(bookingId, {
      status: CONFIG.STATUS.BOOKING.COMPLETED
    });

    return updated;
  }
}

// ==============================================================================
// 12. ADMIN SERVICE
// ==============================================================================
class AdminService {
  constructor() {
    this.travelRepo = new SpreadsheetRepository(CONFIG.SHEETS.TRAVELS);
    this.travelService = new TravelService();
    this.bookingRepo = new SpreadsheetRepository(CONFIG.SHEETS.BOOKINGS);
    this.commissionRepo = new SpreadsheetRepository(CONFIG.SHEETS.COMMISSIONS);
    this.payoutRepo = new SpreadsheetRepository(CONFIG.SHEETS.PAYOUTS);
    this.auditRepo = new SpreadsheetRepository(CONFIG.SHEETS.AUDIT_LOGS);
  }

  listTravels() {
    return this.travelRepo.findAll();
  }

  getTravelDetail(travelId) {
    return this.travelService.getAdminDetail(travelId);
  }

  verifyTravel(travelId, isVerified = true) {
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(15000);
      const updated = this.travelRepo.updateById(travelId, {
        isVerified: !!isVerified,
        status: isVerified ? CONFIG.STATUS.TRAVEL.VERIFIED : CONFIG.STATUS.TRAVEL.REJECTED
      });
      if (!updated) throw new AppError("NOT_FOUND", "Travel tidak ditemukan.");

      this.auditRepo.insert({
        actorId: "ADMIN",
        action: "VERIFY_TRAVEL",
        entity: "TRAVELS",
        entityId: travelId,
        payload: JSON.stringify({ isVerified })
      });

      return updated;
    } finally {
      if (lock.hasLock()) lock.releaseLock();
    }
  }

  listBookings() {
    return this.bookingRepo.findAll();
  }

  listCommissions() {
    return this.commissionRepo.findAll();
  }

  payoutMarkPaid(payoutId, proofUrl = "") {
    const payout = this.payoutRepo.findById(payoutId);
    if (!payout) throw new AppError("NOT_FOUND", "Payout tidak ditemukan.");

    const updated = this.payoutRepo.updateById(payoutId, {
      status: CONFIG.STATUS.PAYOUT.PAID,
      proofUrl: proofUrl || payout.proofUrl
    });

    this.auditRepo.insert({
      actorId: "ADMIN",
      action: "PAYOUT_MARK_PAID",
      entity: "PAYOUTS",
      entityId: payoutId,
      payload: JSON.stringify({ proofUrl })
    });

    return updated;
  }
}

// ==============================================================================
// 13. ROUTER.GS (STRICT ACTION MAPPING, AUTH GUARD & DISPATCHER)
// ==============================================================================
class Router {
  constructor() {
    this.travelService = new TravelService();
    this.packageService = new PackageService();
    this.bookingService = new BookingService();
    this.affiliateService = new AffiliateService();
    this.commissionService = new CommissionService();
    this.adminService = new AdminService();
    this.userService = new UserService();
  }

  dispatch(action, params = {}, payload = {}) {
    const body = { ...params, ...payload };
    const sessionToken = payload.sessionToken || params.sessionToken || payload.token || params.token;
    const context = Auth.resolveSession(sessionToken);

    switch (action) {
      // ========================================================================
      // 1. PUBLIC ROUTES (TIDAK BUTUH AUTH)
      // ========================================================================
      case "packages.list":
        return this.packageService.listPublic(body);

      case "packages.detail":
        Utils.validateRequired(body, ["id"]);
        return this.packageService.getDetail(body.id);

      case "travels.list":
        return this.travelService.list(body);

      case "travels.detail":
        Utils.validateRequired(body, ["id"]);
        return this.travelService.getPublicDetail(body.id);

      case "departures.list":
        return this.packageService.listDepartures(body.packageId);

      case "referrals.track":
        return this.affiliateService.trackClick(body);

      // ========================================================================
      // 2. CUSTOMER ROUTES (ROLE: CUSTOMER)
      // ========================================================================
      case "bookings.create":
        Auth.requireRole(context, ["CUSTOMER"]);
        return this.bookingService.create(body, context);

      case "bookings.listCustomer":
        Auth.requireRole(context, ["CUSTOMER"]);
        return this.bookingService.listCustomer(context.userId);

      case "bookings.cancel":
        Auth.requireUser(context);
        Utils.validateRequired(body, ["id"]);
        return this.bookingService.cancel(body.id, context);

      case "reviews.create":
        Auth.requireRole(context, ["CUSTOMER"]);
        return { message: "Review berhasil dibuat (prototype)." };

      // ========================================================================
      // 3. TRAVEL OWNER ROUTES (ROLE: TRAVEL)
      // ========================================================================
      case "travel.packages.list":
        Auth.requireRole(context, ["TRAVEL"]);
        return this.packageService.listTravelPackages(context.travelId);

      case "packages.create":
        Auth.requireRole(context, ["TRAVEL"]);
        if (!context.travelId) throw new AppError("FORBIDDEN", "Akun travel belum terhubung dengan biro resmi.");
        return this.packageService.create(body, context.travelId);

      case "packages.update":
        Auth.requireRole(context, ["TRAVEL"]);
        Utils.validateRequired(body, ["id"]);
        return this.packageService.update(body.id, body, context.travelId);

      case "packages.publish":
        Auth.requireRole(context, ["TRAVEL"]);
        Utils.validateRequired(body, ["id"]);
        return this.packageService.publish(body.id, context.travelId, body.isPublished !== false && body.isPublished !== "false");

      case "departures.create":
        Auth.requireRole(context, ["TRAVEL"]);
        return this.packageService.createDeparture(body, context.travelId);

      case "travels.update":
        Auth.requireRole(context, ["TRAVEL"]);
        Utils.validateRequired(body, ["id"]);
        return this.travelService.update(body.id, body, context);

      case "bookings.listTravel":
        Auth.requireRole(context, ["TRAVEL"]);
        return this.bookingService.listTravel(context.travelId);

      case "bookings.confirm":
        Auth.requireRole(context, ["TRAVEL"]);
        Utils.validateRequired(body, ["id"]);
        return this.bookingService.confirm(body.id, context);

      case "bookings.markPaid":
        Auth.requireRole(context, ["TRAVEL"]);
        Utils.validateRequired(body, ["id"]);
        return this.bookingService.markPaid(body.id, context);

      case "bookings.complete":
        Auth.requireRole(context, ["TRAVEL"]);
        Utils.validateRequired(body, ["id"]);
        return this.bookingService.complete(body.id, context);

      // ========================================================================
      // 4. AFFILIATE ROUTES (ROLE: AFFILIATE)
      // ========================================================================
      case "affiliates.register":
        return this.affiliateService.register(body);

      case "affiliates.listPackages":
        Auth.requireRole(context, ["AFFILIATE"]);
        return this.affiliateService.listMarketplacePackages();

      case "referrals.create":
        Auth.requireRole(context, ["AFFILIATE"]);
        return {
          affiliateId: context.affiliateId,
          referralCode: context.referralCode,
          referralLink: `https://umrohpedia.my.id/?ref=${context.referralCode}&packageId=${body.packageId || ""}`
        };

      case "commissions.list":
        Auth.requireRole(context, ["AFFILIATE"]);
        return this.commissionService.list({ affiliateId: context.affiliateId });

      case "payouts.create":
        Auth.requireRole(context, ["AFFILIATE"]);
        return { message: "Permintaan penarikan komisi diajukan." };

      case "payouts.list":
        Auth.requireRole(context, ["AFFILIATE"]);
        return [];

      // ========================================================================
      // 5. PLATFORM ADMIN ROUTES (ROLE: ADMIN)
      // ========================================================================
      case "admin.travels":
        Auth.requireRole(context, ["ADMIN"]);
        return this.adminService.listTravels();

      case "admin.travelDetail":
        Auth.requireRole(context, ["ADMIN"]);
        Utils.validateRequired(body, ["travelId"]);
        return this.adminService.getTravelDetail(body.travelId);

      case "admin.verifyTravel":
        Auth.requireRole(context, ["ADMIN"]);
        Utils.validateRequired(body, ["travelId"]);
        return this.adminService.verifyTravel(body.travelId, body.isVerified !== false && body.isVerified !== "false");

      case "admin.bookings":
        Auth.requireRole(context, ["ADMIN"]);
        return this.adminService.listBookings();

      case "admin.commissions":
        Auth.requireRole(context, ["ADMIN"]);
        return this.adminService.listCommissions();

      case "commissions.approve":
        Auth.requireRole(context, ["ADMIN"]);
        Utils.validateRequired(body, ["id"]);
        return this.commissionService.approve(body.id);

      case "admin.payoutMarkPaid":
        Auth.requireRole(context, ["ADMIN"]);
        Utils.validateRequired(body, ["payoutId"]);
        return this.adminService.payoutMarkPaid(body.payoutId, body.proofUrl);

      case "admin.dashboard":
        Auth.requireRole(context, ["ADMIN"]);
        return {
          travelsTotal: this.adminService.listTravels().length,
          bookingsTotal: this.adminService.listBookings().length,
          commissionsTotal: this.adminService.listCommissions().length
        };

      case "admin.seedDemoData":
        Auth.requireRole(context, ["ADMIN"]);
        return seedFullDemoData();

      case "admin.datasetSummary":
        Auth.requireRole(context, ["ADMIN"]);
        return getDemoDatasetSummary();

      default:
        throw new AppError("ACTION_NOT_FOUND", `Aksi API '${action}' tidak dikenali.`);
    }
  }
}

// ==============================================================================
// 14. CODE.GS (ENTRY GATEWAY & DATABASE SETUP)
// ==============================================================================
const router = new Router();

/**
 * GATEWAY HTTP GET
 * Menangani permintaan baca data (Read API) dari Frontend
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const action = params.action || "packages.list";
    
    const data = router.dispatch(action, params, {});
    return Utils.createResponse(true, data, "Request berhasil diproses.", "OK");
  } catch (err) {
    const code = err.code || "BAD_REQUEST";
    return Utils.createResponse(false, null, err.message, code);
  }
}

/**
 * GATEWAY HTTP POST
 * Menangani permintaan tulis data (Create/Update/Delete API) dari Frontend
 */
function doPost(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        payload = {};
      }
    }
    const action = params.action || payload.action;
    if (!action) throw new AppError("VALIDATION_ERROR", "Parameter 'action' wajib disertakan.");

    const data = router.dispatch(action, params, payload);
    return Utils.createResponse(true, data, "Aksi berhasil dieksekusi.", "OK");
  } catch (err) {
    const code = err.code || "EXECUTION_ERROR";
    return Utils.createResponse(false, null, err.message, code);
  }
}

/**
 * Inisialisasi Database Spreadsheet & Seeding Data Awal (Idempoten & Non-Destructive)
 * TIDAK menghapus atau menimpa data existing di spreadsheet.
 */
function setupDatabase() {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      throw new AppError("CONFIGURATION_ERROR", "Jalankan setupDatabase() dari Apps Script yang terikat ke Google Spreadsheet.");
    }

    PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", ss.getId());

    // 1. Buat sheet dan header jika belum ada
    for (const [sheetKey, headers] of Object.entries(CONFIG.SCHEMAS)) {
      let sheet = ss.getSheetByName(sheetKey);
      if (!sheet) {
        sheet = ss.insertSheet(sheetKey);
      }
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(headers);
        sheet.setFrozenRows(1);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#ecfdf5");
      }
    }

    // 2. Seeding Full Demo Dataset (Idempoten & Non-Destructive)
    const summary = seedFullDemoData(false);

    SpreadsheetApp.flush();
    return { success: true, message: "Database UmrohHub berhasil disiapkan secara idempoten.", data: summary };
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

// ==============================================================================
// 15. SEEDER V2 — FULL DEMO DATASET
// ==============================================================================

/**
 * Helper idempoten: insert record hanya jika ID belum ada di database.
 * Non-destructive: tidak pernah menghapus atau menimpa row existing.
 */
function seedIfMissing_(sheetName, record) {
  const repo = new SpreadsheetRepository(sheetName);
  const existing = repo.findById(record.id);
  if (existing) {
    return existing;
  }
  return repo.insert(record);
}

/**
 * 15 Users: 2 ADMIN, 4 TRAVEL, 3 AFFILIATE, 6 CUSTOMER (+ 4 Legacy Users Preserved)
 */
function seedUsers_() {
  const users = [
    // 2 ADMINS
    { id: "USR-DEMO-ADMIN-01", email: "admin@umrohhub.id", fullName: "Super Admin UmrohHub", phoneNumber: "08110001001", role: "ADMIN", status: "ACTIVE" },
    { id: "USR-DEMO-ADMIN-02", email: "verifikator@umrohhub.id", fullName: "Admin Verifikasi Kemenag", phoneNumber: "08110001002", role: "ADMIN", status: "ACTIVE" },
    
    // 4 TRAVEL OWNERS
    { id: "USR-DEMO-TRAVEL-01", email: "fadli@alfalahtour.id", fullName: "H. Ahmad Fadli", phoneNumber: "08120002001", role: "TRAVEL", status: "ACTIVE" },
    { id: "USR-DEMO-TRAVEL-02", email: "rahmah@barokahumroh.id", fullName: "Hj. Siti Rahmah", phoneNumber: "08120002002", role: "TRAVEL", status: "ACTIVE" },
    { id: "USR-DEMO-TRAVEL-03", email: "yusuf@safamarwah.id", fullName: "H. Muhammad Yusuf", phoneNumber: "08120002003", role: "TRAVEL", status: "ACTIVE" },
    { id: "USR-DEMO-TRAVEL-04", email: "aisyah@madinahjourney.id", fullName: "Hj. Nur Aisyah", phoneNumber: "08120002004", role: "TRAVEL", status: "ACTIVE" },

    // 3 AFFILIATES
    { id: "USR-DEMO-AFF-01", email: "abdullah@mitra-umroh.id", fullName: "Ustadz Abdullah", phoneNumber: "08130003001", role: "AFFILIATE", status: "ACTIVE" },
    { id: "USR-DEMO-AFF-02", email: "hijrah@mitra-umroh.id", fullName: "Komunitas Hijrah Muslimah", phoneNumber: "08130003002", role: "AFFILIATE", status: "ACTIVE" },
    { id: "USR-DEMO-AFF-03", email: "sahabat@mitra-umroh.id", fullName: "Sahabat Umroh Barokah", phoneNumber: "08130003003", role: "AFFILIATE", status: "ACTIVE" },

    // 6 CUSTOMERS
    { id: "USR-DEMO-CUST-01", email: "fauzi@jamaah.id", fullName: "Ahmad Fauzi", phoneNumber: "08140004001", role: "CUSTOMER", status: "ACTIVE" },
    { id: "USR-DEMO-CUST-02", email: "aminah@jamaah.id", fullName: "Siti Aminah", phoneNumber: "08140004002", role: "CUSTOMER", status: "ACTIVE" },
    { id: "USR-DEMO-CUST-03", email: "budi@jamaah.id", fullName: "Budi Santoso", phoneNumber: "08140004003", role: "CUSTOMER", status: "ACTIVE" },
    { id: "USR-DEMO-CUST-04", email: "nurhayati@jamaah.id", fullName: "Nurhayati", phoneNumber: "08140004004", role: "CUSTOMER", status: "ACTIVE" },
    { id: "USR-DEMO-CUST-05", email: "rahmat@jamaah.id", fullName: "Rahmat Hidayat", phoneNumber: "08140004005", role: "CUSTOMER", status: "ACTIVE" },
    { id: "USR-DEMO-CUST-06", email: "dewi@jamaah.id", fullName: "Dewi Lestari", phoneNumber: "08140004006", role: "CUSTOMER", status: "ACTIVE" },

    // Existing Legacy Users Preserved
    { id: "USR-ADMIN-01", email: "admin-legacy@umrohhub.id", fullName: "Super Admin Platform (Legacy)", phoneNumber: "081100001", role: "ADMIN", status: "ACTIVE" },
    { id: "USR-TRV-01", email: "alfalah-legacy@travel.id", fullName: "Al-Falah Travel Admin (Legacy)", phoneNumber: "081100002", role: "TRAVEL", status: "ACTIVE" },
    { id: "USR-AFF-01", email: "abdullah-legacy@affiliate.id", fullName: "Ustadz Abdullah (Legacy)", phoneNumber: "081100003", role: "AFFILIATE", status: "ACTIVE" },
    { id: "USR-CUST-01", email: "fauzi-legacy@jamaah.id", fullName: "Ahmad Fauzi (Legacy)", phoneNumber: "081100004", role: "CUSTOMER", status: "ACTIVE" }
  ];

  for (const u of users) {
    seedIfMissing_(CONFIG.SHEETS.USERS, u);
  }
}

/**
 * 6 Travels: 3 VERIFIED, 1 PENDING, 1 REJECTED, 1 SUSPENDED
 */
function seedTravels_() {
  const travels = [
    { id: "TRV-DEMO-001", ownerUserId: "USR-DEMO-TRAVEL-01", name: "Al-Falah Tour & Travel", skKemenag: "PPIU-DEMO-001/2026", city: "Jakarta Selatan", address: "Jl. TB Simatupang No. 88, Jakarta Selatan", rating: 4.9, isVerified: true, status: "VERIFIED" },
    { id: "TRV-DEMO-002", ownerUserId: "USR-DEMO-TRAVEL-02", name: "Barokah Umroh Indonesia", skKemenag: "PPIU-DEMO-002/2026", city: "Surabaya", address: "Jl. Manyar Kertoarjo No. 15, Surabaya", rating: 4.8, isVerified: true, status: "VERIFIED" },
    { id: "TRV-DEMO-003", ownerUserId: "USR-DEMO-TRAVEL-03", name: "Safa Marwah Travel", skKemenag: "PPIU-DEMO-003/2026", city: "Makassar", address: "Jl. Urip Sumoharjo No. 42, Makassar", rating: 4.7, isVerified: true, status: "VERIFIED" },
    { id: "TRV-DEMO-004", ownerUserId: "USR-DEMO-TRAVEL-04", name: "Madinah Journey Mandiri", skKemenag: "PPIU-DEMO-004/2026", city: "Bandung", address: "Jl. Buah Batu No. 102, Bandung", rating: 5.0, isVerified: false, status: "PENDING" },
    { id: "TRV-DEMO-005", ownerUserId: "USR-DEMO-TRAVEL-01", name: "Nusantara Haji Umroh", skKemenag: "PPIU-DEMO-005/2026", city: "Medan", address: "Jl. Gatot Subroto No. 55, Medan", rating: 3.5, isVerified: false, status: "REJECTED" },
    { id: "TRV-DEMO-006", ownerUserId: "USR-DEMO-TRAVEL-02", name: "Amanah Haramain Utama", skKemenag: "PPIU-DEMO-006/2026", city: "Semarang", address: "Jl. Pandanaran No. 18, Semarang", rating: 4.0, isVerified: false, status: "SUSPENDED" }
  ];

  for (const t of travels) {
    seedIfMissing_(CONFIG.SHEETS.TRAVELS, t);
  }
}

/**
 * 18 Travel Documents (3 per travel: SK_KEMENAG, NIB, NPWP / AKTA)
 */
function seedTravelDocuments_() {
  const docs = [
    // Al-Falah (VERIFIED)
    { id: "DOC-DEMO-001", travelId: "TRV-DEMO-001", docType: "SK_KEMENAG", docNumber: "PPIU-DEMO-001/2026", fileUrl: "https://example.com/demo/documents/doc-001.pdf", verifiedStatus: "VERIFIED" },
    { id: "DOC-DEMO-002", travelId: "TRV-DEMO-001", docType: "NIB", docNumber: "NIB-9120001", fileUrl: "https://example.com/demo/documents/doc-002.pdf", verifiedStatus: "VERIFIED" },
    { id: "DOC-DEMO-003", travelId: "TRV-DEMO-001", docType: "NPWP", docNumber: "01.234.567.8-001.000", fileUrl: "https://example.com/demo/documents/doc-003.pdf", verifiedStatus: "VERIFIED" },

    // Barokah (VERIFIED)
    { id: "DOC-DEMO-004", travelId: "TRV-DEMO-002", docType: "SK_KEMENAG", docNumber: "PPIU-DEMO-002/2026", fileUrl: "https://example.com/demo/documents/doc-004.pdf", verifiedStatus: "VERIFIED" },
    { id: "DOC-DEMO-005", travelId: "TRV-DEMO-002", docType: "NIB", docNumber: "NIB-9120002", fileUrl: "https://example.com/demo/documents/doc-005.pdf", verifiedStatus: "VERIFIED" },
    { id: "DOC-DEMO-006", travelId: "TRV-DEMO-002", docType: "AKTA", docNumber: "AHU-00123.AH.01.01", fileUrl: "https://example.com/demo/documents/doc-006.pdf", verifiedStatus: "VERIFIED" },

    // Safa Marwah (VERIFIED)
    { id: "DOC-DEMO-007", travelId: "TRV-DEMO-003", docType: "SK_KEMENAG", docNumber: "PPIU-DEMO-003/2026", fileUrl: "https://example.com/demo/documents/doc-007.pdf", verifiedStatus: "VERIFIED" },
    { id: "DOC-DEMO-008", travelId: "TRV-DEMO-003", docType: "NIB", docNumber: "NIB-9120003", fileUrl: "https://example.com/demo/documents/doc-008.pdf", verifiedStatus: "VERIFIED" },
    { id: "DOC-DEMO-009", travelId: "TRV-DEMO-003", docType: "NPWP", docNumber: "01.234.567.8-003.000", fileUrl: "https://example.com/demo/documents/doc-009.pdf", verifiedStatus: "VERIFIED" },

    // Madinah Journey (PENDING)
    { id: "DOC-DEMO-010", travelId: "TRV-DEMO-004", docType: "SK_KEMENAG", docNumber: "PPIU-DEMO-004/2026", fileUrl: "https://example.com/demo/documents/doc-010.pdf", verifiedStatus: "PENDING" },
    { id: "DOC-DEMO-011", travelId: "TRV-DEMO-004", docType: "NIB", docNumber: "NIB-9120004", fileUrl: "https://example.com/demo/documents/doc-011.pdf", verifiedStatus: "PENDING" },
    { id: "DOC-DEMO-012", travelId: "TRV-DEMO-004", docType: "AKTA", docNumber: "AHU-00456.AH.01.01", fileUrl: "https://example.com/demo/documents/doc-012.pdf", verifiedStatus: "PENDING" },

    // Nusantara (REJECTED)
    { id: "DOC-DEMO-013", travelId: "TRV-DEMO-005", docType: "SK_KEMENAG", docNumber: "PPIU-DEMO-005/2026", fileUrl: "https://example.com/demo/documents/doc-013.pdf", verifiedStatus: "REJECTED" },
    { id: "DOC-DEMO-014", travelId: "TRV-DEMO-005", docType: "NIB", docNumber: "NIB-9120005", fileUrl: "https://example.com/demo/documents/doc-014.pdf", verifiedStatus: "REJECTED" },
    { id: "DOC-DEMO-015", travelId: "TRV-DEMO-005", docType: "NPWP", docNumber: "01.234.567.8-005.000", fileUrl: "https://example.com/demo/documents/doc-015.pdf", verifiedStatus: "REJECTED" },

    // Amanah (SUSPENDED)
    { id: "DOC-DEMO-016", travelId: "TRV-DEMO-006", docType: "SK_KEMENAG", docNumber: "PPIU-DEMO-006/2026", fileUrl: "https://example.com/demo/documents/doc-016.pdf", verifiedStatus: "REJECTED" },
    { id: "DOC-DEMO-017", travelId: "TRV-DEMO-006", docType: "NIB", docNumber: "NIB-9120006", fileUrl: "https://example.com/demo/documents/doc-017.pdf", verifiedStatus: "REJECTED" },
    { id: "DOC-DEMO-018", travelId: "TRV-DEMO-006", docType: "NPWP", docNumber: "01.234.567.8-006.000", fileUrl: "https://example.com/demo/documents/doc-018.pdf", verifiedStatus: "REJECTED" }
  ];

  for (const d of docs) {
    seedIfMissing_(CONFIG.SHEETS.TRAVEL_DOCUMENTS, d);
  }
}

/**
 * 18 Packages: 14 Published, 4 Draft (Reguler, VIP, Plus Turki, Plus Dubai, Ramadhan)
 */
function seedPackages_() {
  const packages = [
    // 6 REGULER (5 Published, 1 Draft)
    { id: "PKG-DEMO-001", travelId: "TRV-DEMO-001", title: "Umroh Reguler Syawal Berkah 9 Hari", category: "Reguler", price: 28500000, durationDays: 9, airline: "Saudia Airlines", hotelMakkah: "Pullman Zamzam (★5)", hotelMadinah: "Rove Madinah (★4)", commissionAffiliate: 750000, isPublished: true },
    { id: "PKG-DEMO-002", travelId: "TRV-DEMO-001", title: "Umroh Hemat Awal Musim 9 Hari", category: "Reguler", price: 27500000, durationDays: 9, airline: "Oman Air", hotelMakkah: "Anjum Hotel (★5)", hotelMadinah: "Grand Plaza (★4)", commissionAffiliate: 750000, isPublished: true },
    { id: "PKG-DEMO-003", travelId: "TRV-DEMO-002", title: "Umroh Barokah Reguler 10 Hari", category: "Reguler", price: 29800000, durationDays: 10, airline: "Garuda Indonesia", hotelMakkah: "Movenpick Hajar (★5)", hotelMadinah: "Al Aqeeq (★5)", commissionAffiliate: 800000, isPublished: true },
    { id: "PKG-DEMO-004", travelId: "TRV-DEMO-002", title: "Umroh Nyaman Surabaya Direct 9 Hari", category: "Reguler", price: 28900000, durationDays: 9, airline: "Saudia Airlines", hotelMakkah: "Swissotel Al Maqam (★5)", hotelMadinah: "Saja Al Madinah (★4)", commissionAffiliate: 750000, isPublished: true },
    { id: "PKG-DEMO-005", travelId: "TRV-DEMO-003", title: "Umroh Ukhuwah Makassar 10 Hari", category: "Reguler", price: 30500000, durationDays: 10, airline: "Garuda Indonesia", hotelMakkah: "Hilton Convention (★5)", hotelMadinah: "Diyar Al Taqwa (★4)", commissionAffiliate: 850000, isPublished: true },
    { id: "PKG-DEMO-006", travelId: "TRV-DEMO-001", title: "Umroh Reguler Akhir Tahun 9 Hari (Draft)", category: "Reguler", price: 29000000, durationDays: 9, airline: "Saudia Airlines", hotelMakkah: "Pullman Zamzam (★5)", hotelMadinah: "Rove Madinah (★4)", commissionAffiliate: 750000, isPublished: false },

    // 4 VIP (3 Published, 1 Draft)
    { id: "PKG-DEMO-007", travelId: "TRV-DEMO-001", title: "Umroh VIP Eksklusif Dar Al Tawhid 10 Hari", category: "VIP", price: 46500000, durationDays: 10, airline: "Garuda Indonesia (Business Class)", hotelMakkah: "Dar Al Tawhid (★5 Depan Ka'bah)", hotelMadinah: "The Oberoi (★5)", commissionAffiliate: 1500000, isPublished: true },
    { id: "PKG-DEMO-008", travelId: "TRV-DEMO-002", title: "Umroh VIP Royal Clock Tower 12 Hari", category: "VIP", price: 48900000, durationDays: 12, airline: "Saudia Airlines", hotelMakkah: "Fairmont Clock Tower (★5)", hotelMadinah: "Dar Al Taqwa (★5)", commissionAffiliate: 1500000, isPublished: true },
    { id: "PKG-DEMO-009", travelId: "TRV-DEMO-003", title: "Umroh Sultan Platinum Makassar 10 Hari", category: "VIP", price: 47500000, durationDays: 10, airline: "Qatar Airways", hotelMakkah: "Raffles Makkah Palace (★5)", hotelMadinah: "Madinah Hilton (★5)", commissionAffiliate: 1400000, isPublished: true },
    { id: "PKG-DEMO-010", travelId: "TRV-DEMO-002", title: "Umroh VIP Private Family Suite (Draft)", category: "VIP", price: 52500000, durationDays: 12, airline: "Emirates", hotelMakkah: "Raffles Makkah (★5)", hotelMadinah: "The Oberoi (★5)", commissionAffiliate: 1500000, isPublished: false },

    // 3 PLUS TURKI (2 Published, 1 Draft)
    { id: "PKG-DEMO-011", travelId: "TRV-DEMO-001", title: "Umroh Plus Wisata Sejarah Turki 12 Hari", category: "Plus Turki", price: 38500000, durationDays: 12, airline: "Turkish Airlines", hotelMakkah: "Swissotel Al Maqam (★5)", hotelMadinah: "Rove Madinah (★4)", commissionAffiliate: 1000000, isPublished: true },
    { id: "PKG-DEMO-012", travelId: "TRV-DEMO-002", title: "Umroh Plus Cappadocia & Istanbul 14 Hari", category: "Plus Turki", price: 42000000, durationDays: 14, airline: "Turkish Airlines", hotelMakkah: "Movenpick Hajar (★5)", hotelMadinah: "Al Aqeeq (★5)", commissionAffiliate: 1200000, isPublished: true },
    { id: "PKG-DEMO-013", travelId: "TRV-DEMO-003", title: "Umroh Jelajah Utsmani Autumn (Draft)", category: "Plus Turki", price: 39500000, durationDays: 12, airline: "Turkish Airlines", hotelMakkah: "Hilton Convention (★5)", hotelMadinah: "Saja Al Madinah (★4)", commissionAffiliate: 1000000, isPublished: false },

    // 3 PLUS DUBAI (2 Published, 1 Draft)
    { id: "PKG-DEMO-014", travelId: "TRV-DEMO-001", title: "Umroh Plus City Tour Dubai Modern 12 Hari", category: "Plus Dubai", price: 37500000, durationDays: 12, airline: "Emirates", hotelMakkah: "Pullman Zamzam (★5)", hotelMadinah: "Rove Madinah (★4)", commissionAffiliate: 1000000, isPublished: true },
    { id: "PKG-DEMO-015", travelId: "TRV-DEMO-003", title: "Umroh Plus Safari Desert Dubai 12 Hari", category: "Plus Dubai", price: 38900000, durationDays: 12, airline: "Emirates", hotelMakkah: "Hilton Suites (★5)", hotelMadinah: "Al Aqeeq (★5)", commissionAffiliate: 1000000, isPublished: true },
    { id: "PKG-DEMO-016", travelId: "TRV-DEMO-002", title: "Umroh Plus Abu Dhabi & Dubai Grand (Draft)", category: "Plus Dubai", price: 41000000, durationDays: 12, airline: "Emirates", hotelMakkah: "Swissotel (★5)", hotelMadinah: "Dar Al Taqwa (★5)", commissionAffiliate: 1100000, isPublished: false },

    // 2 RAMADHAN (2 Published)
    { id: "PKG-DEMO-017", travelId: "TRV-DEMO-001", title: "Umroh Awal Ramadhan Syahdu 12 Hari", category: "Ramadhan", price: 36500000, durationDays: 12, airline: "Saudia Airlines", hotelMakkah: "Pullman Zamzam (★5)", hotelMadinah: "Rove Madinah (★4)", commissionAffiliate: 1000000, isPublished: true },
    { id: "PKG-DEMO-018", travelId: "TRV-DEMO-002", title: "Umroh Lailatul Qadar Akhir Ramadhan 16 Hari", category: "Ramadhan", price: 51500000, durationDays: 16, airline: "Garuda Indonesia", hotelMakkah: "Fairmont Clock Tower (★5)", hotelMadinah: "The Oberoi (★5)", commissionAffiliate: 1500000, isPublished: true }
  ];

  for (const p of packages) {
    seedIfMissing_(CONFIG.SHEETS.PACKAGES, p);
  }
}

/**
 * 30 Departures: Sept 2026 - April 2027 (Jakarta, Surabaya, Makassar, Medan, Solo)
 * Status: OPEN, FULL, COMPLETED
 */
function seedDepartures_() {
  const departures = [
    // PKG 1
    { id: "DEP-DEMO-001", packageId: "PKG-DEMO-001", departureDate: "2026-09-15", returnDate: "2026-09-24", departureCity: "Jakarta (CGK)", quotaTotal: 45, quotaTaken: 4, status: "OPEN" },
    { id: "DEP-DEMO-002", packageId: "PKG-DEMO-001", departureDate: "2026-10-10", returnDate: "2026-10-19", departureCity: "Jakarta (CGK)", quotaTotal: 45, quotaTaken: 5, status: "OPEN" },
    { id: "DEP-DEMO-003", packageId: "PKG-DEMO-001", departureDate: "2026-11-05", returnDate: "2026-11-14", departureCity: "Surabaya (SUB)", quotaTotal: 40, quotaTaken: 4, status: "OPEN" },
    
    // PKG 2
    { id: "DEP-DEMO-004", packageId: "PKG-DEMO-002", departureDate: "2026-09-20", returnDate: "2026-09-29", departureCity: "Jakarta (CGK)", quotaTotal: 40, quotaTaken: 3, status: "OPEN" },
    { id: "DEP-DEMO-005", packageId: "PKG-DEMO-002", departureDate: "2026-10-25", returnDate: "2026-11-03", departureCity: "Solo (SOC)", quotaTotal: 35, quotaTaken: 2, status: "OPEN" },

    // PKG 3
    { id: "DEP-DEMO-006", packageId: "PKG-DEMO-003", departureDate: "2026-09-18", returnDate: "2026-09-28", departureCity: "Surabaya (SUB)", quotaTotal: 45, quotaTaken: 4, status: "OPEN" },
    { id: "DEP-DEMO-007", packageId: "PKG-DEMO-003", departureDate: "2026-11-12", returnDate: "2026-11-22", departureCity: "Jakarta (CGK)", quotaTotal: 45, quotaTaken: 3, status: "OPEN" },

    // PKG 4
    { id: "DEP-DEMO-008", packageId: "PKG-DEMO-004", departureDate: "2026-10-08", returnDate: "2026-10-17", departureCity: "Surabaya (SUB)", quotaTotal: 40, quotaTaken: 4, status: "OPEN" },
    { id: "DEP-DEMO-009", packageId: "PKG-DEMO-004", departureDate: "2026-12-05", returnDate: "2026-12-14", departureCity: "Surabaya (SUB)", quotaTotal: 40, quotaTaken: 2, status: "OPEN" },

    // PKG 5
    { id: "DEP-DEMO-010", packageId: "PKG-DEMO-005", departureDate: "2026-10-15", returnDate: "2026-10-25", departureCity: "Makassar (UPG)", quotaTotal: 45, quotaTaken: 4, status: "OPEN" },
    { id: "DEP-DEMO-011", packageId: "PKG-DEMO-005", departureDate: "2026-12-20", returnDate: "2026-12-30", departureCity: "Makassar (UPG)", quotaTotal: 45, quotaTaken: 3, status: "OPEN" },

    // PKG 7 (VIP)
    { id: "DEP-DEMO-012", packageId: "PKG-DEMO-007", departureDate: "2026-10-01", returnDate: "2026-10-11", departureCity: "Jakarta (CGK)", quotaTotal: 25, quotaTaken: 3, status: "OPEN" },
    { id: "DEP-DEMO-013", packageId: "PKG-DEMO-007", departureDate: "2026-11-15", returnDate: "2026-11-25", departureCity: "Jakarta (CGK)", quotaTotal: 25, quotaTaken: 2, status: "OPEN" },

    // PKG 8 (VIP)
    { id: "DEP-DEMO-014", packageId: "PKG-DEMO-008", departureDate: "2026-10-20", returnDate: "2026-11-01", departureCity: "Surabaya (SUB)", quotaTotal: 30, quotaTaken: 3, status: "OPEN" },
    { id: "DEP-DEMO-015", packageId: "PKG-DEMO-008", departureDate: "2026-12-18", returnDate: "2026-12-30", departureCity: "Jakarta (CGK)", quotaTotal: 30, quotaTaken: 2, status: "OPEN" },

    // PKG 9 (VIP)
    { id: "DEP-DEMO-016", packageId: "PKG-DEMO-009", departureDate: "2026-11-08", returnDate: "2026-11-18", departureCity: "Makassar (UPG)", quotaTotal: 25, quotaTaken: 2, status: "OPEN" },

    // PKG 11 (Plus Turki)
    { id: "DEP-DEMO-017", packageId: "PKG-DEMO-011", departureDate: "2026-10-12", returnDate: "2026-10-24", departureCity: "Jakarta (CGK)", quotaTotal: 35, quotaTaken: 3, status: "OPEN" },
    { id: "DEP-DEMO-018", packageId: "PKG-DEMO-011", departureDate: "2026-11-20", returnDate: "2026-12-02", departureCity: "Jakarta (CGK)", quotaTotal: 35, quotaTaken: 35, status: "FULL" },

    // PKG 12 (Plus Turki)
    { id: "DEP-DEMO-019", packageId: "PKG-DEMO-012", departureDate: "2026-11-10", returnDate: "2026-11-24", departureCity: "Surabaya (SUB)", quotaTotal: 30, quotaTaken: 2, status: "OPEN" },
    { id: "DEP-DEMO-020", packageId: "PKG-DEMO-012", departureDate: "2026-12-15", returnDate: "2026-12-29", departureCity: "Jakarta (CGK)", quotaTotal: 30, quotaTaken: 0, status: "OPEN" },

    // PKG 14 (Plus Dubai)
    { id: "DEP-DEMO-021", packageId: "PKG-DEMO-014", departureDate: "2026-10-28", returnDate: "2026-11-09", departureCity: "Jakarta (CGK)", quotaTotal: 35, quotaTaken: 2, status: "OPEN" },
    { id: "DEP-DEMO-022", packageId: "PKG-DEMO-014", departureDate: "2026-12-22", returnDate: "2027-01-03", departureCity: "Jakarta (CGK)", quotaTotal: 35, quotaTaken: 0, status: "OPEN" },

    // PKG 15 (Plus Dubai)
    { id: "DEP-DEMO-023", packageId: "PKG-DEMO-015", departureDate: "2026-11-25", returnDate: "2026-12-07", departureCity: "Makassar (UPG)", quotaTotal: 30, quotaTaken: 2, status: "OPEN" },

    // PKG 17 (Ramadhan)
    { id: "DEP-DEMO-024", packageId: "PKG-DEMO-017", departureDate: "2027-03-01", returnDate: "2027-03-13", departureCity: "Jakarta (CGK)", quotaTotal: 45, quotaTaken: 0, status: "OPEN" },
    { id: "DEP-DEMO-025", packageId: "PKG-DEMO-017", departureDate: "2027-03-05", returnDate: "2027-03-17", departureCity: "Surabaya (SUB)", quotaTotal: 40, quotaTaken: 0, status: "OPEN" },

    // PKG 18 (Ramadhan)
    { id: "DEP-DEMO-026", packageId: "PKG-DEMO-018", departureDate: "2027-03-15", returnDate: "2027-03-31", departureCity: "Jakarta (CGK)", quotaTotal: 40, quotaTaken: 0, status: "OPEN" },
    { id: "DEP-DEMO-027", packageId: "PKG-DEMO-018", departureDate: "2027-03-18", returnDate: "2027-04-03", departureCity: "Medan (KNO)", quotaTotal: 35, quotaTaken: 0, status: "OPEN" },

    // Past completed departures
    { id: "DEP-DEMO-028", packageId: "PKG-DEMO-001", departureDate: "2026-07-10", returnDate: "2026-07-19", departureCity: "Jakarta (CGK)", quotaTotal: 45, quotaTaken: 45, status: "COMPLETED" },
    { id: "DEP-DEMO-029", packageId: "PKG-DEMO-003", departureDate: "2026-07-20", returnDate: "2026-07-30", departureCity: "Surabaya (SUB)", quotaTotal: 40, quotaTaken: 40, status: "COMPLETED" },
    { id: "DEP-DEMO-030", packageId: "PKG-DEMO-007", departureDate: "2026-08-01", returnDate: "2026-08-11", departureCity: "Jakarta (CGK)", quotaTotal: 25, quotaTaken: 25, status: "COMPLETED" }
  ];

  for (const d of departures) {
    seedIfMissing_(CONFIG.SHEETS.DEPARTURES, d);
  }
}

/**
 * 5 Affiliates: 3 ACTIVE, 1 PENDING, 1 SUSPENDED
 */
function seedAffiliates_() {
  const affiliates = [
    { id: "AFF-DEMO-001", userId: "USR-DEMO-AFF-01", referralCode: "USTADZ", bankName: "Bank Syariah Indonesia (BSI)", bankAccount: "DEMO-7100001", bankHolder: "Ustadz Abdullah", status: "ACTIVE" },
    { id: "AFF-DEMO-002", userId: "USR-DEMO-AFF-02", referralCode: "HIJRAH", bankName: "Bank Muamalat Indonesia", bankAccount: "DEMO-7200002", bankHolder: "Hijrah Muslimah Foundation", status: "ACTIVE" },
    { id: "AFF-DEMO-003", userId: "USR-DEMO-AFF-03", referralCode: "SAHABAT", bankName: "BCA Syariah", bankAccount: "DEMO-7300003", bankHolder: "Sahabat Umroh Barokah", status: "ACTIVE" },
    { id: "AFF-DEMO-004", userId: "USR-DEMO-CUST-04", referralCode: "BERKAH", bankName: "Bank Syariah Indonesia (BSI)", bankAccount: "DEMO-7400004", bankHolder: "Nurhayati", status: "PENDING" },
    { id: "AFF-DEMO-005", userId: "USR-DEMO-CUST-05", referralCode: "UMROH2026", bankName: "Bank Mega Syariah", bankAccount: "DEMO-7500005", bankHolder: "Rahmat Hidayat", status: "SUSPENDED" }
  ];

  for (const a of affiliates) {
    seedIfMissing_(CONFIG.SHEETS.AFFILIATES, a);
  }
}

/**
 * 40 Referral Clicks from ACTIVE affiliates
 */
function seedReferralClicks_() {
  const clicks = [];
  const activeAffs = ["AFF-DEMO-001", "AFF-DEMO-002", "AFF-DEMO-003"];
  const pubPackages = ["PKG-DEMO-001", "PKG-DEMO-002", "PKG-DEMO-003", "PKG-DEMO-004", "PKG-DEMO-007", "PKG-DEMO-011", "PKG-DEMO-014"];

  for (let i = 1; i <= 40; i++) {
    const padded = String(i).padStart(3, '0');
    const affId = activeAffs[i % activeAffs.length];
    const pkgId = pubPackages[i % pubPackages.length];
    clicks.push({
      id: "CLK-DEMO-" + padded,
      affiliateId: affId,
      packageId: pkgId,
      ipHash: "hash-demo-ip-" + padded,
      userAgent: "Mozilla/5.0 (DemoVisitor " + padded + ") AppleWebKit/537.36 Chrome/128.0",
      createdAt: "2026-08-" + String((i % 28) + 1).padStart(2, '0') + "T08:30:00.000Z"
    });
  }

  for (const c of clicks) {
    seedIfMissing_(CONFIG.SHEETS.REFERRAL_CLICKS, c);
  }
}

/**
 * 15 Attributions: 10 Active, 3 Expired, 2 Converted
 */
function seedAttributions_() {
  const attributions = [
    // 10 ACTIVE
    { id: "ATR-DEMO-001", visitorKey: "VISITOR-DEMO-001", affiliateId: "AFF-DEMO-001", packageId: "PKG-DEMO-001", expiresAt: "2026-10-01T00:00:00.000Z", createdAt: "2026-09-01T00:00:00.000Z" },
    { id: "ATR-DEMO-002", visitorKey: "VISITOR-DEMO-002", affiliateId: "AFF-DEMO-001", packageId: "PKG-DEMO-002", expiresAt: "2026-10-01T00:00:00.000Z", createdAt: "2026-09-01T00:00:00.000Z" },
    { id: "ATR-DEMO-003", visitorKey: "VISITOR-DEMO-003", affiliateId: "AFF-DEMO-002", packageId: "PKG-DEMO-003", expiresAt: "2026-10-01T00:00:00.000Z", createdAt: "2026-09-01T00:00:00.000Z" },
    { id: "ATR-DEMO-004", visitorKey: "VISITOR-DEMO-004", affiliateId: "AFF-DEMO-002", packageId: "PKG-DEMO-004", expiresAt: "2026-10-01T00:00:00.000Z", createdAt: "2026-09-01T00:00:00.000Z" },
    { id: "ATR-DEMO-005", visitorKey: "VISITOR-DEMO-005", affiliateId: "AFF-DEMO-003", packageId: "PKG-DEMO-005", expiresAt: "2026-10-01T00:00:00.000Z", createdAt: "2026-09-01T00:00:00.000Z" },
    { id: "ATR-DEMO-006", visitorKey: "VISITOR-DEMO-006", affiliateId: "AFF-DEMO-001", packageId: "PKG-DEMO-007", expiresAt: "2026-10-01T00:00:00.000Z", createdAt: "2026-09-01T00:00:00.000Z" },
    { id: "ATR-DEMO-007", visitorKey: "VISITOR-DEMO-007", affiliateId: "AFF-DEMO-002", packageId: "PKG-DEMO-008", expiresAt: "2026-10-01T00:00:00.000Z", createdAt: "2026-09-01T00:00:00.000Z" },
    { id: "ATR-DEMO-008", visitorKey: "VISITOR-DEMO-008", affiliateId: "AFF-DEMO-003", packageId: "PKG-DEMO-009", expiresAt: "2026-10-01T00:00:00.000Z", createdAt: "2026-09-01T00:00:00.000Z" },
    { id: "ATR-DEMO-009", visitorKey: "VISITOR-DEMO-009", affiliateId: "AFF-DEMO-001", packageId: "PKG-DEMO-011", expiresAt: "2026-10-01T00:00:00.000Z", createdAt: "2026-09-01T00:00:00.000Z" },
    { id: "ATR-DEMO-010", visitorKey: "VISITOR-DEMO-010", affiliateId: "AFF-DEMO-002", packageId: "PKG-DEMO-014", expiresAt: "2026-10-01T00:00:00.000Z", createdAt: "2026-09-01T00:00:00.000Z" },

    // 3 EXPIRED
    { id: "ATR-DEMO-011", visitorKey: "VISITOR-DEMO-011", affiliateId: "AFF-DEMO-001", packageId: "PKG-DEMO-001", expiresAt: "2026-07-01T00:00:00.000Z", createdAt: "2026-06-01T00:00:00.000Z" },
    { id: "ATR-DEMO-012", visitorKey: "VISITOR-DEMO-012", affiliateId: "AFF-DEMO-002", packageId: "PKG-DEMO-003", expiresAt: "2026-07-15T00:00:00.000Z", createdAt: "2026-06-15T00:00:00.000Z" },
    { id: "ATR-DEMO-013", visitorKey: "VISITOR-DEMO-013", affiliateId: "AFF-DEMO-003", packageId: "PKG-DEMO-007", expiresAt: "2026-08-01T00:00:00.000Z", createdAt: "2026-07-01T00:00:00.000Z" },

    // 2 CONVERTED
    { id: "ATR-DEMO-014", visitorKey: "VISITOR-DEMO-014", affiliateId: "AFF-DEMO-001", packageId: "PKG-DEMO-001", expiresAt: "2026-10-15T00:00:00.000Z", createdAt: "2026-08-15T00:00:00.000Z" },
    { id: "ATR-DEMO-015", visitorKey: "VISITOR-DEMO-015", affiliateId: "AFF-DEMO-002", packageId: "PKG-DEMO-003", expiresAt: "2026-10-20T00:00:00.000Z", createdAt: "2026-08-20T00:00:00.000Z" }
  ];

  for (const a of attributions) {
    seedIfMissing_(CONFIG.SHEETS.ATTRIBUTIONS, a);
  }
}

/**
 * 35 Bookings (Relasi valid, unitPrice & totalPrice konsisten dengan paket)
 */
function seedBookings_() {
  const pRepo = new SpreadsheetRepository(CONFIG.SHEETS.PACKAGES);
  const packagesMap = {};
  pRepo.findAll().forEach(p => { packagesMap[p.id] = p; });

  const bookings = [
    // 6 PENDING (No Quota, No Commission)
    { id: "BKG-DEMO-001", bookingCode: "UH-DEMO-0001", departureId: "DEP-DEMO-001", packageId: "PKG-DEMO-001", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-01", jamaahName: "Ahmad Fauzi", jamaahPhone: "08140004001", paxCount: 2, affiliateId: "AFF-DEMO-001", status: "PENDING", paymentStatus: "UNPAID" },
    { id: "BKG-DEMO-002", bookingCode: "UH-DEMO-0002", departureId: "DEP-DEMO-002", packageId: "PKG-DEMO-001", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-02", jamaahName: "Siti Aminah", jamaahPhone: "08140004002", paxCount: 1, affiliateId: "AFF-DEMO-002", status: "PENDING", paymentStatus: "UNPAID" },
    { id: "BKG-DEMO-003", bookingCode: "UH-DEMO-0003", departureId: "DEP-DEMO-004", packageId: "PKG-DEMO-002", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-03", jamaahName: "Budi Santoso", jamaahPhone: "08140004003", paxCount: 3, affiliateId: "", status: "PENDING", paymentStatus: "UNPAID" },
    { id: "BKG-DEMO-004", bookingCode: "UH-DEMO-0004", departureId: "DEP-DEMO-006", packageId: "PKG-DEMO-003", travelId: "TRV-DEMO-002", customerId: "USR-DEMO-CUST-04", jamaahName: "Nurhayati", jamaahPhone: "08140004004", paxCount: 2, affiliateId: "AFF-DEMO-003", status: "PENDING", paymentStatus: "UNPAID" },
    { id: "BKG-DEMO-005", bookingCode: "UH-DEMO-0005", departureId: "DEP-DEMO-008", packageId: "PKG-DEMO-004", travelId: "TRV-DEMO-002", customerId: "USR-DEMO-CUST-05", jamaahName: "Rahmat Hidayat", jamaahPhone: "08140004005", paxCount: 1, affiliateId: "", status: "PENDING", paymentStatus: "UNPAID" },
    { id: "BKG-DEMO-006", bookingCode: "UH-DEMO-0006", departureId: "DEP-DEMO-010", packageId: "PKG-DEMO-005", travelId: "TRV-DEMO-003", customerId: "USR-DEMO-CUST-06", jamaahName: "Dewi Lestari", jamaahPhone: "08140004006", paxCount: 2, affiliateId: "AFF-DEMO-001", status: "PENDING", paymentStatus: "UNPAID" },

    // 7 CONFIRMED + UNPAID (Takes Quota, No Commission)
    { id: "BKG-DEMO-007", bookingCode: "UH-DEMO-0007", departureId: "DEP-DEMO-001", packageId: "PKG-DEMO-001", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-02", jamaahName: "Siti Aminah & Keluarga", jamaahPhone: "08140004002", paxCount: 2, affiliateId: "AFF-DEMO-001", status: "CONFIRMED", paymentStatus: "UNPAID" },
    { id: "BKG-DEMO-008", bookingCode: "UH-DEMO-0008", departureId: "DEP-DEMO-002", packageId: "PKG-DEMO-001", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-03", jamaahName: "Budi Santoso", jamaahPhone: "08140004003", paxCount: 2, affiliateId: "", status: "CONFIRMED", paymentStatus: "UNPAID" },
    { id: "BKG-DEMO-009", bookingCode: "UH-DEMO-0009", departureId: "DEP-DEMO-004", packageId: "PKG-DEMO-002", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-04", jamaahName: "Nurhayati Family", jamaahPhone: "08140004004", paxCount: 2, affiliateId: "AFF-DEMO-002", status: "CONFIRMED", paymentStatus: "UNPAID" },
    { id: "BKG-DEMO-010", bookingCode: "UH-DEMO-0010", departureId: "DEP-DEMO-006", packageId: "PKG-DEMO-003", travelId: "TRV-DEMO-002", customerId: "USR-DEMO-CUST-05", jamaahName: "Rahmat Hidayat", jamaahPhone: "08140004005", paxCount: 2, affiliateId: "AFF-DEMO-003", status: "CONFIRMED", paymentStatus: "UNPAID" },
    { id: "BKG-DEMO-011", bookingCode: "UH-DEMO-0011", departureId: "DEP-DEMO-008", packageId: "PKG-DEMO-004", travelId: "TRV-DEMO-002", customerId: "USR-DEMO-CUST-06", jamaahName: "Dewi Lestari", jamaahPhone: "08140004006", paxCount: 2, affiliateId: "", status: "CONFIRMED", paymentStatus: "UNPAID" },
    { id: "BKG-DEMO-012", bookingCode: "UH-DEMO-0012", departureId: "DEP-DEMO-010", packageId: "PKG-DEMO-005", travelId: "TRV-DEMO-003", customerId: "USR-DEMO-CUST-01", jamaahName: "Ahmad Fauzi Rombongan", jamaahPhone: "08140004001", paxCount: 2, affiliateId: "AFF-DEMO-001", status: "CONFIRMED", paymentStatus: "UNPAID" },
    { id: "BKG-DEMO-013", bookingCode: "UH-DEMO-0013", departureId: "DEP-DEMO-012", packageId: "PKG-DEMO-007", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-02", jamaahName: "Siti Aminah VIP", jamaahPhone: "08140004002", paxCount: 1, affiliateId: "AFF-DEMO-002", status: "CONFIRMED", paymentStatus: "UNPAID" },

    // 8 CONFIRMED + FULL_PAID (Takes Quota, HAS COMMISSION)
    { id: "BKG-DEMO-014", bookingCode: "UH-DEMO-0014", departureId: "DEP-DEMO-001", packageId: "PKG-DEMO-001", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-03", jamaahName: "Budi Santoso Lunas", jamaahPhone: "08140004003", paxCount: 2, affiliateId: "AFF-DEMO-001", status: "CONFIRMED", paymentStatus: "FULL_PAID" },
    { id: "BKG-DEMO-015", bookingCode: "UH-DEMO-0015", departureId: "DEP-DEMO-002", packageId: "PKG-DEMO-001", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-04", jamaahName: "Nurhayati Lunas", jamaahPhone: "08140004004", paxCount: 3, affiliateId: "AFF-DEMO-001", status: "CONFIRMED", paymentStatus: "FULL_PAID" },
    { id: "BKG-DEMO-016", bookingCode: "UH-DEMO-0016", departureId: "DEP-DEMO-004", packageId: "PKG-DEMO-002", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-05", jamaahName: "Rahmat Hidayat Lunas", jamaahPhone: "08140004005", paxCount: 1, affiliateId: "AFF-DEMO-002", status: "CONFIRMED", paymentStatus: "FULL_PAID" },
    { id: "BKG-DEMO-017", bookingCode: "UH-DEMO-0017", departureId: "DEP-DEMO-006", packageId: "PKG-DEMO-003", travelId: "TRV-DEMO-002", customerId: "USR-DEMO-CUST-06", jamaahName: "Dewi Lestari Lunas", jamaahPhone: "08140004006", paxCount: 2, affiliateId: "AFF-DEMO-002", status: "CONFIRMED", paymentStatus: "FULL_PAID" },
    { id: "BKG-DEMO-018", bookingCode: "UH-DEMO-0018", departureId: "DEP-DEMO-008", packageId: "PKG-DEMO-004", travelId: "TRV-DEMO-002", customerId: "USR-DEMO-CUST-01", jamaahName: "Ahmad Fauzi Lunas", jamaahPhone: "08140004001", paxCount: 2, affiliateId: "AFF-DEMO-003", status: "CONFIRMED", paymentStatus: "FULL_PAID" },
    { id: "BKG-DEMO-019", bookingCode: "UH-DEMO-0019", departureId: "DEP-DEMO-010", packageId: "PKG-DEMO-005", travelId: "TRV-DEMO-003", customerId: "USR-DEMO-CUST-02", jamaahName: "Siti Aminah Lunas", jamaahPhone: "08140004002", paxCount: 2, affiliateId: "AFF-DEMO-003", status: "CONFIRMED", paymentStatus: "FULL_PAID" },
    { id: "BKG-DEMO-020", bookingCode: "UH-DEMO-0020", departureId: "DEP-DEMO-012", packageId: "PKG-DEMO-007", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-03", jamaahName: "Budi Santoso VIP Lunas", jamaahPhone: "08140004003", paxCount: 2, affiliateId: "AFF-DEMO-001", status: "CONFIRMED", paymentStatus: "FULL_PAID" },
    { id: "BKG-DEMO-021", bookingCode: "UH-DEMO-0021", departureId: "DEP-DEMO-014", packageId: "PKG-DEMO-008", travelId: "TRV-DEMO-002", customerId: "USR-DEMO-CUST-04", jamaahName: "Nurhayati VIP Lunas", jamaahPhone: "08140004004", paxCount: 2, affiliateId: "AFF-DEMO-002", status: "CONFIRMED", paymentStatus: "FULL_PAID" },

    // 12 COMPLETED + FULL_PAID (Past departures, 4 with Commission, ALL HAVE REVIEWS)
    { id: "BKG-DEMO-022", bookingCode: "UH-DEMO-0022", departureId: "DEP-DEMO-028", packageId: "PKG-DEMO-001", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-01", jamaahName: "Ahmad Fauzi Completed", jamaahPhone: "08140004001", paxCount: 2, affiliateId: "AFF-DEMO-001", status: "COMPLETED", paymentStatus: "FULL_PAID" },
    { id: "BKG-DEMO-023", bookingCode: "UH-DEMO-0023", departureId: "DEP-DEMO-028", packageId: "PKG-DEMO-001", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-02", jamaahName: "Siti Aminah Completed", jamaahPhone: "08140004002", paxCount: 2, affiliateId: "AFF-DEMO-002", status: "COMPLETED", paymentStatus: "FULL_PAID" },
    { id: "BKG-DEMO-024", bookingCode: "UH-DEMO-0024", departureId: "DEP-DEMO-029", packageId: "PKG-DEMO-003", travelId: "TRV-DEMO-002", customerId: "USR-DEMO-CUST-03", jamaahName: "Budi Santoso Completed", jamaahPhone: "08140004003", paxCount: 2, affiliateId: "AFF-DEMO-003", status: "COMPLETED", paymentStatus: "FULL_PAID" },
    { id: "BKG-DEMO-025", bookingCode: "UH-DEMO-0025", departureId: "DEP-DEMO-030", packageId: "PKG-DEMO-007", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-04", jamaahName: "Nurhayati Completed", jamaahPhone: "08140004004", paxCount: 2, affiliateId: "AFF-DEMO-001", status: "COMPLETED", paymentStatus: "FULL_PAID" },
    { id: "BKG-DEMO-026", bookingCode: "UH-DEMO-0026", departureId: "DEP-DEMO-028", packageId: "PKG-DEMO-001", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-05", jamaahName: "Rahmat Hidayat", jamaahPhone: "08140004005", paxCount: 2, affiliateId: "", status: "COMPLETED", paymentStatus: "FULL_PAID" },
    { id: "BKG-DEMO-027", bookingCode: "UH-DEMO-0027", departureId: "DEP-DEMO-028", packageId: "PKG-DEMO-001", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-06", jamaahName: "Dewi Lestari", jamaahPhone: "08140004006", paxCount: 2, affiliateId: "", status: "COMPLETED", paymentStatus: "FULL_PAID" },
    { id: "BKG-DEMO-028", bookingCode: "UH-DEMO-0028", departureId: "DEP-DEMO-029", packageId: "PKG-DEMO-003", travelId: "TRV-DEMO-002", customerId: "USR-DEMO-CUST-01", jamaahName: "Ahmad Fauzi Mandiri", jamaahPhone: "08140004001", paxCount: 1, affiliateId: "", status: "COMPLETED", paymentStatus: "FULL_PAID" },
    { id: "BKG-DEMO-029", bookingCode: "UH-DEMO-0029", departureId: "DEP-DEMO-029", packageId: "PKG-DEMO-003", travelId: "TRV-DEMO-002", customerId: "USR-DEMO-CUST-02", jamaahName: "Siti Aminah Mandiri", jamaahPhone: "08140004002", paxCount: 2, affiliateId: "", status: "COMPLETED", paymentStatus: "FULL_PAID" },
    { id: "BKG-DEMO-030", bookingCode: "UH-DEMO-0030", departureId: "DEP-DEMO-030", packageId: "PKG-DEMO-007", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-03", jamaahName: "Budi Santoso Family", jamaahPhone: "08140004003", paxCount: 3, affiliateId: "", status: "COMPLETED", paymentStatus: "FULL_PAID" },
    { id: "BKG-DEMO-031", bookingCode: "UH-DEMO-0031", departureId: "DEP-DEMO-030", packageId: "PKG-DEMO-007", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-04", jamaahName: "Nurhayati Executive", jamaahPhone: "08140004004", paxCount: 1, affiliateId: "", status: "COMPLETED", paymentStatus: "FULL_PAID" },
    { id: "BKG-DEMO-032", bookingCode: "UH-DEMO-0032", departureId: "DEP-DEMO-028", packageId: "PKG-DEMO-001", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-05", jamaahName: "Rahmat Hidayat Executive", jamaahPhone: "08140004005", paxCount: 2, affiliateId: "", status: "COMPLETED", paymentStatus: "FULL_PAID" },
    { id: "BKG-DEMO-033", bookingCode: "UH-DEMO-0033", departureId: "DEP-DEMO-029", packageId: "PKG-DEMO-003", travelId: "TRV-DEMO-002", customerId: "USR-DEMO-CUST-06", jamaahName: "Dewi Lestari Family", jamaahPhone: "08140004006", paxCount: 2, affiliateId: "", status: "COMPLETED", paymentStatus: "FULL_PAID" },

    // 2 CANCELLED (No Quota, No Commission)
    { id: "BKG-DEMO-034", bookingCode: "UH-DEMO-0034", departureId: "DEP-DEMO-001", packageId: "PKG-DEMO-001", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-01", jamaahName: "Ahmad Fauzi Cancelled", jamaahPhone: "08140004001", paxCount: 2, affiliateId: "AFF-DEMO-001", status: "CANCELLED", paymentStatus: "UNPAID" },
    { id: "BKG-DEMO-035", bookingCode: "UH-DEMO-0035", departureId: "DEP-DEMO-003", packageId: "PKG-DEMO-001", travelId: "TRV-DEMO-001", customerId: "USR-DEMO-CUST-02", jamaahName: "Siti Aminah Cancelled", jamaahPhone: "08140004002", paxCount: 1, affiliateId: "", status: "CANCELLED", paymentStatus: "UNPAID" }
  ];

  for (const b of bookings) {
    const pkg = packagesMap[b.packageId] || { price: 28500000 };
    const unitPrice = Number(pkg.price);
    const totalPrice = unitPrice * Number(b.paxCount);
    seedIfMissing_(CONFIG.SHEETS.BOOKINGS, {
      ...b,
      unitPrice: unitPrice,
      totalPrice: totalPrice
    });
  }
}

/**
 * 12 Commissions (Hanya untuk booking FULL_PAID dengan affiliateId valid: 5 PENDING, 5 APPROVED, 2 PAID)
 */
function seedCommissions_() {
  const commissions = [
    // 5 PENDING (approvedAt kosong)
    { id: "COM-DEMO-001", bookingId: "BKG-DEMO-014", affiliateId: "AFF-DEMO-001", amount: 1500000, status: "PENDING", approvedAt: "" },
    { id: "COM-DEMO-002", bookingId: "BKG-DEMO-015", affiliateId: "AFF-DEMO-001", amount: 2250000, status: "PENDING", approvedAt: "" },
    { id: "COM-DEMO-003", bookingId: "BKG-DEMO-016", affiliateId: "AFF-DEMO-002", amount: 750000, status: "PENDING", approvedAt: "" },
    { id: "COM-DEMO-004", bookingId: "BKG-DEMO-017", affiliateId: "AFF-DEMO-002", amount: 1600000, status: "PENDING", approvedAt: "" },
    { id: "COM-DEMO-005", bookingId: "BKG-DEMO-018", affiliateId: "AFF-DEMO-003", amount: 1500000, status: "PENDING", approvedAt: "" },

    // 5 APPROVED (approvedAt terisi)
    { id: "COM-DEMO-006", bookingId: "BKG-DEMO-019", affiliateId: "AFF-DEMO-003", amount: 1700000, status: "APPROVED", approvedAt: "2026-08-15T10:00:00.000Z" },
    { id: "COM-DEMO-007", bookingId: "BKG-DEMO-020", affiliateId: "AFF-DEMO-001", amount: 3000000, status: "APPROVED", approvedAt: "2026-08-16T11:00:00.000Z" },
    { id: "COM-DEMO-008", bookingId: "BKG-DEMO-021", affiliateId: "AFF-DEMO-002", amount: 3000000, status: "APPROVED", approvedAt: "2026-08-17T14:30:00.000Z" },
    { id: "COM-DEMO-009", bookingId: "BKG-DEMO-022", affiliateId: "AFF-DEMO-001", amount: 1500000, status: "APPROVED", approvedAt: "2026-08-18T09:15:00.000Z" },
    { id: "COM-DEMO-010", bookingId: "BKG-DEMO-023", affiliateId: "AFF-DEMO-002", amount: 1500000, status: "APPROVED", approvedAt: "2026-08-19T16:45:00.000Z" },

    // 2 PAID (approvedAt terisi)
    { id: "COM-DEMO-011", bookingId: "BKG-DEMO-024", affiliateId: "AFF-DEMO-003", amount: 1600000, status: "PAID", approvedAt: "2026-08-01T08:00:00.000Z" },
    { id: "COM-DEMO-012", bookingId: "BKG-DEMO-025", affiliateId: "AFF-DEMO-001", amount: 3000000, status: "PAID", approvedAt: "2026-08-02T10:20:00.000Z" }
  ];

  for (const c of commissions) {
    seedIfMissing_(CONFIG.SHEETS.COMMISSIONS, c);
  }
}

/**
 * 6 Payouts (2 PENDING, 2 APPROVED, 2 PAID)
 */
function seedPayouts_() {
  const payouts = [
    // 2 PENDING (proofUrl kosong)
    { id: "PAY-DEMO-001", affiliateId: "AFF-DEMO-001", amount: 3000000, proofUrl: "", status: "PENDING" },
    { id: "PAY-DEMO-002", affiliateId: "AFF-DEMO-002", amount: 1500000, proofUrl: "", status: "PENDING" },

    // 2 APPROVED (proofUrl kosong)
    { id: "PAY-DEMO-003", affiliateId: "AFF-DEMO-001", amount: 4500000, proofUrl: "", status: "APPROVED" },
    { id: "PAY-DEMO-004", affiliateId: "AFF-DEMO-002", amount: 3000000, proofUrl: "", status: "APPROVED" },

    // 2 PAID (proofUrl terisi)
    { id: "PAY-DEMO-005", affiliateId: "AFF-DEMO-001", amount: 3000000, proofUrl: "https://example.com/demo/payouts/PAY-DEMO-005.jpg", status: "PAID" },
    { id: "PAY-DEMO-006", affiliateId: "AFF-DEMO-003", amount: 1600000, proofUrl: "https://example.com/demo/payouts/PAY-DEMO-006.jpg", status: "PAID" }
  ];

  for (const p of payouts) {
    seedIfMissing_(CONFIG.SHEETS.PAYOUTS, p);
  }
}

/**
 * 12 Reviews (Hanya untuk booking yang berstatus COMPLETED)
 */
function seedReviews_() {
  const reviews = [
    { id: "REV-DEMO-001", bookingId: "BKG-DEMO-022", packageId: "PKG-DEMO-001", customerId: "USR-DEMO-CUST-01", rating: 5, comment: "Alhamdulillah perjalanan sangat berkesan. Muthawwif ramah dan menguasai sunnah Rasulullah. Hotel di Makkah persis depan pelataran Masjidil Haram." },
    { id: "REV-DEMO-002", bookingId: "BKG-DEMO-023", packageId: "PKG-DEMO-001", customerId: "USR-DEMO-CUST-02", rating: 5, comment: "Sangat puas dengan pelayanan Al-Falah Travel. Makanan prasmanan Indonesia lezat, handling bagasi rapi, tidak ada jamaah yang terpisah." },
    { id: "REV-DEMO-003", bookingId: "BKG-DEMO-024", packageId: "PKG-DEMO-003", customerId: "USR-DEMO-CUST-03", rating: 4, comment: "Penerbangan langsung Garuda nyaman, hotel di Madinah sangat dekat gerbang Raudhah. Hanya saja proses imigrasi Jeddah sedikit antre." },
    { id: "REV-DEMO-004", bookingId: "BKG-DEMO-025", packageId: "PKG-DEMO-007", customerId: "USR-DEMO-CUST-04", rating: 5, comment: "Fasilitas VIP bintang 5 benar-benar sesuai ekspektasi. Dar Al Tawhid sangat mewah dan manasik umroh privat sangat mendalam." },
    { id: "REV-DEMO-005", bookingId: "BKG-DEMO-026", packageId: "PKG-DEMO-001", customerId: "USR-DEMO-CUST-05", rating: 4, comment: "Bimbingan ibadahnya sangat intensif dan sabar dalam membimbing lansia. Sangat direkomendasikan untuk ibadah keluarga." },
    { id: "REV-DEMO-006", bookingId: "BKG-DEMO-027", packageId: "PKG-DEMO-001", customerId: "USR-DEMO-CUST-06", rating: 5, comment: "Pelayanan travel responsif dan hotel sesuai paket. Jadwal ziarah di kota Madinah terorganisir rapi." },
    { id: "REV-DEMO-007", bookingId: "BKG-DEMO-028", packageId: "PKG-DEMO-003", customerId: "USR-DEMO-CUST-01", rating: 4, comment: "Proses keberangkatan dari Surabaya lancar, tim handling bandara sigap mendampingi hingga boarding pass." },
    { id: "REV-DEMO-008", bookingId: "BKG-DEMO-029", packageId: "PKG-DEMO-003", customerId: "USR-DEMO-CUST-02", rating: 5, comment: "Hotel Movenpick Makkah luar biasa dekat. Sangat memudahkan kami yang membawa orang tua." },
    { id: "REV-DEMO-009", bookingId: "BKG-DEMO-030", packageId: "PKG-DEMO-007", customerId: "USR-DEMO-CUST-03", rating: 5, comment: "Paket VIP terbaik! Makan malam view Ka'bah, bus eksekutif VIP selama ziarah sangat nyaman tanpa goncangan." },
    { id: "REV-DEMO-010", bookingId: "BKG-DEMO-031", packageId: "PKG-DEMO-007", customerId: "USR-DEMO-CUST-04", rating: 4, comment: "Pelayanan sangat memuaskan, jadwal padat tapi bermakna. Fasilitas The Oberoi Madinah tak tertandingi." },
    { id: "REV-DEMO-011", bookingId: "BKG-DEMO-032", packageId: "PKG-DEMO-001", customerId: "USR-DEMO-CUST-05", rating: 3, comment: "Ibadah lancar alhamdulillah, namun bis jemputan saat ziarah Thaif sempat terlambat 20 menit. Selebihnya oke." },
    { id: "REV-DEMO-012", bookingId: "BKG-DEMO-033", packageId: "PKG-DEMO-003", customerId: "USR-DEMO-CUST-06", rating: 5, comment: "Alhamdulillah mabrur insyaAllah. Tour leader Barokah Umroh sangat amanah dan profesional sampai kepulangan." }
  ];

  for (const r of reviews) {
    seedIfMissing_(CONFIG.SHEETS.REVIEWS, r);
  }
}

/**
 * 25 Audit Logs (Aktivitas platform realistis)
 */
function seedAuditLogs_() {
  const auditLogs = [
    { id: "AUD-DEMO-001", actorId: "USR-DEMO-ADMIN-01", action: "TRAVEL_VERIFIED", entity: "TRAVELS", entityId: "TRV-DEMO-001", payload: JSON.stringify({ skKemenag: "PPIU-DEMO-001/2026", status: "VERIFIED" }) },
    { id: "AUD-DEMO-002", actorId: "USR-DEMO-ADMIN-01", action: "TRAVEL_VERIFIED", entity: "TRAVELS", entityId: "TRV-DEMO-002", payload: JSON.stringify({ skKemenag: "PPIU-DEMO-002/2026", status: "VERIFIED" }) },
    { id: "AUD-DEMO-003", actorId: "USR-DEMO-ADMIN-01", action: "TRAVEL_VERIFIED", entity: "TRAVELS", entityId: "TRV-DEMO-003", payload: JSON.stringify({ skKemenag: "PPIU-DEMO-003/2026", status: "VERIFIED" }) },
    { id: "AUD-DEMO-004", actorId: "USR-DEMO-ADMIN-02", action: "TRAVEL_REJECTED", entity: "TRAVELS", entityId: "TRV-DEMO-005", payload: JSON.stringify({ reason: "Dokumen legalitas kadaluarsa" }) },
    { id: "AUD-DEMO-005", actorId: "USR-DEMO-TRAVEL-01", action: "PACKAGE_CREATED", entity: "PACKAGES", entityId: "PKG-DEMO-001", payload: JSON.stringify({ title: "Umroh Reguler Syawal Berkah 9 Hari", price: 28500000 }) },
    { id: "AUD-DEMO-006", actorId: "USR-DEMO-TRAVEL-01", action: "PACKAGE_PUBLISHED", entity: "PACKAGES", entityId: "PKG-DEMO-001", payload: JSON.stringify({ isPublished: true }) },
    { id: "AUD-DEMO-007", actorId: "USR-DEMO-TRAVEL-01", action: "PACKAGE_CREATED", entity: "PACKAGES", entityId: "PKG-DEMO-007", payload: JSON.stringify({ title: "Umroh VIP Eksklusif Dar Al Tawhid", price: 46500000 }) },
    { id: "AUD-DEMO-008", actorId: "USR-DEMO-TRAVEL-01", action: "PACKAGE_PUBLISHED", entity: "PACKAGES", entityId: "PKG-DEMO-007", payload: JSON.stringify({ isPublished: true }) },
    { id: "AUD-DEMO-009", actorId: "USR-DEMO-TRAVEL-02", action: "PACKAGE_CREATED", entity: "PACKAGES", entityId: "PKG-DEMO-003", payload: JSON.stringify({ title: "Umroh Barokah Reguler 10 Hari", price: 29800000 }) },
    { id: "AUD-DEMO-010", actorId: "USR-DEMO-TRAVEL-02", action: "PACKAGE_PUBLISHED", entity: "PACKAGES", entityId: "PKG-DEMO-003", payload: JSON.stringify({ isPublished: true }) },
    { id: "AUD-DEMO-011", actorId: "USR-DEMO-CUST-01", action: "BOOKING_CREATED", entity: "BOOKINGS", entityId: "BKG-DEMO-001", payload: JSON.stringify({ pax: 2, status: "PENDING" }) },
    { id: "AUD-DEMO-012", actorId: "USR-DEMO-TRAVEL-01", action: "BOOKING_CONFIRMED", entity: "BOOKINGS", entityId: "BKG-DEMO-007", payload: JSON.stringify({ status: "CONFIRMED", quotaDeducted: 2 }) },
    { id: "AUD-DEMO-013", actorId: "USR-DEMO-TRAVEL-01", action: "BOOKING_CONFIRMED", entity: "BOOKINGS", entityId: "BKG-DEMO-014", payload: JSON.stringify({ status: "CONFIRMED", quotaDeducted: 2 }) },
    { id: "AUD-DEMO-014", actorId: "USR-DEMO-TRAVEL-01", action: "BOOKING_PAID", entity: "BOOKINGS", entityId: "BKG-DEMO-014", payload: JSON.stringify({ paymentStatus: "FULL_PAID" }) },
    { id: "AUD-DEMO-015", actorId: "SYSTEM", action: "COMMISSION_CREATED", entity: "COMMISSIONS", entityId: "COM-DEMO-001", payload: JSON.stringify({ bookingId: "BKG-DEMO-014", amount: 1500000 }) },
    { id: "AUD-DEMO-016", actorId: "USR-DEMO-ADMIN-01", action: "COMMISSION_APPROVED", entity: "COMMISSIONS", entityId: "COM-DEMO-007", payload: JSON.stringify({ status: "APPROVED", amount: 3000000 }) },
    { id: "AUD-DEMO-017", actorId: "USR-DEMO-ADMIN-01", action: "COMMISSION_APPROVED", entity: "COMMISSIONS", entityId: "COM-DEMO-008", payload: JSON.stringify({ status: "APPROVED", amount: 3000000 }) },
    { id: "AUD-DEMO-018", actorId: "USR-DEMO-AFF-01", action: "PAYOUT_REQUESTED", entity: "PAYOUTS", entityId: "PAY-DEMO-001", payload: JSON.stringify({ amount: 3000000, bank: "BSI" }) },
    { id: "AUD-DEMO-019", actorId: "USR-DEMO-ADMIN-01", action: "PAYOUT_PAID", entity: "PAYOUTS", entityId: "PAY-DEMO-005", payload: JSON.stringify({ amount: 3000000, status: "PAID" }) },
    { id: "AUD-DEMO-020", actorId: "USR-DEMO-CUST-01", action: "BOOKING_CANCELLED", entity: "BOOKINGS", entityId: "BKG-DEMO-034", payload: JSON.stringify({ status: "CANCELLED" }) },
    { id: "AUD-DEMO-021", actorId: "USR-DEMO-CUST-01", action: "REVIEW_CREATED", entity: "REVIEWS", entityId: "REV-DEMO-001", payload: JSON.stringify({ rating: 5, packageId: "PKG-DEMO-001" }) },
    { id: "AUD-DEMO-022", actorId: "USR-DEMO-CUST-02", action: "REVIEW_CREATED", entity: "REVIEWS", entityId: "REV-DEMO-002", payload: JSON.stringify({ rating: 5, packageId: "PKG-DEMO-001" }) },
    { id: "AUD-DEMO-023", actorId: "USR-DEMO-CUST-03", action: "REVIEW_CREATED", entity: "REVIEWS", entityId: "REV-DEMO-003", payload: JSON.stringify({ rating: 4, packageId: "PKG-DEMO-003" }) },
    { id: "AUD-DEMO-024", actorId: "USR-DEMO-ADMIN-01", action: "AUDIT_LOG_CHECK", entity: "SYSTEM", entityId: "ALL", payload: JSON.stringify({ status: "HEALTHY" }) },
    { id: "AUD-DEMO-025", actorId: "SYSTEM", action: "DEMO_DATASET_INITIALIZED", entity: "SYSTEM", entityId: "SEEDER_V2", payload: JSON.stringify({ source: "DEMO_SEED", environment: "PROTOTYPE" }) }
  ];

  for (const a of auditLogs) {
    seedIfMissing_(CONFIG.SHEETS.AUDIT_LOGS, a);
  }
}

/**
 * Validasi integritas relasional dan konsistensi bisnis dataset demo
 */
function validateDemoDataset_() {
  const users = new SpreadsheetRepository(CONFIG.SHEETS.USERS).findAll();
  const travels = new SpreadsheetRepository(CONFIG.SHEETS.TRAVELS).findAll();
  const packages = new SpreadsheetRepository(CONFIG.SHEETS.PACKAGES).findAll();
  const departures = new SpreadsheetRepository(CONFIG.SHEETS.DEPARTURES).findAll();
  const bookings = new SpreadsheetRepository(CONFIG.SHEETS.BOOKINGS).findAll();
  const affiliates = new SpreadsheetRepository(CONFIG.SHEETS.AFFILIATES).findAll();
  const attributions = new SpreadsheetRepository(CONFIG.SHEETS.ATTRIBUTIONS).findAll();
  const commissions = new SpreadsheetRepository(CONFIG.SHEETS.COMMISSIONS).findAll();
  const reviews = new SpreadsheetRepository(CONFIG.SHEETS.REVIEWS).findAll();

  const userIds = new Set(users.map(u => u.id));
  const travelIds = new Set(travels.map(t => t.id));
  const packageIds = new Set(packages.map(p => p.id));
  const departureIds = new Set(departures.map(d => d.id));
  const affiliateIds = new Set(affiliates.map(a => a.id));
  const bookingIds = new Set(bookings.map(b => b.id));
  const bookingsMap = {};
  bookings.forEach(b => { bookingsMap[b.id] = b; });

  // 1. Validate packages
  for (const p of packages) {
    if (p.id && p.id.startsWith("PKG-DEMO-")) {
      if (!travelIds.has(p.travelId)) {
        throw new Error("Relational Error: Package " + p.id + " has invalid travelId: " + p.travelId);
      }
    }
  }

  // 2. Validate departures
  for (const d of departures) {
    if (d.id && d.id.startsWith("DEP-DEMO-")) {
      if (!packageIds.has(d.packageId)) {
        throw new Error("Relational Error: Departure " + d.id + " has invalid packageId: " + d.packageId);
      }
      if (Number(d.quotaTaken) > Number(d.quotaTotal)) {
        throw new Error("Quota Error: Departure " + d.id + " quotaTaken > quotaTotal (" + d.quotaTaken + " > " + d.quotaTotal + ")");
      }
    }
  }

  // 3. Validate bookings
  for (const b of bookings) {
    if (b.id && b.id.startsWith("BKG-DEMO-")) {
      if (!userIds.has(b.customerId)) {
        throw new Error("Relational Error: Booking " + b.id + " has invalid customerId: " + b.customerId);
      }
      if (!travelIds.has(b.travelId)) {
        throw new Error("Relational Error: Booking " + b.id + " has invalid travelId: " + b.travelId);
      }
      if (!packageIds.has(b.packageId)) {
        throw new Error("Relational Error: Booking " + b.id + " has invalid packageId: " + b.packageId);
      }
      if (!departureIds.has(b.departureId)) {
        throw new Error("Relational Error: Booking " + b.id + " has invalid departureId: " + b.departureId);
      }
    }
  }

  // 4. Validate affiliates
  for (const a of affiliates) {
    if (a.id && a.id.startsWith("AFF-DEMO-")) {
      if (!userIds.has(a.userId)) {
        throw new Error("Relational Error: Affiliate " + a.id + " has invalid userId: " + a.userId);
      }
    }
  }

  // 5. Validate attributions
  for (const attr of attributions) {
    if (attr.id && attr.id.startsWith("ATR-DEMO-")) {
      if (!affiliateIds.has(attr.affiliateId)) {
        throw new Error("Relational Error: Attribution " + attr.id + " has invalid affiliateId: " + attr.affiliateId);
      }
      if (!packageIds.has(attr.packageId)) {
        throw new Error("Relational Error: Attribution " + attr.id + " has invalid packageId: " + attr.packageId);
      }
    }
  }

  // 6. Validate commissions
  for (const c of commissions) {
    if (c.id && c.id.startsWith("COM-DEMO-")) {
      if (!bookingIds.has(c.bookingId)) {
        throw new Error("Relational Error: Commission " + c.id + " has invalid bookingId: " + c.bookingId);
      }
      if (!affiliateIds.has(c.affiliateId)) {
        throw new Error("Relational Error: Commission " + c.id + " has invalid affiliateId: " + c.affiliateId);
      }
      const b = bookingsMap[c.bookingId];
      if (b && b.paymentStatus !== CONFIG.STATUS.PAYMENT.FULL_PAID) {
        throw new Error("Business Rule Error: Commission " + c.id + " created for non-FULL_PAID booking: " + b.id);
      }
    }
  }

  // 7. Validate reviews
  for (const r of reviews) {
    if (r.id && r.id.startsWith("REV-DEMO-")) {
      if (!bookingIds.has(r.bookingId)) {
        throw new Error("Relational Error: Review " + r.id + " has invalid bookingId: " + r.bookingId);
      }
      const b = bookingsMap[r.bookingId];
      if (!b || b.status !== CONFIG.STATUS.BOOKING.COMPLETED) {
        throw new Error("Business Rule Error: Review " + r.id + " references non-COMPLETED booking: " + r.bookingId);
      }
      if (b.packageId !== r.packageId) {
        throw new Error("Relational Error: Review " + r.id + " packageId does not match booking: " + r.packageId + " vs " + b.packageId);
      }
      if (b.customerId !== r.customerId) {
        throw new Error("Relational Error: Review " + r.id + " customerId does not match booking: " + r.customerId + " vs " + b.customerId);
      }
    }
  }

  return { valid: true };
}

/**
 * Ringkasan jumlah record per sheet
 */
function getDemoDatasetSummary() {
  return {
    users: new SpreadsheetRepository(CONFIG.SHEETS.USERS).findAll().length,
    travels: new SpreadsheetRepository(CONFIG.SHEETS.TRAVELS).findAll().length,
    travelDocuments: new SpreadsheetRepository(CONFIG.SHEETS.TRAVEL_DOCUMENTS).findAll().length,
    packages: new SpreadsheetRepository(CONFIG.SHEETS.PACKAGES).findAll().length,
    departures: new SpreadsheetRepository(CONFIG.SHEETS.DEPARTURES).findAll().length,
    bookings: new SpreadsheetRepository(CONFIG.SHEETS.BOOKINGS).findAll().length,
    affiliates: new SpreadsheetRepository(CONFIG.SHEETS.AFFILIATES).findAll().length,
    referralClicks: new SpreadsheetRepository(CONFIG.SHEETS.REFERRAL_CLICKS).findAll().length,
    attributions: new SpreadsheetRepository(CONFIG.SHEETS.ATTRIBUTIONS).findAll().length,
    commissions: new SpreadsheetRepository(CONFIG.SHEETS.COMMISSIONS).findAll().length,
    payouts: new SpreadsheetRepository(CONFIG.SHEETS.PAYOUTS).findAll().length,
    reviews: new SpreadsheetRepository(CONFIG.SHEETS.REVIEWS).findAll().length,
    auditLogs: new SpreadsheetRepository(CONFIG.SHEETS.AUDIT_LOGS).findAll().length
  };
}

/**
 * Main Seeder Function: seed seluruh demo data secara aman, idempoten, dan non-destruktif.
 */
function seedFullDemoData(acquireLock = true) {
  let lock = null;
  if (acquireLock) {
    lock = LockService.getScriptLock();
    lock.waitLock(30000);
  }
  try {
    // Pastikan schema & sheet sudah ada
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      for (const [sheetKey, headers] of Object.entries(CONFIG.SCHEMAS)) {
        let sheet = ss.getSheetByName(sheetKey);
        if (!sheet) {
          sheet = ss.insertSheet(sheetKey);
        }
        if (sheet.getLastRow() === 0) {
          sheet.appendRow(headers);
          sheet.setFrozenRows(1);
          sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#ecfdf5");
        }
      }
    }

    // Seed dalam urutan relasional
    seedUsers_();
    seedTravels_();
    seedTravelDocuments_();
    seedPackages_();
    seedDepartures_();
    seedAffiliates_();
    seedReferralClicks_();
    seedAttributions_();
    seedBookings_();
    seedCommissions_();
    seedPayouts_();
    seedReviews_();
    seedAuditLogs_();

    // Validasi integritas relasi
    validateDemoDataset_();

    SpreadsheetApp.flush();
    return getDemoDatasetSummary();
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}
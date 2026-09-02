# DATABASE_SCHEMA.md
## UmrohHub Prototype — Google Spreadsheet + Google Apps Script API Contract

**Version:** 1.0  
**Target:** Prototype / Demo / Business Flow Validation  
**Frontend:** `index.html` — HTML, CSS, Vanilla JavaScript  
**Backend:** Google Apps Script Web App  
**Database:** Google Spreadsheet  

> Dokumen ini adalah kontrak data dan API untuk prototype. Struktur sengaja dibuat dekat dengan domain production agar migrasi ke PostgreSQL/Next.js nanti tidak membutuhkan redesign business flow besar.

---

# 1. Prinsip Umum

## 1.1 Arsitektur

```text
index.html
    ↓ fetch()
Google Apps Script Web App
    ↓
Service Layer
    ↓
SpreadsheetRepository
    ↓
Google Spreadsheet
```

## 1.2 Aturan Database

1. Satu Google Spreadsheet menjadi database utama.
2. Setiap sheet dianggap sebagai satu tabel.
3. Row pertama setiap sheet wajib merupakan header.
4. Jangan menggunakan nomor row sebagai ID.
5. Semua entity menggunakan ID berbasis UUID/prefix.
6. Semua timestamp menggunakan ISO-8601 UTC/string.
7. Relasi antar-sheet menggunakan ID.
8. Data finansial disimpan sebagai angka integer Rupiah, bukan formatted string.
9. Field boolean disimpan sebagai `TRUE/FALSE`.
10. Field array sederhana dapat menggunakan separator `|` untuk prototype.
11. Backend wajib melakukan validasi; frontend bukan source of truth.
12. Semua perhitungan harga booking dilakukan backend.
13. Semua response API mengikuti envelope yang sama.
14. Prototype tidak dianggap database production.

---

# 2. Naming Convention

## 2.1 ID Prefix

```text
USR_    User
TRV_    Travel
DOC_    Travel Document
PKG_    Package
DEP_    Departure
BKG_    Booking
AFF_    Affiliate
REF_    Referral Link
CLK_    Referral Click
ATR_    Attribution
COM_    Commission
PAY_    Payout
REV_    Review
AUD_    Audit Log
```

Contoh:

```text
USR_92A1F0CD
TRV_3B1D700A
PKG_7EAA34F1
```

Apps Script helper:

```javascript
function generateId(prefix) {
  return prefix + "_" +
    Utilities.getUuid()
      .split("-")[0]
      .toUpperCase();
}
```

---

# 3. Daftar Sheet

```text
USERS
TRAVELS
TRAVEL_DOCUMENTS
PACKAGES
DEPARTURES
BOOKINGS
AFFILIATES
REFERRAL_LINKS
REFERRAL_CLICKS
ATTRIBUTIONS
COMMISSIONS
PAYOUTS
REVIEWS
AUDIT_LOGS
```

---

# 4. USERS

## 4.1 Tujuan

Menyimpan akun prototype untuk empat role utama:

```text
ADMIN
TRAVEL
AFFILIATE
CUSTOMER
```

Untuk demo tertutup, disarankan menggunakan seeded demo accounts dan tidak menyimpan password nyata.

## 4.2 Schema

| Column | Type | Required | Rule |
|---|---|---:|---|
| id | string | yes | unique, `USR_*` |
| name | string | yes | max 150 |
| email | string | yes | unique |
| password_hash | string | prototype | jangan plaintext |
| role | enum | yes | ADMIN/TRAVEL/AFFILIATE/CUSTOMER |
| status | enum | yes | ACTIVE/INACTIVE/SUSPENDED |
| travel_id | string | no | FK → TRAVELS.id |
| affiliate_id | string | no | FK → AFFILIATES.id |
| created_at | datetime | yes | ISO-8601 |
| updated_at | datetime | yes | ISO-8601 |

## 4.3 Header

```text
id | name | email | password_hash | role | status | travel_id | affiliate_id | created_at | updated_at
```

## 4.4 Contoh Isi

| id | name | email | password_hash | role | status | travel_id | affiliate_id | created_at | updated_at |
|---|---|---|---|---|---|---|---|---|---|
| USR_ADMIN01 | Platform Admin | admin@demo.local | DEMO_ONLY | ADMIN | ACTIVE |  |  | 2026-09-02T05:00:00Z | 2026-09-02T05:00:00Z |
| USR_TRV001 | Ahmad Travel | owner@amanah.local | DEMO_ONLY | TRAVEL | ACTIVE | TRV_001 |  | 2026-09-02T05:01:00Z | 2026-09-02T05:01:00Z |
| USR_AFF001 | Hasan Affiliate | affiliate@demo.local | DEMO_ONLY | AFFILIATE | ACTIVE |  | AFF_001 | 2026-09-02T05:02:00Z | 2026-09-02T05:02:00Z |
| USR_CUS001 | Budi Jamaah | budi@demo.local | DEMO_ONLY | CUSTOMER | ACTIVE |  |  | 2026-09-02T05:03:00Z | 2026-09-02T05:03:00Z |

---

# 5. TRAVELS

## 5.1 Tujuan

Menyimpan profil perusahaan travel.

## 5.2 Schema

| Column | Type | Required | Rule |
|---|---|---:|---|
| id | string | yes | unique, `TRV_*` |
| owner_user_id | string | yes | FK → USERS.id |
| name | string | yes | public name |
| slug | string | yes | unique |
| legal_name | string | yes | nama badan usaha |
| city | string | yes | kota |
| province | string | yes | provinsi |
| phone | string | yes | text |
| email | string | yes | email |
| logo_url | string | no | public image URL |
| description | string | no | text |
| verification_status | enum | yes | PENDING/UNDER_REVIEW/VERIFIED/REJECTED/SUSPENDED/EXPIRED |
| rating | number | yes | default 0 |
| review_count | integer | yes | default 0 |
| status | enum | yes | ACTIVE/INACTIVE |
| created_at | datetime | yes | ISO |
| updated_at | datetime | yes | ISO |

## 5.3 Contoh Isi

| id | owner_user_id | name | slug | legal_name | city | province | phone | email | logo_url | description | verification_status | rating | review_count | status | created_at | updated_at |
|---|---|---|---|---|---|---|---|---|---|---|---|---:|---:|---|---|---|
| TRV_001 | USR_TRV001 | Amanah Umroh | amanah-umroh | PT Amanah Wisata Nusantara | Jakarta Selatan | DKI Jakarta | 021555111 | cs@amanah.local | https://example.com/amanah.png | Paket Umroh reguler dan premium | VERIFIED | 4.8 | 124 | ACTIVE | 2026-09-02T05:05:00Z | 2026-09-02T05:05:00Z |
| TRV_002 | USR_TRV002 | Safar Iman | safar-iman | PT Safar Iman Indonesia | Bandung | Jawa Barat | 022555222 | cs@safar.local | https://example.com/safar.png | Travel Umroh keluarga | PENDING | 0 | 0 | ACTIVE | 2026-09-02T05:06:00Z | 2026-09-02T05:06:00Z |

---

# 6. TRAVEL_DOCUMENTS

## 6.1 Tujuan

Metadata dokumen legal travel.

## 6.2 Schema

| Column | Type | Required | Rule |
|---|---|---:|---|
| id | string | yes | `DOC_*` |
| travel_id | string | yes | FK → TRAVELS.id |
| document_type | string | yes | type dokumen |
| document_number | string | no | nomor legal |
| file_url | string | yes | Google Drive/private URL |
| issued_at | date | no | YYYY-MM-DD |
| expires_at | date | no | YYYY-MM-DD |
| status | enum | yes | PENDING/APPROVED/REJECTED/EXPIRED |
| notes | string | no | admin notes |
| reviewed_by | string | no | FK → USERS.id |
| reviewed_at | datetime | no | ISO |
| created_at | datetime | yes | ISO |

## 6.3 Contoh Isi

| id | travel_id | document_type | document_number | file_url | issued_at | expires_at | status | notes | reviewed_by | reviewed_at | created_at |
|---|---|---|---|---|---|---|---|---|---|---|---|
| DOC_001 | TRV_001 | IZIN_USAHA | IZ-2026-001 | https://drive.google.com/... | 2026-01-10 | 2027-01-10 | APPROVED | Dokumen valid | USR_ADMIN01 | 2026-09-02T05:10:00Z | 2026-09-02T05:08:00Z |

---

# 7. PACKAGES

## 7.1 Tujuan

Master produk paket Umroh.

## 7.2 Schema

| Column | Type | Required | Rule |
|---|---|---:|---|
| id | string | yes | `PKG_*` |
| travel_id | string | yes | FK → TRAVELS.id |
| name | string | yes | nama paket |
| slug | string | yes | unique |
| short_description | string | no | summary |
| description | string | yes | detail |
| duration_days | integer | yes | > 0 |
| base_price | integer | yes | Rupiah |
| departure_city | string | yes | kota keberangkatan |
| airline | string | yes | maskapai |
| flight_type | enum | yes | DIRECT/TRANSIT |
| hotel_makkah | string | no | hotel |
| hotel_makkah_rating | integer | no | 1-5 |
| hotel_madinah | string | no | hotel |
| hotel_madinah_rating | integer | no | 1-5 |
| facilities | string | no | delimiter `|` |
| exclusions | string | no | delimiter `|` |
| image_url | string | no | primary image |
| status | enum | yes | DRAFT/PUBLISHED/FULL/COMPLETED/ARCHIVED |
| featured | boolean | yes | TRUE/FALSE |
| created_at | datetime | yes | ISO |
| updated_at | datetime | yes | ISO |

## 7.3 Contoh Isi

| id | travel_id | name | slug | short_description | description | duration_days | base_price | departure_city | airline | flight_type | hotel_makkah | hotel_makkah_rating | hotel_madinah | hotel_madinah_rating | facilities | exclusions | image_url | status | featured | created_at | updated_at |
|---|---|---|---|---|---|---:|---:|---|---|---|---|---:|---|---:|---|---|---|---|---|---|---|
| PKG_001 | TRV_001 | Umroh Premium 9 Hari | umroh-premium-9-hari | Direct flight dan hotel dekat Haram | Paket premium 9 hari untuk keluarga | 9 | 32500000 | Jakarta | Saudia | DIRECT | Pullman Zamzam | 5 | Sofitel Shahd | 5 | Visa\|Hotel\|Makan\|Transport\|Mutawwif | Paspor\|Vaksin | https://example.com/pkg1.jpg | PUBLISHED | TRUE | 2026-09-02T05:20:00Z | 2026-09-02T05:20:00Z |
| PKG_002 | TRV_001 | Umroh Hemat 12 Hari | umroh-hemat-12-hari | Paket ekonomis | Paket Umroh hemat 12 hari | 12 | 27500000 | Jakarta | Oman Air | TRANSIT | Hotel Example Makkah | 4 | Hotel Example Madinah | 4 | Visa\|Hotel\|Makan | Paspor | https://example.com/pkg2.jpg | PUBLISHED | FALSE | 2026-09-02T05:21:00Z | 2026-09-02T05:21:00Z |

---

# 8. DEPARTURES

## 8.1 Tujuan

Menyimpan jadwal keberangkatan dan quota per package.

## 8.2 Schema

| Column | Type | Required | Rule |
|---|---|---:|---|
| id | string | yes | `DEP_*` |
| package_id | string | yes | FK → PACKAGES.id |
| departure_date | date | yes | YYYY-MM-DD |
| return_date | date | yes | > departure |
| price | integer | yes | Rupiah |
| quota | integer | yes | > 0 |
| booked | integer | yes | default 0 |
| status | enum | yes | AVAILABLE/FULL/CLOSED/COMPLETED |
| created_at | datetime | yes | ISO |
| updated_at | datetime | yes | ISO |

## 8.3 Contoh Isi

| id | package_id | departure_date | return_date | price | quota | booked | status | created_at | updated_at |
|---|---|---|---|---:|---:|---:|---|---|---|
| DEP_001 | PKG_001 | 2027-01-10 | 2027-01-18 | 32500000 | 40 | 12 | AVAILABLE | 2026-09-02T05:25:00Z | 2026-09-02T05:25:00Z |
| DEP_002 | PKG_001 | 2027-02-05 | 2027-02-13 | 33500000 | 40 | 5 | AVAILABLE | 2026-09-02T05:25:30Z | 2026-09-02T05:25:30Z |

---

# 9. BOOKINGS

## 9.1 Tujuan

Menyimpan transaksi booking prototype.

## 9.2 Schema

| Column | Type | Required | Rule |
|---|---|---:|---|
| id | string | yes | `BKG_*` |
| booking_code | string | yes | unique human-readable |
| user_id | string | no | FK → USERS.id |
| travel_id | string | yes | snapshot relation |
| package_id | string | yes | FK |
| departure_id | string | yes | FK |
| affiliate_id | string | no | affiliate attribution |
| attribution_id | string | no | FK → ATTRIBUTIONS.id |
| customer_name | string | yes | contact |
| customer_phone | string | yes | contact |
| customer_email | string | yes | contact |
| pilgrim_count | integer | yes | > 0 |
| unit_price | integer | yes | snapshot |
| total_amount | integer | yes | server calculated |
| status | enum | yes | PENDING/CONFIRMED/PAID/COMPLETED/CANCELLED/REJECTED |
| payment_status | enum | yes | UNPAID/PAID |
| notes | string | no | |
| created_at | datetime | yes | ISO |
| updated_at | datetime | yes | ISO |

## 9.3 Contoh Isi

| id | booking_code | user_id | travel_id | package_id | departure_id | affiliate_id | attribution_id | customer_name | customer_phone | customer_email | pilgrim_count | unit_price | total_amount | status | payment_status | notes | created_at | updated_at |
|---|---|---|---|---|---|---|---|---|---|---|---:|---:|---:|---|---|---|---|---|
| BKG_001 | UH-260902-001 | USR_CUS001 | TRV_001 | PKG_001 | DEP_001 | AFF_001 | ATR_001 | Budi Jamaah | 08123456789 | budi@demo.local | 2 | 32500000 | 65000000 | CONFIRMED | UNPAID | Mohon kamar berdekatan | 2026-09-02T05:30:00Z | 2026-09-02T05:32:00Z |

---

# 10. AFFILIATES

## 10.1 Schema

| Column | Type | Required | Rule |
|---|---|---:|---|
| id | string | yes | `AFF_*` |
| user_id | string | yes | FK USERS |
| affiliate_code | string | yes | unique |
| name | string | yes | |
| phone | string | yes | |
| bank_name | string | no | prototype |
| bank_account | string | no | demo only |
| bank_holder_name | string | no | |
| status | enum | yes | PENDING/ACTIVE/SUSPENDED |
| created_at | datetime | yes | |
| updated_at | datetime | yes | |

## 10.2 Contoh Isi

| id | user_id | affiliate_code | name | phone | bank_name | bank_account | bank_holder_name | status | created_at | updated_at |
|---|---|---|---|---|---|---|---|---|---|---|
| AFF_001 | USR_AFF001 | HASAN001 | Hasan Affiliate | 0812000001 | BCA | 1234567890 | Hasan | ACTIVE | 2026-09-02T05:35:00Z | 2026-09-02T05:35:00Z |

---

# 11. REFERRAL_LINKS

## 11.1 Schema

| Column | Type | Required | Rule |
|---|---|---:|---|
| id | string | yes | `REF_*` |
| affiliate_id | string | yes | FK |
| package_id | string | yes | FK |
| code | string | yes | unique token |
| target_url | string | yes | package URL |
| campaign | string | no | optional label |
| status | enum | yes | ACTIVE/INACTIVE |
| created_at | datetime | yes | |

## 11.2 Contoh Isi

| id | affiliate_id | package_id | code | target_url | campaign | status | created_at |
|---|---|---|---|---|---|---|---|
| REF_001 | AFF_001 | PKG_001 | HASAN001-PKG001 | index.html?package=PKG_001&ref=HASAN001 | IG-SEPTEMBER | ACTIVE | 2026-09-02T05:40:00Z |

---

# 12. REFERRAL_CLICKS

## 12.1 Schema

| Column | Type | Required | Rule |
|---|---|---:|---|
| id | string | yes | `CLK_*` |
| affiliate_id | string | yes | FK |
| package_id | string | yes | FK |
| referral_link_id | string | no | FK |
| visitor_id | string | yes | browser-generated opaque ID |
| session_id | string | no | optional |
| landing_url | string | no | |
| clicked_at | datetime | yes | |

## 12.2 Contoh Isi

| id | affiliate_id | package_id | referral_link_id | visitor_id | session_id | landing_url | clicked_at |
|---|---|---|---|---|---|---|---|
| CLK_001 | AFF_001 | PKG_001 | REF_001 | VIS_abcd1234 | SES_xyz999 | index.html?package=PKG_001&ref=HASAN001 | 2026-09-02T05:41:00Z |

---

# 13. ATTRIBUTIONS

## 13.1 Rule

```text
Model   : Last Eligible Affiliate
Window  : 30 hari
```

Klik affiliate valid terbaru menggantikan attribution aktif sebelumnya untuk visitor/package.

## 13.2 Schema

| Column | Type | Required | Rule |
|---|---|---:|---|
| id | string | yes | `ATR_*` |
| visitor_id | string | yes | |
| user_id | string | no | jika login |
| affiliate_id | string | yes | FK |
| package_id | string | yes | FK |
| referral_click_id | string | yes | FK |
| attributed_at | datetime | yes | |
| expires_at | datetime | yes | +30 hari |
| status | enum | yes | ACTIVE/CONVERTED/EXPIRED |
| created_at | datetime | yes | |

## 13.3 Contoh Isi

| id | visitor_id | user_id | affiliate_id | package_id | referral_click_id | attributed_at | expires_at | status | created_at |
|---|---|---|---|---|---|---|---|---|---|
| ATR_001 | VIS_abcd1234 | USR_CUS001 | AFF_001 | PKG_001 | CLK_001 | 2026-09-02T05:41:00Z | 2026-10-02T05:41:00Z | CONVERTED | 2026-09-02T05:41:00Z |

---

# 14. COMMISSIONS

## 14.1 Rule Prototype

Travel menentukan komisi package.

Untuk prototype, nilai commission dapat disimpan/configure pada backend atau package mapping sederhana.

Commission dibuat saat booking memenuhi trigger prototype, misalnya ketika booking menjadi `PAID`.

## 14.2 Schema

| Column | Type | Required | Rule |
|---|---|---:|---|
| id | string | yes | `COM_*` |
| booking_id | string | yes | unique active commission |
| affiliate_id | string | yes | FK |
| travel_id | string | yes | FK |
| package_id | string | yes | FK |
| commission_type | enum | yes | FIXED/PERCENT |
| commission_rate | number | yes | fixed amount or % |
| commission_amount | integer | yes | snapshot Rupiah |
| status | enum | yes | PENDING/APPROVED/PAID/CANCELLED |
| created_at | datetime | yes | |
| updated_at | datetime | yes | |

## 14.3 Contoh Isi

| id | booking_id | affiliate_id | travel_id | package_id | commission_type | commission_rate | commission_amount | status | created_at | updated_at |
|---|---|---|---|---|---|---:|---:|---|---|---|
| COM_001 | BKG_001 | AFF_001 | TRV_001 | PKG_001 | FIXED | 750000 | 750000 | PENDING | 2026-09-02T05:50:00Z | 2026-09-02T05:50:00Z |

---

# 15. PAYOUTS

## 15.1 Schema

| Column | Type | Required | Rule |
|---|---|---:|---|
| id | string | yes | `PAY_*` |
| affiliate_id | string | yes | FK |
| amount | integer | yes | >0 |
| bank_name | string | yes | snapshot |
| bank_account | string | yes | snapshot |
| bank_holder_name | string | yes | snapshot |
| status | enum | yes | PENDING/APPROVED/REJECTED/PAID |
| payment_reference | string | no | admin reference |
| requested_at | datetime | yes | |
| approved_at | datetime | no | |
| paid_at | datetime | no | |
| created_at | datetime | yes | |

## 15.2 Contoh Isi

| id | affiliate_id | amount | bank_name | bank_account | bank_holder_name | status | payment_reference | requested_at | approved_at | paid_at | created_at |
|---|---|---:|---|---|---|---|---|---|---|---|---|
| PAY_001 | AFF_001 | 750000 | BCA | 1234567890 | Hasan | PENDING |  | 2026-09-05T08:00:00Z |  |  | 2026-09-05T08:00:00Z |

---

# 16. REVIEWS

## 16.1 Rule Prototype

Review hanya dapat dibuat untuk booking `COMPLETED`.

## 16.2 Schema

| Column | Type | Required | Rule |
|---|---|---:|---|
| id | string | yes | `REV_*` |
| booking_id | string | yes | unique per user |
| user_id | string | yes | |
| travel_id | string | yes | |
| package_id | string | yes | |
| rating | integer | yes | 1-5 |
| review_text | string | no | |
| status | enum | yes | PENDING/PUBLISHED/HIDDEN |
| created_at | datetime | yes | |
| updated_at | datetime | yes | |

## 16.3 Contoh Isi

| id | booking_id | user_id | travel_id | package_id | rating | review_text | status | created_at | updated_at |
|---|---|---|---|---|---:|---|---|---|---|
| REV_001 | BKG_010 | USR_CUS001 | TRV_001 | PKG_001 | 5 | Pelayanan ramah dan hotel sesuai deskripsi. | PUBLISHED | 2026-09-20T07:00:00Z | 2026-09-20T07:00:00Z |

---

# 17. AUDIT_LOGS

## 17.1 Tujuan

Merekam perubahan administratif dan transaksi sensitif.

## 17.2 Schema

| Column | Type | Required | Rule |
|---|---|---:|---|
| id | string | yes | `AUD_*` |
| actor_user_id | string | no | |
| action | string | yes | |
| entity_type | string | yes | |
| entity_id | string | yes | |
| old_value | string/json | no | JSON.stringify |
| new_value | string/json | no | JSON.stringify |
| notes | string | no | |
| created_at | datetime | yes | |

## 17.3 Contoh Isi

| id | actor_user_id | action | entity_type | entity_id | old_value | new_value | notes | created_at |
|---|---|---|---|---|---|---|---|---|
| AUD_001 | USR_ADMIN01 | VERIFY_TRAVEL | TRAVEL | TRV_001 | `{"verification_status":"UNDER_REVIEW"}` | `{"verification_status":"VERIFIED"}` | Dokumen valid | 2026-09-02T05:10:00Z |

---

# 18. Relasi Utama

```text
USERS
 ├── 1:0..1 → TRAVELS (owner)
 └── 1:0..1 → AFFILIATES

TRAVELS
 ├── 1:N → TRAVEL_DOCUMENTS
 ├── 1:N → PACKAGES
 ├── 1:N → BOOKINGS
 └── 1:N → COMMISSIONS

PACKAGES
 ├── 1:N → DEPARTURES
 ├── 1:N → BOOKINGS
 ├── 1:N → REFERRAL_LINKS
 └── 1:N → REVIEWS

AFFILIATES
 ├── 1:N → REFERRAL_LINKS
 ├── 1:N → REFERRAL_CLICKS
 ├── 1:N → ATTRIBUTIONS
 ├── 1:N → COMMISSIONS
 └── 1:N → PAYOUTS

BOOKINGS
 ├── N:1 → PACKAGE
 ├── N:1 → DEPARTURE
 ├── 0..1:N → AFFILIATE
 ├── 0..1:1 → ATTRIBUTION
 ├── 0..1:1 → COMMISSION
 └── 0..1:1 → REVIEW
```

---

# 19. API Transport

## 19.1 Endpoint

Deployment Apps Script Web App:

```text
https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
```

Prototype menggunakan action-style routing:

```text
GET  ?action=packages.list
POST ?action=bookings.create
```

## 19.2 POST Body

```json
{
  "data": {}
}
```

Untuk implementasi yang lebih sederhana, backend juga boleh menerima body langsung tanpa wrapper `data`, tetapi pilih satu pola dan gunakan konsisten.

Dokumen ini menggunakan pola:

```json
{
  "data": {
    "...": "..."
  }
}
```

---

# 20. Standard API Response

## 20.1 Success — Single

```json
{
  "success": true,
  "data": {
    "id": "PKG_001"
  },
  "meta": null,
  "error": null
}
```

## 20.2 Success — List

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 2
  },
  "error": null
}
```

## 20.3 Error

```json
{
  "success": false,
  "data": null,
  "meta": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data tidak valid.",
    "fields": {
      "email": "Email wajib diisi."
    }
  }
}
```

---

# 21. Error Codes

```text
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
DUPLICATE
INVALID_STATE
TRAVEL_NOT_VERIFIED
PACKAGE_NOT_AVAILABLE
DEPARTURE_NOT_AVAILABLE
QUOTA_NOT_AVAILABLE
AFFILIATE_NOT_ACTIVE
ATTRIBUTION_EXPIRED
COMMISSION_NOT_ELIGIBLE
PAYOUT_BALANCE_INSUFFICIENT
INTERNAL_ERROR
```

---

# 22. API CONTRACT — PUBLIC MARKETPLACE

---

## 22.1 `packages.list`

**Method**

```text
GET
```

**Request**

```text
?action=packages.list
&keyword=premium
&departure_city=Jakarta
&price_min=20000000
&price_max=40000000
&airline=Saudia
&flight_type=DIRECT
&page=1
&limit=20
&sort=price_asc
```

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": "PKG_001",
      "name": "Umroh Premium 9 Hari",
      "slug": "umroh-premium-9-hari",
      "travel": {
        "id": "TRV_001",
        "name": "Amanah Umroh",
        "slug": "amanah-umroh",
        "verification_status": "VERIFIED",
        "rating": 4.8
      },
      "duration_days": 9,
      "base_price": 32500000,
      "departure_city": "Jakarta",
      "airline": "Saudia",
      "flight_type": "DIRECT",
      "hotel_makkah": "Pullman Zamzam",
      "hotel_madinah": "Sofitel Shahd",
      "image_url": "https://example.com/pkg1.jpg",
      "featured": true,
      "next_departure": {
        "id": "DEP_001",
        "departure_date": "2027-01-10",
        "price": 32500000,
        "quota": 40,
        "booked": 12,
        "remaining_quota": 28
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  },
  "error": null
}
```

---

## 22.2 `packages.detail`

**Method**

```text
GET
```

**Request**

```text
?action=packages.detail&id=PKG_001
```

atau:

```text
?action=packages.detail&slug=umroh-premium-9-hari
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "PKG_001",
    "name": "Umroh Premium 9 Hari",
    "slug": "umroh-premium-9-hari",
    "description": "Paket premium 9 hari untuk keluarga",
    "duration_days": 9,
    "base_price": 32500000,
    "departure_city": "Jakarta",
    "airline": "Saudia",
    "flight_type": "DIRECT",
    "hotel_makkah": "Pullman Zamzam",
    "hotel_makkah_rating": 5,
    "hotel_madinah": "Sofitel Shahd",
    "hotel_madinah_rating": 5,
    "facilities": [
      "Visa",
      "Hotel",
      "Makan",
      "Transport",
      "Mutawwif"
    ],
    "exclusions": [
      "Paspor",
      "Vaksin"
    ],
    "image_url": "https://example.com/pkg1.jpg",
    "travel": {
      "id": "TRV_001",
      "name": "Amanah Umroh",
      "slug": "amanah-umroh",
      "verification_status": "VERIFIED",
      "rating": 4.8,
      "review_count": 124
    },
    "departures": [
      {
        "id": "DEP_001",
        "departure_date": "2027-01-10",
        "return_date": "2027-01-18",
        "price": 32500000,
        "quota": 40,
        "booked": 12,
        "remaining_quota": 28,
        "status": "AVAILABLE"
      }
    ]
  },
  "meta": null,
  "error": null
}
```

---

## 22.3 `travels.list`

**Request**

```text
GET ?action=travels.list&verified=true&page=1&limit=20
```

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": "TRV_001",
      "name": "Amanah Umroh",
      "slug": "amanah-umroh",
      "city": "Jakarta Selatan",
      "province": "DKI Jakarta",
      "logo_url": "https://example.com/amanah.png",
      "verification_status": "VERIFIED",
      "rating": 4.8,
      "review_count": 124
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  },
  "error": null
}
```

---

## 22.4 `travels.detail`

**Request**

```text
GET ?action=travels.detail&id=TRV_001
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "TRV_001",
    "name": "Amanah Umroh",
    "slug": "amanah-umroh",
    "city": "Jakarta Selatan",
    "province": "DKI Jakarta",
    "logo_url": "https://example.com/amanah.png",
    "description": "Paket Umroh reguler dan premium",
    "verification_status": "VERIFIED",
    "rating": 4.8,
    "review_count": 124
  },
  "meta": null,
  "error": null
}
```

---

# 23. API CONTRACT — AUTH PROTOTYPE

Untuk prototype tertutup, auth dapat menggunakan seeded accounts dan session sederhana.

## 23.1 `auth.login`

**Method**

```text
POST
```

**Body**

```json
{
  "data": {
    "email": "owner@amanah.local",
    "password": "demo123"
  }
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "session_token": "prototype-session-token",
    "user": {
      "id": "USR_TRV001",
      "name": "Ahmad Travel",
      "email": "owner@amanah.local",
      "role": "TRAVEL",
      "travel_id": "TRV_001"
    }
  },
  "meta": null,
  "error": null
}
```

> Untuk prototype lokal/demo saja. Jangan gunakan desain token ini apa adanya untuk production.

---

## 23.2 `auth.me`

**Request**

```text
GET ?action=auth.me&session_token=prototype-session-token
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "USR_TRV001",
    "name": "Ahmad Travel",
    "role": "TRAVEL",
    "travel_id": "TRV_001"
  },
  "meta": null,
  "error": null
}
```

---

# 24. API CONTRACT — TRAVEL

## 24.1 `travels.create`

**Method:** POST

```json
{
  "data": {
    "owner_user_id": "USR_TRV003",
    "name": "Barokah Tour",
    "legal_name": "PT Barokah Wisata",
    "city": "Surabaya",
    "province": "Jawa Timur",
    "phone": "031555333",
    "email": "hello@barokah.local",
    "description": "Travel Umroh Surabaya"
  }
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "TRV_ABC123",
    "slug": "barokah-tour",
    "verification_status": "PENDING",
    "status": "ACTIVE"
  },
  "meta": null,
  "error": null
}
```

---

## 24.2 `travels.update`

**Body**

```json
{
  "data": {
    "id": "TRV_001",
    "phone": "021555999",
    "description": "Travel Umroh terpercaya untuk keluarga."
  }
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "TRV_001",
    "updated": true
  },
  "meta": null,
  "error": null
}
```

---

## 24.3 `travelDocuments.create`

**Body**

```json
{
  "data": {
    "travel_id": "TRV_002",
    "document_type": "IZIN_USAHA",
    "document_number": "IZ-2026-002",
    "file_url": "https://drive.google.com/...",
    "issued_at": "2026-01-01",
    "expires_at": "2027-01-01"
  }
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "DOC_ABC123",
    "status": "PENDING"
  },
  "meta": null,
  "error": null
}
```

---

# 25. API CONTRACT — PACKAGE MANAGEMENT

## 25.1 `packages.create`

**Body**

```json
{
  "data": {
    "travel_id": "TRV_001",
    "name": "Umroh Ramadhan 12 Hari",
    "short_description": "Paket Ramadhan keluarga",
    "description": "Paket Umroh Ramadhan dengan hotel bintang 5.",
    "duration_days": 12,
    "base_price": 42000000,
    "departure_city": "Jakarta",
    "airline": "Garuda Indonesia",
    "flight_type": "DIRECT",
    "hotel_makkah": "Hotel Example",
    "hotel_makkah_rating": 5,
    "hotel_madinah": "Hotel Example Madinah",
    "hotel_madinah_rating": 5,
    "facilities": [
      "Visa",
      "Hotel",
      "Makan",
      "Transport"
    ],
    "exclusions": [
      "Paspor"
    ],
    "image_url": "https://example.com/ramadhan.jpg"
  }
}
```

**Backend Transform**

```text
facilities array
→ "Visa|Hotel|Makan|Transport"

status
→ DRAFT

featured
→ FALSE
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "PKG_NEW001",
    "slug": "umroh-ramadhan-12-hari",
    "status": "DRAFT"
  },
  "meta": null,
  "error": null
}
```

---

## 25.2 `packages.update`

**Body**

```json
{
  "data": {
    "id": "PKG_NEW001",
    "base_price": 42500000,
    "description": "Deskripsi paket diperbarui."
  }
}
```

---

## 25.3 `packages.publish`

**Body**

```json
{
  "data": {
    "id": "PKG_NEW001"
  }
}
```

**Business Rules**

```text
travel.verification_status == VERIFIED
package mempunyai minimal satu departure AVAILABLE
required fields lengkap
```

**Success**

```json
{
  "success": true,
  "data": {
    "id": "PKG_NEW001",
    "status": "PUBLISHED"
  },
  "meta": null,
  "error": null
}
```

**Failure**

```json
{
  "success": false,
  "data": null,
  "meta": null,
  "error": {
    "code": "TRAVEL_NOT_VERIFIED",
    "message": "Travel belum terverifikasi.",
    "fields": null
  }
}
```

---

# 26. API CONTRACT — DEPARTURE

## 26.1 `departures.list`

```text
GET ?action=departures.list&package_id=PKG_001
```

---

## 26.2 `departures.create`

**Body**

```json
{
  "data": {
    "package_id": "PKG_001",
    "departure_date": "2027-03-01",
    "return_date": "2027-03-09",
    "price": 34000000,
    "quota": 40
  }
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "DEP_NEW001",
    "status": "AVAILABLE",
    "booked": 0
  },
  "meta": null,
  "error": null
}
```

---

# 27. API CONTRACT — BOOKING

## 27.1 `bookings.create`

**Method:** POST

**Body**

```json
{
  "data": {
    "user_id": "USR_CUS001",
    "package_id": "PKG_001",
    "departure_id": "DEP_001",
    "customer_name": "Budi Jamaah",
    "customer_phone": "08123456789",
    "customer_email": "budi@demo.local",
    "pilgrim_count": 2,
    "visitor_id": "VIS_abcd1234",
    "notes": "Mohon kamar berdekatan"
  }
}
```

**Backend Logic**

```text
1. Load package
2. Package harus PUBLISHED
3. Load departure
4. Departure harus AVAILABLE
5. remaining_quota >= pilgrim_count
6. Resolve active attribution berdasarkan visitor_id/package_id
7. unit_price = departure.price
8. total_amount = unit_price × pilgrim_count
9. Generate booking code
10. Insert booking
```

**Important**

Frontend tidak boleh mengirim:

```text
total_amount
unit_price
travel_id
affiliate_id
```

sebagai source of truth.

**Response**

```json
{
  "success": true,
  "data": {
    "id": "BKG_NEW001",
    "booking_code": "UH-260902-002",
    "travel_id": "TRV_001",
    "package_id": "PKG_001",
    "departure_id": "DEP_001",
    "affiliate_id": "AFF_001",
    "unit_price": 32500000,
    "pilgrim_count": 2,
    "total_amount": 65000000,
    "status": "PENDING",
    "payment_status": "UNPAID"
  },
  "meta": null,
  "error": null
}
```

---

## 27.2 `bookings.listCustomer`

```text
GET ?action=bookings.listCustomer&user_id=USR_CUS001
```

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": "BKG_001",
      "booking_code": "UH-260902-001",
      "package_name": "Umroh Premium 9 Hari",
      "travel_name": "Amanah Umroh",
      "departure_date": "2027-01-10",
      "pilgrim_count": 2,
      "total_amount": 65000000,
      "status": "CONFIRMED",
      "payment_status": "UNPAID"
    }
  ],
  "meta": {
    "total": 1
  },
  "error": null
}
```

---

## 27.3 `bookings.listTravel`

```text
GET ?action=bookings.listTravel&travel_id=TRV_001&status=PENDING
```

---

## 27.4 `bookings.confirm`

**Body**

```json
{
  "data": {
    "booking_id": "BKG_NEW001"
  }
}
```

**Allowed**

```text
PENDING → CONFIRMED
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "BKG_NEW001",
    "status": "CONFIRMED"
  },
  "meta": null,
  "error": null
}
```

---

## 27.5 `bookings.markPaid`

**Body**

```json
{
  "data": {
    "booking_id": "BKG_NEW001",
    "payment_reference": "MANUAL-TRANSFER-001"
  }
}
```

**Backend**

```text
CONFIRMED → PAID
payment_status → PAID

Jika booking memiliki affiliate valid:
create commission apabila belum ada.
```

**Response**

```json
{
  "success": true,
  "data": {
    "booking_id": "BKG_NEW001",
    "status": "PAID",
    "payment_status": "PAID",
    "commission_created": true,
    "commission_id": "COM_NEW001"
  },
  "meta": null,
  "error": null
}
```

---

# 28. API CONTRACT — AFFILIATE

## 28.1 `affiliates.register`

**Body**

```json
{
  "data": {
    "user_id": "USR_AFF002",
    "name": "Abdullah",
    "phone": "0812888888",
    "bank_name": "BSI",
    "bank_account": "777888999",
    "bank_holder_name": "Abdullah"
  }
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "AFF_NEW001",
    "affiliate_code": "ABDULLAH01",
    "status": "PENDING"
  },
  "meta": null,
  "error": null
}
```

---

## 28.2 `affiliates.listPackages`

```text
GET ?action=affiliates.listPackages&affiliate_id=AFF_001
```

Response package dapat menambahkan:

```json
{
  "commission": {
    "type": "FIXED",
    "value": 750000
  }
}
```

---

# 29. API CONTRACT — REFERRAL

## 29.1 `referrals.create`

**Body**

```json
{
  "data": {
    "affiliate_id": "AFF_001",
    "package_id": "PKG_001",
    "campaign": "IG-SEPTEMBER"
  }
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "REF_NEW001",
    "code": "HASAN001-PKG001-X1",
    "url": "index.html?package=PKG_001&ref=HASAN001-PKG001-X1"
  },
  "meta": null,
  "error": null
}
```

---

## 29.2 `referrals.track`

**Body**

```json
{
  "data": {
    "ref_code": "HASAN001-PKG001-X1",
    "package_id": "PKG_001",
    "visitor_id": "VIS_abcd1234",
    "session_id": "SES_xyz999",
    "landing_url": "index.html?package=PKG_001&ref=HASAN001-PKG001-X1"
  }
}
```

**Backend**

```text
1. Validate referral link ACTIVE
2. Validate affiliate ACTIVE
3. Validate package
4. Insert REFERRAL_CLICKS
5. Expire/replace previous eligible attribution if needed
6. Create ATTRIBUTIONS with +30 days
```

**Response**

```json
{
  "success": true,
  "data": {
    "tracked": true,
    "attribution_id": "ATR_NEW001",
    "expires_at": "2026-10-02T05:41:00Z"
  },
  "meta": null,
  "error": null
}
```

---

# 30. API CONTRACT — COMMISSION

## 30.1 `commissions.list`

Affiliate:

```text
GET ?action=commissions.list&affiliate_id=AFF_001&status=PENDING
```

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": "COM_001",
      "booking_id": "BKG_001",
      "booking_code": "UH-260902-001",
      "package_name": "Umroh Premium 9 Hari",
      "commission_amount": 750000,
      "status": "PENDING",
      "created_at": "2026-09-02T05:50:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "summary": {
      "pending": 750000,
      "approved": 0,
      "paid": 0
    }
  },
  "error": null
}
```

---

## 30.2 `commissions.approve`

Admin only.

**Body**

```json
{
  "data": {
    "commission_id": "COM_001"
  }
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "COM_001",
    "status": "APPROVED"
  },
  "meta": null,
  "error": null
}
```

---

# 31. API CONTRACT — PAYOUT

## 31.1 `payouts.create`

**Body**

```json
{
  "data": {
    "affiliate_id": "AFF_001",
    "amount": 750000
  }
}
```

Backend mengambil rekening dari AFFILIATES dan membuat snapshot.

**Response**

```json
{
  "success": true,
  "data": {
    "id": "PAY_NEW001",
    "amount": 750000,
    "status": "PENDING"
  },
  "meta": null,
  "error": null
}
```

---

## 31.2 `payouts.list`

```text
GET ?action=payouts.list&affiliate_id=AFF_001
```

---

## 31.3 `admin.payoutMarkPaid`

**Body**

```json
{
  "data": {
    "payout_id": "PAY_NEW001",
    "payment_reference": "BCA-TRX-20260905-001"
  }
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "PAY_NEW001",
    "status": "PAID",
    "payment_reference": "BCA-TRX-20260905-001"
  },
  "meta": null,
  "error": null
}
```

---

# 32. API CONTRACT — REVIEWS

## 32.1 `reviews.create`

**Body**

```json
{
  "data": {
    "booking_id": "BKG_010",
    "user_id": "USR_CUS001",
    "rating": 5,
    "review_text": "Pelayanan ramah dan hotel sesuai deskripsi."
  }
}
```

**Business Rule**

```text
booking.status == COMPLETED
booking.user_id == user_id
belum ada review untuk booking tersebut
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "REV_NEW001",
    "status": "PENDING"
  },
  "meta": null,
  "error": null
}
```

---

## 32.2 `reviews.listPackage`

```text
GET ?action=reviews.listPackage&package_id=PKG_001
```

---

# 33. API CONTRACT — ADMIN

## 33.1 `admin.travels`

```text
GET ?action=admin.travels&verification_status=PENDING
```

---

## 33.2 `admin.verifyTravel`

**Body**

```json
{
  "data": {
    "travel_id": "TRV_002",
    "decision": "VERIFY",
    "notes": "Dokumen telah diperiksa."
  }
}
```

Allowed decisions:

```text
VERIFY
REJECT
SUSPEND
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "TRV_002",
    "verification_status": "VERIFIED"
  },
  "meta": null,
  "error": null
}
```

Wajib membuat `AUDIT_LOGS`.

---

## 33.3 `admin.bookings`

```text
GET ?action=admin.bookings&status=PAID&page=1&limit=50
```

---

## 33.4 `admin.commissions`

```text
GET ?action=admin.commissions&status=PENDING
```

---

## 33.5 `admin.dashboard`

**Request**

```text
GET ?action=admin.dashboard
```

**Response**

```json
{
  "success": true,
  "data": {
    "users": 1250,
    "travels": {
      "total": 48,
      "verified": 35,
      "pending": 13
    },
    "packages": {
      "total": 320,
      "published": 280
    },
    "bookings": {
      "total": 420,
      "paid": 170
    },
    "affiliates": {
      "total": 210,
      "active": 170
    },
    "commissions": {
      "pending_amount": 24500000,
      "approved_amount": 18750000,
      "paid_amount": 12000000
    }
  },
  "meta": null,
  "error": null
}
```

---

# 34. Recommended Router Mapping

```javascript
const ROUTES = {
  "auth.login": AuthService.login,
  "auth.me": AuthService.me,

  "packages.list": PackageService.list,
  "packages.detail": PackageService.detail,
  "packages.create": PackageService.create,
  "packages.update": PackageService.update,
  "packages.publish": PackageService.publish,

  "travels.list": TravelService.list,
  "travels.detail": TravelService.detail,
  "travels.create": TravelService.create,
  "travels.update": TravelService.update,

  "travelDocuments.create": TravelService.createDocument,

  "departures.list": PackageService.listDepartures,
  "departures.create": PackageService.createDeparture,

  "bookings.create": BookingService.create,
  "bookings.listCustomer": BookingService.listCustomer,
  "bookings.listTravel": BookingService.listTravel,
  "bookings.confirm": BookingService.confirm,
  "bookings.markPaid": BookingService.markPaid,

  "affiliates.register": AffiliateService.register,
  "affiliates.listPackages": AffiliateService.listPackages,

  "referrals.create": AffiliateService.createReferral,
  "referrals.track": AffiliateService.trackReferral,

  "commissions.list": CommissionService.list,
  "commissions.approve": CommissionService.approve,

  "payouts.create": CommissionService.createPayout,
  "payouts.list": CommissionService.listPayouts,

  "reviews.create": ReviewService.create,
  "reviews.listPackage": ReviewService.listPackage,

  "admin.travels": AdminService.listTravels,
  "admin.verifyTravel": AdminService.verifyTravel,
  "admin.bookings": AdminService.listBookings,
  "admin.commissions": AdminService.listCommissions,
  "admin.payoutMarkPaid": AdminService.markPayoutPaid,
  "admin.dashboard": AdminService.dashboard
};
```

---

# 35. Frontend API Client Contract

```javascript
const API_URL = "YOUR_APPS_SCRIPT_WEB_APP_URL";

async function api(action, options = {}) {
  const {
    method = "GET",
    query = {},
    data = null
  } = options;

  const params = new URLSearchParams({
    action,
    ...query
  });

  const config = {
    method
  };

  if (method !== "GET" && data !== null) {
    config.headers = {
      "Content-Type": "text/plain;charset=utf-8"
    };

    config.body = JSON.stringify({
      data
    });
  }

  const response = await fetch(`${API_URL}?${params}`, config);
  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.error?.message || "Terjadi kesalahan."
    );
  }

  return result;
}
```

Example:

```javascript
const result = await api("packages.list", {
  query: {
    departure_city: "Jakarta",
    page: 1,
    limit: 20
  }
});

renderPackages(result.data);
```

Booking:

```javascript
const booking = await api("bookings.create", {
  method: "POST",
  data: {
    user_id: currentUser.id,
    package_id: selectedPackage.id,
    departure_id: selectedDeparture.id,
    customer_name: form.name,
    customer_phone: form.phone,
    customer_email: form.email,
    pilgrim_count: Number(form.pilgrimCount),
    visitor_id: getVisitorId(),
    notes: form.notes
  }
});
```

---

# 36. SpreadsheetRepository Contract

Backend service tidak boleh membaca spreadsheet langsung.

Interface konseptual:

```javascript
DB.getAll(sheetName)

DB.findById(sheetName, id)

DB.findOne(sheetName, predicate)

DB.filter(sheetName, predicate)

DB.insert(sheetName, object)

DB.updateById(sheetName, id, patch)

DB.exists(sheetName, predicate)
```

Example:

```javascript
const travel = DB.findById("TRAVELS", packageData.travel_id);

if (!travel) {
  throwAppError("NOT_FOUND", "Travel tidak ditemukan.");
}
```

---

# 37. Validation Minimum

## Package

```text
name              required
duration_days     integer > 0
base_price        number > 0
departure_city    required
travel_id         valid
```

## Departure

```text
package_id        valid
departure_date    required
return_date       > departure_date
price             > 0
quota             > 0
```

## Booking

```text
package_id        valid
departure_id      valid
pilgrim_count     integer > 0
customer_name     required
customer_phone    required
customer_email    valid format
```

## Affiliate

```text
user_id           valid
phone             required
affiliate_code    unique
```

---

# 38. Business Rules yang Tidak Boleh Dipindahkan ke Frontend

Backend wajib menjadi source of truth untuk:

```text
travel verification
package publication eligibility
departure availability
remaining quota
booking price
booking total
affiliate attribution
commission amount
commission status
payout balance
admin verification
```

Frontend boleh menampilkan preview, tetapi backend tetap menghitung ulang.

---

# 39. Prototype Concurrency Protection

Google Sheets bukan transactional database.

Untuk mutation kritis seperti:

```text
bookings.create
bookings.confirm
bookings.markPaid
commissions.approve
payouts.create
```

gunakan Apps Script:

```javascript
const lock = LockService.getScriptLock();

lock.waitLock(10000);

try {
  // read + validate + write
} finally {
  lock.releaseLock();
}
```

Ini hanya mitigasi prototype, bukan pengganti database transaction production.

---

# 40. Data Seed Minimum

Sebelum integrasi frontend, buat minimal:

```text
1 ADMIN
2 CUSTOMER

2 TRAVEL
  ├── 1 VERIFIED
  └── 1 PENDING

5 PACKAGES

8 DEPARTURES

2 AFFILIATES
  ├── 1 ACTIVE
  └── 1 PENDING

3 BOOKINGS

3 REFERRAL LINKS

5 REFERRAL CLICKS

2 ATTRIBUTIONS

2 COMMISSIONS
```

Tujuannya agar semua dashboard mempunyai data nyata untuk demo.

---

# 41. Prototype Smoke Test

Sebelum UI dianggap selesai:

```text
[ ] packages.list mengembalikan package published
[ ] packages.detail mengembalikan departures
[ ] travel pending tidak dapat publish package
[ ] admin dapat verify travel
[ ] verified travel dapat publish package
[ ] booking mengambil harga dari departure
[ ] booking total dihitung backend
[ ] quota kurang → booking ditolak
[ ] referral click tercatat
[ ] attribution expired setelah 30 hari
[ ] last eligible affiliate wins
[ ] attributed booking menyimpan affiliate_id
[ ] markPaid membuat commission hanya sekali
[ ] admin dapat approve commission
[ ] affiliate dapat melihat commission
[ ] payout tidak melebihi balance eligible
[ ] review hanya dari completed booking
[ ] admin action membuat audit log
```

---

# 42. Scope Boundary

## Prototype

Boleh:

```text
Google Sheets
Apps Script
manual payment verification
manual affiliate payout
seeded demo authentication
simple analytics
localStorage visitor ID
```

## Jangan dianggap production-ready

```text
password/session security
financial settlement
PII/passport storage
high concurrency booking
full anti-fraud
large-scale click tracking
regulatory compliance
real banking integration
```

---

# 43. Recommended Build Order

```text
01 Create Spreadsheet + headers
02 Seed sample data
03 Config.gs
04 Utils.gs
05 SpreadsheetRepository.gs
06 Router.gs
07 Public Package APIs
08 Travel APIs
09 Booking APIs
10 Affiliate / Attribution APIs
11 Commission APIs
12 Admin APIs
13 Connect index.html
14 Test end-to-end
```

---

# 44. Definition of Prototype Done

Prototype dianggap selesai jika flow ini dapat didemokan tanpa mengedit Spreadsheet secara manual:

```text
TRAVEL
Login
→ Create Package
→ Create Departure
→ Publish

ADMIN
Verify Travel

CUSTOMER
Browse
→ Package Detail
→ Select Departure
→ Booking

AFFILIATE
Generate Referral
→ Customer Click
→ Attribution
→ Booking

TRAVEL
Confirm
→ Mark Paid

SYSTEM
Create Commission

ADMIN
Approve Commission

AFFILIATE
View Commission
→ Request Payout
```

Itulah kontrak minimum antara `index.html`, Google Apps Script, dan Google Spreadsheet.

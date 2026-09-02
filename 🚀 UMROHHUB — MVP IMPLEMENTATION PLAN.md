# 🚀 UMROHHUB — MVP IMPLEMENTATION PLAN
## Sprint Plan 8 Minggu
### Blueprint → User Story → Database → API → UI → Testing

**Target:** MVP production-ready  
**Platform:** Web Responsive / PWA  
**Architecture:** Modular Monolith  
**Team:** Solo Developer + AI Coding Assistant  
**Timeline:** 8 Minggu  
**Primary Stack:** Next.js + TypeScript + PostgreSQL + Prisma

---

# 0. PRINSIP IMPLEMENTASI

Urutan development wajib mengikuti dependency berikut:

```text
FOUNDATION
    ↓
IDENTITY & RBAC
    ↓
TRAVEL
    ↓
VERIFICATION
    ↓
PACKAGE
    ↓
DEPARTURE
    ↓
MARKETPLACE
    ↓
BOOKING
    ↓
AFFILIATE
    ↓
ATTRIBUTION
    ↓
COMMISSION
    ↓
PAYOUT
    ↓
REVIEW
    ↓
ADMIN
    ↓
HARDENING
```

Jangan membangun UI affiliate sebelum model booking stabil.

Jangan membuat commission sebelum state booking jelas.

Jangan membuat payout sebelum commission ledger selesai.

Jangan membuat analytics kompleks sebelum event/data sumbernya tersedia.

---

# =========================================================
# MINGGU 1 — FOUNDATION, AUTH & RBAC
# =========================================================

## 🎯 Objective

Pada akhir minggu pertama:

```text
User dapat register
↓
Login
↓
Session terbentuk
↓
Role dikenali
↓
Protected route bekerja
↓
Aplikasi dapat deploy ke staging
```

---

# 1.1 USER STORIES

## US-001 — Register Customer

**Sebagai** calon jamaah  
**Saya ingin** membuat akun  
**Agar** dapat menyimpan paket dan melakukan booking.

### Acceptance Criteria

```text
GIVEN user belum memiliki akun
WHEN user memasukkan nama, email dan password valid
THEN akun berhasil dibuat

AND
password tidak disimpan plaintext

AND
email duplicate ditolak

AND
default role = CUSTOMER
```

---

## US-002 — Login

**Sebagai** user  
**Saya ingin** login  
**Agar** dapat mengakses fitur sesuai role.

### Acceptance Criteria

```text
Valid credential → login sukses

Invalid credential → generic error

Inactive user → login ditolak

Session aman dibuat

Logout → session invalid
```

---

## US-003 — Protected Route

**Sebagai** sistem  
**Saya ingin** membatasi halaman berdasarkan role  
**Agar** user tidak mengakses area yang bukan miliknya.

### Acceptance Criteria

CUSTOMER tidak dapat membuka:

```text
/admin/*
/travel/*
/affiliate/*
```

AFFILIATE tidak dapat membuka:

```text
/admin/*
/travel/*
```

TRAVEL tidak dapat membuka:

```text
/admin/*
```

---

# 1.2 DATABASE MIGRATION ORDER

## Migration 001

```text
users
```

Fields utama:

```text
id
email
phone
password_hash
full_name
avatar_url
email_verified_at
status
last_login_at
created_at
updated_at
deleted_at
```

---

## Migration 002

```text
roles
permissions
role_permissions
user_roles
```

Seed roles:

```text
SUPER_ADMIN
ADMIN
CUSTOMER
AFFILIATE
TRAVEL_OWNER
TRAVEL_STAFF
```

---

## Migration 003

```text
audit_logs
```

Dibuat dari awal karena perubahan sensitif berikutnya harus dapat dicatat.

---

# 1.3 API IMPLEMENTATION ORDER

Urutan:

```text
01 POST /api/v1/auth/register
02 POST /api/v1/auth/login
03 POST /api/v1/auth/logout
04 GET  /api/v1/auth/me
05 POST /api/v1/auth/forgot-password
06 POST /api/v1/auth/reset-password
07 GET  /api/v1/users/me
08 PATCH /api/v1/users/me
```

Jangan mengerjakan social login pada MVP awal.

---

# 1.4 UI

Bangun:

```text
/login
/register
/forgot-password
/dashboard redirect
/profile
```

Shared components:

```text
FormField
PasswordField
SubmitButton
ErrorAlert
PageLoader
EmptyState
ConfirmDialog
```

---

# 1.5 TESTING

Minimum automated tests:

```text
register success
duplicate email
weak password
login success
wrong password
inactive account
unauthorized route
wrong role route
logout
```

---

# 1.6 PROMPT CODING — AUTH MODULE

```text
Anda adalah senior TypeScript/Next.js engineer.

Bangun module Authentication untuk aplikasi marketplace Umroh berbasis
Next.js, TypeScript, PostgreSQL dan Prisma.

Requirement:

1. User entity:
   - UUID
   - email unique
   - password_hash
   - full_name
   - status
   - timestamps

2. Roles:
   SUPER_ADMIN
   ADMIN
   CUSTOMER
   AFFILIATE
   TRAVEL_OWNER
   TRAVEL_STAFF

3. Implement:
   - register
   - login
   - logout
   - get current user
   - forgot password
   - reset password

4. Authentication browser harus menggunakan secure HttpOnly cookie/session.
Jangan simpan credential/token sensitif di localStorage.

5. Server-side validation wajib.

6. Password harus menggunakan password hashing library modern.

7. Buat authorization helpers untuk role dan permission.

8. Struktur kode harus modular dan tidak menaruh seluruh logic di route handler.

Pisahkan:
- controller/route
- service
- repository
- schema validation
- domain types
- authorization

9. Buat unit tests untuk business logic kritis.

10. Sertakan Prisma migration dan seed role.

Jangan implementasikan fitur di luar scope.
```

---

# =========================================================
# MINGGU 2 — TRAVEL ONBOARDING & VERIFICATION
# =========================================================

## 🎯 Objective

Travel dapat:

```text
Register sebagai Travel
↓
Buat Profil Travel
↓
Upload Dokumen
↓
Admin Review
↓
Travel Verified
```

---

# 2.1 USER STORIES

## US-010 — Create Travel Company

**Sebagai** pemilik travel  
**Saya ingin** mendaftarkan travel  
**Agar** dapat menjual paket melalui platform.

### Acceptance Criteria

Saat travel dibuat:

```text
verification_status = PENDING
status = ACTIVE
```

User pembuat otomatis menjadi:

```text
TRAVEL_OWNER
```

dan menjadi member travel tersebut.

---

## US-011 — Upload Legal Document

Acceptance Criteria:

```text
Travel owner dapat upload dokumen

File hanya:
PDF
JPG
PNG

File private

Metadata dokumen tersimpan

Travel lain tidak dapat melihat file
```

---

## US-012 — Admin Verify Travel

### Acceptance Criteria

Admin dapat:

```text
approve
reject
request revision
suspend
```

Setiap perubahan wajib mencatat:

```text
admin
timestamp
old_status
new_status
reason
```

---

# 2.2 DATABASE MIGRATIONS

## Migration 004

```text
travel_companies
```

---

## Migration 005

```text
travel_members
```

Unique:

```text
travel_id + user_id
```

---

## Migration 006

```text
travel_documents
```

Important:

```text
expires_at
verification_status
reviewed_by
reviewed_at
rejection_reason
```

---

# 2.3 API ORDER

```text
01 POST  /travels
02 GET   /travels/:slug
03 PATCH /travels/:id

04 GET   /travels/:id/documents
05 POST  /travels/:id/documents
06 DELETE /travels/:id/documents/:documentId

07 GET  /admin/travel-verifications
08 GET  /admin/travels/:id
09 POST /admin/travels/:id/verify
10 POST /admin/travels/:id/reject
11 POST /admin/travels/:id/suspend
```

---

# 2.4 UI

Travel:

```text
/travel/onboarding
/travel/profile
/travel/verification
```

Admin:

```text
/admin/travels
/admin/travels/:id
/admin/verifications
```

---

# 2.5 CRITICAL BUSINESS RULE

Package publication nantinya harus melakukan:

```text
IF travel.verification_status != VERIFIED
THEN reject publication
```

Jangan hanya menyembunyikan tombol UI.

Rule harus divalidasi backend.

---

# 2.6 PROMPT CODING — TRAVEL MODULE

```text
Bangun module Travel Management untuk marketplace Umroh.

Context:
- existing users/RBAC module sudah tersedia
- database PostgreSQL + Prisma
- architecture modular monolith

Implement entities:

TravelCompany
TravelMember
TravelDocument

Travel verification status:
PENDING
UNDER_REVIEW
VERIFIED
REJECTED
SUSPENDED
EXPIRED

Requirement:

1. User yang membuat travel menjadi TRAVEL_OWNER.
2. User hanya dapat memodifikasi travel tempat dia menjadi member authorized.
3. Legal document disimpan sebagai private object.
4. File access menggunakan signed URL.
5. Admin dapat approve/reject/suspend.
6. Semua administrative state changes masuk audit log.
7. Support document expiry date.
8. Jangan expose private document URL di public Travel API.
9. Tambahkan authorization test untuk cross-tenant access.
```

---

# =========================================================
# MINGGU 3 — PACKAGE, DEPARTURE & MARKETPLACE
# =========================================================

## 🎯 Objective

Travel dapat membuat paket dan user dapat melihat marketplace publik.

Flow:

```text
Travel
↓
Create Package
↓
Add Departure
↓
Submit/Publish
↓
Marketplace
↓
Package Detail
```

---

# 3.1 USER STORIES

## US-020 — Create Package

Travel owner dapat membuat draft package.

Mandatory input:

```text
name
description
duration
base_price
departure_city
airline
facilities
terms
```

Status awal:

```text
DRAFT
```

---

## US-021 — Create Departure

Travel dapat membuat:

```text
departure_date
return_date
price
quota
```

Validation:

```text
departure_date < return_date

quota > 0

price > 0
```

---

## US-022 — Publish Package

### Acceptance Criteria

Package hanya dapat published jika:

```text
travel VERIFIED

package valid

minimal 1 departure aktif

minimal 1 image

price valid
```

---

## US-023 — Browse Marketplace

Customer tanpa login dapat:

```text
lihat package
search
filter
sort
lihat detail
lihat travel
```

---

# 3.2 MIGRATIONS

## Migration 007

```text
packages
```

---

## Migration 008

```text
package_images
package_itineraries
```

---

## Migration 009

```text
departures
```

---

## Migration 010

```text
wishlists
```

Wishlist dapat selesai minggu 3 jika waktu cukup.

---

# 3.3 API ORDER

Travel:

```text
01 POST   /travel/packages
02 GET    /travel/packages
03 GET    /travel/packages/:id
04 PATCH  /travel/packages/:id

05 POST   /travel/packages/:id/images
06 DELETE /travel/packages/:id/images/:imageId

07 POST   /travel/packages/:id/departures
08 PATCH  /travel/departures/:id
09 DELETE /travel/departures/:id

10 POST   /travel/packages/:id/publish
11 POST   /travel/packages/:id/archive
```

Public:

```text
12 GET /packages
13 GET /packages/:slug
14 GET /travels/:slug
```

Wishlist:

```text
15 GET    /wishlist
16 POST   /wishlist/:packageId
17 DELETE /wishlist/:packageId
```

---

# 3.4 SEARCH MVP

Gunakan PostgreSQL.

Filter pertama:

```text
keyword
departure_city
departure_month
price_min
price_max
duration
airline
travel
```

Sort:

```text
latest
price_low
price_high
departure_nearest
rating
```

Jangan menggunakan Elasticsearch/Meilisearch dahulu.

---

# 3.5 SEO IMPLEMENTATION

Setiap package:

```text
/paket/{slug}
```

Travel:

```text
/travel/{slug}
```

Marketplace:

```text
/paket-umroh
```

Generate:

```text
title
description
canonical
OpenGraph
structured metadata
sitemap
```

---

# 3.6 PROMPT CODING — PACKAGE MODULE

```text
Bangun Package & Departure module untuk marketplace Umroh.

Existing:
- User/RBAC
- Travel module
- Travel verification

Package lifecycle:
DRAFT
PENDING_REVIEW
PUBLISHED
FULL
COMPLETED
ARCHIVED

Departure:
- departure_date
- return_date
- price
- quota
- reserved_quota
- confirmed_quota

Business rules:

1. Package hanya dimiliki satu travel.
2. Travel hanya boleh mengedit package miliknya.
3. Package hanya boleh publish jika Travel VERIFIED.
4. Minimal satu active departure.
5. Price dan quota harus positif.
6. Slug unique.
7. Public query hanya mengembalikan PUBLISHED package.
8. Jangan percaya travel_id yang dikirim client.
Gunakan authenticated travel membership.
9. Buat filter marketplace menggunakan PostgreSQL.
10. Semua list endpoint harus pagination.
11. Buat tests khusus tenant isolation dan publication rules.
```

---

# =========================================================
# MINGGU 4 — BOOKING ENGINE
# =========================================================

## 🎯 Objective

User dapat:

```text
Pilih Departure
↓
Booking
↓
Travel menerima booking
↓
Travel confirm
↓
User mendapat booking status
```

Ini adalah minggu **paling penting**.

---

# 4.1 BOOKING STATE MACHINE

Allowed transitions:

```text
PENDING_TRAVEL_CONFIRMATION
        ↓
     CONFIRMED
        ↓
 AWAITING_PAYMENT
        ↓
       PAID
        ↓
    PROCESSING
        ↓
    COMPLETED
```

Alternative:

```text
PENDING → REJECTED
PENDING → CANCELLED

CONFIRMED → CANCELLED

AWAITING_PAYMENT → CANCELLED

PAID → CANCELLED
```

PAID cancellation harus mempunyai rule khusus.

---

# 4.2 USER STORIES

## US-030 — Create Booking

**Sebagai** customer  
**Saya ingin** booking departure tertentu  
**Agar** travel dapat memproses pemesanan.

### Acceptance Criteria

Saat booking dibuat:

```text
package aktif
departure aktif
quota tersedia

unit_price disnapshot
total_amount dihitung server
booking_code generated

status =
PENDING_TRAVEL_CONFIRMATION
```

Client tidak boleh menentukan total.

---

## US-031 — Travel Confirm Booking

Travel hanya dapat confirm booking miliknya.

Cross travel:

```text
403 Forbidden
```

---

## US-032 — Booking History

Customer melihat booking miliknya.

Travel melihat booking travel miliknya.

---

# 4.3 MIGRATIONS

## Migration 011

```text
bookings
```

---

## Migration 012

```text
booking_status_history
```

---

## Migration 013

```text
pilgrims
```

---

## Migration 014

```text
payments
```

Walaupun payment gateway belum digunakan.

---

# 4.4 CRITICAL DATABASE RULE

Simpan pada booking:

```text
unit_price
subtotal
discount
total
currency
```

Jangan mengambil current package price untuk histori.

---

# 4.5 QUOTA STRATEGY

MVP sederhana:

Pada booking confirmation:

```text
BEGIN TRANSACTION

SELECT departure FOR UPDATE

check remaining quota

increment reserved/confirmed quota

create/update booking

COMMIT
```

Tujuan:

mencegah dua user mengambil seat terakhir bersamaan.

---

# 4.6 API ORDER

Customer:

```text
01 POST /bookings
02 GET  /bookings
03 GET  /bookings/:bookingCode
04 POST /bookings/:id/cancel
```

Travel:

```text
05 GET  /travel/bookings
06 GET  /travel/bookings/:id
07 POST /travel/bookings/:id/confirm
08 POST /travel/bookings/:id/reject
09 POST /travel/bookings/:id/mark-paid
10 POST /travel/bookings/:id/complete
```

Pilgrim:

```text
11 GET    /bookings/:id/pilgrims
12 POST   /bookings/:id/pilgrims
13 PATCH  /bookings/:id/pilgrims/:pilgrimId
14 DELETE /bookings/:id/pilgrims/:pilgrimId
```

---

# 4.7 IDEMPOTENCY

`POST /bookings` harus mendukung idempotency.

Misalnya:

```text
Idempotency-Key
```

Jika user klik booking dua kali akibat network retry, jangan membuat dua booking.

---

# 4.8 PROMPT CODING — BOOKING MODULE

```text
Bangun Booking Engine production-oriented untuk marketplace Umroh.

Tech:
Next.js
TypeScript
Prisma
PostgreSQL

Existing modules:
Auth
RBAC
Travel
Package
Departure

Booking statuses:
PENDING_TRAVEL_CONFIRMATION
CONFIRMED
AWAITING_PAYMENT
PAID
PROCESSING
COMPLETED
CANCELLED
REJECTED
REFUNDED
DISPUTED

Requirements:

1. Gunakan explicit state transition validator.
2. Jangan izinkan arbitrary status update.
3. Simpan price snapshot saat booking.
4. Client tidak boleh menentukan final total.
5. Validate package/departure availability.
6. Gunakan DB transaction untuk quota-sensitive operation.
7. Buat immutable booking status history.
8. Customer hanya melihat booking sendiri.
9. Travel hanya melihat booking miliknya.
10. Tambahkan idempotency protection pada create booking.
11. Payment masih manual/direct-to-travel.
12. mark-paid harus audited.
13. Buat integration tests untuk:
    - duplicate booking request
    - sold out departure
    - invalid state transition
    - unauthorized travel
    - price changed after booking
```

---

# =========================================================
# MINGGU 5 — BOOKING OPERATIONS, PAYMENT STATUS & NOTIFICATION
# =========================================================

## 🎯 Objective

Membuat flow booking usable secara operasional.

```text
Booking
↓
Travel Confirm
↓
Instruction Payment
↓
Travel Mark Paid
↓
Notification
↓
Operational Processing
```

---

# 5.1 USER STORIES

## US-040 — Mark Booking Paid

Travel dapat melakukan manual verification.

Acceptance:

```text
booking milik travel tersebut

current status valid

payment record dibuat

payment_status = PAID

paid_at set

audit log created
```

---

## US-041 — Booking Notification

Customer mendapat notification saat:

```text
booking dibuat
travel confirm
booking rejected
booking paid
booking cancelled
```

Travel mendapat notification saat booking baru dibuat.

---

# 5.2 MIGRATIONS

## Migration 015

```text
notifications
```

Optional:

```text
notification_preferences
```

dapat ditunda.

---

# 5.3 API

```text
GET   /notifications
POST  /notifications/:id/read
POST  /notifications/read-all
```

Internal application events:

```text
BookingCreated
BookingConfirmed
BookingPaid
BookingCancelled
```

Tidak perlu Kafka.

Gunakan in-process domain event / background job abstraction.

---

# 5.4 EMAIL

Templates:

```text
welcome
travel_verified
booking_created
booking_confirmed
booking_paid
booking_cancelled
```

Jangan hardcode HTML langsung di handler.

---

# 5.5 PROMPT CODING — NOTIFICATION

```text
Bangun Notification module.

Requirement:

Channels MVP:
- in-app
- email

Gunakan event-driven internal architecture tetapi jangan menggunakan
external broker seperti Kafka.

Events:
BookingCreated
BookingConfirmed
BookingRejected
BookingPaid
BookingCancelled
TravelVerified

Requirements:
1. API request tidak boleh gagal hanya karena email provider gagal.
2. Email diproses async/background job jika infrastructure tersedia.
3. Simpan notification in-app.
4. Buat reusable template layer.
5. Logging failure harus jelas.
6. Jangan duplicate notification akibat retry.
```

---

# =========================================================
# MINGGU 6 — AFFILIATE, REFERRAL & ATTRIBUTION
# =========================================================

## 🎯 Objective

Affiliate dapat:

```text
Register
↓
Approved
↓
Pilih Package
↓
Generate Link
↓
Share
↓
Click Tracked
↓
Booking Attributed
```

---

# 6.1 USER STORIES

## US-050 — Affiliate Registration

User dapat mengajukan menjadi affiliate.

Status:

```text
PENDING
```

Admin approve:

```text
ACTIVE
```

---

## US-051 — Generate Referral Link

Affiliate memilih package.

System menghasilkan:

```text
/paket/package-slug?ref=ABC123
```

---

## US-052 — Track Click

Ketika visitor masuk:

```text
ref code validated
↓
click stored
↓
attribution stored
↓
expiration = +30 days
```

---

## US-053 — Attribution Booking

Ketika booking dibuat:

```text
lookup active attribution
↓
last eligible click
↓
attach affiliate_id
↓
attach attribution_id
```

---

# 6.2 MIGRATIONS

## Migration 016

```text
affiliates
```

---

## Migration 017

```text
affiliate_programs
affiliate_package_commissions
```

---

## Migration 018

```text
referral_links
```

---

## Migration 019

```text
referral_clicks
```

---

## Migration 020

```text
attributions
```

---

# 6.3 ATTRIBUTION RULE V1

```text
MODEL:
Last Eligible Click

WINDOW:
30 days
```

Example:

```text
Day 01 Affiliate A
Day 07 Affiliate B
Day 10 Booking

Winner:
Affiliate B
```

---

# 6.4 SELF-REFERRAL

MVP minimum checks:

```text
affiliate user_id != booking user_id

suspicious duplicate activity flagged
```

Jangan menjanjikan anti-fraud sempurna pada MVP.

---

# 6.5 PRIVACY

Tracking data:

Prefer:

```text
visitor opaque ID
session ID
hashed IP when justified
user-agent fingerprint minimal
```

Hindari mengumpulkan data yang tidak dibutuhkan.

---

# 6.6 API ORDER

```text
01 POST  /affiliate/register
02 GET   /affiliate/profile
03 PATCH /affiliate/profile

04 GET   /affiliate/packages
05 POST  /affiliate/referrals
06 GET   /affiliate/referrals
07 GET   /affiliate/referrals/:id/stats

08 GET   /affiliate/analytics
```

Admin:

```text
09 GET  /admin/affiliates
10 POST /admin/affiliates/:id/approve
11 POST /admin/affiliates/:id/suspend
```

---

# 6.7 PROMPT CODING — ATTRIBUTION ENGINE

```text
Bangun Affiliate Attribution Engine untuk marketplace Umroh.

Rule V1:

- attribution window = 30 hari
- last eligible affiliate click wins
- affiliate harus ACTIVE
- package harus eligible
- self-referral tidak eligible

Entities:
Affiliate
ReferralLink
ReferralClick
Attribution

Flow:

1. Visitor membuka URL dengan ref code.
2. Validate affiliate/referral.
3. Store click event.
4. Create/update active attribution.
5. Saat booking dibuat, resolve attribution.
6. Store affiliate_id dan attribution_id ke booking.

Requirements:

- deterministic
- idempotent
- auditable
- attribution booking tidak boleh berubah diam-diam setelah booking dibuat
- expire automatically berdasarkan expires_at
- server-side validation
- tests untuk multiple affiliate click
- tests attribution expired
- tests invalid affiliate
- tests self referral
```

---

# =========================================================
# MINGGU 7 — COMMISSION, WALLET, PAYOUT, REVIEW & ADMIN
# =========================================================

## 🎯 Objective

End-to-end affiliate business loop selesai.

```text
Booking Paid
↓
Commission Created
↓
Pending
↓
Approved
↓
Wallet Credit
↓
Payout Request
↓
Admin Transfer
↓
Paid
```

---

# 7.1 USER STORIES

## US-060 — Generate Commission

Jika:

```text
booking = PAID
affiliate attached
commission program active
```

maka sistem membuat commission.

---

## US-061 — Approve Commission

Admin dapat approve commission setelah validation period.

---

## US-062 — Affiliate Wallet

Affiliate melihat:

```text
pending
approved
payable
paid
available_balance
```

Balance tidak disimpan sebagai angka mutable.

---

## US-063 — Request Payout

Affiliate hanya dapat payout:

```text
amount <= available_balance
```

---

# 7.2 MIGRATIONS

## Migration 021

```text
commissions
```

---

## Migration 022

```text
wallet_entries
```

---

## Migration 023

```text
payouts
```

---

## Migration 024

```text
reviews
```

---

# 7.3 COMMISSION STATE MACHINE

```text
PENDING
↓
ELIGIBLE
↓
APPROVED
↓
PAYABLE
↓
PAID
```

Exceptions:

```text
REJECTED
REVERSED
CANCELLED
```

---

# 7.4 WALLET RULE

Never:

```text
UPDATE affiliates
SET balance = ...
```

Instead:

```text
wallet_entries

+ COMMISSION_CREDIT
- PAYOUT_DEBIT
+/- ADJUSTMENT
```

Balance:

```text
SUM(wallet_entries.amount)
```

atau derived cached balance yang selalu dapat direkonsiliasi dari ledger.

---

# 7.5 PAYOUT MVP

Manual transfer.

Flow:

```text
Affiliate Request
↓
Admin Review
↓
Approve
↓
Manual Bank Transfer
↓
Admin enters reference
↓
PAID
↓
Ledger debit
```

---

# 7.6 REVIEW

Verified review rule MVP:

```text
booking.status = COMPLETED
```

baru dapat review.

Satu booking:

```text
max 1 review / user
```

---

# 7.7 API ORDER

Commission:

```text
GET  /affiliate/commissions
GET  /affiliate/commissions/:id
GET  /affiliate/wallet
```

Admin:

```text
GET  /admin/commissions
POST /admin/commissions/:id/approve
POST /admin/commissions/:id/reject
POST /admin/commissions/:id/reverse
```

Payout:

```text
GET  /affiliate/payouts
POST /affiliate/payouts
GET  /affiliate/payouts/:id
```

Admin payout:

```text
GET  /admin/payouts
POST /admin/payouts/:id/approve
POST /admin/payouts/:id/reject
POST /admin/payouts/:id/mark-paid
```

Reviews:

```text
POST /bookings/:id/review
GET  /packages/:id/reviews
GET  /travels/:id/reviews
```

---

# 7.8 PROMPT CODING — COMMISSION ENGINE

```text
Bangun Commission, Wallet Ledger dan Payout module.

Commission lifecycle:

PENDING
ELIGIBLE
APPROVED
PAYABLE
PAID

Exceptional:
REJECTED
REVERSED
CANCELLED

Business rule:

1. Commission berasal dari valid attributed booking.
2. Commission amount disnapshot saat dibuat.
3. Perubahan package commission setelah booking tidak boleh mengubah commission lama.
4. Satu booking tidak boleh menghasilkan duplicate active commission.
5. Semua transition harus tervalidasi.
6. Wallet menggunakan append-only ledger.
7. Jangan mempunyai editable balance field sebagai source of truth.
8. Payout tidak boleh melebihi available balance.
9. Payout PAID menghasilkan ledger debit.
10. Reversal menghasilkan reversal entry, bukan delete history.
11. Semua action admin harus masuk audit log.
12. Gunakan database transaction pada financial mutation.
13. Buat concurrency test payout agar balance tidak double-spent.
```

---

# =========================================================
# MINGGU 8 — HARDENING, SEO, ANALYTICS & LAUNCH
# =========================================================

## 🎯 Objective

Mengubah aplikasi dari:

```text
"fitur sudah jalan"
```

menjadi:

```text
"cukup aman untuk pilot production"
```

---

# 8.1 ANALYTICS MVP

Platform:

```text
registered users
verified travels
published packages
bookings
paid bookings
affiliate clicks
attributed bookings
commissions
```

Travel:

```text
package views
bookings
booking conversion
affiliate bookings
```

Affiliate:

```text
clicks
bookings
conversion
commission
```

---

# 8.2 JANGAN BANGUN BI COMPLEX

Query sederhana / materialized daily stats cukup.

Future:

```text
package_daily_stats
travel_daily_stats
affiliate_daily_stats
```

---

# 8.3 E2E TEST SCENARIO

## Scenario A — Organic Booking

```text
Customer Register
↓
Browse Marketplace
↓
Select Package
↓
Booking
↓
Travel Confirm
↓
Travel Mark Paid
↓
Complete
↓
Review
```

---

## Scenario B — Affiliate Booking

```text
Affiliate Register
↓
Admin Approve
↓
Generate Link
↓
Customer Click
↓
Customer Booking
↓
Travel Confirm
↓
Travel Mark Paid
↓
Commission
↓
Admin Approve
↓
Affiliate Request Payout
↓
Admin Pay
```

---

## Scenario C — Security

Test:

```text
Travel A accesses Travel B package
Travel A accesses Travel B booking
Affiliate accesses another wallet
Customer accesses another booking
Non-admin verifies travel
Tampered total amount
Invalid booking transition
```

Semua harus ditolak.

---

# 8.4 LOAD TEST

Test minimum:

```text
Marketplace listing
Package detail
Login
Booking create
Referral redirect
```

Tidak perlu mensimulasikan jutaan pengguna.

Tujuan MVP:

mencari obvious bottleneck.

---

# 8.5 SEO CHECKLIST

```text
□ unique title

□ unique description

□ canonical

□ sitemap

□ robots.txt

□ public page server rendered

□ package structured metadata

□ travel structured metadata

□ OpenGraph image

□ 404 handling

□ redirect slug handling
```

---

# 8.6 SECURITY CHECKLIST

```text
□ secure cookie

□ CSRF strategy verified

□ input validation

□ output encoding

□ RBAC

□ ownership validation

□ rate limiting

□ password reset token expiration

□ signed file URL

□ sensitive field encryption

□ audit logs

□ production secrets

□ database backup

□ no verbose error production

□ dependency vulnerability review
```

---

# 8.7 PRODUCTION CHECKLIST

```text
□ production DB

□ migrations applied

□ backup enabled

□ domain active

□ SSL active

□ CDN active

□ error tracking

□ email verified

□ cron/jobs running

□ staging environment

□ production monitoring

□ privacy policy

□ terms of service

□ affiliate agreement

□ travel agreement

□ cancellation policy
```

---

# =========================================================
# GLOBAL DATABASE MIGRATION ORDER
# =========================================================

Migration wajib dijalankan berurutan:

```text
001 users

002 roles
    permissions
    role_permissions
    user_roles

003 audit_logs

004 travel_companies

005 travel_members

006 travel_documents

007 packages

008 package_images
    package_itineraries

009 departures

010 wishlists

011 bookings

012 booking_status_history

013 pilgrims

014 payments

015 notifications

016 affiliates

017 affiliate_programs
    affiliate_package_commissions

018 referral_links

019 referral_clicks

020 attributions

021 commissions

022 wallet_entries

023 payouts

024 reviews
```

Future migration:

```text
025 subscription_plans
026 travel_subscriptions
027 promotions
028 daily_analytics
```

Jangan masukkan future module sebelum MVP membutuhkan.

---

# =========================================================
# GLOBAL API DEVELOPMENT ORDER
# =========================================================

Prioritas implementasi:

```text
PHASE 1
/auth/*
/users/*

PHASE 2
/travels/*
/admin/travel-verifications/*

PHASE 3
/travel/packages/*
/travel/departures/*
/packages/*
/travels/:slug

PHASE 4
/bookings/*
/travel/bookings/*
/pilgrims/*

PHASE 5
/notifications/*

PHASE 6
/affiliate/*
/affiliate/referrals/*
tracking endpoint

PHASE 7
/affiliate/commissions/*
/affiliate/wallet
/affiliate/payouts/*
/admin/commissions/*
/admin/payouts/*
/reviews/*

PHASE 8
/analytics/*
```

---

# =========================================================
# RECOMMENDED MODULE STRUCTURE
# =========================================================

Setiap domain jangan hanya dibuat:

```text
package.service.ts
```

Gunakan boundary lebih jelas:

```text
packages/
├── domain/
│   ├── package.entity.ts
│   ├── package.types.ts
│   ├── package.errors.ts
│   └── package.rules.ts
│
├── application/
│   ├── create-package.ts
│   ├── update-package.ts
│   ├── publish-package.ts
│   └── archive-package.ts
│
├── infrastructure/
│   ├── package.repository.ts
│   └── prisma-package.repository.ts
│
├── presentation/
│   ├── schemas.ts
│   └── handlers.ts
│
└── tests/
```

Tidak harus mengikuti Clean Architecture secara dogmatis.

Tujuannya:

```text
business logic != UI
business logic != Prisma
business logic != HTTP
```

---

# =========================================================
# SHARED CODING RULES UNTUK AI
# =========================================================

Masukkan rules berikut pada setiap prompt coding:

```text
GENERAL ENGINEERING RULES

1. Jangan mengubah module lain kecuali benar-benar diperlukan.

2. Jangan menambah dependency tanpa menjelaskan alasannya.

3. Jangan menggunakan `any` kecuali justified.

4. Semua external input harus divalidasi server-side.

5. Semua protected resource harus mengecek authorization dan ownership.

6. Jangan percaya ID tenant/travel dari client.

7. Semua list endpoint harus:
   - pagination
   - filtering
   - deterministic sorting

8. Financial state transition harus menggunakan transaction.

9. Jangan delete financial history.

10. Jangan ubah status memakai generic update endpoint.

11. Gunakan explicit command:
    confirmBooking()
    approveCommission()
    markPayoutPaid()

bukan:

    update({ status: "..." })

12. Error harus menggunakan typed domain errors.

13. Jangan expose stack trace kepada client production.

14. Buat migration, schema validation, service, API dan test bersamaan.

15. Setelah coding, output:
    - file yang dibuat
    - file yang diubah
    - migration
    - endpoints
    - tests
    - known limitations
```

---

# =========================================================
# MASTER PROMPT UNTUK AI CODING AGENT
# =========================================================

Gunakan prompt ini sebagai header sebelum prompt module mingguan.

```text
Anda bekerja sebagai Senior Full Stack Engineer pada project UmrohHub,
marketplace paket Umroh dengan architecture Modular Monolith.

STACK

- Next.js
- TypeScript strict mode
- PostgreSQL
- Prisma
- Tailwind
- component architecture berbasis ShadCN-style UI

CORE DOMAIN

- Identity
- Travel
- Travel Verification
- Package
- Departure
- Booking
- Affiliate
- Attribution
- Commission
- Wallet Ledger
- Payout
- Review
- Notification
- Admin

ARCHITECTURE RULES

- modular monolith
- domain-oriented boundaries
- no microservices
- no Kafka
- no Kubernetes
- PostgreSQL sebagai primary database
- server-side authorization
- resource ownership validation
- financial operations transactional
- audit sensitive actions
- append-only ledger for wallet
- explicit state machines

SECURITY

- validate all external input
- never trust client-calculated money
- protect against cross-tenant access
- secure cookies/session
- rate limit sensitive endpoints
- private travel documents
- encrypt highly sensitive data
- no sensitive data in logs

CODING STYLE

- maintainable
- typed
- minimal abstraction
- SOLID where useful
- avoid premature abstraction
- no placeholder business logic
- no TODO for critical security
- write tests for critical business rules

BEFORE IMPLEMENTING:

1. Inspect existing related modules.
2. Identify dependencies.
3. Explain files that need to change.
4. Do not rewrite unrelated modules.

AFTER IMPLEMENTING:

Report:
- implementation summary
- migrations
- API
- security controls
- tests
- edge cases
- known limitations
```

---

# =========================================================
# DAILY EXECUTION PATTERN
# =========================================================

Untuk solo developer, setiap hari gunakan pola:

```text
STEP 1
Ambil satu user story

STEP 2
Define acceptance criteria

STEP 3
Database change

STEP 4
Business/domain logic

STEP 5
API

STEP 6
UI

STEP 7
Authorization

STEP 8
Tests

STEP 9
Manual verification

STEP 10
Commit
```

Jangan:

```text
Senin semua database
Selasa semua API
Rabu semua UI
```

untuk seluruh aplikasi.

Lebih aman menyelesaikan vertical slice.

Contoh:

```text
CREATE PACKAGE

Database
+
Service
+
API
+
UI
+
Test

DONE
```

baru masuk fitur berikutnya.

---

# =========================================================
# MVP PRIORITY MATRIX
# =========================================================

## 🔴 P0 — HARUS ADA

```text
Auth
RBAC
Travel registration
Travel verification
Package
Departure
Marketplace
Package detail
Booking
Travel booking management
Manual payment status
Affiliate
Referral
Attribution
Commission
Admin
Audit
Security
```

---

## 🟡 P1 — USAHAKAN ADA

```text
Wishlist
Review
Payout request
Basic analytics
Email notification
Basic SEO landing pages
```

---

## 🟢 P2 — BOLEH SETELAH LAUNCH

```text
Package comparison
Advanced analytics
Subscription billing automation
Featured listing automation
WhatsApp notification
Complex fraud detection
```

---

## ❌ BUKAN MVP

```text
Native mobile app
AI recommendation
Multi-level affiliate
Automatic bank payout
Marketplace escrow
Complex refund engine
Travel ERP
Real-time chat
Kafka
Microservices
Kubernetes
Elasticsearch cluster
```

---

# =========================================================
# MVP RELEASE GATE
# =========================================================

MVP hanya boleh pilot jika seluruh flow berikut lulus:

```text
Travel Register
✓

Admin Verify
✓

Travel Publish Package
✓

Customer Search
✓

Customer Booking
✓

Travel Confirm
✓

Payment Status
✓

Affiliate Link
✓

Attribution
✓

Commission
✓

Payout
✓

Cross-Tenant Security
✓

Audit
✓

Backup
✓

Monitoring
✓
```

---

# 🏁 DEFINITION OF MVP SUCCESS

MVP bukan sukses karena:

```text
semua halaman selesai
```

MVP sukses jika setidaknya ada real-world flow:

```text
1 Travel terverifikasi
↓
1 Paket real
↓
1 Affiliate membagikan link
↓
1 calon jamaah masuk
↓
1 booking tercipta
↓
Travel memproses booking
↓
Attribution tercatat
↓
Commission dihitung dengan benar
```

Jika alur itu berjalan end-to-end tanpa operasi database manual, **core product sudah tervalidasi secara teknis**.

Fokus berikutnya bukan menambah 50 fitur.

Fokus berikutnya adalah:

```text
REAL TRAVEL
+
REAL PACKAGES
+
REAL USERS
+
REAL BOOKINGS
+
REAL AFFILIATES
```

Karena pada titik itulah feedback bisnis akan menentukan apa yang benar-benar perlu dibangun selanjutnya.
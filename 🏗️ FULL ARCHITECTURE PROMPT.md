# 🏗️ FULL ARCHITECTURE PROMPT
## UMROHHUB — Marketplace Umroh Terverifikasi
### Version 1.0 — MVP → Growth Architecture

**Working Name:** UmrohHub  
**Tagline:** *Temukan Travel Terpercaya. Bandingkan Paket. Berangkat Lebih Tenang.*

> Nama **UmrohHub** adalah working title dan dapat diganti tanpa memengaruhi arsitektur sistem.

---

# [BAGIAN 1] EXECUTIVE SUMMARY & VISI PRODUK

## 1.1 Product Vision

UmrohHub adalah marketplace digital yang mempertemukan empat pihak utama:

1. **Jamaah / User**
2. **Travel Umroh**
3. **Affiliate**
4. **Penyedia Platform**

Platform memberikan tempat terpusat bagi jamaah untuk menemukan, membandingkan, menyimpan, dan melakukan booking paket Umroh dari travel yang telah melewati proses verifikasi platform.

Travel memperoleh kanal distribusi dan pemasaran baru tanpa harus membangun sistem marketplace sendiri.

Affiliate memperoleh infrastruktur referral yang transparan sehingga dapat mempromosikan paket travel dan memperoleh komisi dari booking yang valid.

Platform memperoleh revenue dari kombinasi:

- subscription travel,
- transaction/platform commission,
- featured listing,
- sponsored placement,
- layanan premium lain di masa depan.

---

## 1.2 Prinsip Produk

UmrohHub harus dibangun berdasarkan empat prinsip utama:

### TRUST

Jamaah harus dapat mengetahui bahwa travel yang tampil telah melewati proses verifikasi.

Karena itu legalitas travel bukan hanya field:

```text
is_verified = true
```

melainkan lifecycle:

```text
PENDING
   ↓
UNDER_REVIEW
   ↓
VERIFIED
   ↓
EXPIRING
   ↓
EXPIRED / SUSPENDED
```

---

### DISCOVERY

User harus dapat menemukan paket berdasarkan kebutuhan nyata.

Contoh:

```text
Umroh dari Jakarta
Umroh Desember
Umroh Ramadhan
Umroh 9 Hari
Umroh Direct Flight
Umroh Hotel Dekat Masjidil Haram
Umroh Dibawah Rp30 Juta
```

---

### ATTRIBUTION

Setiap traffic yang berasal dari affiliate harus dapat ditelusuri dengan reliable.

```text
Affiliate
   ↓
Referral Link
   ↓
Click
   ↓
Visitor
   ↓
Attribution
   ↓
Booking
   ↓
Conversion
   ↓
Commission
```

---

### TRANSPARENCY

Jamaah, Travel, Affiliate, dan Admin harus mempunyai visibility terhadap transaksi yang relevan bagi mereka.

Tidak boleh ada komisi yang berubah tanpa audit trail.

Tidak boleh ada booking yang berubah status tanpa history.

Tidak boleh ada dokumen travel yang berubah tanpa catatan aktivitas.

---

# 1.3 Target Persona

## PERSONA A — Jamaah

Usia:

```text
23–65 tahun
```

Kebutuhan:

- mencari paket Umroh,
- membandingkan harga,
- membandingkan jadwal,
- mengecek travel,
- melihat hotel,
- melihat maskapai,
- memahami itinerary,
- booking paket,
- menyimpan paket,
- memberikan review.

Pain point:

```text
Sulit membandingkan travel
↓
Informasi tersebar di WhatsApp / Instagram
↓
Tidak tahu kredibilitas travel
↓
Takut penipuan
↓
Sulit membandingkan fasilitas
```

---

## PERSONA B — Pemilik Travel

Kebutuhan:

- mendapatkan calon jamaah,
- memasarkan paket,
- mengelola listing,
- mendapatkan affiliate,
- melihat conversion,
- mengelola booking,
- membangun reputasi.

---

## PERSONA C — Affiliate

Contoh:

- content creator Umroh,
- ustadz,
- komunitas,
- agen travel independen,
- blogger,
- pemilik channel WhatsApp,
- influencer.

Kebutuhan:

```text
Cari Paket
↓
Ambil Referral Link
↓
Promosi
↓
Tracking
↓
Conversion
↓
Komisi
↓
Payout
```

---

## PERSONA D — Platform Administrator

Bertanggung jawab atas:

- travel verification,
- marketplace governance,
- user management,
- package moderation,
- fraud monitoring,
- affiliate governance,
- commission,
- dispute,
- analytics,
- monetization.

---

# 1.4 Visi 6 Bulan

Target:

```text
50–100 travel onboard
500+ paket aktif
500+ affiliate
5.000–10.000 registered users
100+ booking/bulan
```

Fokus:

- marketplace berjalan,
- supply travel terbentuk,
- booking flow tervalidasi,
- affiliate channel terbukti,
- trust terhadap platform mulai terbentuk.

---

# 1.5 Visi 2 Tahun

UmrohHub berkembang menjadi **Umroh Distribution Platform**.

Bukan sekadar listing marketplace.

Platform dapat memiliki:

```text
Marketplace
+
Affiliate Network
+
Booking Infrastructure
+
Payment Infrastructure
+
Travel SaaS
+
Analytics
+
API Partner
+
B2B Distribution
```

Travel dapat mendistribusikan inventory paket melalui UmrohHub.

Partner dapat menggunakan API platform.

Affiliate dapat mempromosikan ribuan paket dari satu dashboard.

---

# 1.6 Unique Value Proposition

Untuk Jamaah:

> Satu tempat untuk mencari, membandingkan, dan booking paket dari travel Umroh yang telah diverifikasi.

Untuk Travel:

> Infrastruktur marketplace dan affiliate tanpa harus membangun teknologi sendiri.

Untuk Affiliate:

> Satu dashboard untuk mencari paket, membuat referral link, dan memperoleh komisi berdasarkan conversion yang dapat dilacak.

---

# 1.7 KPI Utama

## Marketplace

```text
Active Travel
Active Packages
Monthly Active Users
Search → Package View CTR
Package View → Booking Conversion
```

## Booking

```text
Bookings Created
Bookings Confirmed
Bookings Cancelled
Booking Conversion Rate
Average Package Value
```

## Affiliate

```text
Active Affiliate
Referral Clicks
Referral Conversion
Affiliate Revenue
Commission Generated
```

## Travel

```text
Travel Activation Rate
Package Published per Travel
Booking per Travel
Travel Retention
```

## Trust

```text
Verified Travel %
Review Completion
Dispute Rate
Cancellation Rate
Fraud Rate
```

---

# [BAGIAN 2] DAFTAR LENGKAP FITUR & MODUL

# 2.1 AUTHENTICATION & IDENTITY

### FITUR: User Registration

**User:** Jamaah, Travel Owner, Affiliate  
**Trigger:** pengguna memilih daftar  
**Input:** nama, email/nomor HP, password, tipe akun  
**Proses:**

```text
Validate
↓
Check duplicate
↓
Hash password
↓
Create user
↓
Send verification
```

**Output:** akun user

**Business Rule:**

- email unik,
- nomor HP unik jika diwajibkan,
- password disimpan dalam hash,
- email/HP harus diverifikasi untuk operasi sensitif.

**Edge Case:**

- duplicate email,
- expired OTP,
- brute force OTP,
- user belum verified.

**Priority:** MUST HAVE

---

### FITUR: Login

Mendukung:

```text
Email + Password
```

Optional kemudian:

```text
Google
Apple
WhatsApp OTP
```

**Priority:** MUST HAVE

---

### FITUR: Role Based Access Control

Core roles:

```text
SUPER_ADMIN
ADMIN
TRAVEL_OWNER
TRAVEL_STAFF
AFFILIATE
CUSTOMER
```

Architecture harus mendukung permission granular.

Contoh:

```text
package.create
package.update
booking.view
booking.confirm
travel.verify
affiliate.approve
commission.approve
```

---

# 2.2 TRAVEL MANAGEMENT

### FITUR: Travel Registration

Input:

```text
Nama Travel
Nama Legal Entity
Alamat
Email
Phone
Website
Logo
Description
Social Media
```

Travel default:

```text
status = PENDING_VERIFICATION
```

Priority:

**MUST HAVE**

---

### FITUR: Legal Document Management

Travel dapat mengunggah dokumen verifikasi.

Data minimum setiap dokumen:

```text
document_type
document_number
file_url
issued_at
expires_at
verification_status
reviewed_by
reviewed_at
rejection_reason
```

Lifecycle:

```text
PENDING
↓
UNDER_REVIEW
↓
APPROVED / REJECTED
↓
EXPIRING
↓
EXPIRED
```

Priority:

**MUST HAVE**

---

### FITUR: Travel Verification

User:

```text
Admin
Super Admin
```

Business Rule:

travel tidak dapat publish paket apabila verification state tidak memenuhi policy.

Audit log wajib.

Priority:

**MUST HAVE**

---

# 2.3 PACKAGE MANAGEMENT

Travel dapat membuat paket Umroh.

Data paket:

```text
Package Name
Slug
Description
Duration
Price
Original Price
Departure City
Departure Date
Return Date
Airline
Flight Type
Hotel Makkah
Hotel Madinah
Hotel Rating
Distance
Meals
Visa
Tour Leader
Mutawwif
Facilities
Exclusions
Terms
Images
Quota
Remaining Quota
```

Package lifecycle:

```text
DRAFT
↓
PENDING_REVIEW
↓
PUBLISHED
↓
FULL
↓
COMPLETED
↓
ARCHIVED
```

Priority:

**MUST HAVE**

---

# 2.4 DEPARTURE / INVENTORY

Satu package product dapat memiliki beberapa departure.

Contoh:

```text
Umroh Premium 9 Hari

├── 12 Jan 2027
├── 24 Jan 2027
├── 5 Feb 2027
└── 20 Feb 2027
```

Setiap departure:

```text
departure_date
return_date
quota
reserved_quota
confirmed_quota
price
status
```

Ini menghindari membuat duplicate package untuk setiap keberangkatan.

Priority:

**MUST HAVE**

---

# 2.5 MARKETPLACE SEARCH

Filter:

```text
Keyword
Departure City
Departure Month
Departure Date
Price Range
Duration
Travel
Airline
Hotel Rating
Package Type
Direct / Transit
```

Sort:

```text
Recommended
Cheapest
Most Popular
Nearest Departure
Highest Rated
```

Priority:

**MUST HAVE**

---

# 2.6 PACKAGE DETAIL

Halaman menampilkan:

```text
Package Header
Travel
Verification Badge
Price
Departure
Quota
Hotel
Airline
Itinerary
Facilities
Exclusions
Terms
Reviews
Related Packages
Affiliate Indicator
CTA Booking
```

Priority:

**MUST HAVE**

---

# 2.7 WISHLIST

User dapat menyimpan paket.

Priority:

**SHOULD HAVE**

---

# 2.8 PACKAGE COMPARISON

User dapat membandingkan maksimum 3–4 paket.

Comparison:

```text
Price
Duration
Departure
Airline
Hotel
Distance
Facilities
Travel Rating
```

Priority:

**SHOULD HAVE**

---

# 2.9 BOOKING ENGINE

Booking state machine:

```text
DRAFT
↓
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
CANCELLED
EXPIRED
REFUNDED
DISPUTED
```

MVP payment dilakukan langsung ke travel.

Platform tetap menyimpan:

```text
payment_status
payment_method
payment_reference
payment_verified_by
payment_verified_at
```

agar dapat berkembang menuju payment gateway.

---

## FITUR: Booking Creation

Input:

```text
package
departure
number_of_pilgrims
contact_person
affiliate attribution
notes
```

Output:

```text
booking_code
booking_status
price_snapshot
```

**WARNING**

Harga harus disimpan sebagai snapshot.

Jangan mengambil harga package saat menampilkan booking lama.

Jika:

```text
Harga ketika booking = 27 juta
```

kemudian travel mengubah package menjadi:

```text
29 juta
```

booking lama tetap:

```text
27 juta
```

---

# 2.10 PILGRIM MANAGEMENT

Booking dapat mempunyai beberapa jamaah.

Data:

```text
full_name
gender
birth_date
phone
email
passport_number
passport_expiry
nationality
special_notes
```

Data passport termasuk data sensitif.

Akses harus sangat dibatasi.

Priority:

**MUST HAVE untuk operasional booking**, tetapi detail dokumen lengkap dapat dilakukan setelah MVP bila proses operasional travel masih manual.

---

# 2.11 AFFILIATE MANAGEMENT

Affiliate lifecycle:

```text
REGISTERED
↓
PENDING
↓
APPROVED
↓
ACTIVE
↓
SUSPENDED
```

Affiliate memiliki:

```text
affiliate_code
profile
status
bank_account
analytics
```

Priority:

**MUST HAVE**

---

# 2.12 REFERRAL LINK

Format:

```text
/paket/:slug?ref=AFFILIATE_CODE
```

Setiap click membuat:

```text
referral_click
```

Data:

```text
affiliate_id
package_id
session_id
visitor_id
ip_hash
user_agent
landing_url
created_at
```

Jangan menyimpan IP mentah untuk analytics jika tidak diperlukan.

---

# 2.13 ATTRIBUTION ENGINE

MVP rule:

```text
Attribution Window = 30 hari

Model = Last Eligible Affiliate
```

Contoh:

```text
Day 1 → Affiliate A
Day 5 → Affiliate B
Day 8 → Booking

Commission → Affiliate B
```

Eligible click harus berasal dari valid referral.

Self referral dapat diblok berdasarkan rules.

Priority:

**MUST HAVE**

---

# 2.14 COMMISSION ENGINE

Travel menentukan komisi package.

Platform menentukan guardrail.

Commission type MVP:

```text
FIXED_AMOUNT
```

Future:

```text
PERCENTAGE
TIERED
CAMPAIGN_BASED
```

Commission state:

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

Alternative:

```text
REJECTED
CANCELLED
REVERSED
```

Commission hanya dibuat setelah booking memenuhi rule.

Contoh:

```text
Booking PAID
↓
Commission PENDING
↓
Validation Period
↓
APPROVED
↓
PAYABLE
```

Priority:

**MUST HAVE**

---

# 2.15 AFFILIATE WALLET / LEDGER

Jangan hanya menyimpan:

```text
balance = 8.500.000
```

Gunakan ledger.

Contoh:

```text
+750.000 Commission Booking A
+500.000 Commission Booking B
-1.000.000 Payout
```

Balance dihitung dari ledger.

Ini mencegah balance menjadi tidak dapat diaudit.

Priority:

**MUST HAVE**

---

# 2.16 PAYOUT

MVP:

```text
Affiliate Request Payout
↓
Admin Review
↓
Manual Transfer
↓
Admin Upload Reference
↓
PAID
```

Tidak perlu automatic payout pada MVP.

Priority:

**SHOULD HAVE**

---

# 2.17 REVIEW & RATING

Hanya user yang memenuhi verified booking rule dapat review.

Fields:

```text
overall_rating
service_rating
hotel_rating
transport_rating
review_text
images
```

Moderation status:

```text
PENDING
PUBLISHED
REJECTED
HIDDEN
```

Priority:

**SHOULD HAVE**

---

# 2.18 NOTIFICATION

Channels:

MVP:

```text
Email
In-App
```

Growth:

```text
WhatsApp
Push Notification
```

Events:

```text
Travel verified
Document expiring
Booking created
Booking confirmed
Booking cancelled
Commission approved
Payout completed
Review received
```

---

# 2.19 ANALYTICS

Travel dashboard:

```text
Package Views
Clicks
Bookings
Conversion
Affiliate Generated Booking
Top Packages
```

Affiliate:

```text
Clicks
Unique Visitors
Bookings
Conversion
Pending Commission
Approved Commission
Paid Commission
```

Platform:

```text
GMV proxy
Bookings
Active Travel
Active Packages
Affiliate Conversion
Platform Revenue
```

---

# 2.20 MONETIZATION

MVP:

```text
Manual subscription plan configuration
Featured package
Featured travel
```

Growth:

```text
Automated Subscription Billing
Marketplace Commission
Sponsored Search
Campaign
```

---

# [BAGIAN 3] DESAIN MENU & NAVIGASI

# ROLE: CUSTOMER

```text
HOME
├── Search Paket
├── Paket Populer
├── Travel Terverifikasi
└── Promo

MARKETPLACE
├── Semua Paket
├── Filter
├── Compare
└── Detail Paket

TRAVEL
├── Daftar Travel
└── Profil Travel

AKUN SAYA
├── Booking Saya
│   ├── Aktif
│   ├── Selesai
│   └── Dibatalkan
├── Wishlist
├── Review Saya
├── Profil
└── Security
```

---

# ROLE: AFFILIATE

```text
DASHBOARD
├── Click Hari Ini
├── Booking
├── Conversion
├── Pending Commission
└── Available Balance

MARKETPLACE
├── Cari Paket
├── Paket Komisi Tinggi
├── Paket Populer
└── Detail Paket

REFERRAL
├── Link Saya
├── Generate Link
└── Click Tracking

CONVERSION
├── Booking
├── Valid
├── Pending
└── Rejected

COMMISSION
├── Pending
├── Approved
├── Payable
└── Paid

PAYOUT
├── Balance
├── Request Payout
└── History

PROFILE
├── Profile
├── Bank Account
└── Security
```

---

# ROLE: TRAVEL OWNER

```text
DASHBOARD
├── Views
├── Booking
├── Conversion
├── Revenue Proxy
└── Affiliate Performance

TRAVEL PROFILE
├── Profil
├── Legal Documents
├── Verification
└── Team

PAKET UMROH
├── Semua Paket
├── Tambah Paket
├── Draft
├── Published
└── Archived

DEPARTURE
├── Jadwal
├── Quota
└── Passenger

BOOKING
├── Semua Booking
├── Pending
├── Confirmed
├── Paid
├── Completed
└── Cancelled

AFFILIATE
├── Affiliate Program
├── Commission Setting
├── Affiliate Performance
└── Conversion

REVIEWS
├── Semua Review
└── Rating

ANALYTICS
├── Package Performance
├── Booking Analytics
├── Affiliate Analytics
└── Traffic

BILLING
├── Subscription
├── Invoice
└── Promotion

SETTINGS
├── User
├── Notification
└── Security
```

---

# ROLE: ADMIN PLATFORM

```text
DASHBOARD

TRAVEL
├── All Travel
├── Verification Queue
├── Document Review
├── Suspended
└── Expiring Documents

PACKAGES
├── All Packages
├── Moderation
├── Reported
└── Featured

USERS
├── Customers
├── Affiliates
├── Travel Users
└── Admin

BOOKINGS
├── All
├── Confirmed
├── Paid
├── Cancelled
└── Dispute

AFFILIATE
├── Affiliates
├── Referral
├── Attribution
├── Fraud Flags
└── Commission

PAYOUT
├── Requests
├── Approved
├── Rejected
└── Paid

REVIEWS
├── Moderation
└── Reports

MONETIZATION
├── Subscription Plans
├── Featured Packages
├── Featured Travel
└── Platform Fees

ANALYTICS

AUDIT LOG

SYSTEM
├── Roles
├── Permissions
├── Notification Templates
├── Feature Flags
└── Settings
```

---

# [BAGIAN 4] ARSITEKTUR TEKNIKAL

# 4.1 ARCHITECTURE OVERVIEW

Pola utama:

# MODULAR MONOLITH

Alasan:

- solo developer,
- MVP ≤2 bulan,
- deployment sederhana,
- transactional consistency lebih mudah,
- debugging mudah,
- biaya lebih rendah,
- tetap mempunyai module boundaries untuk scale.

Architecture:

```text
                       INTERNET
                           │
                           ▼
                    ┌──────────────┐
                    │  Cloudflare  │
                    │ CDN / WAF    │
                    └──────┬───────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Next.js Web/PWA │
                  │ SSR / RSC / UI  │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Application API │
                  │ Modular Domain  │
                  └────────┬────────┘
                           │
           ┌───────────────┼──────────────┐
           ▼               ▼              ▼
     PostgreSQL       Object Storage    Job Queue
           │
           ▼
      Audit / Ledger
```

Application modules:

```text
Identity
Travel
Verification
Package
Departure
Marketplace
Booking
Pilgrim
Affiliate
Attribution
Commission
Wallet
Payout
Review
Notification
Analytics
Subscription
Promotion
Admin
Audit
```

---

# 4.2 TECH STACK

| Layer | Teknologi | Version Policy | Alasan |
|---|---|---|---|
| Runtime | Node.js | Current LTS | ecosystem besar |
| Language | TypeScript | Current stable | type safety |
| Frontend | Next.js | Current stable | SEO + SSR |
| UI | React | bundled/current | ecosystem |
| CSS | Tailwind CSS | Current stable | cepat |
| Components | ShadCN-style components | Current | customizable |
| Validation | Zod | Current stable | shared schema |
| ORM | Prisma | Current stable | developer productivity |
| Database | PostgreSQL | Supported stable release | ACID |
| Auth | Auth library / managed auth | Current | menghindari custom crypto |
| Object Storage | S3-compatible | Managed | scalable |
| CDN/WAF | Cloudflare | Managed | caching/security |
| Background Jobs | Managed queue / DB-backed job initially | Current | simple MVP |
| Email | Transactional email provider | Managed | deliverability |
| Error Tracking | Sentry-compatible | Managed | visibility |
| CI/CD | GitHub Actions | Managed | automation |
| Hosting | Managed Node platform | Managed | low ops |
| Testing | Vitest/Jest + Playwright | Current | unit + E2E |

---

# 4.3 DATABASE SCHEMA

Semua primary key menggunakan:

```sql
UUID
```

Semua tabel utama mempunyai:

```sql
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Entity yang memerlukan soft delete:

```sql
deleted_at TIMESTAMPTZ NULL
```

---

## TABLE: users

```sql
id                  UUID PK
email               VARCHAR(255) UNIQUE
phone               VARCHAR(30)
password_hash       TEXT
full_name           VARCHAR(255)
avatar_url          TEXT
email_verified_at   TIMESTAMPTZ NULL
phone_verified_at   TIMESTAMPTZ NULL
status              VARCHAR(30)
last_login_at       TIMESTAMPTZ
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
deleted_at          TIMESTAMPTZ NULL
```

Index:

```text
email
phone
status
```

---

## TABLE: roles

```sql
id
code
name
description
```

---

## TABLE: permissions

```sql
id
code
description
```

---

## TABLE: user_roles

```sql
user_id FK users
role_id FK roles

UNIQUE(user_id, role_id)
```

---

## TABLE: travel_companies

```sql
id
owner_user_id
name
slug
legal_name
description
logo_url
cover_url
email
phone
website
address
city
province
postal_code
verification_status
verified_at
verified_by
rating_average
review_count
status
created_at
updated_at
deleted_at
```

Indexes:

```text
slug UNIQUE
verification_status
status
city
```

---

## TABLE: travel_documents

```sql
id
travel_id
document_type
document_number
file_url
issued_at
expires_at
status
reviewed_by
reviewed_at
rejection_reason
created_at
updated_at
```

Index:

```text
travel_id
status
expires_at
```

---

## TABLE: travel_members

```sql
id
travel_id
user_id
role
status
created_at
```

Unique:

```text
travel_id + user_id
```

---

## TABLE: packages

```sql
id
travel_id
name
slug
short_description
description
duration_days
base_price DECIMAL(18,2)
currency VARCHAR(3)
departure_city
package_type
airline_name
flight_type
hotel_makkah_name
hotel_makkah_rating
hotel_madinah_name
hotel_madinah_rating
facilities JSONB
exclusions JSONB
terms TEXT
status
is_featured
published_at
created_at
updated_at
deleted_at
```

Indexes:

```text
travel_id
slug UNIQUE
status
base_price
departure_city
published_at
```

---

## TABLE: package_images

```sql
id
package_id
url
alt_text
sort_order
created_at
```

---

## TABLE: package_itineraries

```sql
id
package_id
day_number
title
description
location
created_at
```

Unique:

```text
package_id + day_number
```

---

## TABLE: departures

```sql
id
package_id
departure_date
return_date
price
quota
reserved_quota
confirmed_quota
status
created_at
updated_at
```

Indexes:

```text
package_id
departure_date
status
```

---

## TABLE: wishlists

```sql
id
user_id
package_id
created_at

UNIQUE(user_id, package_id)
```

---

## TABLE: bookings

```sql
id
booking_code
user_id
travel_id
package_id
departure_id
affiliate_id NULL
attribution_id NULL

number_of_pilgrims

unit_price
subtotal
discount_amount
total_amount
currency

status
payment_status

contact_name
contact_email
contact_phone

notes

confirmed_at
paid_at
cancelled_at
completed_at

created_at
updated_at
```

Critical indexes:

```text
booking_code UNIQUE
user_id
travel_id
package_id
affiliate_id
status
payment_status
created_at
```

---

## TABLE: booking_status_history

```sql
id
booking_id
from_status
to_status
changed_by
reason
metadata JSONB
created_at
```

Tidak boleh dihapus.

---

## TABLE: pilgrims

```sql
id
booking_id
full_name
gender
birth_date
phone
email
passport_number_encrypted
passport_expiry
nationality
notes
created_at
updated_at
```

Security:

passport field harus dienkripsi pada application/database layer sesuai kebutuhan.

---

## TABLE: payments

Walaupun MVP melakukan pembayaran langsung ke travel, tetap buat abstraction.

```sql
id
booking_id
provider
external_reference
amount
currency
method
status
paid_at
verified_by
verified_at
metadata JSONB
created_at
updated_at
```

---

## TABLE: affiliates

```sql
id
user_id
affiliate_code
status
bank_name
bank_account_encrypted
bank_holder_name
approved_at
approved_by
created_at
updated_at
```

Index:

```text
affiliate_code UNIQUE
user_id UNIQUE
status
```

---

## TABLE: affiliate_programs

```sql
id
travel_id
name
status
attribution_window_days DEFAULT 30
minimum_payout
created_at
updated_at
```

---

## TABLE: affiliate_package_commissions

```sql
id
affiliate_program_id
package_id
commission_type
commission_value
starts_at
ends_at
status
created_at
updated_at
```

---

## TABLE: referral_links

```sql
id
affiliate_id
package_id
code
campaign
target_url
created_at
```

---

## TABLE: referral_clicks

```sql
id
affiliate_id
package_id
referral_link_id
visitor_id
session_id
ip_hash
user_agent_hash
landing_url
referer
created_at
```

Indexes:

```text
affiliate_id
package_id
visitor_id
created_at
```

High-volume table.

---

## TABLE: attributions

```sql
id
visitor_id
user_id NULL
affiliate_id
package_id
referral_click_id
attributed_at
expires_at
status
created_at
```

---

## TABLE: commissions

```sql
id
booking_id
affiliate_id
travel_id
package_id

commission_type
commission_rate
commission_amount
currency

status

eligible_at
approved_at
payable_at
paid_at

created_at
updated_at
```

Constraints:

```text
UNIQUE active commission per booking
```

---

## TABLE: wallet_entries

```sql
id
affiliate_id
commission_id NULL
payout_id NULL
entry_type
amount
currency
description
created_at
```

Entry type:

```text
COMMISSION_CREDIT
COMMISSION_REVERSAL
PAYOUT_DEBIT
ADJUSTMENT
```

Append-only sebisa mungkin.

---

## TABLE: payouts

```sql
id
affiliate_id
amount
currency
status
bank_snapshot JSONB
requested_at
approved_at
paid_at
approved_by
payment_reference
rejection_reason
created_at
updated_at
```

---

## TABLE: reviews

```sql
id
booking_id
user_id
travel_id
package_id

overall_rating
service_rating
hotel_rating
transport_rating

review_text
status

published_at
created_at
updated_at
```

Unique:

```text
booking_id + user_id
```

---

## TABLE: notifications

```sql
id
user_id
type
title
message
data JSONB
read_at
created_at
```

---

## TABLE: subscription_plans

```sql
id
name
code
price
billing_interval
features JSONB
status
created_at
updated_at
```

---

## TABLE: travel_subscriptions

```sql
id
travel_id
plan_id
status
starts_at
ends_at
created_at
updated_at
```

---

## TABLE: promotions

```sql
id
travel_id
package_id NULL
type
starts_at
ends_at
amount
status
created_at
updated_at
```

---

## TABLE: audit_logs

```sql
id
actor_user_id
actor_role
action
entity_type
entity_id
old_value JSONB
new_value JSONB
ip_hash
user_agent
created_at
```

Tidak boleh diubah oleh user biasa.

---

# 4.4 API DESIGN

Base:

```text
/api/v1
```

---

## AUTH

```text
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
POST   /auth/verify-email
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/me
```

---

## USERS

```text
GET    /users/me
PATCH  /users/me
PATCH  /users/me/password
```

---

## TRAVEL

```text
POST   /travels
GET    /travels/:slug
PATCH  /travels/:id
GET    /travels/:id/dashboard
```

---

## TRAVEL DOCUMENTS

```text
GET    /travels/:id/documents
POST   /travels/:id/documents
DELETE /travels/:id/documents/:documentId
```

Admin:

```text
GET    /admin/travel-verifications
POST   /admin/travels/:id/verify
POST   /admin/travels/:id/reject
POST   /admin/travels/:id/suspend
```

---

## PACKAGES

Public:

```text
GET    /packages
GET    /packages/:slug
```

Travel:

```text
POST   /travel/packages
GET    /travel/packages
GET    /travel/packages/:id
PATCH  /travel/packages/:id
DELETE /travel/packages/:id
POST   /travel/packages/:id/publish
POST   /travel/packages/:id/archive
```

---

## PACKAGE IMAGE

```text
POST   /travel/packages/:id/images
DELETE /travel/packages/:id/images/:imageId
PATCH  /travel/packages/:id/images/order
```

---

## DEPARTURE

```text
GET    /packages/:packageId/departures

POST   /travel/packages/:packageId/departures
PATCH  /travel/departures/:id
DELETE /travel/departures/:id
```

---

## WISHLIST

```text
GET    /wishlist
POST   /wishlist/:packageId
DELETE /wishlist/:packageId
```

---

## BOOKING

Customer:

```text
POST   /bookings
GET    /bookings
GET    /bookings/:bookingCode
POST   /bookings/:id/cancel
```

Travel:

```text
GET    /travel/bookings
GET    /travel/bookings/:id
POST   /travel/bookings/:id/confirm
POST   /travel/bookings/:id/reject
POST   /travel/bookings/:id/mark-paid
POST   /travel/bookings/:id/complete
```

---

## PILGRIMS

```text
GET    /bookings/:id/pilgrims
POST   /bookings/:id/pilgrims
PATCH  /bookings/:id/pilgrims/:pilgrimId
DELETE /bookings/:id/pilgrims/:pilgrimId
```

---

## AFFILIATE

```text
POST   /affiliate/register
GET    /affiliate/profile
PATCH  /affiliate/profile
GET    /affiliate/dashboard
```

---

## REFERRAL

```text
POST   /affiliate/referrals
GET    /affiliate/referrals
GET    /affiliate/referrals/:id/stats
```

Redirect/click tracking dapat dilakukan melalui public endpoint khusus.

---

## COMMISSION

Affiliate:

```text
GET    /affiliate/commissions
GET    /affiliate/commissions/:id
GET    /affiliate/wallet
```

Travel:

```text
GET    /travel/affiliate-program
PATCH  /travel/affiliate-program
GET    /travel/affiliate-commissions
```

Admin:

```text
GET    /admin/commissions
POST   /admin/commissions/:id/approve
POST   /admin/commissions/:id/reject
POST   /admin/commissions/:id/reverse
```

---

## PAYOUT

```text
GET    /affiliate/payouts
POST   /affiliate/payouts
GET    /affiliate/payouts/:id
```

Admin:

```text
GET    /admin/payouts
POST   /admin/payouts/:id/approve
POST   /admin/payouts/:id/reject
POST   /admin/payouts/:id/mark-paid
```

---

## REVIEWS

```text
POST   /bookings/:id/review
GET    /packages/:id/reviews
GET    /travels/:id/reviews
```

Admin:

```text
GET    /admin/reviews
POST   /admin/reviews/:id/publish
POST   /admin/reviews/:id/hide
```

---

## ANALYTICS

```text
GET /travel/analytics
GET /affiliate/analytics
GET /admin/analytics
```

---

# 4.5 SECURITY ARCHITECTURE

## Authentication

Gunakan:

```text
Short-lived session/access token
+
secure refresh/session mechanism
```

Untuk browser:

preferensi utama adalah **HttpOnly Secure Cookie** dibanding menyimpan token autentikasi sensitif dalam `localStorage`.

---

## Authorization

Gunakan:

```text
RBAC
+
resource ownership
```

Contoh:

TRAVEL_OWNER mempunyai:

```text
package.update
```

tetapi hanya untuk:

```text
package.travel_id == current_travel_id
```

---

## Permission Matrix

| Resource | Customer | Affiliate | Travel | Admin |
|---|---:|---:|---:|---:|
| Browse package | ✅ | ✅ | ✅ | ✅ |
| Create package | ❌ | ❌ | ✅ | ✅ |
| Verify travel | ❌ | ❌ | ❌ | ✅ |
| Booking sendiri | ✅ | ❌ | ❌ | ✅ |
| Travel booking | ❌ | ❌ | ✅ | ✅ |
| Referral | ❌ | ✅ | ✅ view | ✅ |
| Commission | ❌ | ✅ own | ✅ own program | ✅ |
| Payout | ❌ | ✅ own | ❌ | ✅ |
| Moderation | ❌ | ❌ | ❌ | ✅ |

---

## Password

Gunakan algorithm password hashing yang modern dan battle-tested.

Jangan:

```text
MD5
SHA1
Plain SHA256
```

---

## Sensitive Data

Encrypt:

```text
passport_number
bank_account
sensitive identity information
```

---

## Rate Limit

Contoh:

```text
Login
5 attempts / minute / identity

OTP
5 / hour

Search
100 / minute / IP

Booking create
10 / minute / user

Referral redirect
rate anomaly detection
```

---

## Validation

Semua input:

```text
Client Validation
+
Server Validation
```

Client validation tidak dianggap security.

---

## File Upload Security

Whitelist:

```text
PDF
JPG
PNG
```

Check:

```text
file size
MIME
extension
malware scanning bila tersedia
random filename
private storage
signed URL
```

Legal document jangan public URL permanen.

---

## Audit Event

Wajib audit:

```text
Travel verified
Travel suspended
Document approved
Booking manually modified
Payment verified
Commission approved
Commission reversed
Payout approved
Payout marked paid
Admin permission changed
```

---

# 4.6 CACHING STRATEGY

MVP jangan memakai Redis tanpa alasan.

Gunakan framework/CDN caching untuk data public.

Cache:

```text
Package listing
Travel profile
Package detail
Homepage content
```

TTL:

```text
Homepage            5–15 min
Package detail       2–5 min
Travel profile       5–15 min
Search short cache   30–120 sec
```

Invalidation setelah:

```text
package published
package updated
travel changed
package archived
```

Data yang tidak boleh menggunakan stale caching agresif:

```text
Quota
Booking
Payment
Commission
Wallet
Payout
```

---

# 4.7 OFFLINE ARCHITECTURE

Tidak digunakan pada MVP.

Alasan:

marketplace, booking, attribution, payment state, dan quota sangat bergantung pada state server terbaru.

PWA tetap dapat cache:

```text
static assets
icons
shell
selected public pages
```

tetapi transaksi selalu online.

---

# [BAGIAN 5] STRUKTUR FOLDER & CODEBASE

Gunakan monorepo walaupun awalnya hanya satu web application agar shared package dapat berkembang.

```text
umroh-hub/
│
├── apps/
│   └── web/
│       ├── app/
│       │   ├── (public)/
│       │   │   ├── page.tsx
│       │   │   ├── paket/
│       │   │   ├── travel/
│       │   │   └── search/
│       │   │
│       │   ├── (auth)/
│       │   │   ├── login/
│       │   │   ├── register/
│       │   │   └── forgot-password/
│       │   │
│       │   ├── customer/
│       │   │   ├── bookings/
│       │   │   ├── wishlist/
│       │   │   ├── reviews/
│       │   │   └── profile/
│       │   │
│       │   ├── affiliate/
│       │   │   ├── dashboard/
│       │   │   ├── marketplace/
│       │   │   ├── referrals/
│       │   │   ├── conversions/
│       │   │   ├── commissions/
│       │   │   └── payouts/
│       │   │
│       │   ├── travel/
│       │   │   ├── dashboard/
│       │   │   ├── profile/
│       │   │   ├── verification/
│       │   │   ├── packages/
│       │   │   ├── departures/
│       │   │   ├── bookings/
│       │   │   ├── affiliates/
│       │   │   ├── reviews/
│       │   │   └── analytics/
│       │   │
│       │   ├── admin/
│       │   │   ├── dashboard/
│       │   │   ├── travels/
│       │   │   ├── packages/
│       │   │   ├── bookings/
│       │   │   ├── affiliates/
│       │   │   ├── commissions/
│       │   │   ├── payouts/
│       │   │   ├── reviews/
│       │   │   ├── analytics/
│       │   │   └── audit/
│       │   │
│       │   └── api/
│       │
│       ├── components/
│       │   ├── ui/
│       │   ├── marketplace/
│       │   ├── package/
│       │   ├── travel/
│       │   ├── booking/
│       │   ├── affiliate/
│       │   └── dashboard/
│       │
│       ├── lib/
│       ├── hooks/
│       └── middleware/
│
├── packages/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │
│   ├── domain/
│   │   ├── identity/
│   │   ├── travel/
│   │   ├── package/
│   │   ├── booking/
│   │   ├── affiliate/
│   │   ├── attribution/
│   │   ├── commission/
│   │   ├── payout/
│   │   ├── review/
│   │   └── notification/
│   │
│   ├── shared/
│   │   ├── types/
│   │   ├── schemas/
│   │   ├── constants/
│   │   └── utilities/
│   │
│   └── config/
│
├── infrastructure/
│   ├── docker/
│   ├── scripts/
│   └── terraform/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── business-rules/
│   ├── adr/
│   └── runbooks/
│
├── tests/
│   ├── e2e/
│   └── fixtures/
│
└── .github/
    └── workflows/
```

---

# [BAGIAN 6] ROADMAP PENGEMBANGAN

# FASE 0 — FOUNDATION

## Minggu 1

```text
Repository
Database
CI/CD
Environment
Authentication
RBAC
Design System
Error Tracking
Logging
```

Definition of Done:

```text
Login working
Role protected routes
Database migrations working
Staging deploy automatic
```

---

# FASE 1 — TRAVEL & MARKETPLACE

## Minggu 2–3

```text
Travel registration
Travel verification
Travel profile
Package CRUD
Departure CRUD
Package publishing
Public marketplace
Package detail
Search/filter
```

---

# FASE 2 — BOOKING

## Minggu 4–5

```text
Booking creation
Booking state machine
Booking dashboard
Travel booking dashboard
Price snapshot
Pilgrim basic data
Payment verification abstraction
Notification
```

---

# FASE 3 — AFFILIATE

## Minggu 6

```text
Affiliate registration
Affiliate approval
Referral links
Click tracking
Attribution
Commission configuration
Commission engine
Affiliate dashboard
```

---

# FASE 4 — ADMIN & HARDENING

## Minggu 7

```text
Admin dashboards
Commission approval
Payout
Review moderation
Analytics
Audit log
```

---

# FASE 5 — LAUNCH

## Minggu 8

```text
E2E testing
Security hardening
SEO
Performance
Backup verification
Monitoring
Load test
Pilot travel onboarding
Production launch
```

---

# DEFINITION OF DONE

Setiap feature:

```text
Business rule implemented
Authorization tested
Validation tested
Happy path tested
Critical edge cases tested
Audit log where applicable
No critical error
Staging verified
Responsive UI
```

Target testing:

Critical financial/business modules harus memiliki coverage lebih tinggi daripada presentational UI.

Prioritas:

```text
Booking
Commission
Attribution
Payout
Authentication
RBAC
```

---

# [BAGIAN 7] SCALABILITY & PERFORMANCE

# 7.1 Horizontal Scaling

Application harus stateless.

Jangan menyimpan:

```text
session
cart
booking state
```

hanya di memory server.

Server instance dapat:

```text
Instance A
Instance B
Instance C
```

mengakses database/cache yang sama.

---

# 7.2 Database

Gunakan connection pooling.

Index berdasarkan query aktual.

Critical index:

```text
packages(status, departure_city)
departures(departure_date, status)
bookings(travel_id, status)
bookings(user_id, created_at)
commissions(affiliate_id, status)
referral_clicks(affiliate_id, created_at)
```

---

# 7.3 Search Evolution

MVP:

```text
PostgreSQL
```

Growth:

```text
PostgreSQL full text
```

Scale:

```text
Dedicated Search Engine
```

Contoh trigger migrasi search:

```text
>100k active packages
complex faceted filtering
search latency unacceptable
```

Jangan install search cluster sebelum dibutuhkan.

---

# 7.4 Background Jobs

Gunakan async job untuk:

```text
Email
Document expiry reminder
Analytics aggregation
Commission eligibility
Payout notification
Image processing
```

Jangan jalankan pekerjaan berat dalam HTTP request.

---

# 7.5 Analytics Aggregation

Jangan menghitung dashboard:

```sql
SELECT COUNT(*)
```

terhadap jutaan referral click setiap page load.

Growth:

gunakan aggregation:

```text
affiliate_daily_stats
package_daily_stats
travel_daily_stats
```

---

# 7.6 Performance Budget

Target:

```text
Public page LCP < 2.5s
API normal p95 < 300ms
Search normal p95 < 500ms
Dashboard p95 < 1s
```

---

# 7.7 CDN

CDN:

```text
Package images
Travel logos
Static assets
Public media
```

Legal documents:

```text
PRIVATE
SIGNED URL
```

---

# 7.8 Scaling Trigger

Migrate module ke service terpisah hanya jika terdapat alasan nyata.

Possible future services:

```text
Search Service
Tracking Service
Notification Service
Payment Service
Analytics Service
```

Bukan karena:

> “microservices lebih modern.”

---

# [BAGIAN 8] DISASTER RECOVERY & BUSINESS CONTINUITY

# 8.1 Backup

Database:

```text
Daily automated backup
+
Point-in-time recovery jika provider mendukung
```

Retention:

```text
7 daily
4 weekly
3 monthly
```

sesuaikan dengan kapasitas dan kebutuhan compliance.

---

# 8.2 Storage

Dokumen penting harus menggunakan storage versioning jika tersedia.

Jangan bergantung pada local server disk.

---

# 8.3 RPO

MVP target:

```text
RPO ≤ 24 jam
```

Ideal dengan PITR:

```text
RPO beberapa menit
```

---

# 8.4 RTO

MVP:

```text
RTO ≤ 4 jam
```

Growth:

```text
RTO ≤ 1 jam
```

---

# 8.5 Health Check

Endpoint:

```text
/health
/health/ready
```

Check:

```text
Application
Database
Critical dependencies
```

---

# 8.6 Incident Classification

```text
SEV-1
Booking / authentication / platform unavailable

SEV-2
Travel dashboard broken
Affiliate commission processing issue

SEV-3
Non-critical functionality
```

---

# 8.7 Financial Incident

Jika commission engine mempunyai bug:

```text
STOP commission approval
↓
Freeze payout
↓
Audit affected bookings
↓
Recalculate
↓
Record adjustments
↓
Resume
```

Jangan mengedit wallet balance secara manual.

Gunakan adjustment ledger.

---

# [BAGIAN 9] ESTIMASI BIAYA INFRASTRUKTUR

Angka berikut merupakan **budget architecture estimate**, bukan quotation vendor.

# MVP

Target:

```text
<10.000 monthly users
20–100 travel
```

Approx:

```text
Application Hosting     $20–50
PostgreSQL              $20–50
Object Storage/CDN      $5–20
Email                   $0–20
Monitoring              $0–25
Domain/other            $5–15

TOTAL
≈ $50–180 / month
```

Redis belum wajib.

Dedicated search belum wajib.

Kubernetes = tidak.

---

# GROWTH

```text
50k–200k monthly users
```

Possible:

```text
App Instances           $100–300
Database                $100–300
Cache                   $30–100
Storage/CDN             $30–100
Queue                   $20–80
Monitoring              $30–100

TOTAL
≈ $300–1.000 / month
```

---

# SCALE

```text
1M+ monthly users
high click tracking
high booking volume
```

Budget dapat berkembang:

```text
$1.500–5.000+ / month
```

tergantung:

```text
traffic
media
analytics
search
HA requirements
payment
monitoring
```

Cost tidak boleh dijadikan alasan premature optimization pada MVP.

---

# [BAGIAN 10] PRE-LAUNCH CHECKLIST

# SECURITY

```text
□ HTTPS enforced

□ Cookies Secure + HttpOnly

□ Password hashing verified

□ RBAC tested

□ Resource ownership tested

□ Admin routes protected

□ Travel isolation tested

□ Upload validation active

□ Private document storage verified

□ Rate limiting active

□ Login brute-force prevention

□ Secrets outside repository

□ Database production credentials rotated

□ CORS configured

□ Input validation server-side

□ Dependency vulnerability review

□ Audit logs active

□ Sensitive field encryption verified
```

---

# BOOKING

```text
□ Price snapshot tested

□ Departure quota validation tested

□ Duplicate submission protected

□ Booking status transition restricted

□ Unauthorized travel cannot access booking

□ Cancellation rule tested
```

---

# AFFILIATE

```text
□ Referral click works

□ 30-day expiry tested

□ Last eligible affiliate rule tested

□ Self-referral policy tested

□ Duplicate commission prevented

□ Cancelled booking reverses commission correctly

□ Commission amount immutable after creation

□ Wallet calculated from ledger

□ Payout cannot exceed available balance
```

---

# TRAVEL

```text
□ Unverified travel cannot publish

□ Expired documents handled

□ Admin verification audit exists

□ Suspended travel handled correctly

□ Cross-tenant data access impossible
```

---

# PERFORMANCE

```text
□ Homepage optimized

□ Images CDN

□ Lazy loading active

□ Database indexes verified

□ N+1 queries reviewed

□ Public package caching enabled

□ Sitemap generated

□ Metadata generated

□ Load test performed
```

---

# SEO

Marketplace harus mempunyai:

```text
Canonical URL
Meta title
Meta description
Open Graph
Structured data
XML Sitemap
Robots configuration
```

Create indexable landing pages secara terkontrol.

Contoh:

```text
/paket-umroh
/paket-umroh/jakarta
/paket-umroh/surabaya
/umroh/desember
/travel/:slug
/paket/:slug
```

Hindari menghasilkan jutaan parameter URL sebagai indexable pages.

---

# OPERATIONS

```text
□ Production backup active

□ Restore tested

□ Monitoring active

□ Error alerts active

□ Transactional email working

□ Legal pages prepared

□ Privacy policy

□ Terms

□ Travel agreement

□ Affiliate agreement

□ Refund/cancellation policy defined

□ Incident runbook available
```

---

# 🔥 ARCHITECTURE DECISIONS YANG DIKUNCI UNTUK MVP

## ADR-001

**Modular Monolith instead of Microservices**

Alasan:

```text
Solo developer
MVP cepat
Operational simplicity
```

---

## ADR-002

**Web/PWA First**

Alasan:

```text
SEO
Shareable links
Affiliate traffic
No app installation
```

---

## ADR-003

**PostgreSQL**

Alasan:

booking, commissions, payouts dan affiliate merupakan relational transactional data.

---

## ADR-004

**Payment direct to Travel during MVP**

Alasan:

mengurangi complexity:

```text
settlement
refund
reconciliation
regulatory
```

Tetap gunakan payment abstraction agar dapat berkembang.

---

## ADR-005

**Affiliate Attribution: Last Eligible Click / 30 Days**

Alasan:

mudah dipahami dan diimplementasikan pada MVP.

Rule dapat berubah kemudian melalui attribution policy.

---

## ADR-006

**Commission Ledger instead of Editable Balance**

Alasan:

auditability dan financial integrity.

---

## ADR-007

**No Redis by Default**

Tambahkan hanya ketika:

```text
cache
distributed rate limiting
queue
high-frequency data
```

benar-benar memerlukannya.

---

## ADR-008

**No Native Mobile App in MVP**

PWA dahulu.

Mobile dikembangkan setelah marketplace mempunyai usage yang membuktikan kebutuhan.

---

# 🚨 PRODUCTION WARNINGS

### WARNING 1 — Payment

Jangan menerima dan meneruskan dana jamaah menggunakan desain settlement improvisasi.

Full marketplace payment harus memiliki review:

```text
Payment Gateway
Legal
Accounting
Settlement
Refund
Reconciliation
Dispute
```

---

### WARNING 2 — Affiliate Money

Commission adalah financial data.

Setiap perubahan harus:

```text
auditable
deterministic
idempotent
```

Jangan memberikan admin field:

```text
affiliate.balance
```

yang bisa bebas diedit.

---

### WARNING 3 — Multi-Tenant Security

Travel A tidak boleh pernah dapat mengakses:

```text
Travel B booking
Travel B pilgrims
Travel B analytics
```

hanya dengan mengganti ID URL.

Semua query harus mempunyai tenant ownership validation.

---

### WARNING 4 — Overengineering

Untuk target 20–100 travel jangan membangun:

```text
Kubernetes
Kafka
Microservices
Elastic Cluster
CQRS penuh
Event Sourcing penuh
```

sejak awal.

Itu technical debt terselubung.

---

# 🎯 MVP FINAL SCOPE

Versi launch pertama harus membuat flow berikut benar-benar bekerja:

```text
TRAVEL
Register
↓
Verification
↓
Publish Package
              │
              ▼
         MARKETPLACE
              │
     ┌────────┴─────────┐
     ▼                  ▼
 CUSTOMER            AFFILIATE
     │                  │
 Search             Share Link
 Compare               │
 Package               ▼
     │                Click
     └───────┬──────────┘
             ▼
          Booking
             │
             ▼
         Travel Confirm
             │
             ▼
        Payment to Travel
             │
             ▼
          Mark Paid
             │
        ┌────┴─────┐
        ▼          ▼
    Customer    Affiliate
      Journey   Commission
                    │
                    ▼
                  Payout
```

Jika flow tersebut bekerja dengan baik, UmrohHub sudah mempunyai MVP marketplace yang **benar-benar menguji model bisnis**, bukan hanya sebuah website katalog.

---

# 🧭 ROADMAP SETELAH PRODUCT-MARKET VALIDATION

## NEXT

```text
Automated Payment
Automated Payout
WhatsApp Integration
Subscription Billing
Advanced Search
Travel CRM
Campaign Management
Promo Code
Mobile App
```

## LATER

```text
Dynamic Pricing
AI Package Recommendation
Travel Scoring
Fraud Detection
B2B API
White Label
Open Affiliate API
Partner Distribution
Accounting Integration
```

---

# 🏁 NORTH STAR

Jangan mengukur keberhasilan produk berdasarkan:

```text
berapa banyak fitur dibuat
```

Ukur berdasarkan:

```text
Travel aktif
↓
Paket berkualitas
↓
Traffic
↓
Booking
↓
Successful departure
↓
Repeat / referral
```

Arsitektur terbaik untuk UmrohHub bukan arsitektur paling rumit.

Arsitektur terbaik adalah arsitektur yang **bisa diluncurkan cepat, menjaga uang dan data dengan benar, mudah dikembangkan, dan tidak perlu dibuang ketika bisnis mulai tumbuh.**
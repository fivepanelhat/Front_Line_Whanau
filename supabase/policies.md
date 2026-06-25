# Supabase Row Level Security (RLS) Policies

This document records and defines the Row Level Security (RLS) policies implemented on the database tables for Front Line Whānau.

The security architecture follows a **Deny-by-Default** principle, aligning with data privacy best practices and **Te Mana Raraunga (Māori Data Sovereignty)** guidelines to ensure whānau retain ownership, protection, and sovereignty over their personal and collective information.

---

## Architectural Alignment with Te Mana Raraunga

1. **Whānau Control (Self-Determination / Rangatiratanga)**: Personal records, uploaded documents, consent logs, and support queries are bound directly to individual user identities (`auth.uid()`). No other standard user can query or modify this data.
2. **Access Minimisation**: Practitioner access is limited to verification and directory administration. Cross-whānau data reading is strictly prohibited.
3. **Immutable Audit Trails**: Actions like granting or revoking consents are logged on a non-deletable schema table (`consent_records`) ensuring integrity.

---

## Policy Catalog

### 1. `profiles` Table

Stores basic user metadata and assigned authorization roles (`parent`, `practitioner`, `admin`).

* **RLS Enabled**: Yes
* **Trigger-Managed**: Inserted automatically upon signup via trigger function `public.handle_new_user()` executing under `SECURITY DEFINER` constraints.

| Action | Policy Name | Scope / Constraint | Reason |
| --- | --- | --- | --- |
| **SELECT** | `profiles: owner can read` | `auth.uid() = id` | Prevents scanning or enumerating user profiles. |
| **UPDATE** | `profiles: owner can update` | `auth.uid() = id` | Restricts metadata updates to the profile owner. |
| **INSERT** | Disabled | N/A | Handled only via backend auth trigger. |
| **DELETE** | Disabled | N/A | Deletes occur automatically via cascade when `auth.users` deletes. |

---

### 2. `consent_records` Table

Audits granular feature and privacy consents.

* **RLS Enabled**: Yes

| Action | Policy Name | Scope / Constraint | Reason |
| --- | --- | --- | --- |
| **SELECT** | `consent_records: owner can read` | `auth.uid() = user_id` | Restricts consent views to the owner. |
| **INSERT** | `consent_records: owner can insert` | `auth.uid() = user_id` | Allows setting new consent preferences. |
| **UPDATE** | `consent_records: owner can update` | `auth.uid() = user_id` | Allows toggling consent values. |
| **DELETE** | Disabled | N/A | Audit records are immutable and cannot be deleted. |

---

### 3. `directory_listings` Table

Stores professional listings of support organisations, verifications, and regions.

* **RLS Enabled**: Yes

| Action | Policy Name | Scope / Constraint | Reason |
| --- | --- | --- | --- |
| **SELECT** | `directory_listings: authenticated users can read active` | `is_active = true AND is_verified = true` | Only active and verified listings are browseable. |
| **INSERT** | `directory_listings: practitioners can insert` | Authenticated and role check is `practitioner` or `admin` in `profiles` | Restricts listing insertion to vetted practitioners or admins. |
| **UPDATE** | `directory_listings: owner or admin can update` | `auth.uid() = created_by` or profile role is `admin` | Ensures only the creator or administrator can modify the listing. |

---

### 4. `documents` Table

Files and secure records uploaded by users.

* **RLS Enabled**: Yes

| Action | Policy Name | Scope / Constraint | Reason |
| --- | --- | --- | --- |
| **SELECT** | `documents: owner can read` | `auth.uid() = user_id` | Prevents document exposure to unauthorized users. |
| **INSERT** | `documents: owner can insert` | `auth.uid() = user_id` | Allows users to upload documents. |
| **DELETE** | `documents: owner can delete` | `auth.uid() = user_id` | Restricts file deletion to the owner. |
| **UPDATE** | Disabled | N/A | Document metadata is immutable once uploaded. |

---

### 5. `support_threads` Table

Contains support ticket headers and triage states.

* **RLS Enabled**: Yes

| Action | Policy Name | Scope / Constraint | Reason |
| --- | --- | --- | --- |
| **SELECT** | `support_threads: owner can read` | `auth.uid() = user_id` | Restricts tickets views to the owner. |
| **INSERT** | `support_threads: owner can insert` | `auth.uid() = user_id` | Enables creating new help requests. |
| **UPDATE** | `support_threads: owner can update status` | `auth.uid() = user_id` | Restricts thread closure/toggles to the owner. |

# AKIV Diagnostics — Enterprise Architecture

A domain-driven reference architecture for a national clinical laboratory, expressed as 40 Spring Boot microservices deployed to Azure.

- **Status:** reference example. AKIV Diagnostics is a fictional organization.
- **Audience:** an agent session generating the services, and the operations harness that will later operate them.
- **Scope:** domain model, service catalog, eventing, data, deployment, and compliance boundaries.

---

## 0. How to use this document

This document has two jobs, and the second one shapes the first.

**Job 1 — a generation specification.** A separate agent session reads this and produces 40 runnable Spring Boot services in GitLab, deployed to Azure. Every service below carries enough detail to generate it without further decisions: aggregates, endpoints, events, datastore, version, packaging.

**Job 2 — a fixture for the operations harness.** These services are the estate that the Agentic Workbench (AWFD) will operate. A uniform greenfield estate would prove nothing. A real enterprise laboratory has twenty years of accumulated variety, so **this document specifies that variety deliberately**:

- Spring Boot versions spread across **2.7, 3.1, 3.2, 3.3, 3.4, 4.0, 4.1**
- Both `javax.*` (2.7) and `jakarta.*` (3.x, 4.x) namespaces
- Both executable-jar and **WAR-on-Tomcat** packaging
- Hibernate 5.6 and Hibernate 6.x, plus services with no ORM at all
- Actuator fully exposed on some, minimally exposed on most, **disabled on one**
- Caffeine, Redis, and no cache
- Spring Batch on four services only
- Platform threads and virtual threads
- PHI-handling and non-PHI services side by side

**Do not normalize this variety during generation.** It is the point. A harness that can only operate a uniform estate is not an operations product.

---

## 1. Organization context

AKIV Diagnostics is a national clinical laboratory and diagnostics provider.

| Dimension | Scale |
|---|---|
| Patient service centers | ~2,000 |
| Tests resulted per year | ~200 million |
| Distinct assays in the compendium | ~3,500 |
| Ordering clients (clinics, hospitals, health systems) | ~150,000 |
| Regulatory posture | CLIA-certified; HIPAA covered entity |

### Portfolios

The organization is structured into four business portfolios plus a shared platform group. **Each portfolio maps to its own Azure subscription**, which is also the harness's authorization boundary — an installation scoped to one portfolio holds no credentials that reach another.

| Portfolio | Azure subscription | Serves | PHI |
|---|---|---|---|
| **Patients** | `akiv-patients` | Consumers scheduling, receiving results, paying bills, buying tests | Yes |
| **Healthcare Professionals** | `akiv-providers` | Ordering physicians, clinics, health systems, EMR integrations | Yes |
| **Laboratory Managers** | `akiv-lab-ops` | Lab operations, specimen flow, instruments, compendium, analytics | Mixed |
| **Research** | `akiv-research` | De-identified datasets, cohort discovery, trials | De-identified only |
| **Platform** | `akiv-platform` | Identity, audit, eventing, shared services | PHI-adjacent |

Each portfolio contains **programs**, and each program contains **applications** (services). That three-tier hierarchy is the addressing scheme the harness uses to resolve scope.

---

## 2. Ubiquitous language

Terms carry precise meaning in this domain and MUST be used consistently in code, APIs, events, and log fields.

| Term | Meaning |
|---|---|
| **Order** | A clinician's request for testing on a patient. Not yet tied to a physical specimen. |
| **Requisition** | The document/record accompanying an order, carrying diagnosis codes and billing intent. |
| **Specimen** | Physical material collected from a patient. |
| **Accession** | The lab's internal identifier assigned when a specimen is received and registered. The primary correlation key across lab operations. |
| **Assay** | A single measurable test (e.g. TSH). |
| **Panel** | A named group of assays ordered together. |
| **Result** | A value produced for one assay on one accession, with status (preliminary, final, corrected, amended). |
| **Report** | The rendered, releasable document containing one or more results. |
| **Reference range** | Expected value interval, varying by age, sex, and method. |
| **Critical value** | A result requiring immediate clinician notification. |
| **Reflex** | An additional test triggered automatically by a prior result. |
| **Client** | An ordering organization (clinic, hospital, health system). Distinct from a patient. |
| **Ordering provider** | The individual clinician who placed the order, identified by NPI. |
| **PSC** | Patient Service Center — a physical draw location. |
| **Chain of custody** | Documented, unbroken possession record for a specimen, required for regulated testing. |
| **Compendium** | The full catalog of orderable tests with specimen and handling requirements. |
| **ABN** | Advance Beneficiary Notice — patient acknowledgement that a test may not be covered. |
| **Accession-first** | The principle that lab operations correlate on accession, never on patient identity. |

### Identifier discipline

This is a HIPAA constraint expressed as an engineering rule, and the harness depends on it.

- **Correlation across services uses `accession_id`, `order_id`, `specimen_id`, `invoice_id`, `trace_id`** — never patient name, MRN, SSN, or date of birth.
- Patient identity is resolved **only** inside the Patient Identity context and passed as an opaque `patient_ref`.
- **No log line, metric tag, span attribute, or event envelope may contain a direct patient identifier.** Identifiers used for correlation must be pseudonymous.

---

## 3. Bounded contexts

Sixteen bounded contexts. Each owns its data; no shared database.

| # | Bounded context | Portfolio | Core responsibility |
|---|---|---|---|
| 1 | Patient Identity & Access | Patients | Who the patient is; portal identity; consent |
| 2 | Scheduling & Access Points | Patients | When and where a specimen is collected |
| 3 | Ordering | Providers | What testing was requested and whether it is valid |
| 4 | Specimen Management | Lab Ops | Physical custody from collection to the bench |
| 5 | Laboratory Operations | Lab Ops | Running the test on an instrument |
| 6 | Results & Reporting | Patients / Providers | Producing, releasing, and delivering results |
| 7 | Compendium & Terminology | Lab Ops | What can be ordered and what it means |
| 8 | Insurance & Eligibility | Patients | Whether it is covered |
| 9 | Billing & Revenue Cycle | Patients | Claims, remittance, invoices, payment |
| 10 | Consumer Commerce | Patients | Direct-to-consumer purchasing |
| 11 | Client & Provider Management | Providers | Who orders from us |
| 12 | Interoperability | Providers | HL7, FHIR, and EMR exchange |
| 13 | Notification | Patients | Reaching people |
| 14 | Analytics & Stewardship | Lab Ops | Utilization and network optimization |
| 15 | Research & De-identification | Research | Safe secondary use |
| 16 | Audit & Compliance | Platform | Who accessed what |

### Context map

Relationship types follow standard DDD strategic patterns.

```
Ordering ──────────upstream────────▶ Specimen Management ──────▶ Laboratory Operations
   │  (Customer/Supplier)                    │                            │
   │                                         │                     publishes results
   ▼                                         ▼                            ▼
Insurance & Eligibility              Chain of Custody            Results & Reporting
   │                                                                      │
   ▼                                                        ┌─────────────┼─────────────┐
Billing & Revenue Cycle                                     ▼             ▼             ▼
                                                      Notification   Interoperability  Analytics
Compendium & Terminology ──── Shared Kernel (read-only, published language) ──── ALL CONTEXTS

Patient Identity ──── Conformist ────▶ every PHI-handling context (patient_ref only)

Interoperability ──── Anticorruption Layer ────▶ external EMRs (Epic, Cerner, athenahealth)
Insurance ─────────── Anticorruption Layer ────▶ payer clearinghouses (X12 270/271/837/835)
Laboratory Operations ─ Anticorruption Layer ──▶ instrument vendors (ASTM, HL7 v2 LIS)

Research ──── Downstream, de-identified only ────◀ Results, Ordering, Compendium
Audit ──────── Observer of every context (append-only, no back-pressure)
```

**Critical rule:** the Research context never receives PHI. `deidentification-service` is the only permitted bridge, and it is one-directional.

---

## 4. Service catalog

40 services. **The version, packaging, persistence, cache, and actuator columns are specifications, not suggestions** — they define the heterogeneity the harness must handle.

Legend — **Pkg:** `jar` = executable jar on `eclipse-temurin`; `war` = WAR on Tomcat 9 base image. **Act:** actuator exposure — `min` = `health,info`; `std` = `health,info,metrics,loggers`; `full` = `*` (deliberate misconfiguration); `off` = actuator absent.

| # | Service | Context | Portfolio | Boot | Java | Pkg | Persistence | Cache | Act | PHI |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `patient-identity-service` | Identity | Patients | 2.7 | 11 | jar | Oracle · Hibernate 5.6 | Caffeine | min | ✅ |
| 2 | `patient-account-service` | Identity | Patients | 3.3 | 21 | jar | PostgreSQL · Hibernate 6.4 | Redis | std | ✅ |
| 3 | `consent-service` | Identity | Patients | 3.2 | 17 | jar | PostgreSQL · Hibernate 6.1 | — | std | ✅ |
| 4 | `appointment-service` | Scheduling | Patients | 3.4 | 21 | jar | PostgreSQL · Hibernate 6.6 | Redis | std | ✅ |
| 5 | `service-center-service` | Scheduling | Patients | 4.0 | 21 | jar | PostgreSQL · Hibernate 6.6 | Caffeine | std | ❌ |
| 6 | `order-intake-service` | Ordering | Providers | 2.7 | 11 | war | Oracle · Hibernate 5.6 | — | **full** | ✅ |
| 7 | `order-validation-service` | Ordering | Providers | 3.1 | 17 | jar | PostgreSQL · Hibernate 6.1 | Caffeine | std | ✅ |
| 8 | `requisition-service` | Ordering | Providers | 3.2 | 17 | jar | MongoDB (no ORM) | — | std | ✅ |
| 9 | `specimen-collection-service` | Specimen | Lab Ops | 3.3 | 21 | jar | PostgreSQL · Hibernate 6.4 | — | std | ✅ |
| 10 | `accessioning-service` | Specimen | Lab Ops | 2.7 | 11 | war | Oracle · Hibernate 5.6 | — | **off** | ✅ |
| 11 | `chain-of-custody-service` | Specimen | Lab Ops | 3.2 | 17 | jar | PostgreSQL (append-only) | — | std | ✅ |
| 12 | `courier-logistics-service` | Specimen | Lab Ops | 3.4 | 21 | jar | PostgreSQL · PostGIS | Redis | std | ❌ |
| 13 | `worklist-service` | Lab Ops | Lab Ops | 3.1 | 17 | jar | PostgreSQL · Hibernate 6.1 | Caffeine | std | ✅ |
| 14 | `instrument-interface-service` | Lab Ops | Lab Ops | 2.7 | 11 | war | Oracle · plain JDBC | — | min | ✅ |
| 15 | `quality-control-service` | Lab Ops | Lab Ops | 3.3 | 21 | jar | PostgreSQL · Hibernate 6.4 | — | std | ❌ |
| 16 | `result-service` | Results | Patients | 3.4 | 21 | jar | PostgreSQL · Hibernate 6.6 | Redis | std | ✅ |
| 17 | `result-release-service` | Results | Patients | 4.0 | 21 | jar | PostgreSQL · Hibernate 6.6 | — | std | ✅ |
| 18 | `critical-value-service` | Results | Providers | 3.3 | 21 | jar | PostgreSQL · Hibernate 6.4 | — | std | ✅ |
| 19 | `report-rendering-service` | Results | Patients | 3.2 | 17 | jar | Blob + PostgreSQL metadata | — | std | ✅ |
| 20 | `compendium-service` | Compendium | Lab Ops | 4.1 | 21 | jar | PostgreSQL · Hibernate 6.6 | Caffeine | std | ❌ |
| 21 | `reference-range-service` | Compendium | Lab Ops | 3.3 | 21 | jar | PostgreSQL · Hibernate 6.4 | Caffeine | std | ❌ |
| 22 | `terminology-service` | Compendium | Lab Ops | 3.4 | 21 | jar | PostgreSQL · Hibernate 6.6 | Caffeine | std | ❌ |
| 23 | `eligibility-service` | Insurance | Patients | 2.7 | 11 | war | Oracle · Hibernate 5.6 | — | min | ✅ |
| 24 | `prior-authorization-service` | Insurance | Patients | 3.3 | 21 | jar | PostgreSQL · Hibernate 6.4 | — | std | ✅ |
| 25 | `claim-service` | Billing | Patients | 2.7 | 11 | war | Oracle · Hibernate 5.6 | — | min | ✅ |
| 26 | `remittance-service` | Billing | Patients | 3.1 | 17 | jar | PostgreSQL · Hibernate 6.1 | — | std | ✅ |
| 27 | `invoice-service` | Billing | Patients | 3.4 | 21 | jar | PostgreSQL · Hibernate 6.6 | Redis | std | ✅ |
| 28 | `payment-service` | Billing | Patients | 4.0 | 21 | jar | PostgreSQL · Hibernate 6.6 | — | std | ✅ |
| 29 | `price-estimate-service` | Billing | Patients | 4.1 | 21 | jar | PostgreSQL · Hibernate 6.6 | Caffeine | std | ❌ |
| 30 | `shop-catalog-service` | Commerce | Patients | 4.1 | 21 | jar | PostgreSQL · Hibernate 6.6 | Caffeine | std | ❌ |
| 31 | `cart-checkout-service` | Commerce | Patients | 4.0 | 21 | jar | PostgreSQL + Redis session | Redis | std | ✅ |
| 32 | `client-account-service` | Client Mgmt | Providers | 3.2 | 17 | jar | PostgreSQL · Hibernate 6.1 | Caffeine | std | ❌ |
| 33 | `ordering-provider-service` | Client Mgmt | Providers | 3.3 | 21 | jar | PostgreSQL · Hibernate 6.4 | Caffeine | std | ❌ |
| 34 | `hl7-gateway-service` | Interop | Providers | 2.7 | 11 | war | Oracle · plain JDBC | — | min | ✅ |
| 35 | `fhir-gateway-service` | Interop | Providers | 4.1 | 21 | jar | PostgreSQL · Hibernate 6.6 | Redis | std | ✅ |
| 36 | `emr-integration-service` | Interop | Providers | 3.2 | 17 | jar | PostgreSQL · Hibernate 6.1 | — | std | ✅ |
| 37 | `notification-service` | Notification | Patients | 3.4 | 21 | jar | PostgreSQL · Hibernate 6.6 | Redis | std | ✅ |
| 38 | `utilization-analytics-service` | Analytics | Lab Ops | 4.0 | 21 | jar | PostgreSQL + Synapse | — | std | ❌ |
| 39 | `deidentification-service` | Research | Research | 3.4 | 21 | jar | PostgreSQL · Hibernate 6.6 | — | std | ✅→de-id |
| 40 | `audit-service` | Audit | Platform | 3.3 | 21 | jar | PostgreSQL (append-only) | — | std | adjacent |

### Distribution summary

| Attribute | Spread |
|---|---|
| Boot 2.7 (`javax`, Hibernate 5.6, Java 11) | 7 services — 1, 6, 10, 14, 23, 25, 34 |
| Boot 3.1 / 3.2 (`jakarta`, Java 17) | 9 services — 3, 7, 8, 11, 13, 19, 26, 32, 36 |
| Boot 3.3 / 3.4 (Java 21, virtual threads available) | 15 services — 2, 4, 9, 12, 15, 16, 18, 21, 22, 24, 27, 33, 37, 39, 40 |
| Boot 4.0 / 4.1 (Java 21) | 9 services — 5, 17, 20, 28, 29, 30, 31, 35, 38 |
| WAR on Tomcat 9 | 6 services — 6, 10, 14, 23, 25, 34 |
| Spring Batch | 4 services — 25, 26, 38, 39 |
| No ORM (plain JDBC or document store) | 3 services — 8, 14, 34 |
| Actuator misconfigured (`*` exposed) | 1 service — 6 |
| Actuator absent | 1 service — 10 |
| Handles PHI | 27 of 40, plus `deidentification-service` (PHI in, de-identified out) and `audit-service` (PHI-adjacent) |

**Virtual threads:** enable `spring.threads.virtual.enabled=true` on services **4, 16, 17, 27, 28, 31, 35** only. Leave the rest on platform threads.

---

## 5. Context detail

Each context below gives aggregates, the primary API surface, and published/consumed events. Generate one Spring Boot module per service.

### 5.1 Patient Identity & Access

**Aggregates:** `Patient` (root, holds `patient_ref`), `Identity` (external IdP linkage), `Consent`, `ProxyAuthorization` (family/guardian access).

**`patient-identity-service`** — the Master Patient Index. Owns demographic truth and identity resolution (probabilistic match on name/DOB/address). The **only** service permitted to translate a direct identifier into `patient_ref`.
- `POST /patients/match` · `GET /patients/{patientRef}` · `POST /patients/{patientRef}/merge`
- Publishes: `patient.registered`, `patient.merged`, `patient.demographics-updated`

**`patient-account-service`** — portal accounts, credential linkage to Entra External ID, MFA enrollment, session policy.
- `POST /accounts` · `GET /accounts/{accountId}` · `POST /accounts/{accountId}/link-patient`
- Publishes: `account.created`, `account.locked`

**`consent-service`** — consent records, proxy access grants, revocations. Every PHI read elsewhere is expected to be consistent with a consent decision from here.
- `GET /consents/{patientRef}` · `POST /consents` · `POST /proxy-authorizations`
- Publishes: `consent.granted`, `consent.revoked`, `proxy.authorized`

### 5.2 Scheduling & Access Points

**Aggregates:** `Appointment` (root), `ServiceCenter`, `Slot`, `CapacityWindow`.

**`appointment-service`** — booking, rescheduling, cancellation, no-show handling. Holds slots optimistically; releases on timeout.
- `POST /appointments` · `PATCH /appointments/{id}` · `DELETE /appointments/{id}` · `GET /appointments?patientRef=`
- Publishes: `appointment.booked`, `appointment.rescheduled`, `appointment.cancelled`, `appointment.no-show`
- Consumes: `service-center.hours-changed`

**`service-center-service`** — PSC directory, hours, holiday schedules, geospatial search, capacity per interval.
- `GET /service-centers?lat=&lon=&radiusKm=` · `GET /service-centers/{id}/availability`
- Publishes: `service-center.hours-changed`, `service-center.capacity-changed`

### 5.3 Ordering

**Aggregates:** `Order` (root), `Requisition`, `OrderLine` (one per assay/panel), `ValidationOutcome`.

**`order-intake-service`** — receives orders from client portals, EMR feeds, and paper requisition entry. **Boot 2.7, WAR, actuator fully exposed.** Highest-cardinality legacy service.
- `POST /orders` · `GET /orders/{orderId}` · `POST /orders/{orderId}/cancel`
- Publishes: `order.received`, `order.cancelled`
- Consumes: `client.suspended`

**`order-validation-service`** — medical necessity (LCD/NCD), ABN determination, duplicate-order detection, compendium conformance.
- `POST /validations` · `GET /validations/{orderId}`
- Publishes: `order.validated`, `order.rejected`, `abn.required`
- Consumes: `order.received`, `compendium.assay-updated`

**`requisition-service`** — document-shaped requisitions (MongoDB, no ORM), diagnosis codes, attachments, scanned images.
- `POST /requisitions` · `GET /requisitions/{id}`
- Publishes: `requisition.created`

### 5.4 Specimen Management

**Aggregates:** `Specimen` (root), `Accession`, `CustodyEvent`, `CourierRoute`.

**`specimen-collection-service`** — collection events at a PSC or in-home, label/barcode generation, draw failure and redraw handling.
- `POST /collections` · `GET /collections/{specimenId}`
- Publishes: `specimen.collected`, `specimen.redraw-required`
- Consumes: `appointment.booked`, `order.validated`

**`accessioning-service`** — assigns the accession number on receipt; triage, rejection (hemolysis, insufficient volume, unlabeled), routing to a performing lab. **Boot 2.7, WAR, actuator absent** — the highest-throughput service in the estate and the hardest to observe.
- `POST /accessions` · `GET /accessions/{accessionId}` · `POST /accessions/{id}/reject`
- Publishes: `specimen.accessioned`, `specimen.rejected`, `specimen.routed`
- Consumes: `specimen.collected`

**`chain-of-custody-service`** — append-only custody ledger for regulated testing (toxicology, employment, forensic). No updates or deletes, ever.
- `POST /custody-events` · `GET /custody/{specimenId}`
- Publishes: `custody.event-recorded`, `custody.broken`

**`courier-logistics-service`** — pickup routes, stop sequencing, transit temperature excursions. Handles specimen IDs only, never patient identity.
- `GET /routes/{routeId}` · `POST /pickups` · `POST /excursions`
- Publishes: `courier.pickup-completed`, `courier.temperature-excursion`

### 5.5 Laboratory Operations

**Aggregates:** `Worklist` (root), `InstrumentRun`, `QCRun`, `PerformingLab`.

**`worklist-service`** — builds and sequences bench worklists per instrument and shift; handles STAT priority and reruns.
- `GET /worklists?instrumentId=&shift=` · `POST /worklists/{id}/assign`
- Publishes: `worklist.published`, `sample.assigned`
- Consumes: `specimen.routed`

**`instrument-interface-service`** — ASTM E1381/E1394 and HL7 v2 socket bridge to analyzers. **Boot 2.7, WAR, plain JDBC, long-lived TCP connections.** The service most likely to exhibit connection and thread-pool pathologies.
- `POST /instrument-messages` · `GET /instruments/{id}/status`
- Publishes: `instrument.result-received`, `instrument.offline`

**`quality-control-service`** — QC material runs, Westgard multi-rule evaluation, Levey-Jennings tracking, instrument lockout on failure. No PHI — QC material is not a patient specimen.
- `POST /qc-runs` · `GET /qc-runs?instrumentId=` · `GET /instruments/{id}/qc-status`
- Publishes: `qc.passed`, `qc.failed`, `instrument.locked-out`

### 5.6 Results & Reporting

**Aggregates:** `Result` (root, per assay per accession), `Report`, `ReleaseDecision`, `CriticalValueNotification`.

**`result-service`** — result lifecycle: preliminary → final → corrected/amended. Applies reference ranges and abnormal flags. Never deletes a prior version.
- `POST /results` · `GET /results/{accessionId}` · `POST /results/{id}/amend`
- Publishes: `result.finalized`, `result.amended`, `result.critical-detected`
- Consumes: `instrument.result-received`, `qc.failed`

**`result-release-service`** — decides whether and when a result reaches the patient: immediate release under the Cures Act, provider-hold windows, sensitive-result policy by assay and jurisdiction.
- `POST /release-decisions` · `GET /release-decisions/{accessionId}`
- Publishes: `result.released-to-patient`, `result.held`
- Consumes: `result.finalized`, `consent.revoked`

**`critical-value-service`** — escalation ladder for panic values: contact ordering provider, then covering provider, then client escalation. Read-back confirmation is mandatory and recorded.
- `POST /notifications` · `POST /notifications/{id}/acknowledge`
- Publishes: `critical-value.notified`, `critical-value.unacknowledged`
- Consumes: `result.critical-detected`

**`report-rendering-service`** — renders releasable PDF and structured reports to Azure Blob; metadata in PostgreSQL. Blob URLs are short-lived SAS, never long-lived.
- `POST /reports` · `GET /reports/{reportId}`
- Publishes: `report.rendered`
- Consumes: `result.released-to-patient`

### 5.7 Compendium & Terminology

**Shared kernel, published language.** Every context reads it; only Lab Ops writes it.

**`compendium-service`** (4.1) — orderable tests, panels, specimen requirements, turnaround times, performing-lab assignment.
- `GET /assays/{code}` · `GET /panels/{code}` · `GET /assays?specialty=`
- Publishes: `compendium.assay-updated`, `compendium.assay-retired`

**`reference-range-service`** — age-, sex-, and method-specific ranges with effective dating.
- `GET /reference-ranges?assay=&age=&sex=`

**`terminology-service`** — LOINC, SNOMED CT, CPT, ICD-10 mappings and crosswalks.
- `GET /terminology/loinc/{code}` · `POST /terminology/translate`

### 5.8 Insurance & Eligibility

**Aggregates:** `CoverageInquiry` (root), `EligibilityResponse`, `PriorAuthorization`.

**`eligibility-service`** — real-time X12 270/271 through a clearinghouse. **Boot 2.7, WAR.** Anticorruption layer over payer formats.
- `POST /eligibility-inquiries` · `GET /eligibility/{inquiryId}`
- Publishes: `eligibility.verified`, `eligibility.denied`

**`prior-authorization-service`** — PA submission, status polling, appeal tracking.
- `POST /prior-authorizations` · `GET /prior-authorizations/{id}`
- Publishes: `prior-auth.approved`, `prior-auth.denied`

### 5.9 Billing & Revenue Cycle

**Aggregates:** `Claim` (root), `Remittance`, `Invoice`, `Payment`, `Estimate`.

**`claim-service`** — X12 837 generation and submission. **Boot 2.7, WAR, Spring Batch.** Nightly batch job builds and transmits claim files.
- `POST /claims` · `GET /claims/{claimId}` — batch job `claimSubmissionJob`
- Publishes: `claim.submitted`, `claim.rejected`
- Consumes: `result.finalized`, `eligibility.verified`

**`remittance-service`** — X12 835 ingestion and posting. **Spring Batch**, chunk-oriented with skip/retry policy.
- Batch job `remittancePostingJob` · `GET /remittances/{id}`
- Publishes: `remittance.posted`, `claim.denied`

**`invoice-service`** — patient statements, balances, financial-assistance adjudication.
- `GET /invoices?patientRef=` · `POST /invoices/{id}/adjust`
- Publishes: `invoice.issued`, `invoice.paid`

**`payment-service`** — card, ACH, HSA/FSA. **PCI boundary: tokenized only, no PAN ever enters the service or its logs.**
- `POST /payments` · `POST /payments/{id}/refund`
- Publishes: `payment.captured`, `payment.failed`, `payment.refunded`

**`price-estimate-service`** — self-pay estimates and state shoppable-services disclosures. No PHI — prices, not people.
- `GET /estimates?assay=&zip=` · `GET /shoppable-services`

### 5.10 Consumer Commerce

**`shop-catalog-service`** (4.1) — direct-to-consumer catalog with age eligibility and state restrictions.
- `GET /shop/products` · `GET /shop/products/{sku}`

**`cart-checkout-service`** (4.0) — cart, promotions, BNPL handoff, order placement. Redis-backed sessions.
- `POST /carts` · `POST /carts/{id}/items` · `POST /carts/{id}/checkout`
- Publishes: `consumer-order.placed`

### 5.11 Client & Provider Management

**`client-account-service`** — client organizations, contracts, fee schedules, suspension.
- `GET /clients/{clientId}` · `POST /clients/{id}/suspend`
- Publishes: `client.suspended`, `client.fee-schedule-changed`

**`ordering-provider-service`** — NPI registry sync, provider directory, credential status.
- `GET /providers/{npi}` · `GET /providers?clientId=`

### 5.12 Interoperability

All three are anticorruption layers. External formats never leak inward.

**`hl7-gateway-service`** — HL7 v2 ORM (orders in) and ORU (results out) over MLLP. **Boot 2.7, WAR, plain JDBC, persistent socket listeners.**
- MLLP listener + `POST /hl7/messages`
- Publishes: `hl7.order-received`, `hl7.result-transmitted`

**`fhir-gateway-service`** (4.1) — FHIR R4 façade exposing `ServiceRequest`, `Specimen`, `DiagnosticReport`, `Observation`.
- `GET /fhir/DiagnosticReport/{id}` · `POST /fhir/ServiceRequest`

**`emr-integration-service`** — Epic, Cerner, athenahealth connectors with per-vendor quirks isolated behind adapters.
- `POST /emr/{vendor}/inbound` · `GET /emr/connections`
- Publishes: `emr.sync-failed`

### 5.13 Notification, Analytics, Research, Audit

**`notification-service`** — email/SMS orchestration with template versioning, quiet hours, and delivery receipts. **Notifications never contain results** — only "your results are ready."
- `POST /notifications` · `GET /notifications/{id}`
- Consumes: `result.released-to-patient`, `appointment.booked`, `invoice.issued`

**`utilization-analytics-service`** (4.0) — over/under-utilization by client and assay, stewardship reporting. **Spring Batch** nightly aggregation into Synapse. Aggregate only, no PHI.
- `GET /utilization?clientId=&period=` — batch job `utilizationAggregationJob`

**`deidentification-service`** — the sole bridge to Research. HIPAA Safe Harbor removal of the 18 identifiers plus date shifting. **Spring Batch.** One-directional: nothing flows back.
- Batch job `deidentificationJob` · `GET /deid-runs/{runId}`
- Publishes: `dataset.deidentified`

**`audit-service`** — append-only access log and HIPAA disclosure accounting. Consumes an audit event from every PHI access in every service. Must never exert back-pressure on the calling service.
- `POST /audit-events` (fire-and-forget) · `GET /disclosures?patientRef=`

---

## 6. Eventing topology

Asynchronous integration is the default between contexts. Synchronous HTTP is permitted only for query-shaped reads within a portfolio.

| Transport | Used for | Services |
|---|---|---|
| **Azure Event Hubs** (Kafka protocol) | High-volume domain events — orders, specimens, results | Most services |
| **Azure Service Bus** (topics + sessions) | Ordered, transactional workflows — billing, critical values | 18, 25, 26, 27, 28 |
| **Service Bus queues** | Retry and dead-letter for failed integrations | 34, 35, 36 |

### Event envelope

Every event carries this envelope. **The envelope is PHI-free by construction** — this is what makes event streams safe to inspect during an incident.

```json
{
  "eventId": "uuid",
  "eventType": "result.finalized",
  "eventVersion": 1,
  "occurredAt": "2026-09-04T14:02:11.482Z",
  "producer": "result-service",
  "traceId": "W3C traceparent trace-id",
  "correlation": {
    "accessionId": "ACC-2026-0904-118273",
    "orderId": "ORD-88213771",
    "patientRef": "opaque-pseudonymous-reference"
  },
  "payload": { "assayCode": "TSH", "status": "FINAL", "abnormalFlag": "H" }
}
```

**Forbidden in any event payload or envelope:** patient name, date of birth, SSN, MRN, address, phone, email, or any result value that alone identifies a person. `patientRef` is opaque and resolvable only inside the Patient Identity context.

### Principal event flow (order → result → bill)

```
order.received ─▶ order.validated ─▶ specimen.collected ─▶ specimen.accessioned
                                                                    │
                                                                    ▼
                                                            specimen.routed
                                                                    │
                                                                    ▼
                                                          instrument.result-received
                                                                    │
                                                                    ▼
                       ┌──────────────── result.finalized ──────────┴──────────┐
                       ▼                        ▼                              ▼
              result.critical-detected   release decision              claim.submitted
                       ▼                        ▼                              ▼
           critical-value.notified   result.released-to-patient        remittance.posted
                                              ▼                                ▼
                                      report.rendered                   invoice.issued
                                              ▼
                                     notification dispatched
```

---

## 7. Data architecture

**One database per service. No shared schemas. No cross-service joins.** Reporting needs are met by events into Synapse, never by reaching into another service's store.

| Store | Azure service | Used by |
|---|---|---|
| Oracle 19c | Azure VMs (lift-and-shift, 20-year legacy) | 1, 6, 10, 14, 23, 25, 34 |
| PostgreSQL | Azure Database for PostgreSQL Flexible Server | 27 services |
| MongoDB | Azure Cosmos DB for MongoDB (vCore) | 8 |
| Redis | Azure Cache for Redis | Cache and session for 8 services |
| Blob | Azure Blob Storage | 19 (reports), 39 (de-identified extracts) |
| Analytical | Azure Synapse | 38 |

The Oracle estate is deliberate: a twenty-year-old laboratory does not run entirely on PostgreSQL, and the harness must handle both. Hibernate 5.6 against Oracle generates materially different SQL than Hibernate 6.x against PostgreSQL — the N+1 and pagination diagnostics differ accordingly.

---

## 8. Cross-cutting conventions

These are uniform across all 40 services and are what the harness relies on to correlate.

### Correlation

- **W3C Trace Context** (`traceparent`) propagated on every hop, HTTP and messaging.
- MDC keys, present on every log line: `trace_id`, `span_id`, `service.name`, `deployment.environment`.
- One domain business key per service in MDC — `accession_id`, `order_id`, `invoice_id`, `specimen_id`. **Never a patient identifier.**

### Logging

- JSON structured logs to stdout; collected to Azure Monitor and Datadog.
- Boot 3.4+ services use native structured logging (`logging.structured.format.console=ecs`). Earlier services use a Logback JSON encoder. **This inconsistency is intentional** — the harness must handle both.
- `org.hibernate.SQL` at `INFO` or above in production. Never `org.hibernate.orm.jdbc.bind` in a PHI service — bound parameters are patient data.

### Security

- Entra ID workload identity for service-to-service; **no static secrets in any service**.
- Entra External ID for patient portal identity.
- Secrets from Azure Key Vault via CSI driver; nothing in environment variables or config maps.
- mTLS between services inside the mesh.

### Observability

- Micrometer to Azure Monitor and Datadog. Boot 3.x+ uses the Observation API; Boot 2.7 services use the Micrometer 1.9 API directly — again, deliberate.
- Health groups: `liveness` and `readiness` distinct, with readiness including downstream dependency checks.

### Actuator policy — binding, and derived from PHI classification

This is the rule the operations harness enforces, and the estate is built to make it testable.

| Endpoint | Non-PHI service | PHI service |
|---|---|---|
| `health`, `info`, `metrics`, `mappings`, `conditions`, `scheduledtasks` | exposed | exposed |
| `caches` (read), `flyway`, `liquibase` | exposed | exposed |
| `threaddump` | exposed | authorization required |
| `httpexchanges` (3.x+) / `httptrace` (2.7) | authorization required | **never exposed** |
| `env`, `configprops` | authorization required | **never exposed** |
| `heapdump` | authorization required | **never enabled** |
| `loggers` (write), `caches` (evict), batch restart, Quartz triggers | authorization required | authorization required |

`order-intake-service` (#6) violates this policy by exposing `*`. **Leave the violation in place.** It is the estate's known misconfiguration and a legitimate finding for the harness to surface.

---

## 9. Azure deployment topology

```
Management group: akiv-root
│
├── akiv-platform      (audit, eventing, shared identity)
├── akiv-patients      ── AKS: aks-patients-{env}      ── namespaces per program
├── akiv-providers     ── AKS: aks-providers-{env}
├── akiv-lab-ops       ── AKS: aks-labops-{env}
└── akiv-research      ── AKS: aks-research-{env}      (network-isolated, no PHI ingress)
```

- **Environments:** `dev`, `qa`, `staging`, `prod` — separate subscriptions for prod within each portfolio.
- **Namespaces** follow the program tier: `patients-scheduling`, `patients-results`, `patients-billing`, `labops-specimen`, and so on.
- **ACR:** one registry per portfolio, geo-replicated. Images tagged `{service}:{semver}-{gitSha}`.
- **Provisioning:** Terraform for infrastructure; **ArgoCD** for application delivery (one `Application` per service per environment); **Backstage** as the service catalog and ownership record.
- **Ingress:** Azure Application Gateway → NGINX ingress → service. WAF in front of patient-facing paths.
- **Observability:** Azure Monitor + Application Insights, with Datadog as the cross-portfolio aggregation layer.

### Backstage catalog

Every service registers a `Component` with `system` (bounded context), `domain` (portfolio), and `owner` (team group). This is the ownership truth the harness resolves against — it is not duplicated anywhere else.

---

## 10. Compliance boundaries

- **PHI classification is declared per service** (column in §4) and drives the actuator policy in §8, log-level policy, and evidence-handling rules.
- **Minimum necessary:** every service exposes only the fields its consumers need. No "return the whole patient" endpoints.
- **Audit:** every PHI read emits an audit event to `audit-service`. Fire-and-forget; the audit path must never be able to fail a clinical operation.
- **Disclosure accounting:** `audit-service` can answer "who accessed this patient's data, when, and why" for any `patientRef`.
- **Retention:** results retained per state requirements (2–10 years by jurisdiction); audit records 6 years minimum.
- **Research isolation:** `akiv-research` has no network path to PHI stores. `deidentification-service` writes to Blob; Research reads from Blob. There is no request path in the other direction.

---

## 11. GitLab repository layout

One repository per service. Group structure mirrors portfolio and context.

```
gitlab.akiv.example/
├── patients/
│   ├── identity/{patient-identity-service, patient-account-service, consent-service}
│   ├── scheduling/{appointment-service, service-center-service}
│   ├── results/{result-service, result-release-service, report-rendering-service}
│   ├── insurance/{eligibility-service, prior-authorization-service}
│   ├── billing/{claim-service, remittance-service, invoice-service, payment-service, price-estimate-service}
│   ├── commerce/{shop-catalog-service, cart-checkout-service}
│   └── notification/{notification-service}
├── providers/
│   ├── ordering/{order-intake-service, order-validation-service, requisition-service}
│   ├── client-management/{client-account-service, ordering-provider-service}
│   ├── interop/{hl7-gateway-service, fhir-gateway-service, emr-integration-service}
│   └── results/{critical-value-service}
├── lab-ops/
│   ├── specimen/{specimen-collection-service, accessioning-service, chain-of-custody-service, courier-logistics-service}
│   ├── operations/{worklist-service, instrument-interface-service, quality-control-service}
│   ├── compendium/{compendium-service, reference-range-service, terminology-service}
│   └── analytics/{utilization-analytics-service}
├── research/{deidentification-service}
└── platform/{audit-service}
```

Each repository contains: `pom.xml` or `build.gradle`, `src/`, `Dockerfile`, `helm/` chart, `.gitlab-ci.yml`, and a `catalog-info.yaml` for Backstage.

---

## 12. Generation instructions

For the agent session that will produce these services.

1. **Generate one repository per service.** Do not create a monorepo — the harness must operate services whose source lives in separate places, which is the realistic case.
2. **Honor the version matrix in §4 exactly.** Boot 2.7 services must use `javax.*`, Hibernate 5.6, Java 11, and WAR packaging where specified. Do not "upgrade while you're in there."
3. **Implement the aggregates and endpoints in §5.** Business logic can be thin — the point is realistic shape, not clinical completeness.
4. **Emit the events in §5** with the envelope in §6.
5. **Apply the actuator policy in §8**, including leaving `order-intake-service` misconfigured.
6. **Seed each service with realistic synthetic data.** Never use real patient data, and never use production-shaped identifiers that could be mistaken for real MRNs.
7. **Include a `catalog-info.yaml`** so Backstage resolves ownership, and an ArgoCD `Application` per environment.
8. **Include deliberate, documented imperfections** in at least these services, because an estate with no problems cannot exercise an operations product:
   - `accessioning-service` — no actuator, highest throughput, hardest to observe
   - `order-intake-service` — actuator fully exposed
   - `instrument-interface-service` — long-lived sockets, undersized connection pool
   - `claim-service` — nightly batch with no restart-safety on partial failure
   - `result-service` — an N+1 on the result-by-accession read path

Record every deviation from this document in the generated repositories, so the operations harness can later be evaluated against known ground truth.

---

## Appendix A — Service-to-portfolio-to-program index

| Portfolio | Program | Services |
|---|---|---|
| Patients | identity | 1, 2, 3 |
| Patients | scheduling | 4, 5 |
| Patients | results | 16, 17, 19 |
| Patients | insurance | 23, 24 |
| Patients | billing | 25, 26, 27, 28, 29 |
| Patients | commerce | 30, 31 |
| Patients | notification | 37 |
| Providers | ordering | 6, 7, 8 |
| Providers | client-management | 32, 33 |
| Providers | interop | 34, 35, 36 |
| Providers | results | 18 |
| Lab Ops | specimen | 9, 10, 11, 12 |
| Lab Ops | operations | 13, 14, 15 |
| Lab Ops | compendium | 20, 21, 22 |
| Lab Ops | analytics | 38 |
| Research | deidentification | 39 |
| Platform | audit | 40 |

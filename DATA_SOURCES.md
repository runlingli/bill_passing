# Data Sources

This document describes every data source used by the California Proposition Predictor, including external APIs, static reference data, and algorithm constants.

## External APIs

### 1. California Secretary of State — Quick Guide to Props

- **Purpose:** Primary source for proposition titles and numbers
- **Base URL:** `https://quickguidetoprops.sos.ca.gov/propositions`
- **URL Pattern:** `/{YYYY-MM-DD}` (election date)
- **Response Format:** HTML (parsed via regex)
- **Authentication:** None
- **Rate Limits:** None documented
- **File:** `src/lib/external-apis/ca-sos.ts`

The HTML is parsed to extract proposition numbers and titles using the pattern:
```
/propositions/DATE/NUMBER → <h2>TITLE</h2>
```

### 2. Open States API (v3)

- **Purpose:** Fallback source for California ballot measures (constitutional amendments)
- **Base URL:** `https://v3.openstates.org`
- **Endpoint:** `/bills?jurisdiction=ca&session={session}&classification=constitutional+amendment`
- **Response Format:** JSON
- **Authentication:** API key via `X-API-KEY` header
- **Environment Variable:** `OPEN_STATES_API_KEY` (optional — skipped if absent)
- **File:** `src/lib/external-apis/ca-sos.ts`

Sessions use the format `YYYY-YYYY` (e.g., `2025-2026`), derived from the target year.

### 3. Cal-Access / California Civic Data Coalition

- **Purpose:** Campaign finance data (committees, donors, spending)
- **File:** `src/lib/external-apis/cal-access.ts`

**Primary source — Cal-Access Official:**
- **Base URL:** `https://cal-access.sos.ca.gov`
- **Endpoint:** `/Campaign/Measures/Detail.aspx?id={measureNumber}&session={electionYear}`
- **Response Format:** HTML
- **Authentication:** None
- **Cache:** 1 hour (`revalidate: 3600`)

**Fallback — California Civic Data Coalition API:**
- **Base URL:** `https://calaccess.californiacivicdata.org`
- **Endpoints:**
  - `/api/ballot-measures/{year}/{measureNumber}/` — committees
  - `/api/ballot-measures/{year}/{measureNumber}/contributions/` — donor data
- **Response Format:** JSON
- **Authentication:** None
- **Cache:** 1 hour

Returns: support/opposition committees with amounts raised/spent, and top donors sorted by contribution amount.

### 4. US Census Bureau — American Community Survey

- **Purpose:** Demographic data for district-level analysis
- **Base URL:** `https://api.census.gov/data`
- **Data Set:** ACS 5-year (2022)
- **Response Format:** JSON (arrays with header row)
- **Authentication:** API key (optional)
- **Environment Variable:** `CENSUS_API_KEY`
- **File:** `src/lib/external-apis/census.ts`

Fetches data at three geographic levels:
- Counties (all California counties, FIPS `06`)
- Congressional Districts
- State Legislative Districts (Senate and Assembly)

### 5. Ballotpedia

- **Purpose:** Ballot wording text for sentiment/readability analysis
- **Base URL:** `https://ballotpedia.org`
- **URL Pattern:** `/California_Proposition_{number}_{year}`
- **Response Format:** HTML
- **Authentication:** None
- **File:** `src/lib/external-apis/ballotpedia.ts`
- **Note:** Currently returns null — HTML parsing not fully implemented. Ballot analysis uses title/summary text from other sources instead.

## Static Reference Data

All static data in the codebase is either **factual reference data** or **algorithm configuration**. No fabricated/sample data exists.

### Factual Reference Data

| Constant | File | Description |
|----------|------|-------------|
| `CA_ELECTION_DATES` | `ca-sos.ts` | Real California election dates (2016–2026). Used to construct API query URLs for the CA SOS Quick Guide. |
| `HISTORICAL_RESULTS` | `ca-sos.ts` | Factual pass/fail outcomes for 40+ propositions (2016–2025). Source: [Ballotpedia](https://ballotpedia.org/List_of_California_ballot_propositions) and CA Secretary of State. Used to determine proposition status. |
| `ACS_VARIABLES` | `census.ts` | 22 US Census Bureau variable codes (e.g., `B01001_001E` for total population). These are required API parameters — not data themselves. |
| `CALIFORNIA_REGIONS` | `district-service.ts` | Maps region names to lists of California counties. Used for geographic aggregation of district data. |

### Algorithm Constants

These are tuning parameters and NLP word lists — not data that represents real-world entities.

| Constant | File | Description |
|----------|------|-------------|
| `DEFAULT_WEIGHTS` | `prediction-service.ts` | Six weights summing to 1.0 that control how prediction factors are combined: campaign finance (0.30), ballot wording (0.20), demographics (0.15), timing (0.15), historical similarity (0.10), opposition (0.10). |
| Positive/Negative/Neutral word lists | `ballotpedia.ts` | ~42 words used for sentiment scoring of ballot text (e.g., "protect" = positive, "tax" = negative). |
| `comparisonToSimilar` defaults | `ballotpedia.ts` | Historical benchmark averages: `avgWordCount: 300`, `avgReadability: 45`. Used to contextualize a proposition's ballot wording relative to typical measures. |
| Turnout estimation factors | `district-service.ts` | Adjustments for income, education, and urbanization that estimate voter turnout from demographic data. Base turnout: 0.55. |
| Registration shift factors | `district-service.ts` | Adjustments for age, urbanization, and income that estimate partisan lean from demographics. |

## Data Flow

```
External APIs                      Services                        UI
─────────────                      ────────                        ──

CA SOS Quick Guide ──┐
                     ├─→ ca-sos.ts ────────→ proposition-service.ts ──→ /propositions
Open States API ─────┘       │                      │
                             │                      │
                     HISTORICAL_RESULTS              │
                     (pass/fail status)              │
                                                     │
Cal-Access ──────────→ cal-access.ts ───→ getFinanceData() ──────────→ /propositions/[id]
CA Civic Data API ───┘                       │
                                             ↓
Census Bureau ───→ census.ts ──→ district-service.ts ──→ prediction-service.ts
                                                              │
Ballotpedia ─────→ ballotpedia.ts ──→ analyzeBallotWording() ─┘
                                                              │
                                                              ↓
                                                    PropositionPrediction
                                                    (probability + factors)
```

## Fallback Behavior

| API | What happens when unavailable |
|-----|-------------------------------|
| **CA SOS Quick Guide** | Falls back to Open States API. If both fail, returns empty array. |
| **Open States API** | Skipped if no API key is configured. Returns empty array on error. |
| **Cal-Access / Civic Data** | Returns `null` — the proposition is displayed without finance data. |
| **Census Bureau** | Returns empty demographics. Prediction still runs with other available factors. |
| **Ballotpedia** | Returns `null` — ballot analysis uses title/summary text from CA SOS instead. |

No API failure causes the application to crash. All services return graceful defaults (empty arrays, null values) that the UI handles by hiding the corresponding sections.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPEN_STATES_API_KEY` | No | API key for Open States v3. Enables fallback proposition data source. |
| `CENSUS_API_KEY` | No | API key for US Census Bureau. Increases rate limits for demographic queries. |

## Caching

The `PropositionService` class maintains an in-memory cache with a 5-minute TTL for:
- Proposition lists (keyed by year)
- Finance data (keyed by year and measure number)

The Cal-Access client uses Next.js `fetch` with `revalidate: 3600` (1 hour) for HTTP-level caching.

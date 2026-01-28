# California Proposition Predictor

A Next.js TypeScript web application for estimating the probability that California statewide propositions pass, based on historical data, campaign finances, demographics, and ballot wording analysis.

## Features

- **Probability Predictions**: ML-inspired model analyzing historical data, campaign finances, and demographics
- **Campaign Finance Tracking**: Real-time data from Cal-Access
- **What-If Scenarios**: Run simulations with different funding levels, turnout rates, or ballot framing
- **District Impact Analysis**: See how proposition passage affects partisan balance across districts

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **Validation**: Zod

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── districts/         # District impact analysis page
│   ├── predictions/       # Predictions dashboard
│   ├── propositions/      # Propositions list and detail pages
│   └── scenarios/         # What-if scenario simulator
├── components/
│   ├── features/          # Feature-specific components
│   ├── layout/            # Header, Footer, etc.
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions and API client
├── services/              # Business logic and data services
├── store/                 # Zustand state management
└── types/                 # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Required API Keys
GOOGLE_CIVIC_API_KEY=your_key_here
CENSUS_API_KEY=your_key_here
OPEN_STATES_API_KEY=your_key_here

# External Data Source URLs
CAL_ACCESS_BASE_URL=https://cal-access.sos.ca.gov/
SOS_API_BASE_URL=https://www.sos.ca.gov/
CENSUS_API_BASE_URL=https://api.census.gov/data

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CA Proposition Predictor

# Database (Optional - for caching)
DATABASE_URL=postgresql://user:password@localhost:5432/ca_propositions

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_analytics_id
```

## API Reference

All API responses follow a consistent format:

```json
{
  "data": "...",
  "success": true,
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  },
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 100,
    "totalPages": 5,
    "cached": false,
    "cachedAt": "ISO date string"
  }
}
```

### Propositions

#### `GET /api/propositions`

List all propositions with filtering and pagination.

| Parameter | Type   | Description                              |
|-----------|--------|------------------------------------------|
| `year`    | number | Filter by election year                  |
| `category`| string | Filter by proposition category           |
| `status`  | string | Filter by status                         |
| `q`       | string | Search query                             |
| `page`    | number | Page number (default: 1)                 |
| `perPage` | number | Results per page (default: 20)           |

```bash
curl http://localhost:3000/api/propositions?year=2024&category=tax&page=1&perPage=10
```

#### `GET /api/propositions/[id]`

Get full details for a single proposition, including finance data and ballot analysis.

- `id` format: `YEAR-NUMBER` (e.g., `2024-36`)

```bash
curl http://localhost:3000/api/propositions/2024-36
```

#### `GET /api/propositions/[id]/finance`

Get campaign finance data for a specific proposition.

```bash
curl http://localhost:3000/api/propositions/2024-36/finance
```

### Predictions

#### `GET /api/predictions/[id]`

Get the passage probability prediction for a proposition.

- `id` format: `YEAR-NUMBER` (e.g., `2024-36`)

```bash
curl http://localhost:3000/api/predictions/2024-36
```

### Demographics

#### `GET /api/demographics/districts`

Get district-level demographic data.

| Parameter | Type   | Description                                              |
|-----------|--------|----------------------------------------------------------|
| `type`    | string | District type: `congressional`, `state_senate`, or `state_assembly` |

```bash
curl http://localhost:3000/api/demographics/districts?type=congressional
```

#### `GET /api/demographics/counties`

Get demographic data for all California counties.

```bash
curl http://localhost:3000/api/demographics/counties
```

## Data Sources

- [Cal-Access](https://cal-access.sos.ca.gov/) - Campaign finance data
- [Census Bureau ACS](https://www.census.gov/programs-surveys/acs.html) - Demographics
- [CA Secretary of State](https://www.sos.ca.gov/elections/ballot-measures) - Official election data
- [Google Civic Information API](https://developers.google.com/civic-information) - District information
- [Open States API](https://v3.openstates.org) - Legislative data
- [Ballotpedia](https://ballotpedia.org/) - Ballot measure analysis and polls

## Key Features Explained

### Prediction Engine

The prediction engine uses a weighted factor model:

| Factor              | Weight | Description                                                  |
|---------------------|--------|--------------------------------------------------------------|
| Campaign Finance    | 30%    | Support vs opposition spending ratio (0.2–0.8 range)         |
| Ballot Wording      | 20%    | Sentiment (-1 to +1), readability (0–100), complexity        |
| Timing              | 15%    | Election type & turnout adjustments                          |
| Demographics        | 15%    | Age, ethnicity, income, education, urban/rural patterns      |
| Opposition          | 10%    | Organized opposition groups & media spend ratio              |
| Historical Similarity | 10% | Comparison to similar past propositions                      |

Confidence scoring starts at a 0.4 base, with bonuses for data availability (up to 0.85).

### What-If Scenarios

Users can adjust parameters across three categories:

**Funding** — Support/opposition multipliers or custom dollar amounts.

**Turnout** — Overall multiplier, per-demographic adjustments, and regional adjustments.

**Framing** — Title sentiment, summary complexity (`simpler`/`unchanged`/`complex`), emphasis shift (economic, social, environmental), or custom wording.

Five presets are included: High Turnout, Low Turnout, Well-Funded Support, Highly Contested, and Simplified Ballot Language.

### District Impact

Analyzes how proposition passage affects:
- Partisan balance (Democratic advantage percentage)
- Competitiveness index
- Voter engagement estimates
- Regional aggregates across 9 California regions

## Caching

- **Proposition data**: 5-minute TTL
- **Finance data**: 5-minute TTL
- **Demographics**: 24-hour revalidation
- **API responses**: 5-minute default cache

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## License

MIT

## Disclaimer

This tool is for informational purposes only. Predictions are based on statistical models and historical patterns, and should not be considered as definitive outcomes.

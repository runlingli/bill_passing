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
GOOGLE_CIVIC_API_KEY=your_key_here
CENSUS_API_KEY=your_key_here
```

## Data Sources

- [Cal-Access](https://cal-access.sos.ca.gov/) - Campaign finance data
- [Census Bureau ACS](https://www.census.gov/programs-surveys/acs.html) - Demographics
- [CA Secretary of State](https://www.sos.ca.gov/elections/ballot-measures) - Official election data
- [Google Civic Information API](https://developers.google.com/civic-information) - District information
- [CA Elections Data Archive](https://scholars.csus.edu/esploro/outputs/dataset/California-Elections-Data-Archive-CEDA/99257830890201671) - Historical data

## Key Features Explained

### Prediction Engine

The prediction engine uses a weighted factor model considering:
- Campaign Finance (25%): Support vs opposition spending ratio
- Demographics (20%): Demographic alignment with historical patterns
- Ballot Wording (15%): Sentiment and complexity analysis
- Timing (10%): Election type and turnout expectations
- Opposition (10%): Level of organized opposition

### What-If Scenarios

Users can modify:
- Funding multipliers for support/opposition
- Voter turnout levels
- Ballot language sentiment and complexity
- Election timing and type

### District Impact

Analyzes how proposition passage affects:
- Partisan balance (Democratic advantage)
- Competitiveness index
- Voter engagement patterns
- Regional representation

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

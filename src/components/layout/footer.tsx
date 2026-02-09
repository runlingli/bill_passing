'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

const dataSourceLinks = [
  { name: 'Cal-Access', url: 'https://cal-access.sos.ca.gov/' },
  { name: 'Census Bureau ACS', url: 'https://www.census.gov/programs-surveys/acs.html' },
  { name: 'CA Secretary of State', url: 'https://www.sos.ca.gov/elections/ballot-measures' },
  { name: 'Ballotpedia', url: 'https://ballotpedia.org/California_ballot_propositions' },
  { name: 'CalMatters', url: 'https://calmatters.org/politics/elections/' },
];

const resourceLinks = [
  { name: 'UC Davis DataLab', url: 'https://events.library.ucdavis.edu/datalab' },
  { name: 'CA Elections Data Archive', url: 'https://scholars.csus.edu/esploro/outputs/dataset/California-Elections-Data-Archive-CEDA/99257830890201671' },
  { name: 'CA Budget Center', url: 'https://calbudgetcenter.org/issues/ballot-propositions/' },
  { name: 'League of Women Voters', url: 'https://lwvc.org/issues/' },
];

export function Footer() {
  return (
    <footer className="border-t-2 border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="font-display font-bold text-xl text-gray-900 mb-4">
              California Proposition Predictor
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              A data-driven tool for estimating the probability that California statewide
              propositions pass, based on historical data, campaign finances, demographics,
              and ballot wording analysis.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              This tool is for informational purposes only. Predictions are based on
              statistical models and historical patterns, and should not be considered
              as definitive outcomes.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-gray-900 mb-4">Data Sources</h4>
            <ul className="space-y-2">
              {dataSourceLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-blue-900 flex items-center gap-1 transition-colors"
                  >
                    {link.name}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-blue-900 flex items-center gap-1 transition-colors"
                  >
                    {link.name}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t-2 border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              Data sourced from public California state records and federal census data.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/about"
                className="text-xs text-gray-500 hover:text-blue-900 font-medium transition-colors"
              >
                About
              </Link>
              <Link
                href="/methodology"
                className="text-xs text-gray-500 hover:text-blue-900 font-medium transition-colors"
              >
                Methodology
              </Link>
              <Link
                href="/api-docs"
                className="text-xs text-gray-500 hover:text-blue-900 font-medium transition-colors"
              >
                API
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

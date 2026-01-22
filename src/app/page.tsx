import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import {
  BarChart3,
  DollarSign,
  Map,
  Zap,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const features = [
  {
    title: 'Probability Predictions',
    description:
      'Our model analyzes historical data, campaign finances, and demographics to estimate passage probability.',
    icon: BarChart3,
    href: '/predictions',
    color: 'bg-blue-500',
  },
  {
    title: 'Campaign Finance Analysis',
    description:
      'Track real-time campaign contributions and spending from Cal-Access data.',
    icon: DollarSign,
    href: '/propositions',
    color: 'bg-green-500',
  },
  {
    title: 'What-If Scenarios',
    description:
      'Run simulations with different funding levels, turnout rates, or ballot framing.',
    icon: Zap,
    href: '/scenarios',
    color: 'bg-california-gold',
  },
  {
    title: 'District Impact',
    description:
      'See how proposition passage affects partisan balance across California districts.',
    icon: Map,
    href: '/districts',
    color: 'bg-purple-500',
  },
];

const upcomingPropositions = [
  {
    number: '1',
    title: 'Housing Bond Act',
    category: 'housing',
    prediction: 0.62,
  },
  {
    number: '2',
    title: 'Education Funding Reform',
    category: 'education',
    prediction: 0.58,
  },
  {
    number: '3',
    title: 'Environmental Protection',
    category: 'environment',
    prediction: 0.71,
  },
];

const dataSources = [
  {
    name: 'Cal-Access',
    description: 'Campaign finance data',
    url: 'https://cal-access.sos.ca.gov/',
  },
  {
    name: 'Census ACS',
    description: 'Demographic data',
    url: 'https://www.census.gov/programs-surveys/acs.html',
  },
  {
    name: 'CA Secretary of State',
    description: 'Official election data',
    url: 'https://www.sos.ca.gov/elections/ballot-measures',
  },
  {
    name: 'Google Civic Info',
    description: 'District information',
    url: 'https://developers.google.com/civic-information',
  },
];

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-california-blue to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="warning" className="mb-4">
              Beta Release
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              California Proposition Predictor
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Data-driven predictions for statewide ballot measures using historical
              data, campaign finances, demographics, and ballot wording analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/propositions">
                <Button size="lg" className="bg-california-gold text-california-blue hover:bg-yellow-400">
                  View Propositions
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/scenarios">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Try What-If Scenarios
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Analysis Tools
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform combines multiple data sources to provide accurate predictions
              and deep insights into California ballot propositions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Link key={feature.title} href={feature.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Propositions Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Upcoming Propositions
              </h2>
              <p className="text-gray-600">
                Current predictions for upcoming ballot measures
              </p>
            </div>
            <Link href="/propositions">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingPropositions.map((prop) => (
              <Card key={prop.number} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge variant="info" size="sm" className="mb-2">
                        {prop.category}
                      </Badge>
                      <h3 className="font-semibold">
                        Prop {prop.number}: {prop.title}
                      </h3>
                    </div>
                    <span className="text-3xl font-bold text-primary-600">
                      {prop.number}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">
                        Passage Probability
                      </span>
                      <span
                        className={`font-bold ${
                          prop.prediction >= 0.5 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {(prop.prediction * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          prop.prediction >= 0.5 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${prop.prediction * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Powered by Official Data Sources
            </h2>
            <p className="text-gray-600">
              Our predictions are built on publicly available, authoritative data
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {dataSources.map((source) => (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow text-center"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{source.name}</h3>
                <p className="text-sm text-gray-500">{source.description}</p>
                <ExternalLink className="h-4 w-4 text-gray-400 mx-auto mt-3" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-california-blue">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to explore proposition predictions?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Dive into detailed analysis, run what-if scenarios, and understand how
            propositions might affect your district.
          </p>
          <Link href="/propositions">
            <Button size="lg" className="bg-california-gold text-california-blue hover:bg-yellow-400">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

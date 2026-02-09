'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BarChart3, FileText, Zap, Map, Home, ExternalLink } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Propositions', href: '/propositions', icon: FileText },
  { name: 'Predictions', href: '/predictions', icon: BarChart3 },
  { name: 'Scenarios', href: '/scenarios', icon: Zap },
  { name: 'District Impact', href: '/districts', icon: Map },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded bg-blue-900 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-gray-900 tracking-tight">
                CA Prop Predictor
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://www.sos.ca.gov/elections/ballot-measures"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-900 transition-colors"
            >
              CA SOS
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://cal-access.sos.ca.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-900 transition-colors"
            >
              Cal-Access
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

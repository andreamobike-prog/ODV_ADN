'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import {
  LayoutDashboard,
  BookUser,
  HandHelping,
  Ticket,
  Users,
  CalendarDays,
  Wrench,
  PlaySquare,
  ShieldUser,
  Settings,
  ChevronRight,
} from 'lucide-react';

const gestionaleLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/soci', label: 'Libro soci', icon: BookUser },
  { href: '/volontari', label: 'Registro volontari', icon: HandHelping },
  { href: '/tessere', label: 'Tessere', icon: Ticket },
  { href: '/gruppi', label: 'Gruppi', icon: Users },
  { href: '/eventi', label: 'Eventi', icon: CalendarDays },
];

const sistemaLinks = [
  { href: '/assistenza', label: 'Assistenza tecnica', icon: Wrench },
  { href: '/tutorial', label: 'Tutorial', icon: PlaySquare },
  { href: '/accessi', label: 'Utenti e livelli', icon: ShieldUser },
  { href: '/impostazioni', label: 'Impostazioni', icon: Settings },
];

type SidebarProps = {
  logoUrl?: string | null;
  nomeAssociazione?: string;
  sottotitoloAssociazione?: string;
};

type LiveBrandingPayload = {
  nomeAssociazione?: string;
  sottotitoloAssociazione?: string;
  logoUrl?: string | null;
};

export function Sidebar({
  logoUrl = null,
  nomeAssociazione = 'ANGELI DEI NAVIGLI',
  sottotitoloAssociazione = 'Organizzazione di Volontariato',
}: SidebarProps) {
  const pathname = usePathname();

  const [liveNomeAssociazione, setLiveNomeAssociazione] = useState(nomeAssociazione);
  const [liveSottotitoloAssociazione, setLiveSottotitoloAssociazione] =
    useState(sottotitoloAssociazione);
  const [liveLogoUrl, setLiveLogoUrl] = useState<string | null>(logoUrl);

  useEffect(() => {
    setLiveNomeAssociazione(nomeAssociazione);
    setLiveSottotitoloAssociazione(sottotitoloAssociazione);
    setLiveLogoUrl(logoUrl);
  }, [logoUrl, nomeAssociazione, sottotitoloAssociazione]);

  useEffect(() => {
    function handleBrandingPreviewUpdate(event: Event) {
      const customEvent = event as CustomEvent<LiveBrandingPayload>;
      const detail = customEvent.detail ?? {};

      if (typeof detail.nomeAssociazione === 'string') {
        setLiveNomeAssociazione(detail.nomeAssociazione);
      }

      if (typeof detail.sottotitoloAssociazione === 'string') {
        setLiveSottotitoloAssociazione(detail.sottotitoloAssociazione);
      }

      if ('logoUrl' in detail) {
        setLiveLogoUrl(detail.logoUrl ?? null);
      }
    }

    window.addEventListener(
      'branding-preview-update',
      handleBrandingPreviewUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        'branding-preview-update',
        handleBrandingPreviewUpdate as EventListener
      );
    };
  }, []);

  return (
    <aside className="sidebar">
      <div className="brand">
        <img
          src={liveLogoUrl || '/logo.png'}
          alt="Logo associazione"
          className="brand-logo"
        />
        <div>
          <h1>{liveNomeAssociazione}</h1>
          <p>{liveSottotitoloAssociazione}</p>
        </div>
      </div>

      <div className="nav-section-title">Gestionale</div>
      <nav className="nav">
        {gestionaleLinks.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? 'active' : ''}
            >
              <span className="nav-left">
                <Icon size={19} strokeWidth={1.8} className="nav-icon" />
                <span>{item.label}</span>
              </span>
              <ChevronRight size={18} strokeWidth={1.8} className="nav-arrow" />
            </Link>
          );
        })}
      </nav>

      <div className="nav-section-title">Sistema</div>
      <nav className="nav">
        {sistemaLinks.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? 'active' : ''}
            >
              <span className="nav-left">
                <Icon size={19} strokeWidth={1.8} className="nav-icon" />
                <span>{item.label}</span>
              </span>
              <ChevronRight size={18} strokeWidth={1.8} className="nav-arrow" />
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <LogoutButton />
      </div>
    </aside>
  );
}

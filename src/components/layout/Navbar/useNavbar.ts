import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser, useDoc } from '@/firebase';
import { useApp } from '@/contexts/AppContext';
import { translations } from '@/lib/translations';
import { Language, UserRole } from '@/lib/types';
import { signOut } from 'firebase/auth';

export function useNavbar(
  propLang?: Language,
  propSetLang?: (lang: Language) => void,
  propCurrency?: 'THB' | 'USD' | 'CNY',
  propSetCurrency?: (curr: 'THB' | 'USD' | 'CNY') => void,
  onOpenPostListing?: () => void
) {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [navbarSearchQuery, setNavbarSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [upgradeAlertOpen, setUpgradeAlertOpen] = useState(false);
  const [navbarPriceMin, setNavbarPriceMin] = useState(0);
  const [navbarPriceMax, setNavbarPriceMax] = useState(150000);
  const [navbarPropertyType, setNavbarPropertyType] = useState('');
  const megaMenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authAction = params.get('auth');
      if (authAction === 'login') {
        setAuthTab('login');
        setAuthOpen(true);
        const newSearch = window.location.search.replace(/[?&]auth=login/, '').replace(/^&/, '?');
        const newUrl = window.location.pathname + (newSearch === '?' ? '' : newSearch);
        window.history.replaceState({}, '', newUrl);
      } else if (authAction === 'signup' || authAction === 'register') {
        setAuthTab('register');
        setAuthOpen(true);
        const newSearch = window.location.search.replace(/[?&]auth=(signup|register)/, '').replace(/^&/, '?');
        const newUrl = window.location.pathname + (newSearch === '?' ? '' : newSearch);
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('location') || '';
    const type = searchParams.get('type') || '';
    const priceMin = parseInt(searchParams.get('priceMin') || '0') || 0;
    const priceMax = parseInt(searchParams.get('priceMax') || '150000') || 150000;

    setNavbarSearchQuery(q);
    setNavbarPropertyType(type);
    setNavbarPriceMin(priceMin);
    setNavbarPriceMax(priceMax);
  }, [searchParams]);

  const openMegaMenu = () => {
    if (megaMenuTimerRef.current) clearTimeout(megaMenuTimerRef.current);
    setMegaMenuOpen(true);
  };
  const closeMegaMenu = () => {
    megaMenuTimerRef.current = setTimeout(() => setMegaMenuOpen(false), 150);
  };

  const appCtx = useApp();
  const lang = propLang ?? appCtx.lang;
  const setLang = propSetLang ?? appCtx.setLang;
  const currency = propCurrency ?? appCtx.currency;
  const setCurrency = propSetCurrency ?? appCtx.setCurrency;

  const t = translations[lang] || translations.th;
  const { user } = useUser();
  const auth = useAuth();
  const { data: profile } = useDoc<{ role: UserRole }>(user && !user.isMock ? `users/${user.uid}` : null);
  const userRole = profile?.role || (user as any)?.role || null;

  const toggleLang = () => {
    const langs: Language[] = ['th', 'en', 'cn'];
    const nextLang = langs[(langs.indexOf(lang) + 1) % langs.length];
    setLang(nextLang);
    localStorage.setItem('primerent_lang', nextLang);
  };

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('primerent_session_kyc');
      document.cookie = 'user_role=; path=/; max-age=0';
    }
    localStorage.removeItem('prime_mock_user');
    localStorage.removeItem('primerent_user_role');
    localStorage.removeItem('prime_registered_roles');
    localStorage.removeItem('primerent_mock_kyc');
    localStorage.removeItem('primerent_agent_verified');
    if (!user?.isMock && auth) {
      signOut(auth);
    }
    window.location.href = '/';
  };

  const handlePostListingClick = () => {
    if (user) {
      if (userRole === 'renter') {
        setUpgradeAlertOpen(true);
      } else {
        onOpenPostListing ? onOpenPostListing() : router.push('/post-listing');
      }
    } else {
      setAuthTab('login');
      setAuthOpen(true);
    }
  };

  const handleNavbarSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (navbarSearchQuery.trim()) params.set('q', navbarSearchQuery.trim());
    if (navbarPriceMin > 0) params.set('priceMin', navbarPriceMin.toString());
    if (navbarPriceMax < 150000) params.set('priceMax', navbarPriceMax.toString());
    if (navbarPropertyType) params.set('type', navbarPropertyType);
    router.push(params.toString() ? `/listings?${params.toString()}` : '/listings');
  };

  const handleLogoOrHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return {
    router, authOpen, setAuthOpen, authTab, setAuthTab,
    navbarSearchQuery, setNavbarSearchQuery, mobileMenuOpen, setMobileMenuOpen,
    megaMenuOpen, setMegaMenuOpen, navbarPriceMin, setNavbarPriceMin,
    navbarPriceMax, setNavbarPriceMax, openMegaMenu, closeMegaMenu,
    lang, setLang, currency, setCurrency, t, user, userRole,
    toggleLang, handleSignOut, handlePostListingClick, handleNavbarSearch, handleLogoOrHomeClick,
    navbarPropertyType, setNavbarPropertyType,
    upgradeAlertOpen, setUpgradeAlertOpen,
  };
}

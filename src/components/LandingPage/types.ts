import { Language } from "@/lib/types";

export type Lang = Language;

export interface Translation {
  nav: {
    listings: string;
    howItWorks: string;
    agent: string;
    owner: string;
    login: string;
    signup: string;
  };
  hero: {
    badge: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    searchPlaceholder: string;
    searchBtn: string;
    tabs: {
      renter: string;
      owner: string;
      agent: string;
    };
    renterCTA: string;
    ownerCTA: string;
    agentCTA: string;
    renterDesc: string;
    ownerDesc: string;
    agentDesc: string;
  };
  stats: {
    listings: string;
    users: string;
    agents: string;
    success: string;
  };
  featured: {
    title: string;
    subtitle: string;
    viewAll: string;
    perMonth: string;
    beds: string;
    baths: string;
    sqm: string;
  };
  howItWorks: {
    title: string;
    subtitle: string;
    tabs: {
      renter: string;
      owner: string;
      agent: string;
    };
    renterSteps: Step[];
    ownerSteps: Step[];
    agentSteps: Step[];
  };
  why: {
    title: string;
    subtitle: string;
    features: Feature[];
  };
  testimonials: {
    title: string;
    subtitle: string;
    items: Testimonial[];
  };
  line: {
    title: string;
    subtitle: string;
    cta: string;
  };
  faq: {
    title: string;
    items: FAQ[];
  };
  footer: {
    tagline: string;
    renter: string;
    owner: string;
    agent: string;
    company: string;
    links: {
      search: string;
      howRent: string;
      payment: string;
      list: string;
      manage: string;
      income: string;
      joinAgent: string;
      agentTools: string;
      commission: string;
      about: string;
      blog: string;
      privacy: string;
      terms: string;
      contact: string;
    };
    copyright: string;
  };
}

export interface Step {
  icon: string;
  title: string;
  desc: string;
}

export interface Feature {
  icon: string;
  title: string;
  desc: string;
}

export interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  text: string;
  rating: number;
  location: string;
}

export interface FAQ {
  q: string;
  a: string;
}

export interface MockListing {
  id: number;
  title: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  sqm: number;
  tag: string;
  image: string;
  type: string;
}

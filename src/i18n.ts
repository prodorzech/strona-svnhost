export type Language = 'pl' | 'en' | 'de' | 'uk';

export interface Translations {
  nav: {
    home: string;
    services: string;
    pricing: string;
    features: string;
    reviews: string;
    contact: string;
    dashboard: string;
  };
  hero: {
    badge: string;
    title1: string;
    titleAccent: string;
    title2: string;
    subtitle: string;
    cta: string;
    dashboard: string;
    stat1Label: string;
    stat1Value: string;
    stat2Label: string;
    stat2Value: string;
    stat3Label: string;
    stat3Value: string;
  };
  features: {
    title: string;
    subtitle: string;
    cards: {
      title: string;
      description: string;
    }[];
  };
  services: {
    title: string;
    subtitle: string;
    cards: {
      name: string;
      description: string;
      features: string[];
      price: string;
      period: string;
    }[];
  };
  pricing: {
    title: string;
    subtitle: string;
    popular: string;
    btn: string;
    plans: {
      name: string;
      price: string;
      period: string;
      features: string[];
    }[];
  };
  panel: {
    title: string;
    subtitle: string;
    features: {
      title: string;
      description: string;
    }[];
  };
  reviews: {
    title: string;
    subtitle: string;
    items: {
      name: string;
      role: string;
      text: string;
    }[];
  };
  stats: {
    title: string;
    subtitle: string;
    items: {
      value: string;
      label: string;
    }[];
  };
  reasons: {
    title: string;
    subtitle: string;
    items: {
      title: string;
      description: string;
    }[];
  };
  cta: {
    title: string;
    subtitle: string;
    btn: string;
    discord: string;
  };
  footer: {
    description: string;
    company: string;
    companyLinks: { label: string; href: string }[];
    offer: string;
    offerLinks: { label: string; href: string }[];
    contact: string;
    contactInfo: string[];
    copyright: string;
  };
}

const pl: Translations = {
  nav: {
    home: 'Strona główna',
    services: 'Usługi',
    pricing: 'Cennik',
    features: 'Funkcje',
    reviews: 'Opinie',
    contact: 'Kontakt',
    dashboard: 'Panel Klienta',
  },
  hero: {
    badge: 'Premium Hosting od SVNHost',
    title1: 'Wydajny ',
    titleAccent: 'Hosting',
    title2: ' dla Twojego Projektu',
    subtitle:
      'Serwery VPS, FiveM, Minecraft i wiele więcej. Najwyższa wydajność, ochrona DDoS i wsparcie 24/7.',
    cta: 'Zobacz ofertę',
    dashboard: 'Panel klienta',
    stat1Label: 'Klientów',
    stat1Value: '2500+',
    stat2Label: 'Uptime',
    stat2Value: '99.9%',
    stat3Label: 'Wsparcie',
    stat3Value: '24/7',
  },
  features: {
    title: 'Dlaczego my?',
    subtitle:
      'Zapewniamy najwyższą jakość usług hostingowych, korzystając z najnowocześniejszego sprzętu.',
    cards: [
      {
        title: 'Najwydajniejsze podzespoły',
        description:
          'Nasze serwery wyposażone są w procesory AMD EPYC oraz dyski NVMe Enterprise.',
      },
      {
        title: 'Ochrona Anti-DDoS',
        description:
          'Zaawansowana ochrona przed atakami DDoS z pojemnością mitigacji ponad 10 Tbps.',
      },
      {
        title: 'Bezpieczeństwo danych',
        description:
          'Codzienne backupy przenoszone na zewnętrzne centra danych zapewniają pełne bezpieczeństwo.',
      },
      {
        title: 'Wsparcie Premium',
        description:
          'Wykwalifikowany zespół wsparcia gotowy pomóc Ci w każdej chwili, 24/7/365.',
      },
    ],
  },
  services: {
    title: 'Nasze usługi',
    subtitle:
      'Oferujemy szeroki zakres usług hostingowych dopasowanych do Twoich potrzeb.',
    cards: [
      {
        name: 'VPS Hosting',
        description:
          'Wirtualne serwery prywatne z pełnym dostępem root i dedykowanymi zasobami.',
        features: ['Pełny root access', 'Dedykowane zasoby', 'SSD NVMe', 'Anti-DDoS'],
        price: 'od 19.99 zł',
        period: '/mies.',
      },
      {
        name: 'FiveM Hosting',
        description:
          'Zoptymalizowane serwery dla serwerów FiveM z niskim pingiem i ochroną DDoS.',
        features: ['Optymalizacja FiveM', 'Niski ping', 'Auto-restart', 'Anti-DDoS Gaming'],
        price: 'od 39.99 zł',
        period: '/mies.',
      },
      {
        name: 'Minecraft Hosting',
        description:
          'Wydajne serwery Minecraft z panelem zarządzania i automatyczną instalacją modów.',
        features: ['Panel zarządzania', 'Auto-install modów', 'Backup codzienny', 'Ochrona DDoS'],
        price: 'od 9.99 zł',
        period: '/mies.',
      },
      {
        name: 'Bot Discord Hosting',
        description:
          'Hosting botów Discord z wyborem Node.js lub Python. Pełna automatyzacja wdrożenia.',
        features: ['Node.js / Python', 'discord.js / discord.py', 'Auto-restart 24/7', 'Panel zarządzania'],
        price: 'od 9.99 zł',
        period: '/mies.',
      },
    ],
  },
  pricing: {
    title: 'Plany hostingowe',
    subtitle:
      'Wybierz plan idealnie dopasowany do Twojego projektu. Wszystkie plany zawierają ochronę DDoS.',
    popular: 'Najpopularniejszy',
    btn: 'Zamów teraz',
    plans: [
      {
        name: 'Starter',
        price: '19.99 zł',
        period: '/mies.',
        features: [
          '2 vCore CPU',
          '4 GB RAM DDR5',
          '30 GB NVMe',
          'Ochrona Anti-DDoS',
          'Dedykowane IPv4',
          'Backup 3-dniowy',
        ],
      },
      {
        name: 'Professional',
        price: '79.99 zł',
        period: '/mies.',
        features: [
          '4 vCore CPU',
          '16 GB RAM DDR5 ECC',
          '120 GB NVMe Enterprise',
          'Zaawansowana Anti-DDoS',
          'Dedykowane IPv4',
          'Backup codzienny',
        ],
      },
      {
        name: 'Enterprise',
        price: '159.99 zł',
        period: '/mies.',
        features: [
          '8 vCore CPU',
          '32 GB RAM DDR5 ECC',
          '250 GB NVMe Enterprise',
          'Premium Anti-DDoS',
          'Dedykowane IPv4 + IPv6',
          'Backup codzienny + off-site',
        ],
      },
    ],
  },
  panel: {
    title: 'Potężny panel zarządzania',
    subtitle:
      'Zarządzaj swoimi serwerami z zaawansowanego panelu klienta.',
    features: [
      {
        title: 'Monitoring ataków sieciowych',
        description:
          'Monitoruj ataki w czasie rzeczywistym. Szczegółowe informacje o PPS, wolumenie danych i typie ataku.',
      },
      {
        title: 'Konfigurowalne filtry Anti-DDoS',
        description:
          'Wybierz z predefiniowanych ustawień zoptymalizowanych pod FiveM, Minecraft, CS i inne gry.',
      },
      {
        title: 'Automatyczny instalator',
        description:
          'Łatwo instaluj aplikacje: bazy danych, serwery www, serwery gier — jednym kliknięciem.',
      },
      {
        title: 'Pełne API i integracje',
        description:
          'Połącz swój item shop przez dostępne API. Integracja z popularnymi platformami.',
      },
    ],
  },
  reviews: {
    title: 'Opinie klientów',
    subtitle: 'Zobacz co mówią o nas nasi klienci.',
    items: [
      {
        name: 'Marek K.',
        role: 'Właściciel serwera FiveM',
        text: 'Przeszliśmy na SVNHost i natychmiast poczuliśmy różnicę. Szybka pomoc, kontakt i jakość serwera na najwyższym poziomie.',
      },
      {
        name: 'Anna W.',
        role: 'Administrator serwera Minecraft',
        text: 'Hosting można polecić z czystym sumieniem. Każdy problem jest rozwiązywany natychmiast przez wsparcie dostępne 24/7.',
      },
      {
        name: 'Piotr Z.',
        role: 'Developer webowy',
        text: 'Super wydajny hosting, polecam każdemu. Bardzo ładne ceny, nie drogie, szybka odpowiedź na każde pytanie.',
      },
      {
        name: 'Kasia M.',
        role: 'Streamerka',
        text: 'Bardzo profesjonalne podejście. Podczas organizacji turnieju zespół monitorował przebieg przez 4 dni. Gorąco polecam!',
      },
      {
        name: 'Tomek R.',
        role: 'Właściciel sieci serwerów',
        text: 'Współpraca z SVNHost to współpraca z doświadczonymi profesjonalistami, komunikatywnymi i gotowymi pomóc o każdej porze.',
      },
      {
        name: 'Dawid L.',
        role: 'Twórca RolePlay',
        text: 'Mogę polecić hosting z czystym sumieniem. Na pomoc można liczyć o każdej porze dnia i nocy. Nigdy nie byłem zawiedziony.',
      },
    ],
  },
  stats: {
    title: 'SVNHost w liczbach',
    subtitle: 'Liczby mówią same za siebie.',
    items: [
      { value: '2500+', label: 'Aktywnych klientów' },
      { value: '99.9%', label: 'Uptime gwarantowany' },
      { value: '10+ Tbps', label: 'Pojemność mitigacji' },
      { value: '<5 min', label: 'Czas odpowiedzi wsparcia' },
    ],
  },
  reasons: {
    title: '5 powodów by wybrać SVNHost',
    subtitle: 'Jeśli zależy Ci na wydajności i bezpieczeństwie, sprawdź naszą ofertę.',
    items: [
      {
        title: 'Chłodzenie wodne',
        description:
          'Wszystkie nasze serwery są chłodzone cieczą, zapewniając brak throttlingu termicznego.',
      },
      {
        title: 'Data Center',
        description:
          'Nasze centra danych mają pełną redundancję — nie musisz martwić się o przerwy w zasilaniu.',
      },
      {
        title: 'Zaufanie',
        description:
          'Topowe serwery korzystają z naszych usług. Tysiące graczy codziennie spędza czas na naszych serwerach.',
      },
      {
        title: 'Własny sprzęt',
        description:
          'Posiadamy własny sprzęt serwerowy, zapewniając niezawodność, szybkość i bezpieczeństwo.',
      },
      {
        title: 'Urządzenia sieciowe',
        description:
          'Nasza infrastruktura oparta jest na zaawansowanych urządzeniach Juniper Networks.',
      },
    ],
  },
  cta: {
    title: 'Gotowy na start?',
    subtitle:
      'Dołącz do tysięcy zadowolonych klientów i przenieś swój projekt na wyższy poziom.',
    btn: 'Zamów hosting',
    discord: 'Dołącz do Discord',
  },
  footer: {
    description:
      'SVNHost to marka PREMIUM oferująca serwery o wysokiej wydajności, korzystając z najlepszych rozwiązań dostępnych na rynku.',
    company: 'SVNHost',
    companyLinks: [
      { label: 'Kontakt', href: '#contact' },
      { label: 'O nas', href: '#' },
      { label: 'Baza wiedzy', href: '#' },
      { label: 'Panel', href: '#' },
    ],
    offer: 'Oferta',
    offerLinks: [
      { label: 'VPS Hosting', href: '#services' },
      { label: 'FiveM Hosting', href: '#services' },
      { label: 'Minecraft Hosting', href: '#services' },
      { label: 'Bot Discord Hosting', href: '#services' },
      { label: 'Ochrona DDoS', href: '#features' },
    ],
    contact: 'Kontakt',
    contactInfo: ['kontakt@SVNHost.pl', 'Discord: SVNHost'],
    copyright: '© 2026 SVNHost. Wszelkie prawa zastrzeżone.',
  },
};

const en: Translations = {
  nav: {
    home: 'Home',
    services: 'Services',
    pricing: 'Pricing',
    features: 'Features',
    reviews: 'Reviews',
    contact: 'Contact',
    dashboard: 'Client Panel',
  },
  hero: {
    badge: 'Premium Hosting by SVNHost',
    title1: 'Powerful ',
    titleAccent: 'Hosting',
    title2: ' for Your Project',
    subtitle:
      'VPS, FiveM, Minecraft servers and more. Top performance, DDoS protection and 24/7 support.',
    cta: 'See offer',
    dashboard: 'Dashboard',
    stat1Label: 'Clients',
    stat1Value: '2500+',
    stat2Label: 'Uptime',
    stat2Value: '99.9%',
    stat3Label: 'Support',
    stat3Value: '24/7',
  },
  features: {
    title: 'Why choose us?',
    subtitle:
      'We provide top-quality hosting services using the most modern hardware available.',
    cards: [
      {
        title: 'Strongest Components',
        description:
          'Our servers are equipped with AMD EPYC processors and NVMe Enterprise drives.',
      },
      {
        title: 'Anti-DDoS Protection',
        description:
          'Advanced DDoS protection with mitigation capacity exceeding 10 Tbps.',
      },
      {
        title: 'Data Security',
        description:
          'Daily backups transferred to external data centers ensure complete security.',
      },
      {
        title: 'Premium Support',
        description:
          'A qualified support team ready to help you at any time, 24/7/365.',
      },
    ],
  },
  services: {
    title: 'Our services',
    subtitle:
      'We offer a wide range of hosting services tailored to your needs.',
    cards: [
      {
        name: 'VPS Hosting',
        description:
          'Virtual private servers with full root access and dedicated resources.',
        features: ['Full root access', 'Dedicated resources', 'SSD NVMe', 'Anti-DDoS'],
        price: 'from 19.99 PLN',
        period: '/mo',
      },
      {
        name: 'FiveM Hosting',
        description:
          'Optimized servers for FiveM with low ping and DDoS protection.',
        features: ['FiveM optimized', 'Low ping', 'Auto-restart', 'Gaming Anti-DDoS'],
        price: 'from 39.99 PLN',
        period: '/mo',
      },
      {
        name: 'Minecraft Hosting',
        description:
          'High-performance Minecraft servers with management panel and automatic mod installation.',
        features: ['Management panel', 'Auto-install mods', 'Daily backup', 'DDoS Protection'],
        price: 'from 9.99 PLN',
        period: '/mo',
      },
      {
        name: 'Discord Bot Hosting',
        description:
          'Discord bot hosting with Node.js or Python runtime. Fully automated deployment.',
        features: ['Node.js / Python', 'discord.js / discord.py', '24/7 Auto-restart', 'Management panel'],
        price: 'from 9.99 PLN',
        period: '/mo',
      },
    ],
  },
  pricing: {
    title: 'Hosting Plans',
    subtitle:
      'Choose the plan perfectly suited for your project. All plans include DDoS protection.',
    popular: 'Most popular',
    btn: 'Order now',
    plans: [
      {
        name: 'Starter',
        price: '19.99 PLN',
        period: '/mo',
        features: [
          '2 vCore CPU',
          '4 GB RAM DDR5',
          '30 GB NVMe',
          'Anti-DDoS Protection',
          'Dedicated IPv4',
          '3-day Backup',
        ],
      },
      {
        name: 'Professional',
        price: '79.99 PLN',
        period: '/mo',
        features: [
          '4 vCore CPU',
          '16 GB RAM DDR5 ECC',
          '120 GB NVMe Enterprise',
          'Advanced Anti-DDoS',
          'Dedicated IPv4',
          'Daily Backup',
        ],
      },
      {
        name: 'Enterprise',
        price: '159.99 PLN',
        period: '/mo',
        features: [
          '8 vCore CPU',
          '32 GB RAM DDR5 ECC',
          '250 GB NVMe Enterprise',
          'Premium Anti-DDoS',
          'Dedicated IPv4 + IPv6',
          'Daily + off-site Backup',
        ],
      },
    ],
  },
  panel: {
    title: 'Powerful management panel',
    subtitle: 'Manage your servers from an advanced client panel.',
    features: [
      {
        title: 'Network Attack Monitoring',
        description:
          'Monitor attacks in real-time. Detailed information about PPS, data volume and attack type.',
      },
      {
        title: 'Configurable Anti-DDoS Filters',
        description:
          'Choose from predefined settings optimized for FiveM, Minecraft, CS and other games.',
      },
      {
        title: 'Automatic Installer',
        description:
          'Easily install applications: databases, web servers, game servers — with one click.',
      },
      {
        title: 'Full API & Integrations',
        description:
          'Connect your item shop via available API. Integration with popular platforms.',
      },
    ],
  },
  reviews: {
    title: 'Customer reviews',
    subtitle: 'See what our clients say about us.',
    items: [
      {
        name: 'Mark K.',
        role: 'FiveM Server Owner',
        text: 'We switched to SVNHost and immediately felt the difference. Quick help, contact and server quality at the highest level.',
      },
      {
        name: 'Anna W.',
        role: 'Minecraft Server Admin',
        text: 'Hosting can be recommended with a clear conscience. Every problem is solved immediately by support available 24/7.',
      },
      {
        name: 'Peter Z.',
        role: 'Web Developer',
        text: 'Super powerful hosting, I recommend it to everyone. Very nice prices, not expensive, quick response to every question.',
      },
      {
        name: 'Kate M.',
        role: 'Streamer',
        text: 'Very professional approach. During the tournament organization, the team monitored it for 4 days. Highly recommend!',
      },
      {
        name: 'Tom R.',
        role: 'Server Network Owner',
        text: 'Working with SVNHost means working with experienced professionals, communicative and ready to help at any time.',
      },
      {
        name: 'David L.',
        role: 'RolePlay Creator',
        text: 'I can recommend the hosting with a clear conscience. You can count on help at any time of day or night. Never disappointed.',
      },
    ],
  },
  stats: {
    title: 'SVNHost in numbers',
    subtitle: 'The numbers speak for themselves.',
    items: [
      { value: '2500+', label: 'Active clients' },
      { value: '99.9%', label: 'Guaranteed uptime' },
      { value: '10+ Tbps', label: 'Mitigation capacity' },
      { value: '<5 min', label: 'Support response time' },
    ],
  },
  reasons: {
    title: '5 reasons to choose SVNHost',
    subtitle: 'If you care about performance and security, check our offer.',
    items: [
      {
        title: 'Water Cooling',
        description:
          'All our servers are liquid cooled, ensuring no thermal throttling.',
      },
      {
        title: 'Data Center',
        description:
          'Our data centers have full redundancy — no worries about power or network outages.',
      },
      {
        title: 'Trust',
        description:
          'Top servers use our services. Thousands of players spend time on our servers every day.',
      },
      {
        title: 'Own Hardware',
        description:
          'We own our server hardware, providing reliability, speed and security.',
      },
      {
        title: 'Network Devices',
        description:
          'Our infrastructure is based on advanced Juniper Networks devices.',
      },
    ],
  },
  cta: {
    title: 'Ready to start?',
    subtitle:
      'Join thousands of satisfied clients and take your project to the next level.',
    btn: 'Order hosting',
    discord: 'Join Discord',
  },
  footer: {
    description:
      'SVNHost is a PREMIUM brand offering high-performance servers, using the best solutions available on the market.',
    company: 'SVNHost',
    companyLinks: [
      { label: 'Contact', href: '#contact' },
      { label: 'About us', href: '#' },
      { label: 'Knowledge base', href: '#' },
      { label: 'Dashboard', href: '#' },
    ],
    offer: 'Offer',
    offerLinks: [
      { label: 'VPS Hosting', href: '#services' },
      { label: 'FiveM Hosting', href: '#services' },
      { label: 'Minecraft Hosting', href: '#services' },
      { label: 'Discord Bot Hosting', href: '#services' },
      { label: 'DDoS Protection', href: '#features' },
    ],
    contact: 'Contact',
    contactInfo: ['contact@SVNHost.com', 'Discord: SVNHost'],
    copyright: '© 2026 SVNHost. All rights reserved.',
  },
};

const de: Translations = {
  nav: {
    home: 'Startseite',
    services: 'Dienste',
    pricing: 'Preise',
    features: 'Funktionen',
    reviews: 'Bewertungen',
    contact: 'Kontakt',
    dashboard: 'Kundenbereich',
  },
  hero: {
    badge: 'Premium Hosting von SVNHost',
    title1: 'Leistungsstarkes ',
    titleAccent: 'Hosting',
    title2: ' für Ihr Projekt',
    subtitle:
      'VPS, FiveM, Minecraft Server und mehr. Höchste Leistung, DDoS-Schutz und 24/7 Support.',
    cta: 'Angebot ansehen',
    dashboard: 'Dashboard',
    stat1Label: 'Kunden',
    stat1Value: '2500+',
    stat2Label: 'Uptime',
    stat2Value: '99.9%',
    stat3Label: 'Support',
    stat3Value: '24/7',
  },
  features: {
    title: 'Warum wir?',
    subtitle:
      'Wir bieten Hosting-Dienste höchster Qualität mit modernster Hardware.',
    cards: [
      {
        title: 'Leistungsstärkste Komponenten',
        description:
          'Unsere Server sind mit AMD EPYC Prozessoren und NVMe Enterprise Laufwerken ausgestattet.',
      },
      {
        title: 'Anti-DDoS Schutz',
        description:
          'Fortschrittlicher DDoS-Schutz mit einer Mitigationskapazität von über 10 Tbps.',
      },
      {
        title: 'Datensicherheit',
        description:
          'Tägliche Backups werden in externe Rechenzentren übertragen für vollständige Sicherheit.',
      },
      {
        title: 'Premium Support',
        description:
          'Ein qualifiziertes Support-Team, bereit Ihnen jederzeit zu helfen, 24/7/365.',
      },
    ],
  },
  services: {
    title: 'Unsere Dienste',
    subtitle:
      'Wir bieten ein breites Spektrum an Hosting-Diensten, angepasst an Ihre Bedürfnisse.',
    cards: [
      {
        name: 'VPS Hosting',
        description:
          'Virtuelle private Server mit vollem Root-Zugriff und dedizierten Ressourcen.',
        features: ['Voller Root-Zugriff', 'Dedizierte Ressourcen', 'SSD NVMe', 'Anti-DDoS'],
        price: 'ab 19.99 PLN',
        period: '/Mo.',
      },
      {
        name: 'FiveM Hosting',
        description:
          'Optimierte Server für FiveM mit niedrigem Ping und DDoS-Schutz.',
        features: ['FiveM optimiert', 'Niedriger Ping', 'Auto-Neustart', 'Gaming Anti-DDoS'],
        price: 'ab 39.99 PLN',
        period: '/Mo.',
      },
      {
        name: 'Minecraft Hosting',
        description:
          'Leistungsstarke Minecraft-Server mit Verwaltungspanel und automatischer Mod-Installation.',
        features: ['Verwaltungspanel', 'Auto-Install Mods', 'Tägliches Backup', 'DDoS-Schutz'],
        price: 'ab 9.99 PLN',
        period: '/Mo.',
      },
      {
        name: 'Discord Bot Hosting',
        description:
          'Discord-Bot-Hosting mit Node.js oder Python. Vollautomatische Bereitstellung.',
        features: ['Node.js / Python', 'discord.js / discord.py', '24/7 Auto-Neustart', 'Verwaltungspanel'],
        price: 'ab 9.99 PLN',
        period: '/Mo.',
      },
    ],
  },
  pricing: {
    title: 'Hosting-Pakete',
    subtitle:
      'Wählen Sie das perfekte Paket für Ihr Projekt. Alle Pakete beinhalten DDoS-Schutz.',
    popular: 'Beliebteste',
    btn: 'Jetzt bestellen',
    plans: [
      {
        name: 'Starter',
        price: '19.99 PLN',
        period: '/Mo.',
        features: [
          '2 vCore CPU',
          '4 GB RAM DDR5',
          '30 GB NVMe',
          'Anti-DDoS Schutz',
          'Dedizierte IPv4',
          '3-Tage Backup',
        ],
      },
      {
        name: 'Professional',
        price: '79.99 PLN',
        period: '/Mo.',
        features: [
          '4 vCore CPU',
          '16 GB RAM DDR5 ECC',
          '120 GB NVMe Enterprise',
          'Erweiterter Anti-DDoS',
          'Dedizierte IPv4',
          'Tägliches Backup',
        ],
      },
      {
        name: 'Enterprise',
        price: '159.99 PLN',
        period: '/Mo.',
        features: [
          '8 vCore CPU',
          '32 GB RAM DDR5 ECC',
          '250 GB NVMe Enterprise',
          'Premium Anti-DDoS',
          'Dedizierte IPv4 + IPv6',
          'Tägliches + Off-Site Backup',
        ],
      },
    ],
  },
  panel: {
    title: 'Leistungsstarkes Verwaltungspanel',
    subtitle: 'Verwalten Sie Ihre Server über ein fortschrittliches Kundenpanel.',
    features: [
      {
        title: 'Netzwerkangriff-Überwachung',
        description:
          'Überwachen Sie Angriffe in Echtzeit. Detaillierte Informationen über PPS, Datenvolumen und Angriffstyp.',
      },
      {
        title: 'Konfigurierbare Anti-DDoS Filter',
        description:
          'Wählen Sie aus vordefinierten Einstellungen, optimiert für FiveM, Minecraft, CS und andere Spiele.',
      },
      {
        title: 'Automatischer Installer',
        description:
          'Installieren Sie einfach Anwendungen: Datenbanken, Webserver, Gameserver — mit einem Klick.',
      },
      {
        title: 'Vollständige API & Integrationen',
        description:
          'Verbinden Sie Ihren Item-Shop über die verfügbare API. Integration mit beliebten Plattformen.',
      },
    ],
  },
  reviews: {
    title: 'Kundenbewertungen',
    subtitle: 'Sehen Sie, was unsere Kunden über uns sagen.',
    items: [
      {
        name: 'Mark K.',
        role: 'FiveM Server-Besitzer',
        text: 'Wir sind zu SVNHost gewechselt und haben sofort den Unterschied gespürt. Schnelle Hilfe, Kontakt und Serverqualität auf höchstem Niveau.',
      },
      {
        name: 'Anna W.',
        role: 'Minecraft Server-Admin',
        text: 'Das Hosting kann man mit gutem Gewissen empfehlen. Jedes Problem wird sofort vom 24/7 Support gelöst.',
      },
      {
        name: 'Peter Z.',
        role: 'Webentwickler',
        text: 'Super leistungsstarkes Hosting, ich empfehle es jedem. Sehr faire Preise, schnelle Antwort auf jede Frage.',
      },
      {
        name: 'Kate M.',
        role: 'Streamerin',
        text: 'Sehr professioneller Ansatz. Während der Turnierorganisation überwachte das Team 4 Tage lang. Sehr empfehlenswert!',
      },
      {
        name: 'Tom R.',
        role: 'Server-Netzwerk Besitzer',
        text: 'Die Zusammenarbeit mit SVNHost bedeutet Zusammenarbeit mit erfahrenen Profis, kommunikativ und jederzeit hilfsbereit.',
      },
      {
        name: 'David L.',
        role: 'RolePlay Creator',
        text: 'Ich kann das Hosting mit gutem Gewissen empfehlen. Man kann jederzeit auf Hilfe zählen. Nie enttäuscht.',
      },
    ],
  },
  stats: {
    title: 'SVNHost in Zahlen',
    subtitle: 'Die Zahlen sprechen für sich.',
    items: [
      { value: '2500+', label: 'Aktive Kunden' },
      { value: '99.9%', label: 'Garantierte Uptime' },
      { value: '10+ Tbps', label: 'Mitigationskapazität' },
      { value: '<5 Min', label: 'Support-Antwortzeit' },
    ],
  },
  reasons: {
    title: '5 Gründe für SVNHost',
    subtitle: 'Wenn Ihnen Leistung und Sicherheit wichtig sind, schauen Sie sich unser Angebot an.',
    items: [
      {
        title: 'Wasserkühlung',
        description:
          'Alle unsere Server werden flüssigkeitsgekühlt, ohne thermisches Throttling.',
      },
      {
        title: 'Rechenzentrum',
        description:
          'Unsere Rechenzentren haben volle Redundanz — keine Sorgen über Strom- oder Netzwerkausfälle.',
      },
      {
        title: 'Vertrauen',
        description:
          'Top-Server nutzen unsere Dienste. Tausende Spieler verbringen täglich Zeit auf unseren Servern.',
      },
      {
        title: 'Eigene Hardware',
        description:
          'Wir besitzen unsere eigene Server-Hardware für Zuverlässigkeit, Geschwindigkeit und Sicherheit.',
      },
      {
        title: 'Netzwerkgeräte',
        description:
          'Unsere Infrastruktur basiert auf fortschrittlichen Juniper Networks Geräten.',
      },
    ],
  },
  cta: {
    title: 'Bereit zum Start?',
    subtitle:
      'Schließen Sie sich Tausenden zufriedener Kunden an und bringen Sie Ihr Projekt auf das nächste Level.',
    btn: 'Hosting bestellen',
    discord: 'Discord beitreten',
  },
  footer: {
    description:
      'SVNHost ist eine PREMIUM-Marke, die leistungsstarke Server mit den besten verfügbaren Lösungen anbietet.',
    company: 'SVNHost',
    companyLinks: [
      { label: 'Kontakt', href: '#contact' },
      { label: 'Über uns', href: '#' },
      { label: 'Wissensdatenbank', href: '#' },
      { label: 'Dashboard', href: '#' },
    ],
    offer: 'Angebot',
    offerLinks: [
      { label: 'VPS Hosting', href: '#services' },
      { label: 'FiveM Hosting', href: '#services' },
      { label: 'Minecraft Hosting', href: '#services' },
      { label: 'Discord Bot Hosting', href: '#services' },
      { label: 'DDoS-Schutz', href: '#features' },
    ],
    contact: 'Kontakt',
    contactInfo: ['kontakt@SVNHost.de', 'Discord: SVNHost'],
    copyright: '© 2026 SVNHost. Alle Rechte vorbehalten.',
  },
};

const uk: Translations = {
  nav: {
    home: 'Головна',
    services: 'Послуги',
    pricing: 'Ціни',
    features: 'Функції',
    reviews: 'Відгуки',
    contact: 'Контакт',
    dashboard: 'Панель клієнта',
  },
  hero: {
    badge: 'Преміум Хостинг від SVNHost',
    title1: 'Потужний ',
    titleAccent: 'Хостинг',
    title2: ' для Вашого Проєкту',
    subtitle:
      'VPS, FiveM, Minecraft сервери та більше. Найвища продуктивність, захист від DDoS та підтримка 24/7.',
    cta: 'Переглянути пропозицію',
    dashboard: 'Панель',
    stat1Label: 'Клієнтів',
    stat1Value: '2500+',
    stat2Label: 'Uptime',
    stat2Value: '99.9%',
    stat3Label: 'Підтримка',
    stat3Value: '24/7',
  },
  features: {
    title: 'Чому ми?',
    subtitle:
      'Ми забезпечуємо найвищу якість хостингових послуг з найсучаснішим обладнанням.',
    cards: [
      {
        title: 'Найпотужніші компоненти',
        description:
          'Наші сервери обладнані процесорами AMD EPYC та дисками NVMe Enterprise.',
      },
      {
        title: 'Захист Anti-DDoS',
        description:
          'Розширений захист від DDoS-атак з ємністю мітигації понад 10 Тбіт/с.',
      },
      {
        title: 'Безпека даних',
        description:
          'Щоденні бекапи переносяться до зовнішніх дата-центрів для повної безпеки.',
      },
      {
        title: 'Преміум підтримка',
        description:
          'Кваліфікована команда підтримки готова допомогти вам у будь-який час, 24/7/365.',
      },
    ],
  },
  services: {
    title: 'Наші послуги',
    subtitle:
      'Ми пропонуємо широкий спектр хостингових послуг, адаптованих до ваших потреб.',
    cards: [
      {
        name: 'VPS Хостинг',
        description:
          'Віртуальні приватні сервери з повним root-доступом та виділеними ресурсами.',
        features: ['Повний root доступ', 'Виділені ресурси', 'SSD NVMe', 'Anti-DDoS'],
        price: 'від 19.99 PLN',
        period: '/міс.',
      },
      {
        name: 'FiveM Хостинг',
        description:
          'Оптимізовані сервери для FiveM з низьким пінгом та захистом DDoS.',
        features: ['FiveM оптимізація', 'Низький пінг', 'Авто-рестарт', 'Gaming Anti-DDoS'],
        price: 'від 39.99 PLN',
        period: '/міс.',
      },
      {
        name: 'Minecraft Хостинг',
        description:
          'Потужні сервери Minecraft з панеллю управління та автоматичною установкою модів.',
        features: ['Панель управління', 'Авто-install модів', 'Щоденний бекап', 'Захист DDoS'],
        price: 'від 9.99 PLN',
        period: '/міс.',
      },
      {
        name: 'Discord Bot Хостинг',
        description:
          'Хостинг Discord-ботів з Node.js або Python. Повна автоматизація розгортання.',
        features: ['Node.js / Python', 'discord.js / discord.py', 'Авто-рестарт 24/7', 'Панель управління'],
        price: 'від 9.99 PLN',
        period: '/міс.',
      },
    ],
  },
  pricing: {
    title: 'Тарифні плани',
    subtitle:
      'Виберіть план, ідеально підходящий для вашого проєкту. Всі плани включають захист DDoS.',
    popular: 'Найпопулярніший',
    btn: 'Замовити зараз',
    plans: [
      {
        name: 'Starter',
        price: '19.99 PLN',
        period: '/міс.',
        features: [
          '2 vCore CPU',
          '4 GB RAM DDR5',
          '30 GB NVMe',
          'Anti-DDoS Захист',
          'Виділений IPv4',
          'Бекап 3 дні',
        ],
      },
      {
        name: 'Professional',
        price: '79.99 PLN',
        period: '/міс.',
        features: [
          '4 vCore CPU',
          '16 GB RAM DDR5 ECC',
          '120 GB NVMe Enterprise',
          'Розширений Anti-DDoS',
          'Виділений IPv4',
          'Щоденний бекап',
        ],
      },
      {
        name: 'Enterprise',
        price: '159.99 PLN',
        period: '/міс.',
        features: [
          '8 vCore CPU',
          '32 GB RAM DDR5 ECC',
          '250 GB NVMe Enterprise',
          'Преміум Anti-DDoS',
          'Виділений IPv4 + IPv6',
          'Щоденний + зовнішній бекап',
        ],
      },
    ],
  },
  panel: {
    title: 'Потужна панель управління',
    subtitle: 'Керуйте своїми серверами через розширену клієнтську панель.',
    features: [
      {
        title: 'Моніторинг мережевих атак',
        description:
          'Моніторте атаки в реальному часі. Детальна інформація про PPS, обсяг даних та тип атаки.',
      },
      {
        title: 'Налаштовувані фільтри Anti-DDoS',
        description:
          'Обирайте з попередньо налаштованих параметрів, оптимізованих для FiveM, Minecraft, CS та інших ігор.',
      },
      {
        title: 'Автоматичний інсталятор',
        description:
          'Легко встановлюйте додатки: бази даних, веб-сервери, ігрові сервери — одним кліком.',
      },
      {
        title: 'Повне API та інтеграції',
        description:
          'Підключіть свій магазин через доступне API. Інтеграція з популярними платформами.',
      },
    ],
  },
  reviews: {
    title: 'Відгуки клієнтів',
    subtitle: 'Подивіться, що говорять про нас наші клієнти.',
    items: [
      {
        name: 'Марк К.',
        role: 'Власник сервера FiveM',
        text: 'Ми перейшли на SVNHost і відразу відчули різницю. Швидка допомога, контакт і якість сервера на найвищому рівні.',
      },
      {
        name: 'Анна В.',
        role: 'Адміністратор Minecraft',
        text: 'Хостинг можна рекомендувати з чистою совістю. Кожна проблема вирішується негайно підтримкою 24/7.',
      },
      {
        name: 'Петро З.',
        role: 'Веб-розробник',
        text: 'Супер потужний хостинг, рекомендую кожному. Дуже гарні ціни, швидка відповідь на кожне питання.',
      },
      {
        name: 'Катя М.',
        role: 'Стрімерка',
        text: 'Дуже професійний підхід. Під час організації турніру команда моніторила протягом 4 днів. Гаряче рекомендую!',
      },
      {
        name: 'Том Р.',
        role: 'Власник мережі серверів',
        text: 'Співпраця з SVNHost — це співпраця з досвідченими професіоналами, комунікативними та готовими допомогти.',
      },
      {
        name: 'Давид Л.',
        role: 'Творець RolePlay',
        text: 'Можу рекомендувати хостинг з чистою совістю. На допомогу можна розраховувати в будь-який час. Ніколи не був розчарований.',
      },
    ],
  },
  stats: {
    title: 'SVNHost у цифрах',
    subtitle: 'Цифри говорять самі за себе.',
    items: [
      { value: '2500+', label: 'Активних клієнтів' },
      { value: '99.9%', label: 'Гарантований uptime' },
      { value: '10+ Тбіт/с', label: 'Ємність мітигації' },
      { value: '<5 хв', label: 'Час відповіді підтримки' },
    ],
  },
  reasons: {
    title: '5 причин обрати SVNHost',
    subtitle: 'Якщо вам важлива продуктивність та безпека, перегляньте нашу пропозицію.',
    items: [
      {
        title: 'Водяне охолодження',
        description:
          'Всі наші сервери охолоджуються рідиною, забезпечуючи відсутність теплового тротлінгу.',
      },
      {
        title: 'Дата-центр',
        description:
          'Наші дата-центри мають повну резервність — не хвилюйтеся про перебої.',
      },
      {
        title: 'Довіра',
        description:
          'Топові сервери використовують наші послуги. Тисячі гравців проводять час на наших серверах.',
      },
      {
        title: 'Власне обладнання',
        description:
          'Ми володіємо власним серверним обладнанням для надійності, швидкості та безпеки.',
      },
      {
        title: 'Мережеві пристрої',
        description:
          'Наша інфраструктура базується на передових пристроях Juniper Networks.',
      },
    ],
  },
  cta: {
    title: 'Готові почати?',
    subtitle:
      'Приєднуйтеся до тисяч задоволених клієнтів і перенесіть свій проєкт на новий рівень.',
    btn: 'Замовити хостинг',
    discord: 'Приєднатися до Discord',
  },
  footer: {
    description:
      'SVNHost — це ПРЕМІУМ бренд, що пропонує високопродуктивні сервери з найкращими рішеннями на ринку.',
    company: 'SVNHost',
    companyLinks: [
      { label: 'Контакт', href: '#contact' },
      { label: 'Про нас', href: '#' },
      { label: 'База знань', href: '#' },
      { label: 'Панель', href: '#' },
    ],
    offer: 'Пропозиція',
    offerLinks: [
      { label: 'VPS Хостинг', href: '#services' },
      { label: 'FiveM Хостинг', href: '#services' },
      { label: 'Minecraft Хостинг', href: '#services' },
      { label: 'Discord Bot Хостинг', href: '#services' },
      { label: 'Захист DDoS', href: '#features' },
    ],
    contact: 'Контакт',
    contactInfo: ['contact@SVNHost.com', 'Discord: SVNHost'],
    copyright: '© 2026 SVNHost. Всі права захищені.',
  },
};

export const translations: Record<Language, Translations> = { pl, en, de, uk };

export const languageNames: Record<Language, string> = {
  pl: 'Polski',
  en: 'English',
  de: 'Deutsch',
  uk: 'Українська',
};

export const languageFlags: Record<Language, string> = {
  pl: '🇵🇱',
  en: '🇬🇧',
  de: '🇩🇪',
  uk: '🇺🇦',
};

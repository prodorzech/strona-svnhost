import React from 'react';

interface IconProps {
  size?: number;
}

export const UbuntuIcon: React.FC<IconProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="128" cy="128" r="128" fill="#E95420"/>
    <circle cx="128" cy="128" r="46" stroke="white" strokeWidth="14" fill="none"/>
    <circle cx="128" cy="68" r="18" fill="white"/>
    <circle cx="76" cy="158" r="18" fill="white"/>
    <circle cx="180" cy="158" r="18" fill="white"/>
    <line x1="128" y1="86" x2="128" y2="82" stroke="white" strokeWidth="8" strokeLinecap="round"/>
    <line x1="94" y1="148" x2="90" y2="144" stroke="white" strokeWidth="8" strokeLinecap="round"/>
    <line x1="162" y1="148" x2="166" y2="144" stroke="white" strokeWidth="8" strokeLinecap="round"/>
  </svg>
);

export const DebianIcon: React.FC<IconProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="128" cy="128" r="128" fill="#A80030"/>
    <path d="M148 68c-8-3-16 0-12 4 3 3 9 2 12 0 4-2 5-3 0-4zm16 8c-5-4-12-5-8 1 3 4 9 5 12 3 2-2 0-3-4-4zm-48-6c-2 0-5 2-4 4 2 2 8 2 10-1 2-2-3-4-6-3zm72 30c1-14-5-22-10-26 6 7 8 16 6 26-4 24-28 44-52 38-26-6-40-33-34-56 3-10 10-18 16-22-8 2-18 12-22 24-6 20 4 46 32 54 25 8 54-6 62-30 1-2 2-5 2-8zm-50-32c-4-2-10-1-8 3 1 3 6 4 9 2 3-1 3-3-1-5zm-8 130c-34-8-58-34-60-64 0 6-1 13 0 18 4 30 32 56 62 60 32 4 58-12 66-38-10 20-34 32-68 24z" fill="white"/>
  </svg>
);

export const CentOSIcon: React.FC<IconProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="256" height="256" rx="128" fill="#262577"/>
    <path d="M128 40L216 128L128 216L40 128Z" fill="none" stroke="white" strokeWidth="4"/>
    <path d="M128 40L216 128H128V40Z" fill="#9CCD2A"/>
    <path d="M216 128L128 216V128H216Z" fill="#CF7C0E"/>
    <path d="M128 216L40 128H128V216Z" fill="#932279"/>
    <path d="M40 128L128 40V128H40Z" fill="#262577"/>
    <rect x="100" y="100" width="56" height="56" fill="white" stroke="white" strokeWidth="2"/>
    <path d="M128 100V40" stroke="white" strokeWidth="6"/>
    <path d="M156 128H216" stroke="white" strokeWidth="6"/>
    <path d="M128 156V216" stroke="white" strokeWidth="6"/>
    <path d="M100 128H40" stroke="white" strokeWidth="6"/>
    <rect x="108" y="108" width="40" height="40" fill="none"/>
    <path d="M128 108V128H148" fill="#9CCD2A"/>
    <path d="M148 128H128V148" fill="#CF7C0E"/>
    <path d="M128 148V128H108" fill="#932279"/>
    <path d="M108 128H128V108" fill="#262577"/>
  </svg>
);

export const AlmaLinuxIcon: React.FC<IconProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="128" cy="128" r="128" fill="#072B52"/>
    <path d="M128 60L148 108H172L152 128L172 148H148L128 196L108 148H84L104 128L84 108H108Z" fill="#EF4B42"/>
    <circle cx="128" cy="128" r="22" fill="white"/>
    <circle cx="128" cy="68" r="10" fill="#F6C141"/>
    <circle cx="188" cy="128" r="10" fill="#3CAFCE"/>
    <circle cx="128" cy="188" r="10" fill="#EF4B42"/>
    <circle cx="68" cy="128" r="10" fill="#6DAA3A"/>
  </svg>
);

export const RockyLinuxIcon: React.FC<IconProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="128" cy="128" r="128" fill="#10B981"/>
    <path d="M80 180L128 80L176 180H80Z" fill="white" opacity="0.9"/>
    <path d="M96 180L128 108L160 180H96Z" fill="#10B981"/>
    <path d="M108 180L128 135L148 180H108Z" fill="white" opacity="0.7"/>
  </svg>
);

export const FedoraIcon: React.FC<IconProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="128" cy="128" r="128" fill="#294172"/>
    <path d="M128 60C92 60 62 90 62 126v28c0 8 6 14 14 14h28c8 0 14-6 14-14v-28c0-8 6-14 14-14h28c8 0 14-6 14-14V60h-46z" fill="white"/>
    <path d="M164 88h-28c-22 0-38 16-38 38v28c0 2-2 4-4 4H76c-2 0-4-2-4-4v-28c0-32 26-58 58-58h38v16c0 2-2 4-4 4z" fill="#3C6EB4"/>
    <circle cx="140" cy="146" r="26" stroke="white" strokeWidth="12" fill="none"/>
  </svg>
);

export const WindowsIcon: React.FC<IconProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="128" cy="128" r="128" fill="#0078D4"/>
    <path d="M56 76l60-8v58H56V76z" fill="white"/>
    <path d="M56 134h60v58l-60-8V134z" fill="white"/>
    <path d="M124 66l76-10v78H124V66z" fill="white"/>
    <path d="M124 142h76v78l-76-10V142z" fill="white"/>
  </svg>
);

export type OsName = 
  | 'Ubuntu 22.04 LTS'
  | 'Ubuntu 20.04 LTS'
  | 'Debian 12'
  | 'Debian 11'
  | 'CentOS 9'
  | 'AlmaLinux 9'
  | 'Rocky Linux 9'
  | 'Fedora 39'
  | 'Windows Server 2022';

const osIconMap: Record<string, React.FC<IconProps>> = {
  'Ubuntu': UbuntuIcon,
  'Debian': DebianIcon,
  'CentOS': CentOSIcon,
  'AlmaLinux': AlmaLinuxIcon,
  'Rocky': RockyLinuxIcon,
  'Fedora': FedoraIcon,
  'Windows': WindowsIcon,
};

export function getOsIcon(osName: string, size?: number): React.ReactNode {
  const key = Object.keys(osIconMap).find(k => osName.startsWith(k));
  if (key) {
    const IconComponent = osIconMap[key];
    return <IconComponent size={size} />;
  }
  return null;
}

export const osOptions = [
  { name: 'Ubuntu 22.04 LTS' as OsName, icon: UbuntuIcon },
  { name: 'Ubuntu 20.04 LTS' as OsName, icon: UbuntuIcon },
  { name: 'Debian 12' as OsName, icon: DebianIcon },
  { name: 'Debian 11' as OsName, icon: DebianIcon },
  { name: 'CentOS 9' as OsName, icon: CentOSIcon },
  { name: 'AlmaLinux 9' as OsName, icon: AlmaLinuxIcon },
  { name: 'Rocky Linux 9' as OsName, icon: RockyLinuxIcon },
  { name: 'Fedora 39' as OsName, icon: FedoraIcon },
  { name: 'Windows Server 2022' as OsName, icon: WindowsIcon },
];

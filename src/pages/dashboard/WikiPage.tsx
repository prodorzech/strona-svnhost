import { useState } from 'react';
import {
  Book, Search, Server, Gamepad2, Terminal, Shield, Database, Globe,
  HardDrive, Cpu, Network, FileCode, ChevronRight, ChevronDown, ArrowLeft,
  Copy, Check, MonitorSmartphone, Rocket, Settings, Users, Zap, Lock,
  Download, Wrench, RefreshCw, AlertTriangle, Package, Layers,
} from 'lucide-react';
import './WikiPage.css';

interface WikiArticle {
  id: string;
  title: string;
  icon: React.ReactNode;
  category: string;
  tags: string[];
  content: React.ReactNode;
}

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="wiki__code-block">
      {lang && <span className="wiki__code-lang">{lang}</span>}
      <button className="wiki__code-copy" onClick={handleCopy}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Skopiowano' : 'Kopiuj'}
      </button>
      <pre><code>{code}</code></pre>
    </div>
  );
}

function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div className="wiki__step">
      <div className="wiki__step-num">{num}</div>
      <div className="wiki__step-content">
        <h4 className="wiki__step-title">{title}</h4>
        <div className="wiki__step-body">{children}</div>
      </div>
    </div>
  );
}

function InfoBox({ type = 'info', children }: { type?: 'info' | 'warning' | 'tip' | 'danger'; children: React.ReactNode }) {
  const icons = { info: <Zap size={16} />, warning: <AlertTriangle size={16} />, tip: <Rocket size={16} />, danger: <Shield size={16} /> };
  const labels = { info: 'Informacja', warning: 'Uwaga', tip: 'Porada', danger: 'Ważne' };
  return (
    <div className={`wiki__info-box wiki__info-box--${type}`}>
      <div className="wiki__info-box-header">{icons[type]} {labels[type]}</div>
      <div className="wiki__info-box-body">{children}</div>
    </div>
  );
}

const CATEGORIES = [
  { id: 'start', label: 'Rozpoczęcie', icon: <Rocket size={16} /> },
  { id: 'vps', label: 'VPS / Linux', icon: <Server size={16} /> },
  { id: 'fivem', label: 'FiveM', icon: <Gamepad2 size={16} /> },
  { id: 'minecraft', label: 'Minecraft', icon: <Layers size={16} /> },
  { id: 'www', label: 'Strony WWW', icon: <Globe size={16} /> },
  { id: 'bazy', label: 'Bazy danych', icon: <Database size={16} /> },
  { id: 'bezp', label: 'Bezpieczeństwo', icon: <Lock size={16} /> },
  { id: 'faq', label: 'FAQ', icon: <Book size={16} /> },
];

const ARTICLES: WikiArticle[] = [
  // ========== ROZPOCZĘCIE ==========
  {
    id: 'first-steps',
    title: 'Pierwsze kroki po zakupie serwera',
    icon: <Rocket size={18} />,
    category: 'start',
    tags: ['start', 'panel', 'podstawy'],
    content: (
      <>
        <p>Gratulacje! Właśnie kupiłeś swój pierwszy serwer na SVNHost. Oto co powinieneś zrobić w pierwszej kolejności.</p>
        <Step num={1} title="Zaloguj się do panelu">
          <p>Przejdź do <strong>Dashboard → Serwery</strong> — znajdziesz tam swój nowy serwer. Kliknij na niego, żeby wejść w szczegóły.</p>
        </Step>
        <Step num={2} title="Sprawdź dane dostępowe">
          <p>W zakładce serwera znajdziesz:</p>
          <ul>
            <li><strong>Adres IP</strong> — główny adres Twojego serwera</li>
            <li><strong>Port</strong> — port SSH lub gry (zależnie od typu)</li>
            <li><strong>Hasło root</strong> — domyślne hasło (zmień je od razu!)</li>
          </ul>
        </Step>
        <Step num={3} title="Połącz się z serwerem">
          <p>Użyj klienta SSH (np. PuTTY na Windows lub terminal na Mac/Linux):</p>
          <CodeBlock lang="bash" code={`ssh root@TWOJ_IP -p PORT`} />
        </Step>
        <Step num={4} title="Zmień domyślne hasło">
          <CodeBlock lang="bash" code={`passwd`} />
          <p>Ustaw silne hasło — minimum 12 znaków, duże i małe litery, cyfry i znaki specjalne.</p>
        </Step>
        <InfoBox type="tip">
          Zalecamy od razu skonfigurować klucze SSH zamiast hasła — to znacznie bezpieczniejsze. Sprawdź artykuł <strong>"Konfiguracja kluczy SSH"</strong> w sekcji Bezpieczeństwo.
        </InfoBox>
      </>
    ),
  },
  {
    id: 'panel-overview',
    title: 'Jak korzystać z panelu SVNHost',
    icon: <MonitorSmartphone size={18} />,
    category: 'start',
    tags: ['panel', 'dashboard', 'nawigacja'],
    content: (
      <>
        <p>Panel SVNHost to Twoje centralne miejsce do zarządzania serwerami, portfelem i ustawieniami konta.</p>
        <h3>Główne sekcje panelu</h3>
        <ul>
          <li><strong>Dashboard</strong> — przegląd konta, statystyki serwerów, ostatnie transakcje</li>
          <li><strong>Serwery</strong> — lista Twoich serwerów, start/stop/restart, konsola, pliki</li>
          <li><strong>Portfel</strong> — saldo, doładowania, historia transakcji</li>
          <li><strong>Sklep</strong> — konfiguracja i zakup nowych serwerów</li>
          <li><strong>Tickety</strong> — kontakt z supportem</li>
          <li><strong>Ustawienia</strong> — profil, bezpieczeństwo, sesje, wygląd</li>
          <li><strong>Wiki</strong> — właśnie tu jesteś! Baza wiedzy.</li>
        </ul>
        <InfoBox type="info">
          Każdy serwer ma własną podstronę ze szczegółami, konsolą, menadżerem plików i backupami.
        </InfoBox>
      </>
    ),
  },
  // ========== VPS / LINUX ==========
  {
    id: 'vps-ubuntu-setup',
    title: 'Podstawowa konfiguracja Ubuntu / Debian',
    icon: <Terminal size={18} />,
    category: 'vps',
    tags: ['ubuntu', 'debian', 'linux', 'konfiguracja'],
    content: (
      <>
        <p>Po pierwszym połączeniu z serwerem VPS z systemem Ubuntu/Debian wykonaj te kroki:</p>
        <Step num={1} title="Aktualizuj system">
          <CodeBlock lang="bash" code={`apt update && apt upgrade -y`} />
          <p>To zaktualizuje wszystkie pakiety do najnowszych wersji.</p>
        </Step>
        <Step num={2} title="Utwórz nowego użytkownika (zamiast root)">
          <CodeBlock lang="bash" code={`adduser mojuser\nusermod -aG sudo mojuser`} />
          <p>Praca na koncie root jest niebezpieczna — zawsze twórz osobnego użytkownika z sudo.</p>
        </Step>
        <Step num={3} title="Skonfiguruj firewall (UFW)">
          <CodeBlock lang="bash" code={`apt install ufw -y\nufw allow OpenSSH\nufw enable\nufw status`} />
        </Step>
        <Step num={4} title="Zainstaluj podstawowe narzędzia">
          <CodeBlock lang="bash" code={`apt install -y curl wget git htop nano unzip software-properties-common`} />
        </Step>
        <Step num={5} title="Zmień port SSH (opcjonalne, ale zalecane)">
          <CodeBlock lang="bash" code={`nano /etc/ssh/sshd_config\n# Znajdź linię "Port 22" i zmień na np. Port 2222\n# Potem:\nufw allow 2222\nsystemctl restart sshd`} />
          <InfoBox type="warning">
            Pamiętaj o otwarciu nowego portu w firewallu ZANIM restartujesz SSH, inaczej stracisz dostęp!
          </InfoBox>
        </Step>
      </>
    ),
  },
  {
    id: 'vps-docker',
    title: 'Instalacja Docker na VPS',
    icon: <Package size={18} />,
    category: 'vps',
    tags: ['docker', 'kontener', 'instalacja'],
    content: (
      <>
        <p>Docker pozwala uruchamiać aplikacje w izolowanych kontenerach. Oto jak go zainstalować:</p>
        <Step num={1} title="Dodaj repozytorium Docker">
          <CodeBlock lang="bash" code={`apt update\napt install -y ca-certificates curl gnupg\ninstall -m 0755 -d /etc/apt/keyrings\ncurl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg\nchmod a+r /etc/apt/keyrings/docker.gpg\necho "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null`} />
        </Step>
        <Step num={2} title="Zainstaluj Docker">
          <CodeBlock lang="bash" code={`apt update\napt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`} />
        </Step>
        <Step num={3} title="Sprawdź instalację">
          <CodeBlock lang="bash" code={`docker --version\ndocker compose version\ndocker run hello-world`} />
        </Step>
        <InfoBox type="tip">
          Jeśli chcesz używać Docker bez sudo, dodaj użytkownika do grupy docker: <code>usermod -aG docker mojuser</code>
        </InfoBox>
      </>
    ),
  },
  {
    id: 'vps-nginx',
    title: 'Instalacja i konfiguracja Nginx',
    icon: <Globe size={18} />,
    category: 'vps',
    tags: ['nginx', 'web', 'reverse proxy', 'www'],
    content: (
      <>
        <p>Nginx to lekki i szybki serwer HTTP, idealny jako reverse proxy lub hosting stron.</p>
        <Step num={1} title="Zainstaluj Nginx">
          <CodeBlock lang="bash" code={`apt install nginx -y\nsystemctl enable nginx\nsystemctl start nginx`} />
        </Step>
        <Step num={2} title="Skonfiguruj firewall">
          <CodeBlock lang="bash" code={`ufw allow 'Nginx Full'`} />
        </Step>
        <Step num={3} title="Dodaj swoją stronę">
          <CodeBlock lang="bash" code={`nano /etc/nginx/sites-available/mojastrona`} />
          <CodeBlock lang="nginx" code={`server {\n    listen 80;\n    server_name mojadomena.pl www.mojadomena.pl;\n\n    root /var/www/mojastrona;\n    index index.html;\n\n    location / {\n        try_files $uri $uri/ =404;\n    }\n}`} />
        </Step>
        <Step num={4} title="Aktywuj stronę">
          <CodeBlock lang="bash" code={`ln -s /etc/nginx/sites-available/mojastrona /etc/nginx/sites-enabled/\nnginx -t\nsystemctl reload nginx`} />
        </Step>
        <InfoBox type="tip">
          Chcesz SSL? Sprawdź artykuł o Let's Encrypt w sekcji <strong>Strony WWW</strong>.
        </InfoBox>
      </>
    ),
  },
  {
    id: 'vps-node',
    title: 'Instalacja Node.js na VPS',
    icon: <FileCode size={18} />,
    category: 'vps',
    tags: ['nodejs', 'node', 'npm', 'javascript'],
    content: (
      <>
        <p>Node.js jest wymagany do wielu projektów — botów Discord, serwerów API, aplikacji webowych itd.</p>
        <Step num={1} title="Zainstaluj NVM (Node Version Manager)">
          <CodeBlock lang="bash" code={`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash\nsource ~/.bashrc`} />
        </Step>
        <Step num={2} title="Zainstaluj Node.js">
          <CodeBlock lang="bash" code={`nvm install --lts\nnode --version\nnpm --version`} />
        </Step>
        <Step num={3} title="Uruchom projekt jako usługę (PM2)">
          <CodeBlock lang="bash" code={`npm install -g pm2\ncd /sciezka/do/projektu\npm2 start index.js --name "moja-apka"\npm2 save\npm2 startup`} />
          <p>PM2 automatycznie zrestartuje Twoją aplikację po restarcie serwera.</p>
        </Step>
        <InfoBox type="info">
          Możesz zainstalować wiele wersji Node.js jednocześnie: <code>nvm install 18</code>, <code>nvm install 20</code>, <code>nvm use 20</code>
        </InfoBox>
      </>
    ),
  },
  // ========== FIVEM ==========
  {
    id: 'fivem-install',
    title: 'Instalacja serwera FiveM od zera',
    icon: <Gamepad2 size={18} />,
    category: 'fivem',
    tags: ['fivem', 'instalacja', 'txadmin', 'gta'],
    content: (
      <>
        <p>Ten poradnik przeprowadzi Cię przez kompletną instalację serwera FiveM na Linux.</p>
        <Step num={1} title="Przygotuj system">
          <CodeBlock lang="bash" code={`apt update && apt upgrade -y\napt install -y xz-utils curl wget git screen`} />
        </Step>
        <Step num={2} title="Utwórz katalog serwera">
          <CodeBlock lang="bash" code={`mkdir -p /home/fivem/server\ncd /home/fivem/server`} />
        </Step>
        <Step num={3} title="Pobierz artefakty FiveM">
          <p>Pobierz najnowsze artefakty z <strong>https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/</strong></p>
          <CodeBlock lang="bash" code={`wget https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/LINK_DO_NAJNOWSZEJ_WERSJI/fx.tar.xz\ntar xf fx.tar.xz\nrm fx.tar.xz`} />
        </Step>
        <Step num={4} title="Zdobądź klucz licencyjny">
          <p>Wejdź na <strong>https://keymaster.fivem.net</strong> i wygeneruj klucz dla IP Twojego serwera.</p>
        </Step>
        <Step num={5} title="Uruchom serwer (txAdmin)">
          <CodeBlock lang="bash" code={`cd /home/fivem/server\nscreen -S fivem\n./run.sh +exec server.cfg`} />
          <p>txAdmin uruchomi się na porcie <strong>40120</strong> — wejdź w przeglądarce na <code>http://TWOJ_IP:40120</code> i dokończ konfigurację.</p>
        </Step>
        <InfoBox type="warning">
          Pamiętaj o otwarciu portów w firewallu: <code>ufw allow 30120</code> (gra) i <code>ufw allow 40120</code> (txAdmin).
        </InfoBox>
        <InfoBox type="tip">
          Użyj <code>screen -r fivem</code> żeby wrócić do konsoli. Wyjście bez zamykania: <code>Ctrl+A</code>, potem <code>D</code>.
        </InfoBox>
      </>
    ),
  },
  {
    id: 'fivem-resources',
    title: 'Dodawanie zasobów (resources) do FiveM',
    icon: <Package size={18} />,
    category: 'fivem',
    tags: ['fivem', 'resources', 'zasoby', 'skrypty'],
    content: (
      <>
        <p>Zasoby (resources) to skrypty, mapy i inne dodatki rozszerzające Twój serwer FiveM.</p>
        <Step num={1} title="Znajdź zasób">
          <p>Popularne źródła zasobów:</p>
          <ul>
            <li><strong>GitHub</strong> — większość darmowych skryptów</li>
            <li><strong>Cfx.re Forum</strong> — oficjalne forum FiveM</li>
            <li><strong>Tebex/FiveM Store</strong> — płatne zasoby premium</li>
          </ul>
        </Step>
        <Step num={2} title="Wgraj zasób na serwer">
          <CodeBlock lang="bash" code={`cd /home/fivem/txData/NAZWA_PROFILU/resources/\ngit clone https://github.com/autor/nazwa-zasobu`} />
          <p>Lub wgraj pliki przez menadżer plików w panelu SVNHost.</p>
        </Step>
        <Step num={3} title="Dodaj do server.cfg">
          <CodeBlock lang="cfg" code={`ensure nazwa-zasobu`} />
        </Step>
        <Step num={4} title="Restart serwera">
          <p>W txAdmin: <strong>Server → Restart Server</strong>, lub w konsoli:</p>
          <CodeBlock lang="bash" code={`restart nazwa-zasobu`} />
        </Step>
        <InfoBox type="warning">
          Zawsze sprawdzaj kod zasobów przed instalacją — niektóre mogą zawierać backdoory!
        </InfoBox>
      </>
    ),
  },
  {
    id: 'fivem-database',
    title: 'Konfiguracja bazy danych MySQL dla FiveM',
    icon: <Database size={18} />,
    category: 'fivem',
    tags: ['fivem', 'mysql', 'mariadb', 'baza danych', 'oxmysql'],
    content: (
      <>
        <p>Większość frameworków FiveM (ESX, QBCore) wymaga bazy MySQL/MariaDB.</p>
        <Step num={1} title="Zainstaluj MariaDB">
          <CodeBlock lang="bash" code={`apt install mariadb-server -y\nmysql_secure_installation`} />
          <p>Podczas instalacji ustaw hasło root i odpowiedz "Y" na wszystkie pytania bezpieczeństwa.</p>
        </Step>
        <Step num={2} title="Utwórz bazę i użytkownika">
          <CodeBlock lang="sql" code={`mysql -u root -p\n\nCREATE DATABASE fivem;\nCREATE USER 'fivem'@'localhost' IDENTIFIED BY 'TwojeSilneHaslo123!';\nGRANT ALL PRIVILEGES ON fivem.* TO 'fivem'@'localhost';\nFLUSH PRIVILEGES;\nEXIT;`} />
        </Step>
        <Step num={3} title="Zainstaluj oxmysql">
          <CodeBlock lang="bash" code={`cd /home/fivem/txData/PROFIL/resources/\nmkdir [standalone]\ncd [standalone]\ngit clone https://github.com/overextended/oxmysql.git`} />
        </Step>
        <Step num={4} title="Dodaj connection string do server.cfg">
          <CodeBlock lang="cfg" code={`set mysql_connection_string "mysql://fivem:TwojeSilneHaslo123!@localhost/fivem?charset=utf8mb4"\nensure oxmysql`} />
        </Step>
        <InfoBox type="danger">
          Nigdy nie używaj hasła "root" ani "password" — to pierwsze co sprawdzają boty skanujące serwery!
        </InfoBox>
      </>
    ),
  },
  {
    id: 'fivem-esx',
    title: 'Instalacja frameworka ESX Legacy',
    icon: <Layers size={18} />,
    category: 'fivem',
    tags: ['fivem', 'esx', 'framework', 'roleplay'],
    content: (
      <>
        <p>ESX Legacy to jeden z najpopularniejszych frameworków RP do FiveM.</p>
        <Step num={1} title="Wymagania wstępne">
          <ul>
            <li>Serwer FiveM z txAdmin</li>
            <li>Baza danych MySQL/MariaDB (patrz artykuł wyżej)</li>
            <li>oxmysql zainstalowany i działający</li>
          </ul>
        </Step>
        <Step num={2} title="Pobierz ESX przez txAdmin">
          <p>Najłatwiej: podczas konfiguracji txAdmin wybierz <strong>Recipe</strong> → <strong>ESX Legacy</strong>. txAdmin zainstaluje wszystko automatycznie.</p>
        </Step>
        <Step num={3} title="Instalacja ręczna">
          <CodeBlock lang="bash" code={`cd /home/fivem/txData/PROFIL/resources/\ngit clone https://github.com/esx-framework/esx_core.git [core]\ncd [core]\ngit clone https://github.com/esx-framework/esx-legacy.git es_extended`} />
        </Step>
        <Step num={4} title="Importuj SQL">
          <CodeBlock lang="bash" code={`mysql -u fivem -p fivem < [core]/es_extended/sql/legacy.sql`} />
        </Step>
        <Step num={5} title="Dodaj do server.cfg">
          <CodeBlock lang="cfg" code={`ensure es_extended\nensure esx_menu_default\nensure esx_menu_dialog\nensure esx_menu_list`} />
        </Step>
        <InfoBox type="tip">
          Upewnij się, że <code>oxmysql</code> jest ładowany PRZED <code>es_extended</code> w server.cfg.
        </InfoBox>
      </>
    ),
  },
  // ========== MINECRAFT ==========
  {
    id: 'mc-paper',
    title: 'Instalacja serwera Minecraft (Paper)',
    icon: <Layers size={18} />,
    category: 'minecraft',
    tags: ['minecraft', 'paper', 'java', 'instalacja'],
    content: (
      <>
        <p>Paper to zoptymalizowana wersja serwera Minecraft z obsługą pluginów Bukkit/Spigot.</p>
        <Step num={1} title="Zainstaluj Javę 21">
          <CodeBlock lang="bash" code={`apt install openjdk-21-jdk -y\njava -version`} />
        </Step>
        <Step num={2} title="Utwórz katalog serwera">
          <CodeBlock lang="bash" code={`mkdir -p /home/minecraft/server\ncd /home/minecraft/server`} />
        </Step>
        <Step num={3} title="Pobierz Paper">
          <CodeBlock lang="bash" code={`wget -O paper.jar https://api.papermc.io/v2/projects/paper/versions/1.21.4/builds/NUMER_BUILDU/downloads/paper-1.21.4-NUMER_BUILDU.jar`} />
          <p>Sprawdź najnowszy build na <strong>https://papermc.io/downloads/paper</strong></p>
        </Step>
        <Step num={4} title="Zaakceptuj EULA i uruchom">
          <CodeBlock lang="bash" code={`echo "eula=true" > eula.txt\nscreen -S minecraft\njava -Xms2G -Xmx4G -jar paper.jar --nogui`} />
          <p>Dostosuj <code>-Xmx</code> do ilości RAM na Twoim serwerze.</p>
        </Step>
        <Step num={5} title="Konfiguracja portów">
          <CodeBlock lang="bash" code={`ufw allow 25565`} />
        </Step>
        <InfoBox type="info">
          Zalecane minimum: <strong>2 GB RAM</strong> dla serwera vanilla, <strong>4-6 GB</strong> z pluginami, <strong>8+ GB</strong> z modami.
        </InfoBox>
      </>
    ),
  },
  {
    id: 'mc-plugins',
    title: 'Instalacja pluginów na serwerze Minecraft',
    icon: <Package size={18} />,
    category: 'minecraft',
    tags: ['minecraft', 'pluginy', 'spigot', 'bukkit'],
    content: (
      <>
        <p>Pluginy pozwalają dodać nowe funkcje do serwera — ekonomię, ochronę, mini-gry i wiele więcej.</p>
        <Step num={1} title="Znajdź plugin">
          <ul>
            <li><strong>SpigotMC.org</strong> — największa baza pluginów</li>
            <li><strong>Modrinth</strong> — nowoczesna platforma</li>
            <li><strong>Hangar (PaperMC)</strong> — oficjalna platforma Paper</li>
          </ul>
        </Step>
        <Step num={2} title="Wgraj plugin">
          <CodeBlock lang="bash" code={`cd /home/minecraft/server/plugins/\nwget -O NazwaPluginu.jar LINK_DO_PLIKU`} />
          <p>Lub użyj menadżera plików w panelu SVNHost.</p>
        </Step>
        <Step num={3} title="Zrestartuj serwer">
          <p>W konsoli serwera:</p>
          <CodeBlock lang="bash" code={`reload confirm\n# lub lepiej:\nstop\n# i uruchom ponownie`} />
        </Step>
        <InfoBox type="tip">
          Popularne pluginy na start: <strong>EssentialsX</strong> (komendy), <strong>LuckPerms</strong> (rangi), <strong>WorldGuard</strong> (ochrona), <strong>Vault</strong> (ekonomia).
        </InfoBox>
      </>
    ),
  },
  // ========== STRONY WWW ==========
  {
    id: 'www-ssl',
    title: 'Darmowy certyfikat SSL (Let\'s Encrypt)',
    icon: <Lock size={18} />,
    category: 'www',
    tags: ['ssl', 'https', 'certbot', 'lets encrypt'],
    content: (
      <>
        <p>HTTPS jest obowiązkowy dla każdej strony. Let's Encrypt daje darmowe certyfikaty SSL.</p>
        <Step num={1} title="Zainstaluj Certbot">
          <CodeBlock lang="bash" code={`apt install certbot python3-certbot-nginx -y`} />
        </Step>
        <Step num={2} title="Uzyskaj certyfikat">
          <CodeBlock lang="bash" code={`certbot --nginx -d mojadomena.pl -d www.mojadomena.pl`} />
          <p>Certbot automatycznie skonfiguruje Nginx do obsługi HTTPS.</p>
        </Step>
        <Step num={3} title="Automatyczne odnawianie">
          <p>Certbot dodaje automatyczny cron. Sprawdź:</p>
          <CodeBlock lang="bash" code={`certbot renew --dry-run`} />
        </Step>
        <InfoBox type="info">
          Certyfikaty Let's Encrypt są ważne 90 dni, ale Certbot odnawia je automatycznie.
        </InfoBox>
      </>
    ),
  },
  {
    id: 'www-wordpress',
    title: 'Instalacja WordPress na VPS',
    icon: <Globe size={18} />,
    category: 'www',
    tags: ['wordpress', 'www', 'php', 'strona'],
    content: (
      <>
        <p>WordPress to najpopularniejszy CMS na świecie. Oto jak go postawić na VPS.</p>
        <Step num={1} title="Zainstaluj PHP i rozszerzenia">
          <CodeBlock lang="bash" code={`apt install -y php-fpm php-mysql php-curl php-gd php-intl php-mbstring php-soap php-xml php-xmlrpc php-zip`} />
        </Step>
        <Step num={2} title="Utwórz bazę MySQL">
          <CodeBlock lang="sql" code={`mysql -u root -p\nCREATE DATABASE wordpress;\nCREATE USER 'wpuser'@'localhost' IDENTIFIED BY 'SilneHaslo123!';\nGRANT ALL PRIVILEGES ON wordpress.* TO 'wpuser'@'localhost';\nFLUSH PRIVILEGES;\nEXIT;`} />
        </Step>
        <Step num={3} title="Pobierz WordPress">
          <CodeBlock lang="bash" code={`cd /var/www/\nwget https://wordpress.org/latest.tar.gz\ntar xf latest.tar.gz\nchown -R www-data:www-data wordpress\nrm latest.tar.gz`} />
        </Step>
        <Step num={4} title="Skonfiguruj Nginx">
          <CodeBlock lang="nginx" code={`server {\n    listen 80;\n    server_name mojadomena.pl;\n    root /var/www/wordpress;\n    index index.php;\n\n    location / {\n        try_files $uri $uri/ /index.php?$args;\n    }\n\n    location ~ \\.php$ {\n        include snippets/fastcgi-php.conf;\n        fastcgi_pass unix:/run/php/php-fpm.sock;\n    }\n}`} />
        </Step>
        <Step num={5} title="Dokończ instalację w przeglądarce">
          <p>Wejdź na <code>http://mojadomena.pl</code> — WordPress poprowadzi Cię przez kreator.</p>
        </Step>
      </>
    ),
  },
  // ========== BAZY DANYCH ==========
  {
    id: 'db-mysql',
    title: 'Instalacja i zarządzanie MySQL / MariaDB',
    icon: <Database size={18} />,
    category: 'bazy',
    tags: ['mysql', 'mariadb', 'baza danych', 'sql'],
    content: (
      <>
        <p>MariaDB to szybki i darmowy silnik baz danych, kompatybilny z MySQL.</p>
        <Step num={1} title="Instalacja">
          <CodeBlock lang="bash" code={`apt install mariadb-server mariadb-client -y\nsystemctl enable mariadb\nmysql_secure_installation`} />
        </Step>
        <Step num={2} title="Podstawowe komendy">
          <CodeBlock lang="sql" code={`# Pokaż bazy:\nSHOW DATABASES;\n\n# Utwórz bazę:\nCREATE DATABASE nazwa;\n\n# Pokaż tabele:\nUSE nazwa;\nSHOW TABLES;\n\n# Backup:\nmysqldump -u root -p nazwa > backup.sql\n\n# Przywróć:\nmysql -u root -p nazwa < backup.sql`} />
        </Step>
        <Step num={3} title="Zainstaluj phpMyAdmin (opcjonalnie)">
          <CodeBlock lang="bash" code={`apt install phpmyadmin -y`} />
          <p>Wybierz Nginx podczas instalacji. phpMyAdmin będzie dostępny pod <code>/phpmyadmin</code>.</p>
        </Step>
        <InfoBox type="danger">
          Nigdy nie pozwalaj na zdalne logowanie na konto root MySQL! Używaj dedykowanych użytkowników z ograniczonymi uprawnieniami.
        </InfoBox>
      </>
    ),
  },
  {
    id: 'db-redis',
    title: 'Instalacja Redis (cache i sesje)',
    icon: <Zap size={18} />,
    category: 'bazy',
    tags: ['redis', 'cache', 'sesje', 'wydajność'],
    content: (
      <>
        <p>Redis to ultra-szybka baza danych w pamięci RAM, idealna do cache i sesji.</p>
        <Step num={1} title="Zainstaluj Redis">
          <CodeBlock lang="bash" code={`apt install redis-server -y\nsystemctl enable redis-server`} />
        </Step>
        <Step num={2} title="Zabezpiecz Redis">
          <CodeBlock lang="bash" code={`nano /etc/redis/redis.conf\n# Ustaw hasło:\n# requirepass TwojeSilneHaslo\n# Ogranicz do localhost:\n# bind 127.0.0.1\nsystemctl restart redis-server`} />
        </Step>
        <Step num={3} title="Testuj połączenie">
          <CodeBlock lang="bash" code={`redis-cli\nPING\n# Odpowiedź: PONG`} />
        </Step>
      </>
    ),
  },
  // ========== BEZPIECZEŃSTWO ==========
  {
    id: 'sec-ssh-keys',
    title: 'Konfiguracja kluczy SSH',
    icon: <Lock size={18} />,
    category: 'bezp',
    tags: ['ssh', 'klucze', 'bezpieczeństwo', 'autoryzacja'],
    content: (
      <>
        <p>Klucze SSH są bezpieczniejsze niż hasła i eliminują ryzyko ataków brute-force.</p>
        <Step num={1} title="Wygeneruj klucz na swoim komputerze">
          <CodeBlock lang="bash" code={`ssh-keygen -t ed25519 -C "moj@email.pl"\n# lub na starszych systemach:\nssh-keygen -t rsa -b 4096`} />
        </Step>
        <Step num={2} title="Skopiuj klucz na serwer">
          <CodeBlock lang="bash" code={`ssh-copy-id -p PORT user@TWOJ_IP\n# lub ręcznie:\ncat ~/.ssh/id_ed25519.pub | ssh user@TWOJ_IP "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"`} />
        </Step>
        <Step num={3} title="Wyłącz logowanie hasłem">
          <CodeBlock lang="bash" code={`nano /etc/ssh/sshd_config\n# Zmień:\nPasswordAuthentication no\nPubkeyAuthentication yes\n\nsystemctl restart sshd`} />
        </Step>
        <InfoBox type="danger">
          Zanim wyłączysz hasło, UPEWNIJ SIĘ że klucz działa! Otwórz drugie okno terminala i sprawdź logowanie kluczem.
        </InfoBox>
      </>
    ),
  },
  {
    id: 'sec-fail2ban',
    title: 'Ochrona przed brute-force (Fail2ban)',
    icon: <Shield size={18} />,
    category: 'bezp',
    tags: ['fail2ban', 'brute force', 'bezpieczeństwo', 'ban'],
    content: (
      <>
        <p>Fail2ban automatycznie blokuje adresy IP, które wielokrotnie próbują się zalogować.</p>
        <Step num={1} title="Zainstaluj Fail2ban">
          <CodeBlock lang="bash" code={`apt install fail2ban -y\nsystemctl enable fail2ban`} />
        </Step>
        <Step num={2} title="Skonfiguruj">
          <CodeBlock lang="bash" code={`cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local\nnano /etc/fail2ban/jail.local`} />
          <CodeBlock lang="ini" code={`[sshd]\nenabled = true\nport = ssh\nfilter = sshd\nlogpath = /var/log/auth.log\nmaxretry = 3\nbantime = 3600\nfindtime = 600`} />
        </Step>
        <Step num={3} title="Uruchom i sprawdź">
          <CodeBlock lang="bash" code={`systemctl restart fail2ban\nfail2ban-client status\nfail2ban-client status sshd`} />
        </Step>
        <InfoBox type="tip">
          Możesz dodać własne filtry dla Nginx, MySQL, FTP i innych usług — sprawdź katalog <code>/etc/fail2ban/filter.d/</code>.
        </InfoBox>
      </>
    ),
  },
  {
    id: 'sec-backup',
    title: 'Automatyczne backupy serwera',
    icon: <RefreshCw size={18} />,
    category: 'bezp',
    tags: ['backup', 'kopie', 'cron', 'automatyzacja'],
    content: (
      <>
        <p>Regularne backupy to najlepsza ochrona przed utratą danych.</p>
        <Step num={1} title="Stwórz skrypt backupu">
          <CodeBlock lang="bash" code={`nano /root/backup.sh`} />
          <CodeBlock lang="bash" code={`#!/bin/bash\nDATE=$(date +%Y-%m-%d_%H-%M)\nBACKUP_DIR="/root/backups"\nmkdir -p $BACKUP_DIR\n\n# Backup bazy danych\nmysqldump -u root --all-databases > $BACKUP_DIR/db_$DATE.sql\n\n# Backup plików\ntar czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/ /home/fivem/\n\n# Usuń stare backupy (starsze niż 7 dni)\nfind $BACKUP_DIR -mtime +7 -delete\n\necho "Backup $DATE zakończony!"`} />
        </Step>
        <Step num={2} title="Nadaj uprawnienia">
          <CodeBlock lang="bash" code={`chmod +x /root/backup.sh`} />
        </Step>
        <Step num={3} title="Dodaj do crona">
          <CodeBlock lang="bash" code={`crontab -e\n# Dodaj linię (backup codziennie o 3:00):\n0 3 * * * /root/backup.sh >> /var/log/backup.log 2>&1`} />
        </Step>
        <InfoBox type="warning">
          Trzymaj backupy też poza serwerem! Użyj panelu SVNHost do tworzenia backupów w chmurze.
        </InfoBox>
      </>
    ),
  },
  // ========== FAQ ==========
  {
    id: 'faq-connection',
    title: 'Nie mogę połączyć się z serwerem',
    icon: <Network size={18} />,
    category: 'faq',
    tags: ['problem', 'połączenie', 'ssh', 'timeout'],
    content: (
      <>
        <p>Oto najczęstsze przyczyny problemów z połączeniem i ich rozwiązania:</p>
        <h3>🔴 Connection timed out</h3>
        <ul>
          <li>Sprawdź czy serwer jest uruchomiony w panelu SVNHost</li>
          <li>Sprawdź czy port SSH nie jest zablokowany: <code>ufw status</code></li>
          <li>Jeśli zmieniałeś port SSH — używaj nowego portu: <code>ssh -p NOWY_PORT user@IP</code></li>
        </ul>
        <h3>🔴 Connection refused</h3>
        <ul>
          <li>Sprawdź czy SSH działa: <code>systemctl status sshd</code></li>
          <li>Sprawdź czy łączysz się na właściwy port</li>
        </ul>
        <h3>🔴 Permission denied</h3>
        <ul>
          <li>Sprawdź czy hasło jest poprawne</li>
          <li>Jeśli używasz kluczy: upewnij się że klucz jest w <code>~/.ssh/authorized_keys</code></li>
          <li>Sprawdź uprawnienia: <code>chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys</code></li>
        </ul>
        <InfoBox type="tip">
          Jeśli nadal masz problem — utwórz ticket w panelu SVNHost z dokładnym opisem błędu.
        </InfoBox>
      </>
    ),
  },
  {
    id: 'faq-performance',
    title: 'Mój serwer jest wolny — co robić?',
    icon: <Cpu size={18} />,
    category: 'faq',
    tags: ['wydajność', 'lag', 'wolny', 'optymalizacja'],
    content: (
      <>
        <p>Sprawdź te rzeczy po kolei:</p>
        <Step num={1} title="Sprawdź zużycie zasobów">
          <CodeBlock lang="bash" code={`htop\n# lub:\nfree -h\ndf -h`} />
          <p>Jeśli CPU lub RAM są na 100% — potrzebujesz wyższego planu lub optymalizacji.</p>
        </Step>
        <Step num={2} title="Sprawdź obciążenie dysku">
          <CodeBlock lang="bash" code={`iostat -x 1 5\n# lub:\niotop`} />
        </Step>
        <Step num={3} title="Sprawdź sieć">
          <CodeBlock lang="bash" code={`iftop\n# lub:\nnethogs`} />
        </Step>
        <Step num={4} title="Optymalizacje">
          <ul>
            <li>Wyłącz niepotrzebne usługi: <code>systemctl list-units --type=service --state=running</code></li>
            <li>Dodaj swap jeśli brakuje RAM: <code>fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile</code></li>
            <li>Rozważ upgrade planu w Sklepie SVNHost</li>
          </ul>
        </Step>
        <InfoBox type="info">
          Dla FiveM: sprawdź <code>resmon</code> w txAdmin żeby znaleźć zasoby zżerające CPU.
          Dla Minecraft: użyj <code>/spark profiler</code> z pluginem Spark.
        </InfoBox>
      </>
    ),
  },
  {
    id: 'faq-domains',
    title: 'Jak podłączyć domenę do serwera?',
    icon: <Globe size={18} />,
    category: 'faq',
    tags: ['domena', 'dns', 'cloudflare'],
    content: (
      <>
        <p>Żeby domena wskazywała na Twój serwer, musisz skonfigurować rekordy DNS.</p>
        <Step num={1} title="Rekord A (strona/serwis)">
          <p>W panelu DNS Twojego rejestratora (np. Cloudflare, OVH):</p>
          <ul>
            <li><strong>Typ:</strong> A</li>
            <li><strong>Nazwa:</strong> @ (lub subdomena np. <code>panel</code>)</li>
            <li><strong>Wartość:</strong> IP Twojego serwera</li>
            <li><strong>TTL:</strong> Auto</li>
          </ul>
        </Step>
        <Step num={2} title="Rekord SRV (Minecraft)">
          <p>Żeby gracze łączyli się bez podawania portu:</p>
          <ul>
            <li><strong>Typ:</strong> SRV</li>
            <li><strong>Nazwa:</strong> _minecraft._tcp</li>
            <li><strong>Priorytet:</strong> 0</li>
            <li><strong>Waga:</strong> 5</li>
            <li><strong>Port:</strong> 25565</li>
            <li><strong>Wartość:</strong> mojadomena.pl</li>
          </ul>
        </Step>
        <Step num={3} title="FiveM — connect URL">
          <p>W rekordach DNS ustaw A na IP serwera. Gracze łączą się przez: <code>connect mojadomena.pl</code></p>
        </Step>
        <InfoBox type="info">
          Propagacja DNS może trwać do 24-48h, ale zwykle działa w kilka minut.
        </InfoBox>
      </>
    ),
  },
];

export function WikiPage() {
  const [activeCategory, setActiveCategory] = useState<string>('start');
  const [activeArticle, setActiveArticle] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = searchQuery
    ? ARTICLES.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : ARTICLES.filter(a => a.category === activeCategory);

  const currentArticle = activeArticle ? ARTICLES.find(a => a.id === activeArticle) : null;

  const currentCat = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="animate-fadeIn">
      <div className="dash-page__header animate-fadeInDown">
        <h1 className="dash-page__title">
          <Book size={28} style={{ marginRight: 10, color: 'var(--accent)' }} />
          Baza wiedzy
        </h1>
        <p className="dash-page__subtitle">Poradniki, tutoriale i FAQ — wszystko czego potrzebujesz do zarządzania serwerem.</p>
      </div>

      {/* Search */}
      <div className="wiki__search animate-fadeInDown" style={{ animationDelay: '0.05s' }}>
        <Search size={18} className="wiki__search-icon" />
        <input
          type="text"
          className="wiki__search-input"
          placeholder="Szukaj artykułów... np. Docker, FiveM, SSL, MySQL..."
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setActiveArticle(null); }}
        />
        {searchQuery && (
          <button className="wiki__search-clear" onClick={() => setSearchQuery('')}>
            <span>✕</span>
          </button>
        )}
      </div>

      <div className="wiki__layout">
        {/* Sidebar categories */}
        <aside className="wiki__sidebar animate-slideInUp" style={{ animationDelay: '0.1s' }}>
          <div className="wiki__sidebar-title">Kategorie</div>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`wiki__cat-btn ${activeCategory === cat.id && !searchQuery ? 'wiki__cat-btn--active' : ''}`}
              onClick={() => { setActiveCategory(cat.id); setActiveArticle(null); setSearchQuery(''); }}
            >
              {cat.icon}
              <span>{cat.label}</span>
              <span className="wiki__cat-count">
                {ARTICLES.filter(a => a.category === cat.id).length}
              </span>
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="wiki__main">
          {currentArticle ? (
            <div className="wiki__article animate-fadeIn">
              <button className="wiki__back-btn" onClick={() => setActiveArticle(null)}>
                <ArrowLeft size={16} /> Powrót do listy
              </button>
              <div className="wiki__article-header">
                <div className="wiki__article-icon">{currentArticle.icon}</div>
                <div>
                  <h2 className="wiki__article-title">{currentArticle.title}</h2>
                  <div className="wiki__article-tags">
                    {currentArticle.tags.map(tag => (
                      <span key={tag} className="wiki__tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="wiki__article-body">
                {currentArticle.content}
              </div>
            </div>
          ) : (
            <>
              {searchQuery ? (
                <div className="wiki__list-header">
                  <Search size={18} />
                  <span>Wyniki wyszukiwania: „{searchQuery}" ({filteredArticles.length})</span>
                </div>
              ) : (
                <div className="wiki__list-header">
                  {currentCat?.icon}
                  <span>{currentCat?.label}</span>
                </div>
              )}
              <div className="wiki__articles-grid">
                {filteredArticles.length === 0 ? (
                  <div className="wiki__empty">
                    <Search size={40} />
                    <p>Brak artykułów pasujących do wyszukiwania.</p>
                  </div>
                ) : (
                  filteredArticles.map((article, i) => (
                    <button
                      key={article.id}
                      className="wiki__article-card animate-slideInUp"
                      style={{ animationDelay: `${0.05 * i}s` }}
                      onClick={() => setActiveArticle(article.id)}
                    >
                      <div className="wiki__article-card-icon">{article.icon}</div>
                      <div className="wiki__article-card-info">
                        <h3>{article.title}</h3>
                        <div className="wiki__article-card-tags">
                          {article.tags.slice(0, 3).map(t => (
                            <span key={t} className="wiki__tag wiki__tag--sm">{t}</span>
                          ))}
                        </div>
                      </div>
                      <ChevronRight size={18} className="wiki__article-card-arrow" />
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

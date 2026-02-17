import { useState } from 'react';
import { useStoreState } from '../../store/useStore';
import { addNode, updateNode, removeNode } from '../../store/store';
import type { HostingNode } from '../../store/types';
import {
  Network, Plus, Trash2, Edit3, X, Check, AlertTriangle,
  Server, HardDrive, Cpu, MemoryStick, Globe, BookOpen,
  ChevronDown, ChevronRight, Copy, CheckCircle2, Info,
} from 'lucide-react';
import { CustomSelect } from '../../components/CustomSelect';

type Tab = 'nodes' | 'guide' | 'phpmyadmin' | 'deploy';

export function AdminInfrastructure() {
  const store = useStoreState();
  const [tab, setTab] = useState<Tab>('nodes');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Add form
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [location, setLocation] = useState('');
  const [totalCpu, setTotalCpu] = useState('8');
  const [totalRam, setTotalRam] = useState('32768');
  const [totalDisk, setTotalDisk] = useState('500');
  const [maxServers, setMaxServers] = useState('0');

  // Edit form
  const [editData, setEditData] = useState<Partial<HostingNode>>({});

  // Guide sections
  const [openSection, setOpenSection] = useState<string | null>('requirements');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleAdd = () => {
    if (!name.trim() || !ip.trim() || !location.trim()) return;
    addNode({
      name: name.trim(),
      ip: ip.trim(),
      location: location.trim(),
      totalCpu: parseInt(totalCpu),
      totalRamMb: parseInt(totalRam),
      totalDiskGb: parseInt(totalDisk),
      maxServers: parseInt(maxServers) || 0,
      usedCpu: 0,
      usedRamMb: 0,
      usedDiskGb: 0,
      status: 'online',
    });
    setShowAdd(false);
    setName(''); setIp(''); setLocation('');
    setTotalCpu('8'); setTotalRam('32768'); setTotalDisk('500'); setMaxServers('0');
  };

  const handleEdit = (nodeId: string) => {
    updateNode(nodeId, editData);
    setEditId(null);
    setEditData({});
  };

  const handleDelete = (nodeId: string) => {
    removeNode(nodeId);
    setConfirmDeleteId(null);
  };

  const statusColors: Record<string, string> = {
    online: '#22c55e', offline: '#ef4444', maintenance: '#f59e0b',
  };
  const statusLabels: Record<string, string> = {
    online: 'Online', offline: 'Offline', maintenance: 'Konserwacja',
  };

  const CodeBlock = ({ code, lang }: { code: string; lang?: string }) => (
    <div style={{ position: 'relative', background: 'var(--bg-input)', borderRadius: 8, padding: '14px 16px', marginTop: 8, marginBottom: 8, border: '1px solid var(--border-primary)', fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'var(--text-primary)' }}>
      {lang && <span style={{ position: 'absolute', top: 6, right: 44, fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{lang}</span>}
      <button
        onClick={() => copyToClipboard(code)}
        style={{ position: 'absolute', top: 6, right: 6, background: 'none', border: 'none', color: copiedText === code ? '#22c55e' : 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}
        title="Kopiuj"
      >
        {copiedText === code ? <CheckCircle2 size={14} /> : <Copy size={14} />}
      </button>
      {code}
    </div>
  );

  const GuideSection = ({ id, title, icon, children }: { id: string; title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div style={{ border: '1px solid var(--border-primary)', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
      <button
        onClick={() => setOpenSection(openSection === id ? null : id)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px',
          background: openSection === id ? 'rgba(99,102,241,0.06)' : 'transparent',
          border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600,
        }}
      >
        {icon}
        <span style={{ flex: 1, textAlign: 'left' }}>{title}</span>
        {openSection === id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>
      {openSection === id && (
        <div style={{ padding: '4px 18px 18px', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <div className="dash-page__header animate-fadeInDown">
        <h1 className="dash-page__title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Network size={24} style={{ color: 'var(--accent)' }} /> Infrastruktura
        </h1>
        <p className="dash-page__subtitle">Zarządzaj node'ami, przeczytaj poradnik jak uruchomić hosting</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-input)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {([
          { key: 'nodes' as Tab, label: 'Node\'y', icon: <Server size={15} /> },
          { key: 'guide' as Tab, label: 'Poradnik hostingu', icon: <BookOpen size={15} /> },
          { key: 'deploy' as Tab, label: 'Domena i deploy', icon: <Globe size={15} /> },
          { key: 'phpmyadmin' as Tab, label: 'phpMyAdmin', icon: <HardDrive size={15} /> },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
            border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all .2s',
            background: tab === t.key ? 'var(--accent)' : 'transparent',
            color: tab === t.key ? '#fff' : 'var(--text-secondary)',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ═══ NODES TAB ═══ */}
      {tab === 'nodes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              {store.nodes.length === 0 ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b' }}>
                  <AlertTriangle size={16} /> Brak podpiętych node'ów — serwery używają IP 127.0.0.1 (localhost)
                </span>
              ) : (
                `Podpięte node'y: ${store.nodes.length}`
              )}
            </p>
            <button className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}
              onClick={() => setShowAdd(true)}>
              <Plus size={16} /> Dodaj Node
            </button>
          </div>

          {/* Node cards */}
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))' }}>
            {store.nodes.map(node => (
              <div key={node.id} className="dash-card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: statusColors[node.status] }} />

                {editId === node.id ? (
                  /* Edit mode */
                  <div style={{ display: 'grid', gap: 10, paddingTop: 8 }}>
                    <input className="dash-input" value={editData.name ?? node.name}
                      onChange={e => setEditData({ ...editData, name: e.target.value })} placeholder="Nazwa" />
                    <input className="dash-input" value={editData.ip ?? node.ip}
                      onChange={e => setEditData({ ...editData, ip: e.target.value })} placeholder="IP" />
                    <CustomSelect value={editData.status ?? node.status}
                      onChange={val => setEditData({ ...editData, status: val as HostingNode['status'] })}
                      options={[
                        { value: 'online', label: 'Online' },
                        { value: 'offline', label: 'Offline' },
                        { value: 'maintenance', label: 'Konserwacja' },
                      ]}
                    />
                    <div>
                      <label className="dash-label" style={{ fontSize: '0.78rem', marginBottom: 4 }}>Max serwerów (0 = bez limitu)</label>
                      <input className="dash-input" type="number" min="0"
                        value={editData.maxServers ?? node.maxServers ?? 0}
                        onChange={e => setEditData({ ...editData, maxServers: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn btn--ghost" onClick={() => { setEditId(null); setEditData({}); }}
                        style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <X size={14} /> Anuluj
                      </button>
                      <button className="btn btn--primary" onClick={() => handleEdit(node.id)}
                        style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={14} /> Zapisz
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div style={{ paddingTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <h3 style={{ fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                          {node.name}
                          <span style={{
                            fontSize: '0.7rem', padding: '2px 8px', borderRadius: 6, fontWeight: 600,
                            background: `${statusColors[node.status]}18`, color: statusColors[node.status],
                          }}>{statusLabels[node.status]}</span>
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                          <Globe size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                          {node.ip} · {node.location}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => { setEditId(node.id); setEditData({}); }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}>
                          <Edit3 size={16} />
                        </button>
                        {confirmDeleteId === node.id ? (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => handleDelete(node.id)}
                              style={{ background: '#ef444420', border: 'none', borderRadius: 6, color: '#ef4444', cursor: 'pointer', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600 }}>
                              Usuń
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px 6px', fontSize: '0.75rem' }}>
                              Anuluj
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDeleteId(node.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Resources */}
                    {(() => {
                      // Calculate real usage from servers on THIS node
                      const nodeServers = store.servers.filter(s => s.ip === node.ip);
                      const serverCount = nodeServers.length;
                      const totalUsedCpu = nodeServers.reduce((sum, s) => sum + (s.cpuCores || 0), 0);
                      const totalUsedRamMb = nodeServers.reduce((sum, s) => sum + (s.ramMb || 0), 0);
                      const totalUsedDiskGb = nodeServers.reduce((sum, s) => sum + (s.diskGb || 0), 0);
                      const serverPct = node.maxServers ? Math.round((serverCount / node.maxServers) * 100) : 0;
                      return (
                    <>
                    <div style={{ background: 'var(--bg-input)', borderRadius: 8, padding: '8px 12px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Server size={13} /> Serwery na tym node
                      </span>
                      <span style={{ fontWeight: 700, color: serverPct > 80 ? '#ef4444' : serverPct > 60 ? '#f59e0b' : 'var(--text-primary)' }}>
                        {serverCount}{node.maxServers > 0 ? ` / ${node.maxServers}` : ''}{node.maxServers === 0 ? ' (bez limitu)' : ''}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, fontSize: '0.8rem' }}>
                      {[
                        { icon: <Cpu size={13} />, label: 'CPU', used: totalUsedCpu, total: node.totalCpu, unit: ' rdzeni' },
                        { icon: <MemoryStick size={13} />, label: 'RAM', used: Math.round(totalUsedRamMb / 1024), total: Math.round(node.totalRamMb / 1024), unit: ' GB' },
                        { icon: <HardDrive size={13} />, label: 'Dysk', used: totalUsedDiskGb, total: node.totalDiskGb, unit: ' GB' },
                      ].map(r => {
                        const pct = r.total ? Math.round((r.used / r.total) * 100) : 0;
                        return (
                          <div key={r.label} style={{ background: 'var(--bg-input)', borderRadius: 8, padding: '8px 10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', marginBottom: 4 }}>
                              {r.icon} {r.label}
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.used}/{r.total}{r.unit}</div>
                            <div style={{ height: 3, borderRadius: 2, background: 'var(--border-primary)', marginTop: 4 }}>
                              <div style={{ height: '100%', borderRadius: 2, width: `${pct}%`, background: pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#22c55e', transition: 'width .3s' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    </>
                      );
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>

          {store.nodes.length === 0 && (
            <div className="dash-card" style={{ textAlign: 'center', padding: '48px 24px', marginTop: 12 }}>
              <Server size={48} style={{ color: 'var(--text-secondary)', opacity: 0.4, marginBottom: 12 }} />
              <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Brak Node'ów</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 400, margin: '0 auto' }}>
                Dodaj swój pierwszy node, aby serwery klientów otrzymywały prawdziwe IP. Przeczytaj poradnik w zakładce "Poradnik hostingu".
              </p>
            </div>
          )}

          {/* Add Node Modal */}
          {showAdd && (
            <div className="modal-overlay" onClick={() => setShowAdd(false)}>
              <div className="dash-card modal-card" style={{ width: '100%', maxWidth: 520 }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontWeight: 700 }}>Dodaj nowy Node</h3>
                  <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>
                <div style={{ display: 'grid', gap: 14 }}>
                  <div><label className="dash-label">Nazwa Node'a</label>
                    <input className="dash-input" placeholder="np. Node-PL-01" value={name} onChange={e => setName(e.target.value)} /></div>
                  <div><label className="dash-label">Adres IP</label>
                    <input className="dash-input" placeholder="np. 185.238.72.10" value={ip} onChange={e => setIp(e.target.value)} /></div>
                  <div><label className="dash-label">Lokalizacja</label>
                    <input className="dash-input" placeholder="np. Warszawa, PL" value={location} onChange={e => setLocation(e.target.value)} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <div><label className="dash-label">CPU (rdzenie)</label>
                      <input className="dash-input" type="number" value={totalCpu} onChange={e => setTotalCpu(e.target.value)} /></div>
                    <div><label className="dash-label">RAM (MB)</label>
                      <input className="dash-input" type="number" value={totalRam} onChange={e => setTotalRam(e.target.value)} /></div>
                    <div><label className="dash-label">Dysk (GB)</label>
                      <input className="dash-input" type="number" value={totalDisk} onChange={e => setTotalDisk(e.target.value)} /></div>
                  </div>
                  <div><label className="dash-label">Max serwerów (0 = bez limitu)</label>
                    <input className="dash-input" type="number" min="0" value={maxServers} onChange={e => setMaxServers(e.target.value)} /></div>
                  <button className="btn btn--primary" onClick={handleAdd} style={{ padding: '12px', marginTop: 4 }}>
                    <Plus size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Dodaj Node
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ HOSTING GUIDE TAB ═══ */}
      {tab === 'guide' && (
        <div style={{ maxWidth: 820 }}>
          <div className="dash-card" style={{ padding: 20, marginBottom: 16, background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))', borderColor: 'rgba(99,102,241,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Info size={20} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Jak uruchomić pełnoprawny hosting?</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Ten poradnik przeprowadzi Cię przez cały proces konfiguracji infrastruktury hostingowej. Potrzebujesz serwera dedykowanego (VPS/dedyk) z Linuxem.
                </p>
              </div>
            </div>
          </div>

          <GuideSection id="requirements" title="1. Wymagania sprzętowe" icon={<Server size={16} style={{ color: '#6366f1' }} />}>
            <p><strong>Minimalne wymagania na Node:</strong></p>
            <ul style={{ paddingLeft: 20, marginTop: 6, display: 'grid', gap: 4 }}>
              <li>System operacyjny: <strong>Ubuntu 22.04 LTS</strong> lub <strong>Debian 12</strong></li>
              <li>CPU: minimum <strong>4 rdzenie</strong> (zalecane 8+)</li>
              <li>RAM: minimum <strong>16 GB</strong> (zalecane 32 GB+)</li>
              <li>Dysk: minimum <strong>200 GB SSD</strong> (zalecane NVMe)</li>
              <li>Sieć: <strong>1 Gbit/s</strong> z dedykowanym IPv4</li>
              <li>Dostęp root przez SSH</li>
            </ul>
            <p style={{ marginTop: 12 }}><strong>Rekomendowani dostawcy serwerów:</strong></p>
            <ul style={{ paddingLeft: 20, marginTop: 6, display: 'grid', gap: 2 }}>
              <li>OVH / OVHcloud (dobre ceny w EU)</li>
              <li>Hetzner (najlepsza jakość/cena)</li>
              <li>Contabo (budżetowo)</li>
              <li>Netcup (Niemcy)</li>
            </ul>
          </GuideSection>

          <GuideSection id="setup-os" title="2. Konfiguracja systemu" icon={<HardDrive size={16} style={{ color: '#22c55e' }} />}>
            <p>Po zakupie serwera, zaloguj się przez SSH i wykonaj poniższe komendy:</p>
            <CodeBlock lang="bash" code={`# Aktualizacja systemu
sudo apt update && sudo apt upgrade -y

# Instalacja wymaganych pakietów
sudo apt install -y curl wget git nano ufw software-properties-common

# Konfiguracja firewalla
sudo ufw allow 22/tcp        # SSH
sudo ufw allow 80/tcp        # HTTP
sudo ufw allow 443/tcp       # HTTPS
sudo ufw allow 3306/tcp      # MySQL
sudo ufw allow 8080/tcp      # phpMyAdmin
sudo ufw allow 30120:30200/tcp  # FiveM game ports
sudo ufw allow 30120:30200/udp  # FiveM game ports (UDP)
sudo ufw allow 40120:40200/tcp  # txAdmin ports
sudo ufw allow 25565:25600/tcp  # Minecraft ports
sudo ufw enable`} />
          </GuideSection>

          <GuideSection id="docker" title="3. Instalacja Docker" icon={<Server size={16} style={{ color: '#3b82f6' }} />}>
            <p>Docker pozwala izolować serwery klientów w kontenerach:</p>
            <CodeBlock lang="bash" code={`# Instalacja Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Dodanie użytkownika do grupy docker
sudo usermod -aG docker $USER

# Sprawdzenie instalacji
docker --version
docker compose version`} />
            <p style={{ marginTop: 12 }}>Następnie zainstaluj <strong>Portainer</strong> do zarządzania kontenerami przez GUI:</p>
            <CodeBlock lang="bash" code={`# Instalacja Portainer
sudo docker volume create portainer_data
sudo docker run -d -p 9443:9443 -p 9000:9000 \\
  --name portainer --restart=always \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -v portainer_data:/data \\
  portainer/portainer-ce:latest`} />
            <p style={{ marginTop: 8 }}>Panel Portainer będzie dostępny pod: <code>https://IP_SERWERA:9443</code></p>
          </GuideSection>

          <GuideSection id="wings" title="4. Instalacja Wings (Panel Game)" icon={<Cpu size={16} style={{ color: '#f97316' }} />}>
            <p>Wings to daemon od Pterodactyl, który zarządza serwerami gier. Jest to opcjonalny krok, ale mocno zalecany:</p>
            <CodeBlock lang="bash" code={`# Tworzenie katalogu
sudo mkdir -p /etc/pterodactyl
sudo mkdir -p /srv/daemon-data

# Pobieranie Wings
sudo curl -L -o /usr/local/bin/wings \\
  "https://github.com/pterodactyl/wings/releases/latest/download/wings_linux_amd64"
sudo chmod u+x /usr/local/bin/wings`} />
            <p style={{ marginTop: 12 }}>Utwórz plik konfiguracji Wings:</p>
            <CodeBlock lang="bash" code={`sudo nano /etc/pterodactyl/config.yml`} />
            <p style={{ marginTop: 8 }}>Wklej konfigurację wygenerowaną z panelu Pterodactyl.</p>
            <CodeBlock lang="bash" code={`# Uruchomienie Wings jako serwis
sudo tee /etc/systemd/system/wings.service << 'EOF'
[Unit]
Description=Pterodactyl Wings Daemon
After=docker.service
Requires=docker.service
PartOf=docker.service

[Service]
User=root
WorkingDirectory=/etc/pterodactyl
LimitNOFILE=4096
PIDFile=/var/run/wings/daemon.pid
ExecStart=/usr/local/bin/wings
Restart=on-failure
StartLimitInterval=180
StartLimitBurst=30
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now wings`} />
          </GuideSection>

          <GuideSection id="mysql" title="5. Instalacja MySQL/MariaDB" icon={<HardDrive size={16} style={{ color: '#8b5cf6' }} />}>
            <p>Bazy danych są niezbędne dla serwerów FiveM (np. dla ESX/QBCore):</p>
            <CodeBlock lang="bash" code={`# Instalacja MariaDB
sudo apt install -y mariadb-server

# Zabezpieczenie instalacji
sudo mysql_secure_installation
# (Ustaw hasło root, odpowiedz Y na wszystkie pytania)

# Logowanie do MySQL
sudo mysql -u root -p

# Tworzenie użytkownika dla panelu hostingowego
CREATE USER 'svnhost'@'%' IDENTIFIED BY 'TwojeSilneHaslo123!';
GRANT ALL PRIVILEGES ON *.* TO 'svnhost'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;`} />
            <p style={{ marginTop: 8 }}>Umożliwienie zdalnych połączeń:</p>
            <CodeBlock lang="bash" code={`# Edycja konfiguracji MariaDB
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf

# Zmień bind-address na:
bind-address = 0.0.0.0

# Restart
sudo systemctl restart mariadb`} />
          </GuideSection>

          <GuideSection id="fivem" title="6. Konfiguracja FiveM Servers" icon={<Globe size={16} style={{ color: '#f97316' }} />}>
            <p>Każdy serwer FiveM klienta automatycznie dostaje rekomendowane pliki. Aby ręcznie przygotować artefakty:</p>
            <CodeBlock lang="bash" code={`# Tworzenie katalogu na artefakty FiveM
sudo mkdir -p /opt/fivem/artifacts

# Pobieranie artefaktów FiveM
# Sprawdź najnowszy build na: https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/
cd /opt/fivem/artifacts
sudo wget -O fx.tar.xz "https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/25770-8ddccd4e4dfd6a760ce18651656463f961cc4761/fx.tar.xz"

# Rozpakowanie
sudo tar -xf fx.tar.xz
sudo chmod +x run.sh

# Tworzenie katalogu na dane serwera
sudo mkdir -p /opt/fivem/servers`} />
            <p style={{ marginTop: 12 }}><strong>Automatyczne przydzielanie portów:</strong></p>
            <ul style={{ paddingLeft: 20, marginTop: 6, display: 'grid', gap: 2 }}>
              <li>Pierwszy serwer FiveM: <strong>port 30120</strong>, txAdmin: <strong>port 40120</strong></li>
              <li>Drugi serwer FiveM: <strong>port 30121</strong>, txAdmin: <strong>port 40121</strong></li>
              <li>I tak dalej...</li>
            </ul>
          </GuideSection>

          <GuideSection id="connecting" title="7. Podłączanie Node'a do panelu" icon={<Network size={16} style={{ color: '#ec4899' }} />}>
            <p>Aby podłączyć nowy Node do tego panelu hostingowego:</p>
            <ol style={{ paddingLeft: 20, marginTop: 8, display: 'grid', gap: 8 }}>
              <li>Przejdź do zakładki <strong>"Node'y"</strong> powyżej</li>
              <li>Kliknij <strong>"Dodaj Node"</strong></li>
              <li>Podaj <strong>nazwę</strong>, <strong>IP serwera</strong>, <strong>lokalizację</strong> i <strong>zasoby</strong></li>
              <li>Na serwerze zainstaluj agenta panelu (opcjonalnie Wings)</li>
              <li>Po dodaniu node'a, nowe serwery klientów będą automatycznie przydzielane do node'ów z dostępnymi zasobami</li>
            </ol>
            <div style={{ marginTop: 16, padding: 14, background: 'rgba(34,197,94,0.06)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.15)' }}>
              <p style={{ fontWeight: 600, color: '#22c55e', marginBottom: 4 }}>✓ Testowanie lokalne</p>
              <p>Jeśli nie masz jeszcze node'a, panel automatycznie przydziela IP <strong>127.0.0.1</strong> (localhost) do serwerów. Możesz testować cały panel na swoim komputerze bez dedykowanego serwera.</p>
            </div>
          </GuideSection>

          <GuideSection id="ssl" title="8. Certyfikat SSL (HTTPS)" icon={<Globe size={16} style={{ color: '#0ea5e9' }} />}>
            <p>Zainstaluj darmowy certyfikat SSL od Let's Encrypt:</p>
            <CodeBlock lang="bash" code={`# Instalacja Certbot
sudo apt install -y certbot

# Generowanie certyfikatu (zamień twojadomena.pl)
sudo certbot certonly --standalone -d twojadomena.pl -d www.twojadomena.pl

# Auto-renewal
sudo certbot renew --dry-run`} />
          </GuideSection>
        </div>
      )}

      {/* ═══ DEPLOY & DOMAIN TAB ═══ */}
      {tab === 'deploy' && (
        <div style={{ maxWidth: 820 }}>
          <div className="dash-card" style={{ padding: 20, marginBottom: 16, background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(59,130,246,0.05))', borderColor: 'rgba(99,102,241,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Globe size={20} style={{ color: '#6366f1', flexShrink: 0, marginTop: 2 }} />
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Poradnik: Postawienie strony z domeną</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Ten poradnik przeprowadzi Cię przez cały proces wdrożenia strony głównej (landing page) oraz panelu zarządzania na własnej domenie z certyfikatem SSL.
                </p>
              </div>
            </div>
          </div>

          <GuideSection id="deploy-req" title="1. Wymagania i instalacja" icon={<Server size={16} style={{ color: '#6366f1' }} />}>
            <CodeBlock lang="bash" code={`# Aktualizacja systemu
sudo apt update && sudo apt upgrade -y

# Usuń stare paczki Node (jeśli są)
sudo apt remove -y libnode-dev libnode72 nodejs 2>/dev/null
sudo apt autoremove -y

# Instalacja Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalacja Nginx + narzędzi
sudo apt install -y nginx git curl

# Sprawdź wersje (node musi być 20+)
node -v
npm -v
nginx -v`} />
          </GuideSection>

          <GuideSection id="deploy-dns" title="2. Konfiguracja DNS" icon={<Globe size={16} style={{ color: '#22c55e' }} />}>
            <CodeBlock lang="dns" code={`# W panelu domeny (OVH / Cloudflare / home.pl) dodaj:

Typ: A   |  Nazwa: @    |  Wartość: IP_TWOJEGO_SERWERA  |  TTL: 3600
Typ: A   |  Nazwa: www  |  Wartość: IP_TWOJEGO_SERWERA  |  TTL: 3600`} />
            <CodeBlock lang="bash" code={`# Sprawdź czy DNS działa (po kilku minutach)
dig +short twojadomena.pl
dig +short www.twojadomena.pl`} />
          </GuideSection>

          <GuideSection id="deploy-build" title="3. Klonowanie i build frontendu" icon={<HardDrive size={16} style={{ color: '#f97316' }} />}>
            <CodeBlock lang="bash" code={`# Klonuj repo
cd ~
git clone https://github.com/prodorzech/strona-svnhost.git
cd ~/strona-svnhost

# Instalacja zależności
npm install

# Utwórz .env z adresem backendu
cat > .env << 'EOF'
VITE_API_URL=https://twojadomena.pl/api
VITE_WS_URL=https://twojadomena.pl
EOF

# Build
npm run build

# Skopiuj pliki na serwer www
sudo mkdir -p /var/www/svnhost
sudo cp -r dist/* /var/www/svnhost/
sudo chown -R www-data:www-data /var/www/svnhost`} />
          </GuideSection>

          <GuideSection id="deploy-backend" title="4. Build i uruchomienie backendu" icon={<Cpu size={16} style={{ color: '#ec4899' }} />}>
            <CodeBlock lang="bash" code={`# Build backendu
cd ~/strona-svnhost/backend
npm install
npm rebuild better-sqlite3
npm run build

# Utwórz serwis systemd (sudo tee, NIE sudo cat >)
sudo tee /etc/systemd/system/svnhost-backend.service << 'EOF'
[Unit]
Description=SVNHost Backend API
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME/strona-svnhost/backend
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
EOF

# Włącz i uruchom
sudo systemctl daemon-reload
sudo systemctl enable --now svnhost-backend

# Sprawdź
sudo systemctl status svnhost-backend
sudo journalctl -u svnhost-backend -n 20 --no-pager`} />
          </GuideSection>

          <GuideSection id="deploy-nginx" title="5. Konfiguracja Nginx" icon={<Globe size={16} style={{ color: '#3b82f6' }} />}>
            <CodeBlock lang="bash" code={`# Utwórz konfigurację Nginx (sudo tee, NIE sudo cat >)
sudo tee /etc/nginx/sites-available/svnhost << 'NGINX'
server {
    listen 80;
    server_name twojadomena.pl www.twojadomena.pl;

    root /var/www/svnhost;
    index index.html;

    # React SPA — fallback na index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
    }

    # WebSocket (Socket.IO)
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # Cache statycznych plików
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)\$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

# Aktywuj i zrestartuj
sudo ln -sf /etc/nginx/sites-available/svnhost /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx`} />
          </GuideSection>

          <GuideSection id="deploy-ssl" title="6. Certyfikat SSL (HTTPS)" icon={<CheckCircle2 size={16} style={{ color: '#22c55e' }} />}>
            <CodeBlock lang="bash" code={`# Instalacja Certbot
sudo apt install -y certbot python3-certbot-nginx

# Wygeneruj certyfikat i skonfiguruj Nginx automatycznie
sudo certbot --nginx -d twojadomena.pl -d www.twojadomena.pl

# Sprawdź auto-odnowienie
sudo certbot renew --dry-run

# Gotowe — strona działa na https://twojadomena.pl`} />
          </GuideSection>

          <GuideSection id="deploy-update" title="7. Aktualizacja strony" icon={<Info size={16} style={{ color: '#f59e0b' }} />}>
            <CodeBlock lang="bash" code={`# Aktualizacja frontendu
cd ~/strona-svnhost
git pull
npm install
npm run build
sudo cp -r dist/* /var/www/svnhost/

# Aktualizacja backendu
cd ~/strona-svnhost/backend
npm install
npm rebuild better-sqlite3
npm run build
sudo systemctl restart svnhost-backend

# Sprawdź status
sudo systemctl status svnhost-backend`} />
          </GuideSection>

          <GuideSection id="deploy-all" title="⚡ Szybki deploy — wszystko w jednym" icon={<Server size={16} style={{ color: '#6366f1' }} />}>
            <CodeBlock lang="bash" code={`# === CAŁY DEPLOY OD ZERA (kopiuj-wklej) ===

# 1. Instalacja
sudo apt update && sudo apt upgrade -y
sudo apt remove -y libnode-dev libnode72 nodejs 2>/dev/null
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git certbot python3-certbot-nginx

# 2. Klonuj repo
cd ~
git clone https://github.com/prodorzech/strona-svnhost.git
cd ~/strona-svnhost

# 3. Frontend
cat > .env << 'EOF'
VITE_API_URL=https://TWOJADOMENA.pl/api
VITE_WS_URL=https://TWOJADOMENA.pl
EOF
npm install
npm run build
sudo mkdir -p /var/www/svnhost
sudo cp -r dist/* /var/www/svnhost/
sudo chown -R www-data:www-data /var/www/svnhost

# 4. Backend
cd ~/strona-svnhost/backend
npm install
npm rebuild better-sqlite3
npm run build

sudo tee /etc/systemd/system/svnhost-backend.service << 'EOF'
[Unit]
Description=SVNHost Backend API
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME/strona-svnhost/backend
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now svnhost-backend

# 5. Nginx
sudo tee /etc/nginx/sites-available/svnhost << 'NGINX'
server {
    listen 80;
    server_name TWOJADOMENA.pl www.TWOJADOMENA.pl;
    root /var/www/svnhost;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
    }
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)\$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

NGINX

sudo ln -sf /etc/nginx/sites-available/svnhost /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 6. SSL
sudo certbot --nginx -d TWOJADOMENA.pl -d www.TWOJADOMENA.pl

# Gotowe! Strona: https://TWOJADOMENA.pl`} />
          </GuideSection>
        </div>
      )}

      {/* ═══ PHPMYADMIN TAB ═══ */}
      {tab === 'phpmyadmin' && (
        <div style={{ maxWidth: 820 }}>
          <div className="dash-card" style={{ padding: 20, marginBottom: 16, background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(234,179,8,0.05))', borderColor: 'rgba(249,115,22,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <HardDrive size={20} style={{ color: '#f97316', flexShrink: 0, marginTop: 2 }} />
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Poradnik: phpMyAdmin</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  phpMyAdmin pozwala klientom zarządzać bazami danych MySQL przez przeglądarkę. Poniżej znajdziesz instrucję instalacji i konfiguracji.
                </p>
              </div>
            </div>
          </div>

          <GuideSection id="pma-install" title="1. Instalacja phpMyAdmin" icon={<HardDrive size={16} style={{ color: '#f97316' }} />}>
            <p>Najłatwiej zainstalować phpMyAdmin przez Docker:</p>
            <CodeBlock lang="bash" code={`# phpMyAdmin przez Docker
docker run -d \\
  --name phpmyadmin \\
  --restart always \\
  -p 8080:80 \\
  -e PMA_ARBITRARY=1 \\
  -e PMA_HOST=HOST_MYSQL \\
  -e PMA_PORT=3306 \\
  -e UPLOAD_LIMIT=100M \\
  phpmyadmin/phpmyadmin:latest`} />
            <p style={{ marginTop: 8 }}>
              Zamień <code>HOST_MYSQL</code> na IP serwera MySQL (zazwyczaj <code>127.0.0.1</code> jeśli MySQL jest na tym samym serwerze).
            </p>
            <p style={{ marginTop: 8 }}>phpMyAdmin będzie dostępny pod: <code>http://IP_SERWERA:8080</code></p>
          </GuideSection>

          <GuideSection id="pma-alt" title="2. Alternatywa: apt install" icon={<Globe size={16} style={{ color: '#3b82f6' }} />}>
            <p>Możesz też zainstalować phpMyAdmin tradycyjnie z apt:</p>
            <CodeBlock lang="bash" code={`# Instalacja
sudo apt install -y phpmyadmin php-mbstring php-zip php-gd php-json php-curl

# Podczas instalacji:
# - Wybierz "apache2" jako web server
# - Wybierz "Yes" na konfigurację z dbconfig-common
# - Podaj hasło root MySQL i ustaw hasło dla phpMyAdmin

# Konfiguracja Apache
sudo phpenmod mbstring
sudo systemctl restart apache2

# phpMyAdmin dostępny pod: http://IP_SERWERA/phpmyadmin`} />
          </GuideSection>

          <GuideSection id="pma-nginx" title="3. Konfiguracja z Nginx + SSL" icon={<Globe size={16} style={{ color: '#22c55e' }} />}>
            <p>Jeśli używasz Nginx zamiast Apache:</p>
            <CodeBlock lang="bash" code={`# Instalacja Nginx + PHP
sudo apt install -y nginx php-fpm php-mysql

# Pobierz phpMyAdmin ręcznie
cd /usr/share
wget https://www.phpmyadmin.net/downloads/phpMyAdmin-latest-all-languages.tar.gz
tar -xzf phpMyAdmin-latest-all-languages.tar.gz
mv phpMyAdmin-*-all-languages phpmyadmin
rm phpMyAdmin-latest-all-languages.tar.gz`} />
            <p style={{ marginTop: 8 }}>Konfiguracja Nginx:</p>
            <CodeBlock lang="nginx" code={`# /etc/nginx/sites-available/phpmyadmin
server {
    listen 8080;
    server_name _;
    root /usr/share/phpmyadmin;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }
}`} />
            <CodeBlock lang="bash" code={`# Aktywacja
sudo ln -s /etc/nginx/sites-available/phpmyadmin /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx`} />
          </GuideSection>

          <GuideSection id="pma-panel" title="4. Podłączenie do panelu SVNHost" icon={<Network size={16} style={{ color: '#8b5cf6' }} />}>
            <p>Po zainstalowaniu phpMyAdmin, podłącz go do panelu:</p>
            <ol style={{ paddingLeft: 20, marginTop: 8, display: 'grid', gap: 8 }}>
              <li>Przejdź do <strong>Admin → Ustawienia</strong></li>
              <li>W sekcji <strong>"phpMyAdmin"</strong> wklej URL (np. <code>http://185.238.72.10:8080</code>)</li>
              <li>Włącz opcję <strong>"phpMyAdmin aktywny"</strong></li>
              <li>Od teraz klienci zobaczą przycisk <strong>"Otwórz phpMyAdmin"</strong> w zakładce baz danych na swoich serwerach</li>
            </ol>
            <div style={{ marginTop: 14, padding: 14, background: 'rgba(99,102,241,0.06)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.15)' }}>
              <p style={{ fontWeight: 600, color: '#6366f1', marginBottom: 4 }}>💡 Wskazówka bezpieczeństwa</p>
              <p>Zalecamy umieszczenie phpMyAdmin za reverse proxy z certyfikatem SSL oraz ustawienie <code>AllowDeny</code> rules, aby ograniczyć dostęp tylko do IP klientów.</p>
            </div>
          </GuideSection>
        </div>
      )}
    </div>
  );
}

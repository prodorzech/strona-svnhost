import { useState } from 'react';
import { useStoreState } from '../../store/useStore';
import { addNode, updateNode, removeNode } from '../../store/store';
import type { HostingNode } from '../../store/types';
import {
  Network, Plus, Trash2, Edit3, X, Check, AlertTriangle,
  Server, HardDrive, Cpu, MemoryStick, Globe, BookOpen, Database, Lock, Key,
  ChevronDown, ChevronRight, Copy, CheckCircle2, Info,
} from 'lucide-react';
import { CustomSelect } from '../../components/CustomSelect';

type Tab = 'nodes' | 'guide' | 'deploy' | 'database' | 'phpmyadmin';

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
          { key: 'database' as Tab, label: 'Baza danych', icon: <Database size={15} /> },
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
                  Potrzebujesz VPS/dedyk z Ubuntu 22.04+ (min. 4 CPU, 16 GB RAM, 200 GB SSD, 1 Gbit/s). Zalecani dostawcy: Hetzner, OVH, Contabo, Netcup.
                </p>
              </div>
            </div>
          </div>

          <GuideSection id="all-in-one" title="⚡ Komenda 1 — Pełna instalacja infrastruktury" icon={<Server size={16} style={{ color: '#22c55e' }} />}>
            <p>Jedna komenda: system + firewall + Docker + Portainer + MySQL + FiveM artefakty + Certbot. <strong>Zaloguj się przez SSH jako root i wklej:</strong></p>
            <CodeBlock lang="bash" code={`# ══════════════════════════════════════════════════════
#  SVNHost — pełna instalacja infrastruktury
# ══════════════════════════════════════════════════════

# System + wymagane pakiety
apt update && apt upgrade -y && \\
apt install -y curl wget git nano ufw software-properties-common mariadb-server certbot && \\

# Firewall
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && \\
ufw allow 3306/tcp && ufw allow 8080/tcp && \\
ufw allow 30120:30200/tcp && ufw allow 30120:30200/udp && \\
ufw allow 40120:40200/tcp && ufw allow 25565:25600/tcp && \\
ufw --force enable && \\

# Docker
curl -fsSL https://get.docker.com | sh && \\
usermod -aG docker $USER && \\

# Portainer (GUI do kontenerów → https://IP:9443)
docker volume create portainer_data && \\
docker run -d -p 9443:9443 -p 9000:9000 --name portainer --restart=always \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -v portainer_data:/data portainer/portainer-ce:latest && \\

# MySQL/MariaDB — zabezpieczenie + user svnhost
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'RootHaslo2025'; \\
  CREATE USER IF NOT EXISTS 'svnhost'@'%' IDENTIFIED BY 'SvnHaslo2025'; \\
  GRANT ALL PRIVILEGES ON *.* TO 'svnhost'@'%' WITH GRANT OPTION; \\
  FLUSH PRIVILEGES;" && \\
sed -i 's/^bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mariadb.conf.d/50-server.cnf && \\
systemctl restart mariadb && \\

# FiveM artefakty
mkdir -p /opt/fivem/artifacts /opt/fivem/servers && \\
cd /opt/fivem/artifacts && \\
wget -qO fx.tar.xz "https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/25770-8ddccd4e4dfd6a760ce18651656463f961cc4761/fx.tar.xz" && \\
tar -xf fx.tar.xz && chmod +x run.sh && \\

echo '' && echo '✅ Gotowe: Docker, MySQL, FiveM, Portainer — wszystko zainstalowane.' && \\
echo '🔑 MySQL root haslo: RootHaslo2025  |  user svnhost haslo: SvnHaslo2025' && \\
echo '🌐 Portainer: https://'$(hostname -I | awk '{print $1}')':9443' && \\
echo '⚠️  ZMIEN HASLA MySQL po instalacji.'`} />
            <div style={{ marginTop: 14, padding: 14, background: 'rgba(239,68,68,0.06)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.15)' }}>
              <p style={{ fontWeight: 600, color: '#ef4444', marginBottom: 4 }}>⚠️ Po instalacji zmień hasła MySQL</p>
              <p><code>mysql -u root -p'RootHaslo2025'</code> → <code>ALTER USER 'root'@'localhost' IDENTIFIED BY 'TWOJE_NOWE_HASLO';</code></p>
            </div>
          </GuideSection>

          <GuideSection id="wings-cmd" title="⚡ Komenda 2 — Wings / Pterodactyl (opcjonalnie)" icon={<Cpu size={16} style={{ color: '#f97316' }} />}>
            <p>Jeśli chcesz używać Pterodactyl Wings do zarządzania serwerami gier:</p>
            <CodeBlock lang="bash" code={`# ══════════════════════════════════════════════════════
#  Wings (Pterodactyl) — daemon do zarządzania serwerami
# ══════════════════════════════════════════════════════

mkdir -p /etc/pterodactyl /srv/daemon-data && \\
curl -L -o /usr/local/bin/wings \\
  "https://github.com/pterodactyl/wings/releases/latest/download/wings_linux_amd64" && \\
chmod u+x /usr/local/bin/wings && \\

# Serwis systemd
cat > /etc/systemd/system/wings.service << 'EOF'
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

systemctl daemon-reload && systemctl enable --now wings && \\
echo "✅ Wings zainstalowany. Wklej config z panelu Pterodactyl do /etc/pterodactyl/config.yml"`} />
          </GuideSection>

          <GuideSection id="ssl-domain" title="⚡ Komenda 3 — SSL + podłączenie Node'a" icon={<Globe size={16} style={{ color: '#0ea5e9' }} />}>
            <p>Certyfikat SSL + podłącz Node w panelu:</p>
            <CodeBlock lang="bash" code={`# ══════════════════════════════════════════════════════
#  SSL (Let's Encrypt) — zamień DOMENA na swoją
# ══════════════════════════════════════════════════════

certbot certonly --standalone -d DOMENA -d www.DOMENA && \\
certbot renew --dry-run && \\
echo "✅ SSL gotowy dla DOMENA"`} />
            <div style={{ marginTop: 14, padding: 14, background: 'rgba(34,197,94,0.06)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.15)' }}>
              <p style={{ fontWeight: 600, color: '#22c55e', marginBottom: 4 }}>📌 Podłączenie Node'a do panelu</p>
              <p>Po instalacji przejdź do zakładki <strong>"Node'y"</strong> → <strong>"Dodaj Node"</strong> → wpisz IP serwera, lokalizację i zasoby. Nowe serwery klientów będą automatycznie przydzielane do node'ów z wolnymi slotami.</p>
            </div>
            <div style={{ marginTop: 10, padding: 14, background: 'rgba(99,102,241,0.06)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.15)' }}>
              <p style={{ fontWeight: 600, color: '#6366f1', marginBottom: 4 }}>🧪 Testowanie lokalne</p>
              <p>Bez node'a panel przydziela IP <strong>127.0.0.1</strong> (localhost). Możesz testować cały panel na swoim komputerze.</p>
            </div>
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

      {/* ═══ DATABASE AUTH TAB ═══ */}
      {tab === 'database' && (
        <div style={{ maxWidth: 820 }}>
          <div className="dash-card" style={{ padding: 20, marginBottom: 16, background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(16,185,129,0.05))', borderColor: 'rgba(34,197,94,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Database size={20} style={{ color: '#22c55e', flexShrink: 0, marginTop: 2 }} />
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Baza danych &mdash; system logowania (SQLite + bcrypt)</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Panel SVNHost używa SQLite (better-sqlite3) jako bazy danych. Logowanie, rejestracja, sesje i użytkownicy są przechowywane w pliku <code>backend/data/svnhost.db</code>. Hasła hashowane bcrypt. Bez MongoDB.
                </p>
              </div>
            </div>
          </div>

          <GuideSection id="db-overview" title="1. Architektura auth" icon={<Info size={16} style={{ color: '#6366f1' }} />}>
            <p>System autoryzacji składa się z:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: 'grid', gap: 6 }}>
              <li><strong>SQLite</strong> &mdash; plik <code>backend/data/svnhost.db</code> (tabele: <code>users</code>, <code>sessions</code>, <code>servers</code>)</li>
              <li><strong>bcryptjs</strong> &mdash; hashowanie haseł (salt rounds: 10)</li>
              <li><strong>Token (UUID)</strong> &mdash; sesje bearer token w nagłówku <code>Authorization</code></li>
              <li><strong>Middleware</strong> &mdash; <code>authMiddleware</code> weryfikuje token, <code>adminMiddleware</code> sprawdza rolę</li>
            </ul>
            <div style={{ marginTop: 14, padding: 14, background: 'rgba(34,197,94,0.06)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.15)' }}>
              <p style={{ fontWeight: 600, color: '#22c55e', marginBottom: 4 }}>✅ Domyślne konto admina</p>
              <p>Przy pierwszym uruchomieniu backendu automatycznie tworzone jest konto:<br/>
              Email: <code>admin@svnhost.pl</code> &mdash; Hasło: <code>admin123</code><br/>
              <strong>Zmień hasło natychmiast po pierwszym logowaniu!</strong></p>
            </div>
          </GuideSection>

          <GuideSection id="db-install" title="2. Instalacja zależności" icon={<Database size={16} style={{ color: '#22c55e' }} />}>
            <CodeBlock lang="bash" code={`cd ~/strona-svnhost/backend

# Wymagane pakiety (powinny być w package.json)
npm install better-sqlite3 bcryptjs
npm install -D @types/better-sqlite3 @types/bcryptjs

# Jeśli zmienisz wersję Node.js:
npm rebuild better-sqlite3`} />
          </GuideSection>

          <GuideSection id="db-tables" title="3. Struktura tabel" icon={<HardDrive size={16} style={{ color: '#f59e0b' }} />}>
            <p>Tabele tworzone automatycznie w <code>initDatabase()</code>:</p>
            <CodeBlock lang="sql" code={`-- Tabela użytkowników
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',    -- 'user' | 'admin'
  balance REAL NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  avatar TEXT,
  fullName TEXT,
  bio TEXT,
  phone TEXT,
  language TEXT DEFAULT 'pl',
  timezone TEXT DEFAULT 'Europe/Warsaw',
  twoFa INTEGER DEFAULT 0,
  loginAlerts INTEGER DEFAULT 0
);

-- Tabela sesji
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,          -- UUID-UUID
  userId TEXT NOT NULL,
  device TEXT,
  browser TEXT,
  ip TEXT,
  location TEXT,
  createdAt TEXT NOT NULL,
  lastActive TEXT NOT NULL,         -- aktualizowane przy każdym req
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);`} />
          </GuideSection>

          <GuideSection id="db-endpoints" title="4. Endpointy API" icon={<Key size={16} style={{ color: '#8b5cf6' }} />}>
            <p>Wszystkie endpointy auth pod <code>/api/auth/</code>:</p>
            <CodeBlock lang="text" code={`# ── Publiczne (bez tokenu) ──────────────────────
POST /api/auth/register     { email, username, password }
  → 201 { user, token }

POST /api/auth/login        { email, password }
  → 200 { user, token }

# ── Chronione (Bearer token) ───────────────────
GET  /api/auth/me
  → 200 { user }

POST /api/auth/logout
  → 200 { message }

POST /api/auth/logout-all
  → 200 { message }   (wyloguj ze wszystkich urządzeń)

PUT  /api/auth/profile      { username?, fullName?, bio?, ... }
  → 200 { user }

POST /api/auth/change-password  { currentPassword, newPassword }
  → 200 { message, token }   (nowy token, stare sesje usunięte)

GET  /api/auth/sessions
  → 200 [ { token, device, browser, ip, lastActive } ]

# ── Admin only ─────────────────────────────────
GET    /api/auth/admin/users
GET    /api/auth/admin/users/:id
PUT    /api/auth/admin/users/:id   { role?, balance?, username? }
DELETE /api/auth/admin/users/:id`} />
          </GuideSection>

          <GuideSection id="db-frontend" title="5. Frontend — jak działa logowanie" icon={<Lock size={16} style={{ color: '#ef4444' }} />}>
            <p>Flow logowania po stronie frontendu:</p>
            <CodeBlock lang="typescript" code={`// 1. Login.tsx — wysyła request do backendu
const res = await backendApi.auth.login(email, password);
if (res.success && res.data) {
  setToken(res.data.token);              // zapisz token w localStorage
  setCurrentUserFromApi(res.data.user);  // cache user w store
  navigate('/dashboard');
}

// 2. Każdy request do API automatycznie dodaje token:
// backendApi.ts → apiCall() → headers['Authorization'] = 'Bearer <token>'

// 3. Na odświeżenie strony — App.tsx:
useEffect(() => {
  if (!getToken()) return;
  loadCurrentUser().finally(() => setAuthLoading(false));
}, []);
// loadCurrentUser() wywołuje GET /api/auth/me z zapisanym tokenem

// 4. Wylogowanie:
export function logout() {
  backendApi.auth.logout();  // DELETE sesji w bazie
  clearToken();              // usuń z localStorage
  state.currentUserId = null;
}`} />
          </GuideSection>

          <GuideSection id="db-middleware" title="6. Middleware — zabezpieczanie endpointów" icon={<Lock size={16} style={{ color: '#f97316' }} />}>
            <p>Jak chronić własne endpointy:</p>
            <CodeBlock lang="typescript" code={`// backend/src/authMiddleware.ts
import { authMiddleware, adminMiddleware, AuthRequest } from './authMiddleware';

// Endpoint wymaga logowania:
router.get('/my-data', authMiddleware, (req: AuthRequest, res) => {
  // req.user — zalogowany użytkownik (SafeUser)
  // req.token — aktualny token sesji
  res.json({ user: req.user });
});

// Endpoint wymaga admina:
router.delete('/dangerous',
  authMiddleware,      // najpierw: czy zalogowany?
  adminMiddleware,     // potem: czy admin?
  (req: AuthRequest, res) => {
    // tylko admin dotrze tutaj
  }
);`} />
          </GuideSection>

          <GuideSection id="db-test" title="7. Testowanie z curl" icon={<Copy size={16} style={{ color: '#06b6d4' }} />}>
            <CodeBlock lang="bash" code={`# ── Rejestracja ─────────────────────────────────
curl -X POST http://localhost:3001/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@test.pl","username":"TestUser","password":"test123"}'

# ── Logowanie ───────────────────────────────────
curl -X POST http://localhost:3001/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@svnhost.pl","password":"admin123"}'
# → {"success":true,"data":{"user":{...},"token":"abc-123-..."}}

# ── Sprawdź sesję (podmień TOKEN) ───────────────
curl http://localhost:3001/api/auth/me \\
  -H "Authorization: Bearer TOKEN"

# ── Lista użytkowników (admin) ──────────────────
curl http://localhost:3001/api/auth/admin/users \\
  -H "Authorization: Bearer ADMIN_TOKEN"

# ── Wylogowanie ─────────────────────────────────
curl -X POST http://localhost:3001/api/auth/logout \\
  -H "Authorization: Bearer TOKEN"`} />
          </GuideSection>

          <GuideSection id="db-files" title="8. Pliki systemu auth" icon={<Server size={16} style={{ color: '#64748b' }} />}>
            <CodeBlock lang="text" code={`backend/
├── data/
│   └── svnhost.db              ← plik SQLite (tworzony automatycznie)
├── src/
│   ├── database.ts             ← initDatabase(), tabele, CRUD users/sessions
│   ├── authMiddleware.ts       ← authMiddleware, adminMiddleware
│   ├── authRoutes.ts           ← POST /register, /login, GET /me, etc.
│   ├── index.ts                ← app.use('/api/auth', authRouter)
│   └── routes.ts               ← pozostałe endpointy (serwery, pliki...)

src/
├── services/
│   └── backendApi.ts           ← backendApi.auth.*, token management
├── store/
│   └── store.ts                ← loadCurrentUser(), setCurrentUserFromApi()
├── pages/auth/
│   ├── Login.tsx               ← async login via backendApi
│   └── Register.tsx            ← async register via backendApi
└── App.tsx                     ← loadCurrentUser() on startup`} />
          </GuideSection>

          <GuideSection id="db-backup" title="9. Backup bazy danych" icon={<HardDrive size={16} style={{ color: '#22c55e' }} />}>
            <CodeBlock lang="bash" code={`# ── Backup ──────────────────────────────────────
cp ~/strona-svnhost/backend/data/svnhost.db ~/backup-svnhost-$(date +%Y%m%d).db

# ── Automatyczny backup (cron, codziennie o 3:00) ──
crontab -e
# Dodaj linię:
0 3 * * * cp /home/ubuntu/strona-svnhost/backend/data/svnhost.db /home/ubuntu/backups/svnhost-$(date +\%Y\%m\%d).db

# ── Przywracanie ────────────────────────────────
sudo systemctl stop svnhost-backend
cp ~/backup-svnhost-20260217.db ~/strona-svnhost/backend/data/svnhost.db
sudo systemctl start svnhost-backend

# ── Podgląd bazy z terminala ────────────────────
sqlite3 ~/strona-svnhost/backend/data/svnhost.db
.tables
SELECT id, email, username, role FROM users;
SELECT token, userId, lastActive FROM sessions;
.quit`} />
          </GuideSection>

          <GuideSection id="db-security" title="10. Bezpieczeństwo — co zmienić na produkcji" icon={<AlertTriangle size={16} style={{ color: '#ef4444' }} />}>
            <CodeBlock lang="bash" code={`# 1. ZMIEŃ hasło admina natychmiast po deploy:
#    Zaloguj się jako admin@svnhost.pl / admin123
#    → Ustawienia → Zmień hasło

# 2. Plik bazy NIE powinien być w git:
echo "backend/data/" >> .gitignore

# 3. Uprawnienia pliku bazy:
chmod 600 ~/strona-svnhost/backend/data/svnhost.db

# 4. Opcjonalnie — wyłącz rejestrację otwartą:
#    W authRoutes.ts, w POST /register dodaj:
#    if (!ALLOW_REGISTRATION) return res.status(403).json(...);

# 5. Rate limiting (ochrona przed brute-force):
npm install express-rate-limit
# W index.ts:
import rateLimit from 'express-rate-limit';
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minut
  max: 20,                    // max 20 prób
  message: { success: false, error: 'Za dużo prób, spróbuj później' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);`} />
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

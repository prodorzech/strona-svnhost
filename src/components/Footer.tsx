import { useApp } from '../context';
import { Heart } from 'lucide-react';
import { getCurrentUser } from '../store/store';
import { getLogoForAccent } from '../utils/logo';
import './Footer.css';

export function Footer() {
  const { t } = useApp();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <a href="#" className="footer__logo">
              <img src={getLogoForAccent(getCurrentUser()?.settings?.accentColor)} alt="SVNHost" className="footer__logo-img" />
            </a>
            <p className="footer__desc">{t.footer.description}</p>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">{t.footer.company}</h4>
            <ul>
              {t.footer.companyLinks.map((link: { label: string; href: string }, i: number) => (
                <li key={i}>
                  <a href={link.href} className="footer__link">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">{t.footer.offer}</h4>
            <ul>
              {t.footer.offerLinks.map((link: { label: string; href: string }, i: number) => (
                <li key={i}>
                  <a href={link.href} className="footer__link">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">{t.footer.contact}</h4>
            <ul>
              {t.footer.contactInfo.map((info: string, i: number) => (
                <li key={i} className="footer__contact-item">{info}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>{t.footer.copyright}</p>
          <p className="footer__made">
            Made with <Heart size={14} className="footer__heart" /> by SVNHost
          </p>
        </div>
      </div>
    </footer>
  );
}

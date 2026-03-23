import { motion } from 'framer-motion'

interface Props {
  onClose: () => void
}

export default function PrivacyPolicy({ onClose }: Props) {
  return (
    <div className="policy-overlay">
      <motion.div
        className="policy-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="policy-header">
          <h2>Integritetspolicy</h2>
          <button className="policy-close" onClick={onClose}>✕</button>
        </div>
        <div className="policy-body">
          <p className="policy-updated">Senast uppdaterad: mars 2026</p>

          <h3>Vem är ansvarig?</h3>
          <p>Doxtail (organisationsnummer ej tillgängligt) är personuppgiftsansvarig för de uppgifter du lämnar i Vitalize.</p>

          <h3>Vilka uppgifter samlar vi in?</h3>
          <ul>
            <li>E-postadress (för inloggning)</li>
            <li>Ålder, kön, vikt och längd (för att beräkna rekommendationer)</li>
            <li>Hälsomål och daglig logg över kosttillskott</li>
          </ul>

          <h3>Varför samlar vi in uppgifterna?</h3>
          <p>Uppgifterna används uteslutande för att ge dig personliga rekommendationer och spara din dagliga logg. Vi säljer aldrig dina uppgifter till tredje part.</p>

          <h3>Hur länge sparas uppgifterna?</h3>
          <p>Dina uppgifter sparas så länge du har ett aktivt konto. När du raderar ditt konto tas alla uppgifter bort permanent inom 30 dagar.</p>

          <h3>Var lagras uppgifterna?</h3>
          <p>Vi använder Supabase (EU-region) för lagring. Supabase är GDPR-certifierat och tecknat EU Standard Contractual Clauses.</p>

          <h3>Dina rättigheter</h3>
          <ul>
            <li><strong>Rätt till tillgång</strong> — du kan begära ut dina uppgifter</li>
            <li><strong>Rätt till rättelse</strong> — du kan uppdatera din profil när som helst</li>
            <li><strong>Rätt till radering</strong> — du kan radera ditt konto och all data direkt i appen</li>
            <li><strong>Rätt att klaga</strong> — du kan vända dig till Integritetsskyddsmyndigheten (imy.se)</li>
          </ul>

          <h3>Kontakt</h3>
          <p>Frågor om din data? Kontakta oss på <strong>hello@doxtail.se</strong></p>
        </div>
      </motion.div>
    </div>
  )
}

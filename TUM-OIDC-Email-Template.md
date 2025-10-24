# E-Mail Vorlage für TUM IT Support

---

**Betreff:** Aktualisierung der Redirect-URIs für OIDC-Anwendung (Virtual Patient System)

---

Sehr geehrte Damen und Herren,

wir haben unser Virtual Patient System (Virtuelles Patientensystem für die medizinische Ausbildung) auf eine eigene Domain migriert und benötigen eine Aktualisierung der OIDC-Konfiguration.

**Details zur Anwendung:**
- **Client ID:** TUMEAM0-ANAMNESEBOT
- **Anwendungsname:** Virtual Patient System / Anamnese Bot
- **Zweck:** Medizinische Ausbildung (Anamnese-Training mit KI-unterstützten Patientensimulationen)

**Benötigte Änderung:**

Bitte fügen Sie folgende Redirect-URIs zu unserer OIDC-Anwendung hinzu:

```
https://virtual-patients-tum.com/auth/callback
https://www.virtual-patients-tum.com/auth/callback
```

**Bestehende Redirect-URIs bitte beibehalten** (für Übergangsphase und Fallback):

```
https://virtual-patient-system-457056093077.europe-west3.run.app/auth/callback
https://virtual-patient-system-eu-457056093077.europe-west1.run.app/auth/callback
```

**Hintergrund:**
Wir haben das System von der Cloud Run Standard-URL auf unsere neue Domain virtual-patients-tum.com migriert. Die Anwendung läuft weiterhin auf Google Cloud Run und verwendet dieselbe Authentifizierungslogik wie bisher.

**Technische Details:**
- Alle Redirect-URIs verwenden HTTPS
- Die neue Domain ist bereits DNS-konfiguriert und SSL-zertifiziert
- Die OIDC-Integration bleibt ansonsten unverändert

Falls Sie weitere Informationen benötigen oder Rückfragen haben, stehe ich Ihnen gerne zur Verfügung.

Vielen Dank für Ihre Unterstützung!

Mit freundlichen Grüßen

---

**Alternative: Kürzere Version**

---

**Betreff:** OIDC Redirect-URI Update für TUMEAM0-ANAMNESEBOT

Sehr geehrte Damen und Herren,

für unsere OIDC-Anwendung **TUMEAM0-ANAMNESEBOT** (Virtual Patient System) benötigen wir folgende Ergänzungen der Redirect-URIs:

**Neue URIs (hinzufügen):**
- https://virtual-patients-tum.com/auth/callback
- https://www.virtual-patients-tum.com/auth/callback

**Bestehende URIs (beibehalten):**
- https://virtual-patient-system-457056093077.europe-west3.run.app/auth/callback
- https://virtual-patient-system-eu-457056093077.europe-west1.run.app/auth/callback

Hintergrund: Migration auf eigene Domain (virtual-patients-tum.com)

Vielen Dank!

Mit freundlichen Grüßen

---

## Empfohlene Kontaktstelle

**TUM IT Support für OIDC/Identity Management:**
- E-Mail: servicedesk@tum.de
- Portal: https://portal.mytum.de

**Alternative:**
- LRZ Servicedesk (falls OIDC über LRZ verwaltet wird)
- E-Mail: servicedesk@lrz.de

---

## Nachfass-E-Mail (falls keine Antwort nach 3-5 Tagen)

**Betreff:** Erinnerung: OIDC Redirect-URI Update für TUMEAM0-ANAMNESEBOT

Sehr geehrte Damen und Herren,

ich möchte höflich an meine Anfrage vom [Datum] bezüglich der Aktualisierung der Redirect-URIs für unsere OIDC-Anwendung TUMEAM0-ANAMNESEBOT erinnern.

**Zusammenfassung:**
Wir benötigen die Ergänzung folgender Redirect-URIs:
- https://virtual-patients-tum.com/auth/callback
- https://www.virtual-patients-tum.com/auth/callback

Die bestehenden URIs sollen bitte beibehalten werden.

Könnten Sie mir bitte eine Rückmeldung zum aktuellen Status geben?

Vielen Dank und freundliche Grüße

---


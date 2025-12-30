# AV Quote Pro 🚀

Profesionální ERP systém pro AV produkční firmy. Slouží k řízení celého životního cyklu zakázky – od prvotní poptávky, přes kalkulaci nabídky, rezervaci techniky ve skladu (shelf.nu), až po produkční realizaci na místě.

## 🌟 Klíčové Funkce

*   **Inbox & CRM:** Evidence příchozích poptávek (E-maily, telefonáty) a jejich konverze na nabídky.
*   **Chytré Nabídky:**
    *   Automatický výpočet dnů pronájmu.
    *   Podpora měn (CZK, EUR, USD).
    *   Sledování ziskovosti (Marže, Náklady vs. Cena).
    *   Podpora externích sub-rentálů (nezapočítávají se do skladu).
*   **Sklad & Logistika:**
    *   Integrace se **shelf.nu** (Supabase) pro kontrolu dostupnosti a rezervace.
    *   Generování "Pull Sheet" (Výdejky) pro skladníky.
    *   Evidence vozidel a řidičů.
*   **Produkce (Production Hub):**
    *   **Venue Info:** WiFi, parking, kontakty na správce.
    *   **Schedule:** Run of Show (export do *Ontime*).
    *   **Crew:** Správa posádky, kontakty, diety, call times.
    *   **Dokumenty:** Odkazy na Stage ploty, ridery.
*   **Automatizace:**
    *   Notifikace na **Mattermost** při schválení akce.
    *   Export do **Google Kalendáře**.
    *   AI Copilot pro analýzu poptávek (připraveno pro API).

---

## 🛠️ Konfigurace a Nastavení

Po nasazení aplikace (např. na Vercel) je nutné nastavit několik klíčových propojení. To můžete udělat buď přes Environment Variables (doporučeno pro bezpečnost) nebo přímo v aplikaci v sekci **Settings**.

### 1. Shelf.nu (Supabase) – **KRITICKÉ** 🛑
Aby aplikace viděla váš sklad a mohla vytvářet rezervace, musíte ji propojit s databází vašeho self-hosted shelf.nu.

*   **Kde to najdu:** V nastavení vašeho Supabase projektu (`Project Settings -> API`).
*   **Co potřebujete:**
    *   `SUPABASE_URL`: (např. `https://your-project.supabase.co`)
    *   `SUPABASE_ANON_KEY`: (dlouhý řetězec)
*   **Kam to vložit:**
    *   **Možnost A (Vercel):** Nastavte jako Environment Variables `NEXT_PUBLIC_SUPABASE_URL` a `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
    *   **Možnost B (V aplikaci):** Jděte do sekce **Settings** a vložte údaje do formuláře.

### 2. Mattermost (Notifikace) – *Volitelné*
Pokud chcete, aby schválení nabídky poslalo zprávu do chatu.

*   **Co potřebujete:** Incoming Webhook URL.
*   **Jak získat:** V Mattermostu: `Integrations -> Incoming Webhooks -> Add Incoming Webhook`.
*   **Kam to vložit:** V aplikaci v sekci **Settings**.

### 3. AI Copilot (OpenAI) – *Volitelné*
Pro automatickou analýzu emailů v Inboxu.

*   **Stav:** Kód je připraven, ale ve výchozím stavu běží v "Demo módu" (vrací ukázková data).
*   **Jak aktivovat:**
    1.  Otevřete soubor `src/app/api/copilot/parse/route.ts`.
    2.  Odkomentujte sekci `REAL AI IMPLEMENTATION`.
    3.  Vložte svůj `OPENAI_API_KEY`.

---

## 🚀 Jak spustit (Lokálně)

1.  **Klonování:**
    ```bash
    git clone https://github.com/vas-repo/av-quote-pro.git
    cd av-quote-pro
    ```

2.  **Instalace závislostí:**
    ```bash
    npm install
    ```

3.  **Spuštění:**
    ```bash
    npm run dev
    ```
    Aplikace poběží na `http://localhost:3000`.

---

## 📦 Struktura Dat

Aplikace používá pro "lehká data" (nabídky, kontakty crew) lokální JSON soubory (`src/data/*.json`).
Pro "těžká data" (inventář) se připojuje přímo do vaší existující databáze **shelf.nu**.

*   `src/data/quotes.json`: Všechny nabídky a jejich stav.
*   `src/data/leads.json`: Inbox poptávek.
*   `src/data/crew.json`: Databáze techniků.
*   `src/data/settings.json`: Konfigurace API klíčů a obchodních podmínek.

---

## ⚠️ Důležité upozornění pro nasazení (Vercel)

Protože aplikace zapisuje do JSON souborů (`quotes.json`), na Vercelu (který je "stateless") se tato data při každém novém nasazení **restartují**.

**Pro trvalý provoz doporučujeme:**
Přepsat funkce `getQuotesData` a `setQuotesData` v `src/app/api/quotes/route.ts` tak, aby ukládaly data také do Supabase (např. do nové tabulky `App_Quotes`), místo do lokálního souboru. Kód je na to připraven, stačí změnit úložiště.

---

Vyvinuto pro AV profesionály. 🎧💡

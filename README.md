# SmartBudgetSE

Svensk budget- och kvittoapp byggd med Next.js. Appen fungerar direkt i webbläsaren och sparar data lokalt med `localStorage`, så den kan användas utan konto eller backend.

## Starta projektet

```bash
npm install
npm run dev
```

Öppna sedan `http://localhost:3000`.

## Funktioner

- Månadsbudget med inkomst, sparmål och kvar-att-leva-på
- Utgiftsregistrering med kategori, datum, anteckning och kvittofilnamn
- Kategoribudgetar med progress och justerbara belopp
- Sökning och filtrering i utgiftshistoriken
- Responsiv svensk design för mobil och desktop

## Publicera appen

Det enklaste sättet att få en publik webbadress är att deploya projektet till Vercel:

1. Skapa ett konto på `https://vercel.com`.
2. Lägg innehållet i mappen `SmartBudgetSE` i ett GitHub-repo. `package.json` måste ligga i repots rot.
3. Importera repot i Vercel.
4. Använd standardinställningarna för Next.js.
5. Tryck Deploy.

Appen kräver ingen databas eller backend just nu. Varje användares budget sparas lokalt i den personens webbläsare.

Om Vercel visar `404: NOT_FOUND`, kontrollera att projektets Root Directory pekar på mappen där `package.json` och `app/page.tsx` finns. Om repot innehåller en övermapp ska Root Directory vara `SmartBudgetSE`.

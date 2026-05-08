# Webier OS

> Internal operations platform for Webier Studio — Quotation & Invoice generation powered by Gemini AI.

![License](https://img.shields.io/badge/license-Private-red)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20Tailwind-blue)

## Features

- 🔐 **Password-protected access** — Single password gate via environment variable
- 📄 **Quotation Generator** — AI-powered professional quotations with Gemini 2.0 Flash
- 🧾 **Invoice Generator** — Dynamic line items, auto-calculated totals, tax support
- 🖨️ **PDF Export** — One-click export with company letterhead on every page
- 📱 **Responsive Design** — Works on desktop and mobile with collapsible sidebar
- 🎨 **Premium UI** — Dark navy design with electric blue accents

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd InternalTool
npm install
```

### 2. Configure Environment

Copy the example env file and add your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_APP_PASSWORD=your_secret_password
VITE_GEMINI_API_KEY=your_gemini_api_key
```

- **VITE_APP_PASSWORD**: The password users need to enter on the login screen
- **VITE_GEMINI_API_KEY**: Your Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### 3. Add Letterhead PDF

Place your company quotation/letterhead PDF at:

```
public/assets/letterhead.pdf
```

The app will automatically extract:
- **Top ~120px** as the document header
- **Bottom ~60px** as the document footer

These appear on every generated document and exported PDF.

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deploying to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repository
2. Set the **Framework Preset** to `Vite`
3. Add environment variables:
   - `VITE_APP_PASSWORD` → your password
   - `VITE_GEMINI_API_KEY` → your Gemini API key
4. Deploy!

The included `vercel.json` handles SPA routing automatically.

### 3. Upload Letterhead

Place `letterhead.pdf` in the `public/assets/` directory before deploying. It will be served as a static asset.

## Project Structure

```
src/
├── main.jsx                  # App entry point
├── App.jsx                   # Router & route definitions
├── index.css                 # Tailwind CSS + custom styles
├── context/
│   ├── AuthContext.jsx       # Password authentication
│   └── LetterheadContext.jsx # PDF letterhead extraction
├── components/
│   ├── DashboardLayout.jsx   # Sidebar + main content layout
│   └── DocumentPreview.jsx   # Document renderer with PDF export
├── pages/
│   ├── LoginPage.jsx         # Password login screen
│   ├── QuotationGenerator.jsx # Quotation form + AI generation
│   └── InvoiceGenerator.jsx  # Invoice form + AI generation
└── utils/
    ├── api.js                # Gemini API + helpers
    └── pdf.js                # PDF export utilities
```

## Tech Stack

- **React 19** + **Vite** — Fast build & HMR
- **Tailwind CSS v4** — Utility-first styling
- **Gemini 2.0 Flash** — AI document generation
- **pdf.js** — Letterhead PDF extraction
- **html2pdf.js** — Document-to-PDF export
- **Lucide React** — Premium icon library
- **React Hot Toast** — Notification system

## License

Private — Webier Studio internal use only.

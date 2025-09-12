
# Web Data Intelligence Extractor

An intelligent web scraper that leverages the Google Gemini API to extract, analyze, and cross-reference product and forum data from websites. It categorizes information like product details, pricing, part numbers, and Q&A, providing a powerful, searchable interface to find compatibility information and user experiences.

![Web Data Intelligence Extractor Screenshot](https://storage.googleapis.com/aistudio-project-showcase/examples/web-data-intelligence-extractor.png)

## Core Features

-   **AI-Powered Scraping**: Uses the Gemini API to understand the structure and content of websites, eliminating the need for brittle, selector-based scraping logic.
-   **Dual-Source Analysis**: Ingests URLs for both product-focused sites (e.g., e-commerce shops) and discussion forums.
-   **Intelligent Cross-Referencing**: Automatically identifies mentions of products within forum discussions and links them, providing valuable context and user feedback.
-   **Structured Data Extraction**: Returns clean, structured JSON data containing product details (name, price, part number) and Q&A items.
-   **Interactive UI**: A rich user interface for viewing, searching, and filtering the extracted data.
-   **Fuzzy Search**: Find products and Q&A items even with minor misspellings in your search query.
-   **Advanced Filtering & Sorting**: Easily filter products by price range, part number availability, and sort results by various criteria.
-   **Comprehensive Exporting**: Export filtered or complete datasets as CSV or HTML reports, including specialized "Parts List" and "Forum Mentions" reports.
-   **Persistent Configuration**: Remembers your data source URLs in local storage for convenience.

## Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **AI Engine**: Google Gemini API (`gemini-2.5-flash`)
-   **Build Tool**: Vite
-   **Deployment**: Vercel

## How It Works

1.  **Input**: The user provides a list of "Product Data Source" URLs (e.g., online shops) and "Forum Data Source" URLs.
2.  **Prompt Generation**: The application constructs a detailed, task-specific prompt for the Gemini API, instructing it to act as an expert data scraper. The prompt specifies the URLs, the required data schema, and the critical cross-referencing steps.
3.  **AI Analysis**: The Gemini API receives the prompt. It programmatically accesses the provided URLs, analyzes their content, extracts the relevant information (products, parts, Q&A), and performs the cross-referencing to link forum mentions to products.
4.  **Structured Response**: The API returns the meticulously structured data in a JSON format that matches the requested schema.
5.  **Validation & Display**: The React application receives the JSON, validates its structure, and then renders it in a user-friendly interface, complete with summary statistics, search, and filtering capabilities.

## Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

-   Node.js (v18 or later recommended)
-   npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/web-data-intelligence-extractor.git
    cd web-data-intelligence-extractor
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    You need a Google Gemini API key to run this application.

    -   Create a new file named `.env.local` in the root of the project.
    -   Add your API key to this file:

    ```env
    VITE_API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```

    > **Note:** The `VITE_` prefix is required by Vite to expose the environment variable to the client-side code.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on `http://localhost:5173` (or the next available port).

## Build & Deployment

### Building for Production

To create a production-ready build of the application, run:
```bash
npm run build
```
This command will compile the TypeScript and React code and bundle it into a static `dist/` directory.

### Deploying to Vercel

This project is pre-configured for seamless deployment to [Vercel](https://vercel.com/).

1.  Push your code to a Git repository (e.g., GitHub, GitLab).
2.  Import the repository into your Vercel account.
3.  Vercel will automatically detect the Vite configuration.
4.  **Add your Environment Variable**: In the Vercel project settings, add your Gemini API key.
    -   **Name**: `VITE_API_KEY`
    -   **Value**: `YOUR_GEMINI_API_KEY_HERE`
5.  Click "Deploy". Vercel will build and deploy your application.

## File Structure

```
/
├── public/                # Static assets
├── src/
│   ├── components/        # React UI components
│   ├── services/          # API services (geminiService.ts)
│   ├── utils/             # Helper functions (export, validation, parsing)
│   ├── App.tsx            # Main application component
│   ├── index.tsx          # Entry point for React
│   └── types.ts           # TypeScript type definitions
├── .env.local             # Local environment variables (untracked)
├── index.html             # Main HTML entry point
├── package.json           # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vercel.json            # Vercel deployment configuration
└── vite.config.ts         # Vite build configuration
```

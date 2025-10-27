# US Stocks Monitor - Technical Documentation

## 1. Project Structure

The application's source code is organized into a modular structure to promote separation of concerns and maintainability.

```
/
├── components/         # Reusable React components (UI elements)
│   ├── CurrencySelector.tsx
│   ├── DashboardHeader.tsx
│   ├── DataSourceSelector.tsx
│   ├── ErrorDisplay.tsx
│   ├── ExportControls.tsx
│   ├── LoadingSpinner.tsx
│   ├── Navbar.tsx
│   ├── StockCountSelector.tsx
│   ├── StockDetailModal.tsx
│   ├── StockTable.tsx
│   ├── TableSkeleton.tsx
│   └── ThemeToggle.tsx
├── pages/              # Page-level components that compose the app's views
│   ├── ContactPage.tsx
│   ├── DashboardPage.tsx
│   └── FeaturesPage.tsx
├── services/           # Modules for external API interactions (Gemini)
│   └── geminiService.ts
├── utils/              # Utility functions
│   ├── currency.ts
│   └── export.ts
├── App.tsx             # Main application component, handles routing and layout
├── index.tsx           # Entry point of the React application
├── types.ts            # Centralized TypeScript type definitions
└── index.html          # The main HTML file
```

- **`components/`**: Contains small, reusable UI components. For example, `ThemeToggle` and `ExportControls` are interactive UI elements.
- **`pages/`**: These components represent the main views of the application (e.g., Dashboard, Features). They are responsible for fetching data and managing the state for their respective views.
- **`services/`**: Handles all communication with the Google Gemini API. This isolates API logic from the UI components.
- **`utils/`**: Houses helper functions that can be used across the application, such as `formatCurrency` and `exportToCsv`.
- **`App.tsx`**: The root component. It manages the global state like the current theme, currency, and active page, acting as a simple router.
- **`types.ts`**: Defines the data structures (`StockData`, `DataSource`, etc.) used throughout the app, ensuring type safety.

## 2. Core Components & Logic

### `pages/DashboardPage.tsx`
- **Role**: The primary interactive view of the application.
- **State Management**: This is the most stateful component, managing:
    - `stocks`: The raw and processed data for all stocks.
    - `isLoading`, `error`: API request status.
    - `sortConfig`: The current sorting state of the table.
    - `searchQuery`: The value of the filter input.
    - `selectedStock`: Manages which stock is selected to be shown in the detail modal.
    - `dataSource`: The selected source for stock data (e.g., 'Google Finance').
- **Data Processing**:
    - **Momentum Score**: `calculateMomentumScore` computes a weighted average of recent performance metrics to create a normalized 0-100 score.
    - **Volatility**: `calculateVolatility` calculates the standard deviation of performance metrics to categorize risk.

### `components/StockDetailModal.tsx`
- **Role**: Provides a detailed view of a single stock.
- **Features**:
    - **Sparkline Chart**: A custom SVG chart visualizes the 1-year performance trend.
    - **Historical Price Lookup**: Implements a date picker and a handler (`handleFetchPrice`) that calls the `fetchHistoricalPrice` service to get data for a specific day and displays the result.

## 3. Gemini API Integration (`services/geminiService.ts`)

The application relies on the Google Gemini API for all its data.

- **`fetchHighGrowthStocks(count, dataSource)`**:
    - Constructs a detailed prompt asking for a specific number (`count`) of US stocks.
    - The `dataSource` parameter dynamically alters the prompt to instruct the model to provide data as it would be found on a specific platform (e.g., Google Finance).
    - Uses a `responseSchema` to instruct the Gemini model to return a well-structured JSON array, which drastically improves reliability.

- **`fetchConversionRates()`**:
    - Sends a simple prompt to get real-time USD to EUR and INR conversion rates.
    - Also uses a JSON schema to ensure a predictable response format.
    - Includes a hardcoded fallback to prevent the app from crashing if the API call fails.

- **`fetchHistoricalPrice(symbol, date)`**:
    - Takes a stock symbol and a date to ask the Gemini model for the closing price on that day.
    - The prompt is designed to handle cases where data might be unavailable (e.g., market closed), returning `null`.

## 4. Key Feature Implementations

### Data Source Selection
1. The `DataSourceSelector` component allows the user to pick from 'Gemini', 'Google Finance', or 'Yahoo Finance'.
2. The selection is stored in the `dataSource` state within `DashboardPage`.
3. When `loadStockData` is called, it passes the `dataSource` to `fetchHighGrowthStocks`.
4. The `geminiService` modifies the prompt to the API based on the source, influencing the data returned by the model.

### Data Exporting
- **CSV Export**:
    1. The `ExportControls` component has a "Download CSV" button.
    2. On click, it calls `handleExportCsv` in `DashboardPage`, which passes the currently sorted and filtered stock data to the `exportToCsv` utility.
    3. `utils/export.ts` contains the logic to convert the JSON data into a CSV formatted string, create a Blob, and trigger a browser download.
- **Print to PDF**:
    1. The "Print to PDF" button in `ExportControls` calls `window.print()`.
    2. Custom styles in `index.html` under an `@media print` query are applied. These styles hide all non-essential UI elements (header, buttons, footer), leaving only a clean table to be printed.
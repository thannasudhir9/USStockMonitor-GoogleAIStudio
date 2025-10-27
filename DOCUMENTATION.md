# US Stocks Monitor - Technical Documentation

## 1. Project Structure

The application's source code is organized into a modular structure to promote separation of concerns and maintainability.

```
/
├── components/         # Reusable React components (UI elements)
│   ├── AlertNotifications.tsx
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
│   ├── alerts.ts
│   ├── currency.ts
│   └── export.ts
├── App.tsx             # Main application component, handles routing and layout
├── index.tsx           # Entry point of the React application
├── types.ts            # Centralized TypeScript type definitions
└── index.html          # The main HTML file
```

- **`components/`**: Contains small, reusable UI components. For example, `ThemeToggle` and `AlertNotifications` are interactive UI elements.
- **`pages/`**: These components represent the main views of the application (e.g., Dashboard, Features). They are responsible for fetching data and managing the state for their respective views.
- **`services/`**: Handles all communication with the Google Gemini API. This isolates API logic from the UI components.
- **`utils/`**: Houses helper functions that can be used across the application, such as `formatCurrency`, `exportToCsv`, and all price alert logic.
- **`App.tsx`**: The root component. It manages the global state like the current theme, currency, and active page, acting as a simple router.
- **`types.ts`**: Defines the data structures (`StockData`, `PriceAlert`, etc.) used throughout the app, ensuring type safety.

## 2. Core Components & Logic

### `pages/DashboardPage.tsx`
- **Role**: The primary interactive view of the application.
- **State Management**: This is the most stateful component, managing:
    - `stocks`: The raw and processed data for all stocks.
    - `activeAlerts`, `triggeredAlerts`: State for the price alert system.
    - `isLoading`, `error`: API request status.
    - `sortConfig`: The current sorting state of the table.
- **Data Processing**:
    - **Momentum Score**: `calculateMomentumScore` computes a weighted average of recent performance metrics to create a normalized 0-100 score.
    - **Volatility**: `calculateVolatility` calculates the standard deviation of performance metrics to categorize risk.
    - **Price Alerts**: On data load, it calls `checkAlerts` from `utils/alerts.ts` to determine if any alerts have been triggered.

### `components/StockDetailModal.tsx`
- **Role**: Provides a detailed view of a single stock.
- **Features**:
    - **Sparkline Chart**: A custom SVG chart visualizes the 1-year performance trend.
    - **Historical Price Lookup**: Implements a date picker and a handler that calls the `fetchHistoricalPrice` service.
    - **Alert Manager**: A dedicated UI section for users to set, view, update, and remove price alerts for the specific stock.

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

### Price Alert System
1.  **Storage (`utils/alerts.ts`)**: All alert logic is encapsulated in this module. Functions like `getAlerts`, `saveAlerts`, `addOrUpdateAlert`, and `removeAlert` handle all interactions with `localStorage`, providing a clean API for the rest of the app.
2.  **Setting Alerts (`StockDetailModal.tsx`)**: The `AlertManager` component within the modal provides the UI for creating or deleting an alert. State changes are propagated up to `DashboardPage`.
3.  **State Management (`DashboardPage.tsx`)**: The main dashboard page holds the `activeAlerts` in its state. When a user modifies an alert, handlers update this state and call the save functions from `utils/alerts.ts`.
4.  **Checking Alerts (`DashboardPage.tsx`)**: After every successful data fetch, the new stock prices are passed to `checkAlerts` along with the list of `activeAlerts`.
5.  **Notifications (`AlertNotifications.tsx`)**: The `checkAlerts` function returns any triggered alerts. These are set in the `triggeredAlerts` state on `DashboardPage`, which causes the `AlertNotifications` component to render dismissible toast notifications. The triggered alerts are then removed from `localStorage`.
6.  **UI Indicators (`StockTable.tsx`)**: A memoized selector in `DashboardPage` adds a `hasActiveAlert` flag to each stock object, which the `StockTable` uses to conditionally render a bell icon.

### Data Exporting
- **CSV Export**:
    1. The `ExportControls` component has a "Download CSV" button.
    2. On click, it calls `handleExportCsv` in `DashboardPage`, which passes the currently sorted and filtered stock data to the `exportToCsv` utility.
    3. `utils/export.ts` contains the logic to convert the JSON data into a CSV formatted string, create a Blob, and trigger a browser download.
- **Print to PDF**:
    1. The "Print to PDF" button in `ExportControls` calls `window.print()`.
    2. Custom styles in `index.html` under an `@media print` query are applied. These styles hide all non-essential UI elements (header, buttons, footer), leaving only a clean table to be printed.
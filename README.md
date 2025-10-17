# FinBoard - Customizable Finance Dashboard

A modern, professional finance dashboard builder that allows users to create custom dashboards by connecting to financial APIs and visualizing data through interactive widgets.

## Features

### Core Features

#### 1. Widget Management System

- **Add Widgets**: Create new finance data widgets by connecting to any financial API
  - **Table Widget**: Paginated list/grid of stocks with filters and search functionality
  - **Finance Cards**: Display key metrics like watchlist, market gainers, performance data
  - **Charts**: Line and bar graphs showing stock prices over different intervals
- **Remove Widgets**: Easy deletion of unwanted widgets
- **Rearrange Layout**: Smooth drag-and-drop functionality to reorganize widget positions
- **Widget Configuration**: Edit widget titles, refresh intervals, and field selections

#### 2. API Integration & Data Handling

- **Dynamic Data Mapping**: Explore API responses and select specific fields to display
- **Real-time Updates**: Automatic data refresh with configurable intervals (5-3600 seconds)
- **Data Caching**: Intelligent caching system to optimize API calls
- **Multiple API Support**:
  - Alpha Vantage (stocks)
  - Finnhub (financial data)
  - JSONPlaceholder (testing)
  - Coinbase (cryptocurrency)

#### 3. User Interface & Experience

- **Customizable Widgets**: Finance cards with editable titles and selected metrics
- **Responsive Design**: Fully responsive layout supporting all screen sizes
- **Loading & Error States**: Comprehensive handling of loading, error, and empty data states
- **Dark/Light Mode**: Seamless theme switching with persistent storage

#### 4. Data Persistence

- **Browser Storage Integration**: All widget configurations persist across sessions
- **State Recovery**: Complete dashboard restoration upon page refresh
- **Configuration Backup**: Export/import dashboard configurations as JSON files

#### 5. Advanced Widget Features

- **Field Selection Interface**: Interactive JSON explorer for choosing display fields
- **Custom Formatting**: Support for currency, percentage, and other data formats
- **Widget Naming**: User-defined widget titles and descriptions
- **API Endpoint Management**: Easy switching between different API endpoints

### Bonus Features

#### 1. Dynamic Theme Switching

- Toggle between light and dark modes seamlessly
- Theme preference persists across sessions
- Smooth transitions between themes

#### 2. Dashboard Templates

- **Create Templates**: Save current dashboard configuration as a template
- **Load Templates**: Quickly load pre-built or saved templates
- **Delete Templates**: Remove templates you no longer need
- **Template Management**: View all saved templates with descriptions

#### 3. Real-time Data Updates

- Configurable refresh intervals for each widget
- Automatic polling for live data updates
- Efficient caching to minimize API calls

## Technology Stack

- **Frontend Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS v4 with OKLCH color system
- **UI Components**: shadcn/ui
- **State Management**: Zustand with localStorage persistence
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Drag & Drop**: Native HTML5 Drag and Drop API

## Getting Started

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd finboard
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Configuration

#### API Keys

To use financial APIs, you'll need to obtain API keys:

1. **Alpha Vantage**: Visit [https://www.alphavantage.co/](https://www.alphavantage.co/) and sign up for a free API key
2. **Finnhub**: Visit [https://finnhub.io/](https://finnhub.io/) and create an account
3. **Coinbase**: Visit [https://www.coinbase.com/](https://www.coinbase.com/) for cryptocurrency data

## Usage

### Adding a Widget

1. Click the **"+ Add Widget"** button in the header
2. Select widget type (Chart, Card, or Table)
3. Enter a widget title
4. Choose or paste an API URL
5. Click **"Test"** to validate the API connection
6. Select fields to display from the API response
7. Configure widget-specific settings:
   - **Chart**: Select chart type, X/Y axis fields, and color
   - **Card**: Select fields to display as metrics
   - **Table**: Select columns to display, configure search/sort
8. Click **"Add Widget"** to create

### Editing a Widget

1. Hover over a widget and click the **Settings** icon
2. Modify the configuration in the drawer
3. Click **"Update Widget"** to save changes

### Rearranging Widgets

1. Hover over a widget to see the drag handle (grip icon)
2. Click and drag the widget to reorder
3. Drop in the desired position
4. Changes are automatically saved

### Managing Templates

1. Click **"Templates"** in the header
2. View all saved templates
3. Click **"Load"** to apply a template
4. Click **"Delete"** to remove a template
5. Click **"Create Template"** to save current dashboard

### Exporting/Importing

1. Click **"Export"** to download current dashboard as JSON
2. Click **"Import"** to load a previously exported dashboard
3. Click **"Delete Template"** to clear all widgets

### Theme Switching

1. Click the **Sun/Moon** icon in the header
2. Theme preference is automatically saved

## API Response Format

The dashboard supports various API response formats. When adding a widget:

1. Test the API connection
2. The system automatically extracts available fields
3. Select which fields to display
4. Fields are displayed using dot notation for nested objects (e.g., `data.rates.USD`)

## Performance Optimization

- **Lazy Loading**: Widgets load data on demand
- **Caching**: API responses are cached to reduce redundant requests
- **Debouncing**: Search and filter operations are debounced
- **Code Splitting**: Components are code-split for faster initial load

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

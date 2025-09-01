# Tourify Remote

A specialized web application designed to facilitate remote worksite supervision for the Santiago Metro. The application provides a collaborative, real-time environment that combines 360° panoramic imagery, live video communication, and interactive annotation tools.

## Features

- **Interactive Site Map**: Visual representation of Santiago Metro network with real-time site status
- **360° Panoramic Viewer**: Immersive view of worksites using Three.js
- **Live Video Communication**: WebRTC-based video calls between experts and field technicians
- **Interactive Annotations**: Draw directly onto 360° views with various tools (pen, circle, arrow)
- **AI-Powered Reporting**: Automatic session summaries using Google Gemini API
- **Support Ticket Management**: Track and filter maintenance tickets by status and location

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS with Metro de Santiago brand colors
- **3D/360° Rendering**: Three.js
- **AI Integration**: Google Gemini API
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Linting**: ESLint with TypeScript support

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key (for AI reporting features)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tourify-remote
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Google Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard with site map and tickets
│   ├── LiveSession.tsx  # Live session interface
│   ├── Sidebar.tsx      # Navigation sidebar
│   └── Viewer360.tsx    # 360° panoramic viewer
├── services/            # External services
│   └── geminiService.ts # Google Gemini AI integration
├── types/               # TypeScript type definitions
│   └── index.ts         # Main type definitions
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## Core User Flow

1. **Site Selection**: Expert selects a worksite from the interactive map
2. **Session Initiation**: Live session starts with video communication
3. **360° Navigation**: Expert views and navigates the 360° site imagery
4. **Interactive Guidance**: Expert draws annotations to guide the field technician
5. **AI Report Generation**: Session concludes with automatic AI-generated summary

## Configuration

### Metro de Santiago Brand Colors

The application uses custom Tailwind colors matching Metro de Santiago's brand:

- `metro-blue`: #003f7f (Primary blue)
- `metro-light-blue`: #0066cc (Secondary blue)
- `metro-orange`: #ff6600 (Accent orange)
- `metro-gray`: #666666 (Text gray)

### Environment Variables

- `VITE_GEMINI_API_KEY`: Google Gemini API key for AI-powered reporting

## Development Notes

- The application uses modern ES Modules with Vite for fast development
- Three.js is used for 360° panoramic rendering with WebGL
- WebRTC APIs are used for video communication (requires HTTPS in production)
- The annotation system overlays HTML5 Canvas on the Three.js scene

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and type checking
5. Submit a pull request

## License

This project is proprietary software for Metro de Santiago.
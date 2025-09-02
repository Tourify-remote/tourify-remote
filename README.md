# Tourify Remote

A production-ready SaaS application for remote worksite supervision for the Santiago Metro. The application provides a collaborative, real-time environment that combines 360° panoramic imagery, live video communication, and interactive annotation tools with multi-tenant architecture, authentication, and billing.

## Features

- **Multi-Tenant Architecture**: Organization-based access with Row Level Security
- **Authentication & Authorization**: Supabase Auth with email/password and magic links
- **Subscription Management**: Stripe integration with Pro and Enterprise plans
- **Interactive Site Map**: Visual representation of Santiago Metro network with real-time site status
- **360° Panoramic Viewer**: Immersive view of worksites using Three.js
- **Live Video Communication**: WebRTC-based video calls between experts and field technicians
- **Interactive Annotations**: Draw directly onto 360° views with various tools (pen, circle, arrow)
- **AI-Powered Reporting**: Pluggable AI service supporting multiple providers (Gemini, OpenAI, Anthropic, Groq, OpenRouter)
- **Support Ticket Management**: Track and filter maintenance tickets by status and location

## Tech Stack

- **Frontend**: React 18 with TypeScript, React Router
- **Styling**: Tailwind CSS with Metro de Santiago brand colors
- **3D/360° Rendering**: Three.js
- **Backend**: Netlify Functions (serverless)
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth
- **Payments**: Stripe Checkout & Customer Portal
- **AI Integration**: Multi-provider support via Netlify Functions
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Netlify
- **Linting**: ESLint with TypeScript support

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase project
- Stripe account (for billing)
- AI provider API keys (Gemini, OpenAI, etc.)

### Local Development Setup

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
   cp .env.example .env.local
   ```
   Edit `.env.local` with your actual values:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_APP_URL=http://localhost:8888
   ```

4. Set up Supabase database:
   - Create a new Supabase project
   - Run the SQL migration from `supabase-migration.sql` in the SQL editor
   - Configure RLS policies and authentication

5. Start the development server with Netlify Functions:
   ```bash
   netlify dev
   ```
   This runs both the Vite dev server and Netlify Functions locally.

6. Open your browser and navigate to `http://localhost:8888`

### Production Deployment

1. **Deploy to Netlify:**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Configure Environment Variables in Netlify:**

   **Frontend variables (Site settings → Environment variables):**
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_APP_URL=https://your-site.netlify.app
   VITE_STRIPE_PRICE_MONTHLY_ID=price_1234567890
   ```

   **Function variables (Site settings → Functions → Environment variables):**
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE=your_supabase_service_role_key
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   PRICE_MONTHLY_ID=price_1234567890
   PRICE_YEARLY_ID=price_0987654321
   GEMINI_API_KEY=your_gemini_api_key
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   GROQ_API_KEY=your_groq_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   PROVIDER_ORDER=gemini,groq,openai,anthropic
   APP_URL=https://your-site.netlify.app
   ```

3. **Configure Stripe Webhooks:**
   - In Stripe Dashboard, create a webhook endpoint: `https://your-site.netlify.app/api/stripe-webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
   - Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

4. **Set up Supabase Authentication:**
   - Configure allowed redirect URLs in Supabase Auth settings
   - Add your production domain to the allowed origins

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── auth/                # Authentication components and providers
│   ├── AuthProvider.tsx      # Supabase auth context
│   ├── OrganizationProvider.tsx # Multi-tenant organization context
│   └── ProtectedRoute.tsx    # Route protection component
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard with site map and tickets
│   ├── LiveSession.tsx  # Live session interface
│   ├── MainApp.tsx      # Main app wrapper with routing
│   ├── Sidebar.tsx      # Navigation sidebar with user info
│   └── Viewer360.tsx    # 360° panoramic viewer
├── hooks/               # Custom React hooks
│   └── useSubscription.ts # Subscription management hook
├── lib/                 # Library configurations
│   └── supabase.ts      # Supabase client setup
├── pages/               # Page components
│   ├── Login.tsx        # Login page
│   ├── Signup.tsx       # Signup page
│   └── Pricing.tsx      # Pricing and subscription page
├── services/            # External services
│   ├── ai.ts            # Multi-provider AI service
│   └── geminiService.ts # Legacy Gemini service (deprecated)
├── types/               # TypeScript type definitions
│   └── index.ts         # Main type definitions
├── App.tsx              # Main application with routing
├── main.tsx             # Application entry point
└── index.css            # Global styles

netlify/
└── functions/           # Netlify serverless functions
    ├── ai.ts            # Multi-provider AI endpoint
    ├── create-checkout.ts # Stripe checkout creation
    ├── create-portal.ts   # Stripe customer portal
    └── stripe-webhook.ts  # Stripe webhook handler

supabase-migration.sql   # Database schema and RLS policies
netlify.toml            # Netlify configuration
```

## Core User Flow

1. **Authentication**: User signs up/logs in via Supabase Auth
2. **Organization Setup**: Automatic organization creation for new users
3. **Subscription Management**: Choose between Free, Pro, or Enterprise plans
4. **Site Management**: Add and manage worksites within organization
5. **Site Selection**: Expert selects a worksite from the interactive map
6. **Session Initiation**: Live session starts with video communication (Pro feature)
7. **360° Navigation**: Expert views and navigates the 360° site imagery
8. **Interactive Guidance**: Expert draws annotations to guide the field technician
9. **AI Report Generation**: Session concludes with automatic AI-generated summary using pluggable AI providers

## Configuration

### Metro de Santiago Brand Colors

The application uses custom Tailwind colors matching Metro de Santiago's brand:

- `metro-blue`: #003f7f (Primary blue)
- `metro-light-blue`: #0066cc (Secondary blue)
- `metro-orange`: #ff6600 (Accent orange)
- `metro-gray`: #666666 (Text gray)

## Multi-Tenant Architecture

The application uses a multi-tenant architecture with the following key concepts:

- **Organizations**: Each user belongs to one or more organizations
- **Row Level Security (RLS)**: Database-level security ensuring users only see their organization's data
- **Subscriptions**: Per-organization billing with Stripe integration
- **Role-Based Access**: Owner, Admin, and Member roles within organizations

## AI Provider Support

The application supports multiple AI providers with automatic fallback:

- **Gemini**: Google's Generative AI (primary)
- **Groq**: Fast Llama 3.1 inference
- **OpenAI**: GPT-4o-mini and other models
- **Anthropic**: Claude 3.5 Haiku
- **OpenRouter**: Access to various open-source models

Providers are tried in order until one succeeds, ensuring high availability.

## Subscription Plans

- **Free**: 1 organization, up to 5 sites, basic features
- **Pro ($99/month)**: Unlimited sites, live video, annotations, advanced AI, team collaboration
- **Enterprise (Custom)**: Custom integrations, analytics, dedicated support, SLA guarantees

## Environment Variables

### Frontend (VITE_ prefix)
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_GEMINI_API_KEY`: Google Gemini API key
- `VITE_APP_URL`: Application URL
- `VITE_STRIPE_PRICE_MONTHLY_ID`: Stripe price ID for monthly plan

### Netlify Functions
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE`: Supabase service role key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `PRICE_MONTHLY_ID`: Stripe monthly price ID
- `GEMINI_API_KEY`: Google Gemini API key
- `OPENAI_API_KEY`: OpenAI API key (optional)
- `ANTHROPIC_API_KEY`: Anthropic API key (optional)
- `GROQ_API_KEY`: Groq API key (optional)
- `OPENROUTER_API_KEY`: OpenRouter API key (optional)
- `PROVIDER_ORDER`: Comma-separated list of AI providers to try

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

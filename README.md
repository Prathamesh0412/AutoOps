# AutoOps AI - AI-Driven Business Action Agent

A fully functional AI-powered platform that automates high-value business workflows by analyzing unstructured data, predicting business needs, and executing solutions.

## Features

### 🎯 Core Capabilities
- **Data Analysis** - Process unstructured data from emails, invoices, reviews, and sales logs
- **AI Predictions** - Predict customer churn, inventory shortages, and high-value leads with confidence scores
- **Automated Actions** - Execute solutions like retention offers, purchase orders, and pipeline prioritization
- **Workflow Automation** - Configure and manage 6 pre-built automation workflows
- **Real-time Monitoring** - Track metrics, success rates, and time saved

### 📊 Dashboard
- Live metrics showing active workflows, predictions made, actions executed, and time saved
- Real-time data processing status with progress indicators
- AI prediction panel with confidence scores
- Pending actions requiring approval

### 🔮 Insights Page
- Detailed prediction cards with severity levels (Critical, High, Medium, Low)
- AI confidence scores and recommended actions
- Comprehensive metrics for each prediction
- Real-time updates from the database

### ⚡ Actions Page
- Review and approve pending AI-generated actions
- View execution history with impact metrics
- Approve/reject actions with one click
- Track success rates and outcomes
- Generate Groq-powered customer email drafts that require approval before sending

### 🔄 Workflows Page
- 6 pre-configured automation workflows
- Toggle workflows on/off in real-time
- Monitor execution counts and success rates
- Configure triggers and actions

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **State Management**: React hooks, SWR pattern
- **Icons**: Lucide React

## Database Schema

The app uses 6 main tables:
- `data_sources` - Track uploaded and processed data
- `predictions` - AI-generated business predictions
- `actions` - Automated actions (pending and executed)
- `workflows` - Workflow configurations
- `workflow_executions` - Workflow execution history
- `metrics` - Performance and time-saved metrics

## API Routes

- `GET /api/metrics` - Dashboard metrics
- `GET /api/data-sources` - Data source status
- `GET /api/predictions` - AI predictions (filter by status/severity)
- `GET /api/actions` - Actions (filter by status)
- `PATCH /api/actions` - Update action status
- `GET /api/workflows` - All workflows
- `PATCH /api/workflows` - Toggle workflow active state
- `GET /api/workflows/stats` - Workflow statistics

## Key Features

### Real-time Data
- All components fetch live data from Supabase
- Auto-refresh intervals (10-30 seconds)
- Optimistic UI updates for better UX

### Interactive Actions
- Approve pending actions with one click
- Toggle workflows on/off
- Real-time status updates

### Professional UI
- Dark mode by default
- Purple/blue primary color scheme with accent greens
- Responsive design for all screen sizes
- Loading states and empty states

## Sample Data

The database comes pre-populated with:
- 4 data sources (emails, invoices, reviews, sales logs)
- 6 AI predictions (churn risk, stock shortage, leads, etc.)
- 8 actions (4 executed, 4 pending)
- 6 workflows (churn prevention, inventory, lead scoring, etc.)
- Performance metrics

## Getting Started

The app is ready to run! All database tables are created and populated with sample data.

1. The Supabase integration is already connected
2. Database schema is set up with sample data
3. All API routes are functional
4. Frontend components fetch real data

Simply preview the app to see it in action!

### Environment Variables

Create a `.env.local` file with your Groq key to enable LLM-authored customer emails:

```
GROQ_API_KEY=your_groq_api_key
```

### Customer Feedback Email Workflow

1. Navigate to **Actions → Customer Feedback Email** and submit the customer name, email, review sentiment, and raw feedback.
2. The server calls Groq's `mixtral-8x7b-32768` model to draft a tailored response.
3. The draft is saved as a pending `customer_email` action. Review it inside **Automated Actions → Pending**.
4. Approve the action to mark it executed (and trigger downstream sending once hooked to your ESP).

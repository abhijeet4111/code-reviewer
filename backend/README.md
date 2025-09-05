# Security Scanner Backend

A Node.js/Express backend API for the Security Scanner application that analyzes GitHub repositories for security vulnerabilities.

## Features

- 🔍 **Repository Scanning**: Analyze GitHub repositories for security issues
- 📊 **Comprehensive Reports**: Store and retrieve detailed scan reports
- 🛡️ **Security Rules Engine**: Manage custom security rules and patterns
- 🗄️ **PostgreSQL Database**: Persistent storage for scans, results, and rules
- 📈 **Statistics & Analytics**: Track scanning metrics and trends
- 🔐 **Security First**: Built with security best practices

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd code-reviewer/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5433
   DB_NAME=plugin_scanner
   DB_USER=postgres
   DB_PASSWORD=Abhijeet@123
   DATABASE_URL=postgresql://postgres:Abhijeet@123@localhost:5433/plugin_scanner
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start the server**:
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## Database Setup

The application will automatically:
- Connect to PostgreSQL using the provided credentials
- Create necessary tables on first run
- Seed default security rules in development mode

To manually seed rules:
```bash
npm run seed
```

## API Endpoints

### Scans

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/scans` | Create a new scan |
| `GET` | `/api/scans` | Get all scans (paginated) |
| `GET` | `/api/scans/:id` | Get specific scan with results |
| `GET` | `/api/scans/statistics` | Get scan statistics |
| `DELETE` | `/api/scans/:id` | Delete a scan |

### Rules

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/rules` | Get all rules (filterable) |
| `GET` | `/api/rules/:id` | Get specific rule |
| `POST` | `/api/rules` | Create new rule |
| `PUT` | `/api/rules/:id` | Update rule |
| `PATCH` | `/api/rules/:id/toggle` | Toggle rule active status |
| `DELETE` | `/api/rules/:id` | Delete rule |
| `GET` | `/api/rules/categories` | Get all rule categories |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health status |

## API Examples

### Create a Scan
```bash
curl -X POST http://localhost:5000/api/scans \\
  -H "Content-Type: application/json" \\
  -d '{
    "repository_url": "https://github.com/user/repo",
    "rules_to_use": ["SEC001", "SEC002"]
  }'
```

### Get Scan Results
```bash
curl http://localhost:5000/api/scans/{scan-id}
```

### Create Custom Rule
```bash
curl -X POST http://localhost:5000/api/rules \\
  -H "Content-Type: application/json" \\
  -d '{
    "id": "CUSTOM001",
    "name": "Custom Security Rule",
    "description": "Detects custom security pattern",
    "pattern": "dangerousFunction\\\\(.*\\\\)",
    "severity": "HIGH",
    "category": "Security"
  }'
```

## Database Schema

### Scans Table
- `id` (UUID) - Primary key
- `repository_url` (String) - GitHub repository URL
- `repository_name` (String) - Repository name
- `repository_owner` (String) - Repository owner
- `scan_status` (Enum) - PENDING, RUNNING, COMPLETED, FAILED
- `total_files_scanned` (Integer)
- `total_issues_found` (Integer)
- `high_severity_count` (Integer)
- `medium_severity_count` (Integer)
- `low_severity_count` (Integer)
- `scan_started_at` (DateTime)
- `scan_completed_at` (DateTime)
- `scan_duration` (Integer) - in seconds
- `rules_used` (JSONB) - Array of rule IDs used
- `metadata` (JSONB) - Additional scan metadata

### Scan Results Table
- `id` (UUID) - Primary key
- `scan_id` (UUID) - Foreign key to Scans
- `rule_id` (String) - Rule identifier
- `rule_name` (String) - Rule name
- `issue_type` (String) - Type of issue found
- `severity` (Enum) - HIGH, MEDIUM, LOW
- `category` (String) - Issue category
- `file_path` (String) - File where issue was found
- `line_number` (Integer) - Line number (optional)
- `column_number` (Integer) - Column number (optional)
- `description` (Text) - Issue description
- `fix_suggestion` (Text) - How to fix the issue
- `code_snippet` (Text) - Code snippet showing the issue
- `status` (Enum) - PENDING, REVIEWED, FIXED, IGNORED
- `confidence_level` (Integer) - 0-100
- `metadata` (JSONB) - Additional issue metadata

### Rules Table
- `id` (String) - Primary key
- `name` (String) - Rule name
- `description` (Text) - Rule description
- `pattern` (Text) - Regular expression pattern
- `severity` (Enum) - HIGH, MEDIUM, LOW
- `category` (String) - Rule category
- `language` (String) - Programming language (optional)
- `file_extensions` (JSONB) - Array of file extensions
- `fix_suggestion` (Text) - Fix recommendation
- `is_active` (Boolean) - Whether rule is enabled
- `is_custom` (Boolean) - Whether rule is custom-created
- `created_by` (String) - User who created the rule
- `usage_count` (Integer) - How many times rule was used
- `metadata` (JSONB) - Additional rule metadata

## Security Rules

The backend includes pre-defined security rules for:

1. **SEC001** - Hardcoded Secrets
2. **SEC002** - SQL Injection
3. **SEC003** - Weak Cryptography
4. **SEC004** - Insecure Random Number Generation
5. **SEC005** - XSS Vulnerabilities
6. **SEC006** - Insecure HTTP Usage
7. **SEC007** - Debug Information
8. **SEC008** - Insecure CORS Configuration
9. **SEC009** - Eval Usage
10. **SEC010** - Vulnerable Dependencies

## Development

### Project Structure
```
backend/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── scanController.js    # Scan operations
│   └── ruleController.js    # Rule operations
├── middleware/
│   └── errorHandler.js      # Error handling middleware
├── models/
│   ├── Scan.js             # Scan model
│   ├── ScanResult.js       # Scan result model
│   ├── Rule.js             # Rule model
│   └── index.js            # Model associations
├── routes/
│   ├── scanRoutes.js       # Scan API routes
│   └── ruleRoutes.js       # Rule API routes
├── src/
│   ├── mockScanner.js      # Mock scanning implementation
│   └── seedRules.js        # Database seeding
├── .env                    # Environment variables
├── server.js               # Main server file
└── package.json
```

### Running Tests
```bash
npm test
```

### Environment Variables
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `CORS_ORIGIN` - Frontend URL for CORS

## Production Deployment

1. Set environment variables for production
2. Set `NODE_ENV=production`
3. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "security-scanner-backend"
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

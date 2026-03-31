# Development Guide for RouteCanvas

## Project Structure
```
RouteCanvas/
├── backend/              # Python FastAPI backend
│   ├── app/              # Main application code
│   │   ├── main.py       # Entry point
│   │   ├── models.py     # Database models
│   │   ├── routers/      # API route handlers
│   │   ├── services/     # Business logic
│   │   ├── auth.py       # Authentication utilities
│   │   ├── badges.py     # Badge definitions
│   │   ├── config.py     # Configuration
│   │   └── database.py   # Database connection
│   ├── requirements.txt  # Python dependencies
│   └── routecanvas.db    # SQLite database
│
├── web/                  # React frontend
│   ├── src/              # Source code
│   │   ├── App.tsx       # Main application component
│   │   ├── auth/         # Authentication components and utilities
│   │   ├── components/   # Reusable UI components
│   │   ├── art/          # Art generator component
│   │   └── utils/        # Utility functions
│   ├── package.json      # Frontend dependencies
│   └── vite.config.ts    # Vite configuration
```

## Build Commands

### Backend (Python/FastAPI)
```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run development server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# Run with hot reload
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend (React/TypeScript)
```bash
# Install dependencies
cd web
npm install

# Run development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing Commands

Currently, there are no automated tests configured for this project. To add tests:

### Backend Testing
1. Install pytest: `pip install pytest pytest-asyncio httpx`
2. Create test files in `backend/tests/`
3. Run tests: `cd backend && pytest`

Example test command for a specific test file:
```bash
cd backend
pytest tests/test_auth.py -v
```

### Frontend Testing
1. Install Jest and React Testing Library: `npm install --save-dev jest @testing-library/react @testing-library/jest-dom`
2. Create test files with `.test.tsx` extension
3. Run tests: `npm test`

Example test command for a specific test:
```bash
cd web
npm test src/components/Inventory.test.tsx
```

### Manual Testing Checklist
When adding features, verify manually:
- [ ] Social sharing (Twitter, Facebook, LinkedIn, Reddit, Instagram)
- [ ] Art generation and download
- [ ] Color themes (5 palettes with style-aware filtering)
- [ ] Background colors (style-specific backgrounds)
- [ ] Custom name on art ("Created by")
- [ ] Fingerprint share (click fingerprint ID → modal with download + share)
- [ ] User authentication (register, login, logout)
- [ ] Route saving and sharing
- [ ] Badge awards
- [ ] Public Gallery (browse, scroll, sort)
- [ ] Save to Gallery (thumbnail generation for constellation/retro)
- [ ] Like/Unlike routes
- [ ] Public user profiles

## Linting Commands

### Backend (Python)
Install flake8 and black:
```bash
pip install flake8 black
```

Run linting:
```bash
cd backend
flake8 .                    # Check for style issues
black --check .             # Check code formatting
black .                     # Auto-format code
```

### Frontend (TypeScript/JavaScript)
Linting is handled by ESLint and Prettier:
```bash
cd web
npm run lint                # Check for issues
npm run format              # Format code (if configured)
```

To add linting to package.json:
```json
"scripts": {
  "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "format": "prettier --write src/**/*.{ts,tsx,json,css}"
}
```

## Code Style Guidelines

### Python (Backend)
1. **Imports**:
   - Standard library imports first
   - Third-party imports second
   - Local imports last
   - Alphabetical order within each group
   - Group from statements together when appropriate

2. **Naming Conventions**:
   - Variables/functions: snake_case
   - Classes: PascalCase
   - Constants: UPPER_SNAKE_CASE
   - Private members: prefixed with _

3. **Type Hints**:
   - Always use type hints for function parameters and return values
   - Use Pydantic models for data validation

4. **Error Handling**:
   - Use specific exception types when possible
   - Always log errors appropriately
   - Return meaningful error messages to clients

5. **Formatting**:
   - Follow PEP 8 guidelines
   - Maximum line length: 88 characters (Black default)
   - Use docstrings for module, class, and function documentation

### TypeScript/React (Frontend)
1. **Imports**:
   - External libraries first
   - Absolute imports second
   - Relative imports last
   - Within each group, alphabetical order

2. **Component Structure**:
   - Use functional components with hooks
   - Separate component logic from presentation
   - Use TypeScript interfaces for props

3. **Naming Conventions**:
   - Variables/functions: camelCase
   - Components: PascalCase
   - Interfaces: PascalCase with "Props" suffix for component props

4. **Type Safety**:
   - Define interfaces for all props and state
   - Use generics where appropriate
   - Avoid using 'any' type

5. **State Management**:
   - Prefer useState/useReducer for local state
   - Use Context API for global state when needed
   - Separate state logic from UI components

6. **Error Handling**:
   - Handle API errors gracefully
   - Display user-friendly error messages
   - Log errors appropriately for debugging

## Recent Commits (2026-03)
- **8278ea2** - Add Route Atlas feature for comparing routes to same destination
  - Visual map overlay with distinct bright colors, parallel 'bus lane' rendering
  - Stats dashboard, Path Breakdown (ASN chain distribution), Hop Details
  - Backend: GET /routes/by-destination endpoint
- **0c1ac18** - Add First Discoveries and Route Uniqueness feature
  - GlobalDiscovery model, first_discoveries column on User model
  - /me/uniqueness endpoint, 5 new First Discovery badges (1, 10, 25, 50, 100)
  - "FIRST" badge (cyan/pink gradient), "Only you" and "1 in X users" displays
- **7491cd9** - Fix collection system - handle legacy new_items format
- **f60f6c2** - Clean up ROADMAP.md

## Recent Updates (2026-03-30)
- **Route Atlas route picker**: Select up to 8 routes to compare with modal picker
  - Routes grouped by destination (hostname only label)
  - Max 8 routes selectable, top 3 by frequency pre-selected
  - Fingerprint IDs shown in picker alongside timestamps
  - "Show X more" collapsible sections for groups with many routes
- **Duplicate fingerprint prevention**: Prevent saving duplicate routes
  - Check against SavedRoute.fingerprint_id in database
  - Block save/share with clear error message showing fingerprint ID
  - SavedRoute model extended with fingerprint_id column

## PWA (Progressive Web App)
- **App name**: Routerino
- **Display**: Fullscreen
- **Theme**: Cyan/pink gradient on dark background
- **Icons**: Globe with "RI" letters, 192x192 and 512x512 PNG
- **Service Worker**: Auto-update via vite-plugin-pwa

### Files
| File | Purpose |
|------|---------|
| `web/public/manifest.json` | PWA manifest |
| `web/public/icons/icon-192.png` | Small icon |
| `web/public/icons/icon-512.png` | Large icon |
| `web/public/favicon.png` | Browser favicon |
| `web/public/icons/icon.svg` | Source SVG for icons |

### Deployment
PWA requires HTTPS for service workers to work. Deploy to Vercel/Netlify for bug testing.

## Database Guidelines
1. Always use migrations for schema changes
2. Use SQLAlchemy models for all database interactions
3. Handle database connections properly with context managers
4. Sanitize input data before database operations

## Security Practices
1. Use environment variables for sensitive configuration
2. Validate and sanitize all user inputs
3. Use HTTPS in production
4. Implement proper authentication and authorization
5. Hash passwords using bcrypt
6. Use secure JWT tokens with appropriate expiration

## API Design
1. Follow RESTful principles
2. Use consistent endpoint naming (plural nouns)
3. Return appropriate HTTP status codes
4. Provide informative error messages
5. Version API endpoints appropriately
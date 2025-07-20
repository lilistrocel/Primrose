# Primrose Backend

A modular TypeScript backend framework with user authentication, built for scalability and easy deployment to AWS, Play Store, and App Store.

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcrypt
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Joi

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn
- Git (for version control)

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd primrose
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your configuration (required!)
# See simulatedenv.txt for the correct Docker MongoDB configuration
# Key values to update:
# - JWT_SECRET (a secure random string, at least 32 characters)
# - DOCKER_MONGODB=true (to enable Docker MongoDB)
# - MONGODB_URI=mongodb://primrose_user:primrose_password@localhost:27017/primrose
```

4. **Start development server** (multiple options):

**Option A: Service Manager (Recommended)**
```bash
npm run services:start
```

**Option B: Windows Batch File (Windows users)**
```bash
start.bat
# or double-click start.bat in File Explorer
```

**Option C: Simple Development Server**
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### First-Time Setup

After starting the server, seed your database with test data:
```bash
npm run db:seed
```

This creates test accounts:
- Admin: `admin@primrose.com` / `Admin123!`
- User: `john.doe@example.com` / `User123!`
- Test: `test@example.com` / `Test123!`

## Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run services:start` - Start service manager with logging
- `npm run start:simple` - Direct Node.js server startup
- `npm run win:start` - Windows batch file starter

### Building
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run build:watch` - Build with watch mode
- `npm run clean` - Clean build directory

### Testing
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:auth` - Run only authentication tests

### Database & Utilities
- `npm run db:seed` - Seed database with test data
- `npm run db:seed -- --clear` - Clear and reseed database
- `npm run health-check` - Check all service health
- `npm run services:logs` - View service logs

### Log Management
- `npm run services:logs show` - Show all logs
- `npm run services:logs show backend` - Show backend logs only
- `npm run services:logs tail backend` - Real-time log tailing
- `npm run services:logs clear` - Clear all logs
- `npm run services:logs stats` - Show log statistics

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Health Check
- `GET /health` - Server health status

## Project Structure

```
src/
├── config/           # Configuration files
├── middleware/       # Global middleware
├── modules/          # Feature modules
│   └── auth/         # Authentication module
│       ├── auth.controller.ts
│       ├── auth.middleware.ts
│       ├── auth.model.ts
│       ├── auth.routes.ts
│       └── auth.validation.ts
└── index.ts          # Main server entry
```

## Modular Architecture

Each feature is organized as a module containing:
- **Controller**: Business logic and request handling
- **Model**: Database schema and methods
- **Routes**: API endpoint definitions
- **Middleware**: Feature-specific middleware
- **Validation**: Input validation schemas

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Rate limiting
- CORS protection
- Security headers with Helmet
- Input validation
- Error handling

## Environment Variables

See `.env.example` for all available configuration options.

## Platform Support

This project is designed to work seamlessly across different platforms:

- ✅ **Windows** (PowerShell, Command Prompt, Git Bash)
- ✅ **macOS** (Terminal, iTerm2) 
- ✅ **Linux** (Bash, Zsh)
- ✅ **Docker** (planned for deployment)

### Windows Users
Use the convenient batch file for the easiest setup:
```bash
start.bat
```

### Development Tools

- **Service Manager**: Automatic service startup with logging
- **Health Monitoring**: Built-in health checks for all services
- **Log Management**: Centralized logging with filtering and real-time viewing
- **Database Seeding**: Quick test data setup
- **Comprehensive Testing**: Full test suite with coverage reporting

## Troubleshooting

### Common Issues

**Windows npm spawn errors:**
- Use `start.bat` or `npm run win:start`
- Ensure Node.js is properly installed and in PATH

**MongoDB connection issues:**
- Check your `.env` MONGODB_URI setting
- Ensure MongoDB is running locally or accessible
- Run `npm run health-check` to diagnose

**Port already in use:**
- Change PORT in `.env` file
- Check for other running services on port 3000

**Test failures:**
- Ensure MongoDB is available for testing
- Check that all dependencies are installed
- Run `npm run test:coverage` for detailed output

## Contributing

This project follows a modular development approach. When adding new features:

1. Create a new module in `src/modules/`
2. Follow the established pattern (controller, model, routes, etc.)
3. Add comprehensive tests for your module
4. Update the main `index.ts` to include new routes
5. Update this README and DEVLOG.md
6. Run the full test suite before submitting

## License

MIT
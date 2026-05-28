# Build Project Workflow

This workflow details the commands required to install dependencies, verify types, and build the Next.js application.

## Steps

1. **Install Dependencies**
   Ensure all npm packages are installed:
   ```bash
   npm install
   ```

2. **Verify Types**
   Check for any TypeScript compilation errors before building:
   ```bash
   npm run typecheck
   ```

3. **Build the Application**
   Build the application for production:
   ```bash
   npm run build
   ```

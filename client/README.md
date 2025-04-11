# RiikonBot React Frontend

This is the React frontend for RiikonBot, a modular Discord bot with extensible package management.

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Run for development:
   ```
   npm start
   ```

3. Build for production:
   ```
   npm run build
   ```

4. When built, the production files will be in the `build` directory and served by the Express.js backend.

## Project Structure

- **src/components/** - Reusable UI components
- **src/contexts/** - React context providers (auth, etc.)
- **src/layouts/** - Page layout templates
- **src/pages/** - Individual page components
- **src/styles/** - CSS files for styling components and pages
- **src/utils/** - Utility functions and helpers

## Deployment

For deployment, build the React app and update the Express server to serve the static React files.

```
npm run build
```

The Express server will serve the built React app from the `client/build` directory.

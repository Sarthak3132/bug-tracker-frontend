# Bug Tracker Frontend

A modern, colorful React TypeScript frontend for the Bug Tracker System with beautiful authentication pages.

## Features

- 🎨 **Beautiful Design**: Modern, colorful UI with gradients and smooth animations
- 🔐 **Complete Authentication**: Login, Register, Forgot Password, and Reset Password pages
- 🚀 **Google OAuth**: Ready for Google authentication integration
- 📱 **Responsive**: Works perfectly on all device sizes
- ⚡ **TypeScript**: Full type safety and better developer experience
- 🎯 **Industry Standards**: Following modern React and UI/UX best practices

## Pages Included

1. **Login Page** (`/login`)
   - Email and password fields
   - Google OAuth button
   - Forgot password link
   - Register redirect

2. **Register Page** (`/register`)
   - Name, email, password, and confirm password fields
   - Form validation
   - Login redirect

3. **Forgot Password Page** (`/forgot-password`)
   - Email field for reset link
   - Success state with confirmation
   - Back to login navigation

4. **Reset Password Page** (`/reset-password`)
   - New password and confirm password fields
   - Password requirements display
   - Success state confirmation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd bug-tracker-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AuthLayout.tsx   # Layout wrapper for auth pages
│   ├── Button.tsx       # Styled button component
│   └── Input.tsx        # Styled input component
├── pages/               # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   └── ResetPasswordPage.tsx
├── services/            # API service layer
│   └── api.ts
├── styles/              # Theme and global styles
│   ├── theme.ts
│   └── GlobalStyles.ts
└── App.tsx              # Main app component
```

## Design System

### Colors
- **Primary**: Indigo gradient (#667eea → #764ba2)
- **Secondary**: Pink gradient (#f093fb → #f5576c)
- **Success**: Blue gradient (#4facfe → #00f2fe)
- **Bug Theme**: Pink-yellow gradient (#fa709a → #fee140)

### Components
- **Buttons**: Multiple variants (primary, secondary, google, link)
- **Inputs**: With error states and validation
- **Layout**: Centered auth layout with branded header

## Integration with Backend

The frontend is ready to integrate with your existing backend:

1. Update the API endpoints in `src/services/api.ts`
2. Configure Google OAuth redirect URLs
3. Set up proper CORS in your backend
4. Update environment variables

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (not recommended)

## Next Steps

1. Connect the API calls to your backend endpoints
2. Implement proper error handling and loading states
3. Add form validation feedback
4. Set up Google OAuth configuration
5. Add protected routes and authentication context
6. Implement the main dashboard and bug tracking features

## Technologies Used

- React 18 with TypeScript
- React Router for navigation
- Styled Components for styling
- Axios for API calls
- React Icons for iconography
- Modern CSS with gradients and animations
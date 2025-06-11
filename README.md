# Job Portal Application

A modern web application for posting job listings and managing candidate applications.

## Features

- Post and manage job listings
- Apply for jobs
- Track applications
- Admin dashboard for managing listings and applications
- Responsive design for all devices

## Tech Stack

- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: MongoDB
- Styling: Tailwind CSS

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:

   - Create `.env` file in the backend directory
   - Add the following variables:
     ```
     PORT=5000
     MONGODB_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     ```

4. Start the development servers:

   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd frontend
   npm start
   ```

## Project Structure

```
job-portal/
├── frontend/           # React frontend application
├── backend/           # Node.js backend server
└── README.md
```

## License

MIT

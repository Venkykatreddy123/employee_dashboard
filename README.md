# 🏢 Employee Management System (EMS)

A modern, high-performance dashboard for managing employees, projects, and tasks. Built with a focus on real-time data visualization and efficient administration.

## 🚀 Key Features

- **Admin Dashboard**: Comprehensive overview of workforce status, active projects, and upcoming tasks.
- **Employee Portal**: Personalized view for employees to track their tasks, projects, and schedules.
- **Project Tracking**: Manage multiple projects with progress monitoring and team assignments.
- **Task Management**: Kanban-style or list-based task tracking for efficient workflow management.
- **Real-time Analytics**: Visualized data using Recharts for workforce status and project completion.
- **Modern UI/UX**: Clean, responsive design with Tailwind CSS and Lucide icons.

## 🛠️ Tech Stack

- **Frontend Core**: React 19, Vite
- **Styling**: Tailwind CSS 4, Lucide React
- **State Management**: Zustand
- **Data Visualization**: Recharts
- **Utilities**: Date-fns, CLSX, Tailwind Merge

## 📦 Project Structure

```text
src/
├── components/     # Reusable UI components (Sidebar, Layout, etc.)
├── pages/          # Main dashboard views (Admin, Employee, Tasks, etc.)
├── store/          # Zustand state management (Auth, App state)
├── lib/            # Utility functions and shared logic
├── assets/         # Static images and icons
└── App.jsx         # Main application routing and entry
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd Employee
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Execution

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📄 License

This project is licensed under the MIT License.

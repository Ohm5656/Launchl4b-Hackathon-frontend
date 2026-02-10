import { createBrowserRouter } from 'react-router';
import { Login } from './components/Login';
import { AddGmail } from './components/AddGmail';
import { GmailCallback } from './components/GmailCallback';
import { MainLayout } from './components/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CalendarPage } from './pages/CalendarPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login,
  },
  {
    path: '/add-gmail',
    Component: AddGmail,
  },
  {
    path: '/gmail-callback',
    Component: GmailCallback,
  },
  {
    path: '/app',
    Component: MainLayout,
    children: [
      {
        index: true,
        Component: DashboardPage,
      },
      {
        path: 'calendar',
        Component: CalendarPage,
      },
      {
        path: 'insights',
        Component: InsightsPage,
      },
      {
        path: 'settings',
        Component: SettingsPage,
      },
    ],
  },
]);
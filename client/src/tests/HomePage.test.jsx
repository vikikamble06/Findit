import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { NotificationProvider } from '../context/NotificationContext';

vi.mock('../services/api', () => ({
  authAPI: {
    getMe: vi.fn().mockResolvedValue({ data: { success: false } }),
  },
  notificationsAPI: {
    getNotifications: vi.fn().mockResolvedValue({ data: { success: true, notifications: [], unreadCount: 0 } }),
  },
  itemsAPI: {
    getItems: vi.fn().mockResolvedValue({
      data: {
        success: true,
        items: [
          {
            _id: 'item1',
            type: 'lost',
            title: 'Black BoAt Earbuds',
            category: 'Electronics',
            color: 'Black',
            campusZone: 'Central Library',
            date: new Date(),
            status: 'open',
            images: []
          }
        ],
        pagination: { total: 1 }
      }
    })
  },
  adminAPI: {
    getDashboardStats: vi.fn().mockResolvedValue({
      data: {
        success: true,
        stats: { totalItems: 8, resolvedItems: 3, totalUsers: 14, totalMatches: 5 }
      }
    })
  }
}));

describe('HomePage Component', () => {
  it('renders headline, CTAs, and quick categories', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <NotificationProvider>
              <HomePage />
            </NotificationProvider>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    // Headline check
    const headings = screen.getAllByText(/Lost something/i);
    expect(headings.length).toBeGreaterThan(0);
    expect(screen.getByText(/Find it smarter/i)).toBeInTheDocument();

    // CTA buttons check
    expect(screen.getByText(/I Lost Something/i)).toBeInTheDocument();
    expect(screen.getByText(/I Found Something/i)).toBeInTheDocument();

    // Search bar check
    expect(screen.getByPlaceholderText(/Search for keys/i)).toBeInTheDocument();
  });
});

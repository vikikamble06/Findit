import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ItemCard from '../components/ItemCard';

describe('ItemCard Component', () => {
  const sampleItem = {
    _id: 'item123',
    title: 'Blue Stainless Steel Water Bottle',
    type: 'lost',
    category: 'Bottles & Containers',
    color: 'Blue',
    campusZone: 'Cafeteria & Food Court',
    approximateLocation: 'Juice counter table 2',
    date: new Date('2026-10-20'),
    status: 'open',
    images: []
  };

  it('renders item title, type badge, campus zone, and category', () => {
    render(
      <BrowserRouter>
        <ItemCard item={sampleItem} />
      </BrowserRouter>
    );

    expect(screen.getByText('Blue Stainless Steel Water Bottle')).toBeInTheDocument();
    expect(screen.getByText('LOST')).toBeInTheDocument();
    expect(screen.getAllByText('Bottles & Containers').length).toBeGreaterThan(0);
    expect(screen.getByText('Cafeteria & Food Court')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MatchCard from '../components/MatchCard';

describe('MatchCard Component', () => {
  const sampleMatch = {
    _id: 'match123',
    similarityScore: 88,
    matchCategory: 'high',
    explanation: 'High match (88%): Both reports describe black wireless earphones in Central Library.',
    scoreBreakdown: {
      categoryScore: 100,
      textScore: 85,
      colorScore: 100,
      locationScore: 100,
      dateScore: 85
    },
    matchedItem: {
      _id: 'candidate123',
      title: 'Black Wireless Earphones with Case',
      type: 'found',
      category: 'Electronics',
      campusZone: 'Central Library',
      color: 'Black',
      date: new Date()
    }
  };

  it('renders similarity percentage, candidate title, and explanation', () => {
    render(
      <BrowserRouter>
        <MatchCard match={sampleMatch} />
      </BrowserRouter>
    );

    expect(screen.getByText('88% Match')).toBeInTheDocument();
    expect(screen.getByText('Black Wireless Earphones with Case')).toBeInTheDocument();
    expect(screen.getByText(/Both reports describe black wireless earphones/i)).toBeInTheDocument();
    expect(screen.getByText('View Report')).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { render } from '@testing-library/react';
import { StatCard } from '../StatCard';
import { Ticket, Users, Clock } from 'lucide-react';

describe('StatCard', () => {
  const defaultProps = {
    title: 'Total Tickets',
    value: 150,
    icon: Ticket,
  };

  it('renders title correctly', () => {
    const { getByText } = render(<StatCard {...defaultProps} />);
    expect(getByText('Total Tickets')).toBeInTheDocument();
  });

  it('renders numeric value correctly', () => {
    const { getByText } = render(<StatCard {...defaultProps} />);
    expect(getByText('150')).toBeInTheDocument();
  });

  it('renders string value correctly', () => {
    const { getByText } = render(<StatCard {...defaultProps} value="$1,500" />);
    expect(getByText('$1,500')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    const { getByText } = render(<StatCard {...defaultProps} description="From last week" />);
    expect(getByText('From last week')).toBeInTheDocument();
  });

  describe('change indicator', () => {
    it('renders positive change with up arrow', () => {
      const { container } = render(
        <StatCard
          {...defaultProps}
          change={{ value: 12, trend: 'up' }}
        />
      );
      expect(container.textContent).toContain('↑');
      expect(container.textContent).toContain('+12%');
    });

    it('renders negative change with down arrow', () => {
      const { container } = render(
        <StatCard
          {...defaultProps}
          change={{ value: -5, trend: 'down' }}
        />
      );
      expect(container.textContent).toContain('↓');
      expect(container.textContent).toContain('-5%');
    });

    it('renders neutral change without arrow', () => {
      const { queryByText } = render(
        <StatCard
          {...defaultProps}
          change={{ value: 0, trend: 'neutral' }}
        />
      );
      expect(queryByText('↑')).not.toBeInTheDocument();
      expect(queryByText('↓')).not.toBeInTheDocument();
    });

    it('applies correct color for up trend', () => {
      const { container } = render(
        <StatCard
          {...defaultProps}
          change={{ value: 10, trend: 'up' }}
        />
      );
      const changeSpan = container.querySelector('.text-green-600');
      expect(changeSpan).toBeInTheDocument();
    });

    it('applies correct color for down trend', () => {
      const { container } = render(
        <StatCard
          {...defaultProps}
          change={{ value: -8, trend: 'down' }}
        />
      );
      const changeSpan = container.querySelector('.text-red-600');
      expect(changeSpan).toBeInTheDocument();
    });
  });

  describe('icon rendering', () => {
    it('renders with Users icon', () => {
      const { container } = render(
        <StatCard title="Users" value={100} icon={Users} />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders with Clock icon', () => {
      const { container } = render(
        <StatCard title="Avg Response" value="2h" icon={Clock} />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <StatCard {...defaultProps} className="custom-stat-card" />
      );
      expect(container.firstChild).toHaveClass('custom-stat-card');
    });

    it('renders within a card component', () => {
      const { container } = render(<StatCard {...defaultProps} />);
      expect(container.querySelector('.p-6')).toBeInTheDocument();
    });
  });
});

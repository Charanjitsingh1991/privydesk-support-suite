import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { render } from '@testing-library/react';
import { StatusBadge, PriorityBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  describe('status variations', () => {
    it('renders open status', () => {
      const { getByText } = render(<StatusBadge status="open" />);
      expect(getByText('Open')).toBeInTheDocument();
    });

    it('renders in_progress status', () => {
      const { getByText } = render(<StatusBadge status="in_progress" />);
      expect(getByText('In Progress')).toBeInTheDocument();
    });

    it('renders waiting_customer status', () => {
      const { getByText } = render(<StatusBadge status="waiting_customer" />);
      expect(getByText('Waiting')).toBeInTheDocument();
    });

    it('renders resolved status', () => {
      const { getByText } = render(<StatusBadge status="resolved" />);
      expect(getByText('Resolved')).toBeInTheDocument();
    });

    it('renders closed status', () => {
      const { getByText } = render(<StatusBadge status="closed" />);
      expect(getByText('Closed')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies correct classes for open status', () => {
      const { getByText } = render(<StatusBadge status="open" />);
      const badge = getByText('Open');
      expect(badge).toHaveClass('rounded-full', 'text-xs', 'font-medium');
    });

    it('applies custom className', () => {
      const { getByText } = render(<StatusBadge status="open" className="custom-class" />);
      const badge = getByText('Open');
      expect(badge).toHaveClass('custom-class');
    });
  });
});

describe('PriorityBadge', () => {
  describe('priority variations', () => {
    it('renders low priority', () => {
      const { getByText } = render(<PriorityBadge priority="low" />);
      expect(getByText('Low')).toBeInTheDocument();
    });

    it('renders medium priority', () => {
      const { getByText } = render(<PriorityBadge priority="medium" />);
      expect(getByText('Medium')).toBeInTheDocument();
    });

    it('renders high priority', () => {
      const { getByText } = render(<PriorityBadge priority="high" />);
      expect(getByText('High')).toBeInTheDocument();
    });

    it('renders urgent priority', () => {
      const { getByText } = render(<PriorityBadge priority="urgent" />);
      expect(getByText('Urgent')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies correct base classes', () => {
      const { getByText } = render(<PriorityBadge priority="high" />);
      const badge = getByText('High');
      expect(badge).toHaveClass('rounded-full', 'text-xs', 'font-medium', 'border');
    });

    it('applies custom className', () => {
      const { getByText } = render(<PriorityBadge priority="urgent" className="test-class" />);
      const badge = getByText('Urgent');
      expect(badge).toHaveClass('test-class');
    });
  });
});

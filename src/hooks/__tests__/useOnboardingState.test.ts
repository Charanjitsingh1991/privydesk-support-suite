import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnboardingState } from '../useOnboardingState';

const STORAGE_KEY = 'privydesk_onboarding_data';

describe('useOnboardingState', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default data when localStorage is empty', async () => {
      const { result } = renderHook(() => useOnboardingState());
      
      // Wait for loading to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.currentStep).toBe(1);
      expect(result.current.data.organizationName).toBe('');
      expect(result.current.data.slug).toBe('');
      expect(result.current.data.selectedPlan).toBe('free');
    });

    it('should load saved state from localStorage', async () => {
      const savedData = {
        data: {
          organizationName: 'Test Company',
          slug: 'test-company',
          industry: 'Technology',
          selectedPlan: 'pro',
        },
        currentStep: 3,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));

      const { result } = renderHook(() => useOnboardingState());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.currentStep).toBe(3);
      expect(result.current.data.organizationName).toBe('Test Company');
      expect(result.current.data.slug).toBe('test-company');
      expect(result.current.data.selectedPlan).toBe('pro');
    });

    it('should handle corrupted localStorage data gracefully', async () => {
      localStorage.setItem(STORAGE_KEY, 'invalid-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useOnboardingState());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.currentStep).toBe(1);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('updateData', () => {
    it('should update data and persist to localStorage', async () => {
      const { result } = renderHook(() => useOnboardingState());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.updateData({ organizationName: 'New Company' });
      });

      expect(result.current.data.organizationName).toBe('New Company');
      
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(saved.data.organizationName).toBe('New Company');
    });

    it('should preserve existing data when updating partial fields', async () => {
      const { result } = renderHook(() => useOnboardingState());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.updateData({ organizationName: 'Test' });
      });

      act(() => {
        result.current.updateData({ industry: 'Technology' });
      });

      expect(result.current.data.organizationName).toBe('Test');
      expect(result.current.data.industry).toBe('Technology');
    });
  });

  describe('step navigation', () => {
    it('should navigate to next step with nextStep()', async () => {
      const { result } = renderHook(() => useOnboardingState());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.currentStep).toBe(1);

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(2);
    });

    it('should not exceed max step (6) with nextStep()', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        data: {},
        currentStep: 6,
      }));

      const { result } = renderHook(() => useOnboardingState());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(6);
    });

    it('should navigate to previous step with prevStep()', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        data: {},
        currentStep: 3,
      }));

      const { result } = renderHook(() => useOnboardingState());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.prevStep();
      });

      expect(result.current.currentStep).toBe(2);
    });

    it('should not go below step 1 with prevStep()', async () => {
      const { result } = renderHook(() => useOnboardingState());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.prevStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should navigate to specific step with goToStep()', async () => {
      const { result } = renderHook(() => useOnboardingState());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.goToStep(4);
      });

      expect(result.current.currentStep).toBe(4);
    });

    it('should ignore invalid step numbers in goToStep()', async () => {
      const { result } = renderHook(() => useOnboardingState());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.goToStep(7);
      });
      expect(result.current.currentStep).toBe(1);

      act(() => {
        result.current.goToStep(0);
      });
      expect(result.current.currentStep).toBe(1);

      act(() => {
        result.current.goToStep(-1);
      });
      expect(result.current.currentStep).toBe(1);
    });
  });

  describe('clearState', () => {
    it('should clear all state and localStorage', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        data: { organizationName: 'Test' },
        currentStep: 4,
      }));

      const { result } = renderHook(() => useOnboardingState());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.clearState();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.data.organizationName).toBe('');
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });
});

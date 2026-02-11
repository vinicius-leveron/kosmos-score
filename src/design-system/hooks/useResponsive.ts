import { useState, useEffect } from 'react';

/**
 * Breakpoints matching Tailwind CSS defaults
 */
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type Breakpoint = keyof typeof breakpoints;

/**
 * Hook to detect current responsive breakpoint
 * @returns Object with boolean flags for each breakpoint
 */
export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile: windowSize.width < breakpoints.sm,
    isTablet: windowSize.width >= breakpoints.sm && windowSize.width < breakpoints.lg,
    isDesktop: windowSize.width >= breakpoints.lg,
    // Specific breakpoints
    sm: windowSize.width >= breakpoints.sm,
    md: windowSize.width >= breakpoints.md,
    lg: windowSize.width >= breakpoints.lg,
    xl: windowSize.width >= breakpoints.xl,
    '2xl': windowSize.width >= breakpoints['2xl'],
    // Utility functions
    isBreakpoint: (breakpoint: Breakpoint) => windowSize.width >= breakpoints[breakpoint],
    isBetween: (min: Breakpoint, max: Breakpoint) => 
      windowSize.width >= breakpoints[min] && windowSize.width < breakpoints[max],
  };
}

/**
 * Hook to detect if device has touch capability
 */
export function useTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Check for touch capability
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore - vendor prefix
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
  }, []);

  return isTouch;
}

/**
 * Hook to get device type based on user agent and screen size
 */
export function useDeviceType() {
  const responsive = useResponsive();
  const isTouch = useTouchDevice();
  
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    if (responsive.isMobile || (isTouch && responsive.width < breakpoints.sm)) {
      setDeviceType('mobile');
    } else if (responsive.isTablet || (isTouch && responsive.width < breakpoints.lg)) {
      setDeviceType('tablet');
    } else {
      setDeviceType('desktop');
    }
  }, [responsive, isTouch]);

  return {
    type: deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    hasTouch: isTouch,
  };
}
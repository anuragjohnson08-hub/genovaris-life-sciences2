import type { Transition } from 'motion/react';

/**
 * High-refresh-rate (90Hz / 120Hz / 144Hz+) calibrated iOS spring profiles.
 * Tight restDelta & restSpeed prevent premature tail snapping on high-Hz panels.
 */
export const IOS_SPRING_SNAPPY: Transition = {
  type: 'spring',
  stiffness: 440,
  damping: 34,
  mass: 0.8,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const IOS_SPRING_HOVER: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 30,
  mass: 0.65,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const IOS_SPRING_GENTLE: Transition = {
  type: 'spring',
  stiffness: 290,
  damping: 32,
  mass: 0.95,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const IOS_SPRING_SHEET: Transition = {
  type: 'spring',
  stiffness: 340,
  damping: 35,
  mass: 0.9,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const IOS_SPRING_SCROLL = {
  stiffness: 240,
  damping: 34,
  mass: 0.35,
  restDelta: 0.0005,
};

export const IOS_EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const IOS_TRANSITION_FAST: Transition = {
  duration: 0.2,
  ease: IOS_EASE_OUT,
};

export const IOS_TRANSITION_PAGE: Transition = {
  duration: 0.3,
  ease: IOS_EASE_OUT,
};

export const IOS_REVEAL_TRANSITION: Transition = {
  duration: 0.5,
  ease: IOS_EASE_OUT,
};

export const IOS_SPRING_CHECK: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 26,
  mass: 0.7,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const IOS_VIEWPORT_REVEAL = {
  once: true,
  amount: 0.14 as const,
};

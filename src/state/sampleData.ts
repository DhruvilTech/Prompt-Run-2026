/**
 * High-fidelity sample dataset for TENFLOW
 * Represents a student/early-career professional managing ₹10,000 over 30 days.
 */

import { AppState, DecisionScenario } from '../domain/financeTypes';

export const INITIAL_CONFIG = {
  startingBudget: 10000,
  totalDays: 30,
  currentDay: 10,
  startDate: '2026-10-01',
  emergencyBufferGoal: 1000,
};

export const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-1',
    type: 'expense' as const,
    amount: 850,
    category: 'Food & Dining' as const,
    description: 'Weekly grocery essentials',
    date: '2026-10-01',
    dayIndex: 1,
    isPlanned: false,
  },
  {
    id: 'tx-2',
    type: 'expense' as const,
    amount: 400,
    category: 'Travel & Transit' as const,
    description: 'Metro smartcard recharge',
    date: '2026-10-03',
    dayIndex: 3,
    isPlanned: false,
  },
  {
    id: 'tx-3',
    type: 'expense' as const,
    amount: 180,
    category: 'Food & Dining' as const,
    description: 'Campus cafeteria lunch',
    date: '2026-10-04',
    dayIndex: 4,
    isPlanned: false,
  },
  {
    id: 'tx-4',
    type: 'expense' as const,
    amount: 350,
    category: 'Shopping' as const,
    description: 'Project study notebooks & pens',
    date: '2026-10-06',
    dayIndex: 6,
    isPlanned: false,
  },
  {
    id: 'tx-5',
    type: 'expense' as const,
    amount: 260,
    category: 'Food & Dining' as const,
    description: 'Weekend cold brew & snack',
    date: '2026-10-07',
    dayIndex: 7,
    isPlanned: false,
  },
  {
    id: 'tx-6',
    type: 'income' as const,
    amount: 1200,
    category: 'Income & Freelance' as const,
    description: 'Graphic design side-gig payout',
    date: '2026-10-08',
    dayIndex: 8,
    isPlanned: false,
  },
  {
    id: 'tx-7',
    type: 'expense' as const,
    amount: 120,
    category: 'Food & Dining' as const,
    description: 'Evening tea & snacks',
    date: '2026-10-09',
    dayIndex: 9,
    isPlanned: false,
  },
  {
    id: 'tx-8',
    type: 'expense' as const,
    amount: 150,
    category: 'Travel & Transit' as const,
    description: 'Express feeder bus pass',
    date: '2026-10-10',
    dayIndex: 10,
    isPlanned: false,
  },
];

export const INITIAL_COMMITMENTS = [
  {
    id: 'comm-1',
    name: 'Spotify Student Subscription',
    amount: 59,
    category: 'Subscriptions' as const,
    dueDay: 12,
    isPaid: false,
    notes: 'Auto-debit on 12th',
  },
  {
    id: 'comm-2',
    name: 'Phone & 5G Unlimited Plan',
    amount: 299,
    category: 'Bills & Utilities' as const,
    dueDay: 15,
    isPaid: false,
    notes: 'Prepaid 28-day cycle renewal',
  },
  {
    id: 'comm-3',
    name: 'Shared Flat WiFi Contribution',
    amount: 400,
    category: 'Bills & Utilities' as const,
    dueDay: 20,
    isPaid: false,
    notes: 'Split with roommates',
  },
  {
    id: 'comm-4',
    name: 'Gym & Fitness Membership',
    amount: 600,
    category: 'Health & Wellness' as const,
    dueDay: 25,
    isPaid: false,
    notes: 'Monthly community gym pass',
  },
];

export const INITIAL_GOALS = [
  {
    id: 'goal-1',
    name: 'Emergency Cushion',
    targetAmount: 1000,
    currentAmount: 500,
    targetDay: 30,
    isVirtualAllocation: true,
  },
  {
    id: 'goal-2',
    name: 'Studio Headphones Upgrade',
    targetAmount: 2500,
    currentAmount: 700,
    targetDay: 30,
    isVirtualAllocation: true,
  },
];

export const PREDEFINED_SCENARIOS: DecisionScenario[] = [
  {
    id: 'sc-1',
    title: 'Buy Studio Headphones',
    description: 'Treat yourself to premium noise-cancelling headphones right now.',
    category: 'Shopping',
    impactType: 'one_off_expense',
    amount: 2000,
  },
  {
    id: 'sc-2',
    title: 'Order Gourmet Dinner for Delivery',
    description: 'Tired after a long day; order a special restaurant feast on Zomato/Swiggy.',
    category: 'Food & Dining',
    impactType: 'one_off_expense',
    amount: 450,
  },
  {
    id: 'sc-3',
    title: 'Weekend Cinema & Arcades',
    description: 'Hang out with friends for an IMAX premiere and weekend arcade gaming.',
    category: 'Entertainment',
    impactType: 'one_off_expense',
    amount: 800,
  },
  {
    id: 'sc-4',
    title: 'Unexpected Scooter / Transit Repair',
    description: 'Sudden flat tyre and brake overhaul needed immediately to commute.',
    category: 'Unexpected & Emergency',
    impactType: 'unexpected_expense',
    amount: 1500,
  },
  {
    id: 'sc-5',
    title: 'Receive Freelance Bonus Payout',
    description: 'Client accepted additional web development milestones and cleared invoice.',
    category: 'Income & Freelance',
    impactType: 'income',
    amount: 2000,
  },
  {
    id: 'sc-6',
    title: 'Add Netflix 4K Subscription',
    description: 'Commit to a recurring monthly streaming subscription starting this week.',
    category: 'Subscriptions',
    impactType: 'new_subscription',
    amount: 649,
  },
  {
    id: 'sc-7',
    title: 'Cancel Gym Pass for Home Workouts',
    description: 'Pause gym membership and switch to bodyweight calisthenics in the park.',
    category: 'Health & Wellness',
    impactType: 'cancel_subscription',
    amount: 600,
    targetCommitmentId: 'comm-4',
  },
  {
    id: 'sc-8',
    title: 'Lock In ₹1,000 Safety Buffer',
    description: 'Set aside ₹1,000 untouchable liquid cushion before spending anything else.',
    category: 'Savings Transfer',
    impactType: 'reserve_buffer',
    amount: 1000,
  },
  {
    id: 'sc-9',
    title: 'Boost Savings Contribution',
    description: 'Transfer ₹500 into your priority goals ahead of schedule.',
    category: 'Savings Transfer',
    impactType: 'savings_allocation',
    amount: 500,
  },
];

export function getInitialAppState(): AppState {
  return {
    config: { ...INITIAL_CONFIG },
    transactions: [...INITIAL_TRANSACTIONS],
    commitments: [...INITIAL_COMMITMENTS],
    goals: [...INITIAL_GOALS],
    activeScenarioId: null,
    customScenarios: [],
  };
}

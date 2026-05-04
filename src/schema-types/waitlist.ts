import { z } from 'zod';

export const RoleSchema = z.enum(['coach', 'individual']);
export type Role = z.infer<typeof RoleSchema>;

export const WaitlistFormSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  first_name: z.string().trim().max(32).optional(),
  role: RoleSchema,
  hype_answer: z.string().max(40).optional(),
});
export type WaitlistForm = z.infer<typeof WaitlistFormSchema>;

export const COACH_HYPE_OPTIONS = ['1–5', '6–20', '21–50', '50+'] as const;
export const INDIVIDUAL_HYPE_OPTIONS = [
  'Get stronger',
  'Build muscle',
  'Lose fat',
  'Train for sport',
  'Just feel better',
] as const;

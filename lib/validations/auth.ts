import { z } from 'zod';

export const loginSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createUserSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  firstNameKana: z.string().optional(),
  lastNameKana: z.string().optional(),
  department: z.enum(['FACTORY_1', 'FACTORY_2', 'FACTORY_3', 'PRESS', 'WELDING', 'INDIRECT']),
  role: z.enum(['EMPLOYEE', 'MANAGER', 'ADMIN']).default('EMPLOYEE'),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT']).default('FULL_TIME'),
  hireDate: z.string().or(z.date()),
  hourlyRate: z.number().optional(),
  monthlySalary: z.number().optional(),
  nfcCardId: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true }).extend({
  password: z.string().min(6).optional(),
  isActive: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
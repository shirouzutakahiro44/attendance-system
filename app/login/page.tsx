"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validations/auth';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading, error } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsSubmitting(true);
      await login(data.employeeId, data.password);
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by useAuth
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEFAE0' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#D4A373' }}></div>
          <p style={{ color: '#8B7355' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#E0E1DD' }}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#0D1B2A' }}>
            勤怠管理システム
          </h1>
          <p className="text-lg" style={{ color: '#778DA9' }}>
            Attendance Management System
          </p>
        </div>

        <div className="rounded-2xl p-8 shadow-lg" style={{ backgroundColor: 'white', border: '1px solid #778DA9' }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium mb-2" style={{ color: '#0D1B2A' }}>
                社員番号 / Employee ID
              </label>
              <input
                {...register('employeeId')}
                type="text"
                id="employeeId"
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-colors"
                style={{
                  backgroundColor: 'white',
                  borderColor: '#778DA9',
                  color: '#1B263B'
                }}
                onFocus={(e) => e.target.style.borderColor = '#415A77'}
                onBlur={(e) => e.target.style.borderColor = '#778DA9'}
                placeholder="社員番号を入力してください"
              />
              {errors.employeeId && (
                <p className="mt-1 text-sm" style={{ color: '#E63946' }}>{errors.employeeId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#0D1B2A' }}>
                パスワード / Password
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-colors"
                style={{
                  backgroundColor: 'white',
                  borderColor: '#778DA9',
                  color: '#1B263B'
                }}
                onFocus={(e) => e.target.style.borderColor = '#415A77'}
                onBlur={(e) => e.target.style.borderColor = '#778DA9'}
                placeholder="パスワードを入力してください"
              />
              {errors.password && (
                <p className="mt-1 text-sm" style={{ color: '#E63946' }}>{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg border" style={{ backgroundColor: '#FFEBEE', borderColor: '#E63946' }}>
                <p className="text-sm" style={{ color: '#E63946' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                backgroundColor: '#415A77',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#2F4156')}
              onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#415A77')}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ログイン中...
                </span>
              ) : (
                'ログイン'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs" style={{ color: '#778DA9' }}>
              ログインに関する問題がある場合は、システム管理者にお問い合わせください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
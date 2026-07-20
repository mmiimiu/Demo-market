/**
 * AuthModal translations
 */

import type { Language } from '@/lib/types/user';

export const authTranslations: Record<Language, AuthTranslations> = {
  th: {
    login: {
      title: 'เข้าสู่ระบบ',
      subtitle: 'ยินดีต้อนรับกลับมา',
      email: 'อีเมล',
      password: 'รหัสผ่าน',
      forgotPassword: 'ลืมรหัสผ่าน?',
      loginBtn: 'เข้าสู่ระบบ',
      noAccount: 'ยังไม่มีบัญชี?',
      registerBtn: 'สมัครสมาชิก',
      orContinueWith: 'หรือเข้าสู่ระบบด้วย',
      line: 'LINE',
      google: 'Google',
    },
    register: {
      title: 'สมัครสมาชิก',
      subtitle: 'สร้างบัญชีใหม่',
      fullName: 'ชื่อ-นามสกุล',
      email: 'อีเมล',
      phone: 'เบอร์โทรศัพท์',
      password: 'รหัสผ่าน',
      confirmPassword: 'ยืนยันรหัสผ่าน',
      agreeTerms: 'ฉันยอมรับเงื่อนไขการใช้งาน',
      registerBtn: 'สมัครสมาชิก',
      hasAccount: 'มีบัญชีอยู่แล้ว?',
      loginBtn: 'เข้าสู่ระบบ',
      orContinueWith: 'หรือสมัครด้วย',
      line: 'LINE',
      google: 'Google',
    },
    forgotPassword: {
      title: 'ลืมรหัสผ่าน',
      subtitle: 'กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน',
      email: 'อีเมล',
      sendBtn: 'ส่งลิงก์รีเซ็ต',
      backToLogin: 'กลับไปหน้าเข้าสู่ระบบ',
    },
  },
  en: {
    login: {
      title: 'Login',
      subtitle: 'Welcome back',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      loginBtn: 'Login',
      noAccount: "Don't have an account?",
      registerBtn: 'Sign up',
      orContinueWith: 'Or continue with',
      line: 'LINE',
      google: 'Google',
    },
    register: {
      title: 'Sign up',
      subtitle: 'Create a new account',
      fullName: 'Full name',
      email: 'Email',
      phone: 'Phone number',
      password: 'Password',
      confirmPassword: 'Confirm password',
      agreeTerms: 'I agree to the terms of service',
      registerBtn: 'Sign up',
      hasAccount: 'Already have an account?',
      loginBtn: 'Login',
      orContinueWith: 'Or sign up with',
      line: 'LINE',
      google: 'Google',
    },
    forgotPassword: {
      title: 'Forgot password',
      subtitle: 'Enter your email to receive a password reset link',
      email: 'Email',
      sendBtn: 'Send reset link',
      backToLogin: 'Back to login',
    },
  },
  cn: {
    login: {
      title: '登录',
      subtitle: '欢迎回来',
      email: '电子邮件',
      password: '密码',
      forgotPassword: '忘记密码?',
      loginBtn: '登录',
      noAccount: '还没有账户?',
      registerBtn: '注册',
      orContinueWith: '或使用以下方式登录',
      line: 'LINE',
      google: 'Google',
    },
    register: {
      title: '注册',
      subtitle: '创建新账户',
      fullName: '全名',
      email: '电子邮件',
      phone: '电话号码',
      password: '密码',
      confirmPassword: '确认密码',
      agreeTerms: '我同意服务条款',
      registerBtn: '注册',
      hasAccount: '已有账户?',
      loginBtn: '登录',
      orContinueWith: '或使用以下方式注册',
      line: 'LINE',
      google: 'Google',
    },
    forgotPassword: {
      title: '忘记密码',
      subtitle: '输入您的电子邮件以接收密码重置链接',
      email: '电子邮件',
      sendBtn: '发送重置链接',
      backToLogin: '返回登录',
    },
  },
};

export interface AuthTranslations {
  login: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    forgotPassword: string;
    loginBtn: string;
    noAccount: string;
    registerBtn: string;
    orContinueWith: string;
    line: string;
    google: string;
  };
  register: {
    title: string;
    subtitle: string;
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    agreeTerms: string;
    registerBtn: string;
    hasAccount: string;
    loginBtn: string;
    orContinueWith: string;
    line: string;
    google: string;
  };
  forgotPassword: {
    title: string;
    subtitle: string;
    email: string;
    sendBtn: string;
    backToLogin: string;
  };
}

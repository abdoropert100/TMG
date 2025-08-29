import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/AuthService';

interface LoginCredentials {
  username: string;
  password: string;
  rememberMe: boolean;
}

const LoginForm: React.FC = () => {
  const { actions } = useApp();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // المستخدمين المتاحين للنظام
  const availableUsers = [
    {
      id: 'admin',
      username: 'admin',
      password: 'admin123',
      name: 'مدير النظام',
      role: 'مدير النظام',
      department: 'إدارة تقنية المعلومات',
      permissions: ['admin', 'read', 'write', 'delete', 'export', 'import']
    },
    {
      id: 'manager',
      username: 'manager',
      password: 'manager123',
      name: 'مدير الإدارة',
      role: 'مدير إدارة',
      department: 'الإدارة الهندسية',
      permissions: ['read', 'write', 'export']
    },
    {
      id: 'employee',
      username: 'employee',
      password: 'employee123',
      name: 'موظف عادي',
      role: 'موظف',
      department: 'الشؤون الإدارية',
      permissions: ['read']
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // استخدام خدمة المصادقة الجديدة
      const result = await authService.login(
        credentials.username, 
        credentials.password, 
        credentials.rememberMe
      );

      if (result.success && result.user) {
        // تحديث بيانات المستخدم الحالي
        actions.updateCurrentUser({
          id: result.user.id,
          name: result.user.fullName,
          role: result.user.role,
          department: result.user.departmentId || '',
          permissions: result.user.permissions
        });

        // حفظ بيانات الجلسة
        const sessionData = {
          userId: result.user.id,
          username: result.user.username,
          name: result.user.fullName,
          role: result.user.role,
          loginTime: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).getTime() // 8 ساعات
        };

        if (credentials.rememberMe) {
          localStorage.setItem('userSession', JSON.stringify(sessionData));
        } else {
          sessionStorage.setItem('userSession', JSON.stringify(sessionData));
        }

        // تسجيل عملية الدخول
        actions.logActivity('auth', 'login', `تم تسجيل الدخول بنجاح للمستخدم ${result.user.fullName}`);

        // إعادة تحميل الصفحة لتطبيق التغييرات
        window.location.reload();
      } else {
        setError(result.error || 'اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      setError('خطأ في تسجيل الدخول');
      console.error('خطأ في تسجيل الدخول:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* رأس النموذج */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold mb-2">نظام إدارة مصلحة الري</h1>
          <p className="text-blue-100">وزارة الموارد المائية والري</p>
        </div>

        {/* نموذج تسجيل الدخول */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* رسالة الخطأ */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* اسم المستخدم */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المستخدم
              </label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أدخل اسم المستخدم"
                  required
                />
              </div>
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أدخل كلمة المرور"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* تذكرني */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={credentials.rememberMe}
                onChange={(e) => setCredentials(prev => ({ ...prev, rememberMe: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="rememberMe" className="mr-2 text-sm text-gray-700">
                تذكرني
              </label>
            </div>

            {/* زر تسجيل الدخول */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>

          </form>

          {/* معلومات المستخدمين التجريبية */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">حسابات تجريبية:</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div>مدير النظام: admin / admin123</div>
              <div>مدير إدارة: manager / manager123</div>
              <div>موظف عادي: employee / employee123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
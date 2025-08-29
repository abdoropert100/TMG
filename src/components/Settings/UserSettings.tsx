import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Camera,
  Key,
  Shield,
  Bell,
  Globe,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// واجهة إعدادات المستخدم
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  division: string;
  avatar: string;
  joinDate: string;
  lastLogin: string;
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    notifications: {
      email: boolean;
      browser: boolean;
      mobile: boolean;
    };
    privacy: {
      showEmail: boolean;
      showPhone: boolean;
      showLastLogin: boolean;
    };
  };
}

// واجهة خصائص مكون إعدادات المستخدم
interface UserSettingsProps {
  config: any;
  onConfigChange: (config: any) => void;
}

// مكون إعدادات المستخدم
const UserSettings: React.FC<UserSettingsProps> = ({ config, onConfigChange }) => {
  // استخدام السياق للحصول على بيانات المستخدم الحالي
  const { state, actions } = useApp();

  // حالات المكون
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // حالة ملف المستخدم
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: state.currentUser.id,
    name: state.currentUser.name,
    email: 'admin@irrigation.gov.eg',
    phone: '+20 10 0073 1116',
    position: state.currentUser.role,
    department: state.currentUser.department,
    division: 'قسم إدارة النظم',
    avatar: '',
    joinDate: '2023-01-15',
    lastLogin: new Date().toISOString(),
    preferences: {
      language: 'ar',
      timezone: 'Africa/Cairo',
      dateFormat: 'DD/MM/YYYY',
      notifications: {
        email: true,
        browser: true,
        mobile: false
      },
      privacy: {
        showEmail: true,
        showPhone: false,
        showLastLogin: true
      }
    }
  });

  // حالات النموذج
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // دالة تحديث ملف المستخدم
  const handleProfileUpdate = (field: keyof UserProfile, value: any) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
    
    // تحديث بيانات المستخدم في السياق العام
    if (field === 'name') {
      actions.updateCurrentUser({ name: value });
    }
  };

  // دالة تحديث التفضيلات
  const handlePreferenceUpdate = (category: string, field: string, value: any) => {
    setUserProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: {
          ...prev.preferences[category as keyof typeof prev.preferences],
          [field]: value
        }
      }
    }));
  };

  // دالة تغيير كلمة المرور
  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    // هنا يتم إرسال طلب تغيير كلمة المرور
    console.log('تغيير كلمة المرور');
    setShowChangePassword(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setSuccess('تم تغيير كلمة المرور بنجاح');
    setTimeout(() => setSuccess(null), 3000);
  };

  // دالة رفع صورة الملف الشخصي
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleProfileUpdate('avatar', result);
        actions.updateCurrentUser({ avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* رسائل النجاح والخطأ */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="mr-auto text-red-600">×</button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-700">{success}</span>
          <button onClick={() => setSuccess(null)} className="mr-auto text-green-600">×</button>
        </div>
      )}

      {/* الملف الشخصي */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">الملف الشخصي</h3>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-white transition-colors"
          >
            <Edit className="h-4 w-4" />
            {isEditing ? 'إلغاء' : 'تعديل'}
          </button>
        </div>

        <div className="flex items-start gap-6">
          {/* صورة الملف الشخصي */}
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt="الصورة الشخصية" className="w-full h-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-gray-400" />
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="h-3 w-3" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            )}
          </div>

          {/* معلومات المستخدم */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
              {isEditing ? (
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) => handleProfileUpdate('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{userProfile.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              {isEditing ? (
                <input
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => handleProfileUpdate('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{userProfile.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={userProfile.phone}
                  onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{userProfile.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المنصب</label>
              <p className="text-gray-900">{userProfile.position}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الإدارة</label>
              <p className="text-gray-900">{userProfile.department}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
              <p className="text-gray-900">{userProfile.division}</p>
            </div>
          </div>
        </div>
      </div>

      {/* الأمان وكلمة المرور */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">الأمان وكلمة المرور</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">كلمة المرور</p>
                <p className="text-sm text-gray-600">آخر تغيير منذ 30 يوماً</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowChangePassword(true)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              تغيير كلمة المرور
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">المصادقة الثنائية</p>
                <p className="text-sm text-gray-600">حماية إضافية لحسابك</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* التفضيلات */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">التفضيلات</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* اللغة والمنطقة */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">اللغة والمنطقة</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اللغة</label>
              <select
                value={userProfile.preferences.language}
                onChange={(e) => handlePreferenceUpdate('', 'language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المنطقة الزمنية</label>
              <select
                value={userProfile.preferences.timezone}
                onChange={(e) => handlePreferenceUpdate('', 'timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Africa/Cairo">القاهرة (GMT+2)</option>
                <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                <option value="UTC">UTC (GMT+0)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تنسيق التاريخ</label>
              <select
                value={userProfile.preferences.dateFormat}
                onChange={(e) => handlePreferenceUpdate('', 'dateFormat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>

          {/* الإشعارات */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">الإشعارات</h4>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">إشعارات البريد الإلكتروني</span>
                <input
                  type="checkbox"
                  checked={userProfile.preferences.notifications.email}
                  onChange={(e) => handlePreferenceUpdate('notifications', 'email', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">إشعارات المتصفح</span>
                <input
                  type="checkbox"
                  checked={userProfile.preferences.notifications.browser}
                  onChange={(e) => handlePreferenceUpdate('notifications', 'browser', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">إشعارات الهاتف المحمول</span>
                <input
                  type="checkbox"
                  checked={userProfile.preferences.notifications.mobile}
                  onChange={(e) => handlePreferenceUpdate('notifications', 'mobile', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* الخصوصية */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">إعدادات الخصوصية</h3>
        
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">إظهار البريد الإلكتروني للآخرين</span>
            <input
              type="checkbox"
              checked={userProfile.preferences.privacy.showEmail}
              onChange={(e) => handlePreferenceUpdate('privacy', 'showEmail', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">إظهار رقم الهاتف للآخرين</span>
            <input
              type="checkbox"
              checked={userProfile.preferences.privacy.showPhone}
              onChange={(e) => handlePreferenceUpdate('privacy', 'showPhone', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">إظهار آخر تسجيل دخول</span>
            <input
              type="checkbox"
              checked={userProfile.preferences.privacy.showLastLogin}
              onChange={(e) => handlePreferenceUpdate('privacy', 'showLastLogin', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* نافذة تغيير كلمة المرور */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">تغيير كلمة المرور</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الحالية</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowChangePassword(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handlePasswordChange}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                تغيير كلمة المرور
              </button>
            </div>
          </div>
          
          {/* إغلاق النافذة عند النقر خارجها */}
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => setShowChangePassword(false)}
          ></div>
        </div>
      )}

    </div>
  );
};

export default UserSettings;

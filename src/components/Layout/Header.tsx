/**
 * مكون شريط الرأس العلوي
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  User, 
  Menu, 
  LogOut, 
  Settings,
  ChevronDown,
  Globe,
  Sun,
  Moon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationPanel from './NotificationPanel';
import GlobalSearch from '../UI/GlobalSearch';
import NotificationBadge from '../UI/NotificationBadge';

// واجهة خصائص شريط الرأس
interface HeaderProps {
  currentUser: {
    id: string;
    name: string;
    role: string;
    department: string;
    avatar: string;
    permissions: string[];
  };
  onToggleSidebar: () => void;
  systemName: string;
  organizationName: string;
  notifications: any[];
}

/**
 * مكون شريط الرأس العلوي
 * يحتوي على البحث والإشعارات ومعلومات المستخدم
 */
const Header: React.FC<HeaderProps> = ({
  currentUser,
  onToggleSidebar,
  systemName,
  organizationName,
  notifications: _notifications // سيتم تجاهل هذا ونستخدم useNotifications
}) => {
  const { state } = useApp();
  const { notifications, unreadCount, loadNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications(state.currentUser.id);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  // إخفاء عدد الإشعارات عند فتح اللوحة
  const handleNotificationsClick = () => {
    setShowNotifications(true);
  };

  /**
   * دالة تسجيل الخروج
   */
  const handleLogout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      // مسح بيانات الجلسة
      localStorage.removeItem('userSession');
      sessionStorage.removeItem('userSession');
      
      // تسجيل عملية الخروج
      actions.logActivity('auth', 'logout', 'تم تسجيل الخروج من النظام');
      
      // إعادة تحميل الصفحة
      window.location.reload();
    }
  };

  /**
   * دالة معالجة النقر على نتيجة البحث
   */
  const handleSearchResult = (result: any) => {
    // التنقل إلى الصفحة المناسبة
    switch (result.type) {
      case 'task':
        actions.setCurrentPage('tasks');
        break;
      case 'employee':
        actions.setCurrentPage('employees');
        break;
      case 'correspondence':
        actions.setCurrentPage('correspondence');
        break;
      case 'department':
        actions.setCurrentPage('departments');
        break;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        
        {/* الجانب الأيمن: زر القائمة والبحث */}
        <div className="flex items-center gap-4">
          
          {/* زر تبديل الشريط الجانبي */}
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* البحث الشامل */}
          <div className="relative">
            <button
              onClick={() => setShowGlobalSearch(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors min-w-[300px] text-right"
            >
              <Search className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">البحث في جميع أنحاء النظام...</span>
            </button>
          </div>

        </div>

        {/* الجانب الأيسر: الإشعارات ومعلومات المستخدم */}
        <div className="flex items-center gap-4">
          
          {/* زر الإشعارات */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="عرض الإشعارات"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full px-2 text-xs font-bold">{unreadCount}</span>
              )}
            </button>
          </div>

          {/* معلومات المستخدم */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.role}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {/* قائمة المستخدم المنسدلة */}
            {showUserMenu && (
              <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                <div className="p-3 border-b border-gray-100">
                  <p className="font-medium text-gray-900">{currentUser.name}</p>
                  <p className="text-sm text-gray-600">{currentUser.department}</p>
                </div>
                
                <button
                  onClick={() => {
                    actions.setCurrentPage('settings');
                    setShowUserMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4" />
                  الإعدادات
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* لوحة الإشعارات */}
      {showNotifications && (
        <NotificationPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          notifications={notifications}
          onMarkAsRead={async (id) => { await markAsRead(id); loadNotifications(); }}
          onMarkAllAsRead={async () => { await markAllAsRead(); loadNotifications(); }}
          onDeleteNotification={async (id) => { await deleteNotification(id); loadNotifications(); }}
        />
      )}

      {/* البحث الشامل */}
      <GlobalSearch
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
        onResultClick={handleSearchResult}
      />

      {/* إغلاق القوائم عند النقر خارجها */}
      {(showUserMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        ></div>
      )}

    </header>
  );
};

export default Header;
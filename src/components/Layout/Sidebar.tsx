import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Mail, 
  Building2, 
  FileText, 
  Settings, 
  SettingsIcon,
  ChevronLeft,
  Activity,
  TestTube,
  Trash2,
  Tag
} from 'lucide-react';

/**
 * واجهة خصائص الشريط الجانبي
 */
interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  systemName: string; // اسم النظام القابل للتخصيص
}

/**
 * قائمة عناصر القائمة الرئيسية مع الأيقونات والتسميات
 */
const menuItems = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'tasks', label: 'إدارة المهام', icon: CheckSquare },
  { id: 'correspondence', label: 'إدارة المراسلات', icon: Mail },
  { id: 'employees', label: 'إدارة الموظفين', icon: Users },
  { id: 'departments', label: 'إدارة الأقسام', icon: Building2 },
  { id: 'reports', label: 'التقارير', icon: FileText },
  { id: 'attachments', label: 'مرفقات', icon: FileText },
  { id: 'trash', label: 'سلة المحذوفات', icon: Trash2 },
  { id: 'users', label: 'إدارة المستخدمين', icon: Users },
  { id: 'categories', label: 'إدارة التصنيفات', icon: Tag },
  { id: 'system-log', label: 'سجل النظام', icon: Activity },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
  { id: 'advanced-settings', label: 'الإعدادات المتقدمة', icon: SettingsIcon },
  { id: 'system-test', label: 'فحص النظام', icon: TestTube }
];

/**
 * مكون الشريط الجانبي للتنقل
 * يوفر تنقل سهل بين أقسام النظام المختلفة
 */
const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  onPageChange, 
  isCollapsed, 
  onToggleCollapse,
  systemName
}) => {
  return (
    <div className={`bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } min-h-screen relative flex flex-col shadow-lg`}>
      
      {/* قسم شعار النظام والعنوان الرئيسي */}
      <div className="p-4 border-b border-blue-700/50">
        <div className="flex items-center gap-3">
          {/* أيقونة النظام الرئيسية */}
          {systemName.includes('شعار') ? (
            <div className="bg-white rounded-lg p-2 flex-shrink-0 shadow-md">
              <img src="/logo.png" alt="شعار النظام" className="h-6 w-6" />
            </div>
          ) : (
            <div className="bg-white rounded-lg p-2 flex-shrink-0 shadow-md">
              <Activity className="h-6 w-6 text-blue-900" />
            </div>
          )}
          
          {/* عرض اسم النظام القابل للتخصيص */}
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-lg leading-tight truncate">
                {systemName || 'نظام إدارة مصلحة الري'}
              </h1>
              <p className="text-blue-200 text-xs mt-1 truncate">
                وزارة الموارد المائية والري
              </p>
            </div>
          )}
        </div>
      </div>

      {/* زر التحكم في توسيع/طي الشريط الجانبي */}
      <button
        onClick={onToggleCollapse}
        className="absolute -left-3 top-20 bg-blue-800 hover:bg-blue-700 rounded-full p-1.5 border-2 border-white shadow-lg transition-all duration-200 hover:scale-110"
        dir="ltr"
        title={isCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
      >
        <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* قائمة التنقل الرئيسية بين أقسام النظام */}
      <nav className="flex-1 mt-6 px-3">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative group ${
                    isActive
                      ? 'bg-white/20 text-white shadow-lg border-r-4 border-yellow-400 scale-105'
                      : 'text-blue-200 hover:bg-white/10 hover:text-white hover:scale-105'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {/* أيقونة عنصر القائمة */}
                  <Icon className={`h-5 w-5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-yellow-400' : 'group-hover:text-white'
                  }`} />
                  
                  {/* نص تسمية عنصر القائمة */}
                  {!isCollapsed && (
                    <span className="font-medium text-sm truncate">
                      {item.label}
                    </span>
                  )}

                  {/* مؤشر بصري للعنصر النشط */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-yellow-400 rounded-full" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* قسم معلومات النظام في أسفل الشريط الجانبي */}
      {!isCollapsed && (
        <div className="p-4 border-t border-blue-700/50 mt-auto">
          <div className="bg-blue-800/50 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-blue-200 text-xs mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>النظام متصل</span>
            </div>
            <div className="text-xs text-blue-300 space-y-1">
              <p>الإصدار: 1.0.0</p>
              <p>آخر تحديث: يناير 2024</p>
            </div>
          </div>
        </div>
      )}

      {/* مؤشر حالة النظام عند طي الشريط الجانبي */}
      {isCollapsed && (
        <div className="p-4 flex justify-center">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" title="النظام متصل" />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
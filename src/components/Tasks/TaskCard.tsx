import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  Building2, 
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  ArrowRight,
  MoreVertical,
  Eye,
  Repeat,
  Mail,
  Link
} from 'lucide-react';
import { Task, Employee, Department, Division } from '../../types';

/**
 * واجهة خصائص بطاقة المهمة
 */
interface TaskCardProps {
  task: Task;
  employees: Employee[];
  departments: Department[];
  divisions: Division[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onTransfer: (task: Task) => void;
  onViewDetails: (task: Task) => void;
  onLinkToCorrespondence?: (task: Task) => void;
}

/**
 * مكون بطاقة المهمة المحسن
 * يعرض معلومات المهمة مع إمكانيات التفاعل والإدارة
 */
const TaskCard: React.FC<TaskCardProps> = ({
  task,
  employees,
  departments,
  divisions,
  onEdit,
  onDelete,
  onStatusChange,
  onTransfer,
  onViewDetails,
  onLinkToCorrespondence
}) => {
  // حالة عرض قائمة الإجراءات
  const [showMenu, setShowMenu] = useState(false);

  /**
   * دالة الحصول على لون أولوية المهمة
   * @param priority أولوية المهمة
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'عاجل': return 'bg-red-100 text-red-800 border-red-200';
      case 'عالي': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'متوسط': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'منخفض': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * دالة الحصول على لون حالة المهمة
   * @param status حالة المهمة
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مكتملة': return 'bg-green-100 text-green-800 border-green-200';
      case 'قيد التنفيذ': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'متأخرة': return 'bg-red-100 text-red-800 border-red-200';
      case 'جديدة': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * دالة الحصول على أيقونة حالة المهمة
   * @param status حالة المهمة
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'مكتملة': return <CheckCircle className="h-4 w-4" />;
      case 'قيد التنفيذ': return <Clock className="h-4 w-4" />;
      case 'متأخرة': return <AlertCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  /**
   * دالة حساب الأيام المتبقية لانتهاء المهمة
   */
  const getDaysRemaining = () => {
    const today = new Date();
    const endDate = new Date(task.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /**
   * دالة الحصول على أسماء الموظفين من معرفاتهم
   * @param employeeIds قائمة معرفات الموظفين
   */
  const getEmployeeNames = (employeeIds: string[]) => {
    return employeeIds
      .map(id => employees.find(emp => emp.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  /**
   * دالة الحصول على اسم الإدارة من معرفها
   */
  const getDepartmentName = () => {
    return departments.find(dept => dept.id === task.department)?.name || task.department;
  };

  /**
   * دالة الحصول على اسم القسم من معرفه
   */
  const getDivisionName = () => {
    return divisions.find(div => div.id === task.division)?.name || task.division;
  };

  /**
   * دالة تغيير حالة المهمة
   * @param newStatus الحالة الجديدة
   */
  const handleStatusChange = (newStatus: string) => {
    onStatusChange(task.id, newStatus);
    setShowMenu(false);
  };

  /**
   * دالة حذف المهمة مع تأكيد المستخدم
   */
  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      onDelete(task.id);
    }
    setShowMenu(false);
  };

  // حساب الأيام المتبقية وحالة التأخير
  const daysRemaining = getDaysRemaining();
  const isOverdue = daysRemaining < 0 && task.status !== 'مكتملة';

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-300 hover:shadow-md w-full flex flex-col ${
      isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-100 hover:border-blue-200'
    }`}>
      
      {/* رأس البطاقة مع المعلومات الأساسية */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          
          {/* قسم معلومات المهمة الأساسية */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {/* شارة الأولوية */}
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              {/* شارة الحالة مع الأيقونة */}
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                {getStatusIcon(task.status)}
                {task.status}
              </span>
              {/* شارة المهمة المتكررة */}
              {task.isRecurring && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  <Mail className="h-4 w-4" />
                  متكررة ({task.recurringCount || 0} مرة)
                </span>
              )}
            </div>
            
            {/* عنوان المهمة */}
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {task.title}
            </h3>
            
            {/* وصف المهمة */}
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {task.description}
            </p>
          </div>

          {/* قائمة الإجراءات المنسدلة */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {/* النافذة المنبثقة للإجراءات */}
            {showMenu && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg min-w-56 max-w-xs w-full p-2">
                  {/* إجراءات المشاهدة والتعديل */}
                  <button
                    onClick={() => { onViewDetails(task); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4" />
                    عرض التفاصيل
                  </button>
                  <button
                    onClick={() => { onEdit(task); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4" />
                    تعديل
                  </button>
                  <button
                    onClick={() => { onTransfer(task); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <ArrowRight className="h-4 w-4" />
                    تحويل
                  </button>
                  {onLinkToCorrespondence && (
                    <button
                      onClick={() => { onLinkToCorrespondence(task); setShowMenu(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Link className="h-4 w-4" />
                      ربط بمراسلة
                    </button>
                  )}
                  <div className="border-t border-gray-100 my-1"></div>
                  {/* قسم تغيير حالة المهمة */}
                  <div className="px-3 py-1">
                    <p className="text-xs text-gray-500 mb-1">تغيير الحالة:</p>
                    {['جديدة', 'قيد التنفيذ', 'مكتملة', 'متأخرة'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`block w-full text-right px-2 py-1 text-xs rounded hover:bg-gray-50 ${
                          task.status === status ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 my-1"></div>
                  {/* زر حذف المهمة */}
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    حذف
                  </button>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="mt-2 w-full px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* محتوى البطاقة الرئيسي */}
      <div className="p-4 space-y-3">
        
        {/* عرض معلومات الإدارة والقسم */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Building2 className="h-4 w-4" />
            <span>{getDepartmentName()}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>•</span>
            <span>{getDivisionName()}</span>
          </div>
        </div>

        {/* عرض الموظفين المسند إليهم المهمة */}
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">المسند إليهم:</span>
          <span className="text-gray-900 font-medium">
            {getEmployeeNames(task.assignedTo || [])}
          </span>
        </div>

        {task.linkedCorrespondenceId && (
          <div className="flex items-center gap-2 text-sm">
            <Link className="h-4 w-4 text-purple-500" />
            <span className="text-gray-600">مرتبطة بمراسلة:</span>
            <span className="text-purple-700 font-medium">
              {task.linkedCorrespondenceId.slice(0, 8)}...
            </span>
          </div>
        )}

        {/* عرض الموظفين المنجزين للمهمة (إن وجدوا) */}
        {task.completedBy && task.completedBy.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-gray-600">المنجزون:</span>
            <span className="text-green-700 font-medium">
              {getEmployeeNames(task.completedBy)}
            </span>
          </div>
        )}

        {/* عرض تواريخ المهمة والوقت المتبقي */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {new Date(task.startDate).toLocaleDateString('ar-EG')} - {new Date(task.endDate).toLocaleDateString('ar-EG')}
            </span>
          </div>
          
          {/* مؤشر الوقت المتبقي مع الألوان التحذيرية */}
          <div className={`flex items-center gap-1 ${
            isOverdue ? 'text-red-600' : daysRemaining <= 3 ? 'text-orange-600' : 'text-gray-600'
          }`}>
            <Clock className="h-4 w-4" />
            <span className="text-xs">
              {isOverdue 
                ? `متأخر ${Math.abs(daysRemaining)} يوم`
                : daysRemaining === 0 
                ? 'ينتهي اليوم'
                : `${daysRemaining} يوم متبقي`
              }
            </span>
          </div>
        </div>

        {/* عرض نقاط المهمة (إن وجدت) */}
        {task.points > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-gray-600">النقاط:</span>
              <span className="text-blue-600 font-semibold">{task.points}</span>
            </div>
            {task.isRecurring && (
              <div className="flex items-center gap-1 text-xs text-purple-600">
                <Repeat className="h-3 w-3" />
                <span>متكررة - تكررت {task.recurringCount || 0} مرة</span>
              </div>
            )}
          </div>
        )}

        {/* عرض العلامات */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* شريط التقدم للمهام قيد التنفيذ */}
        {task.status === 'قيد التنفيذ' && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>التقدم</span>
              <span>75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        )}

      </div>

      {/* تحذير خاص للمهام المتأخرة */}
      {isOverdue && (
        <div className="px-4 pb-4">
          <div className="bg-red-100 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-red-700 text-sm font-medium">
              هذه المهمة متأخرة ويجب معالجتها فوراً
            </span>
          </div>
        </div>
      )}

      {/* طبقة شفافة لإغلاق القائمة عند النقر خارجها */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMenu(false)}
        ></div>
      )}

    </div>
  );
};

export default TaskCard;
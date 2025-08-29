/**
 * مكون تفاصيل المهمة المتقدم
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Building2, 
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Edit,
  ArrowRight,
  FileText,
  Link,
  Repeat,
  Award,
  MessageSquare,
  Download,
  Eye,
  Tag
} from 'lucide-react';
import { Task, Employee, Department, Division } from '../../types';
import { useApp } from '../../context/AppContext';
import AttachmentViewer from '../UI/AttachmentViewer';
import FileUpload from '../UI/FileUpload';

// واجهة خصائص مكون تفاصيل المهمة
interface TaskDetailsProps {
  task: Task;
  employees: Employee[];
  departments: Department[];
  divisions: Division[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onTransfer: (task: Task) => void;
  onCreateRecurring: (task: Task) => void;
  onLinkToCorrespondence: (task: Task) => void;
}

/**
 * مكون تفاصيل المهمة الشامل
 * يعرض جميع تفاصيل المهمة مع المرفقات والسجلات والمراسلات المرتبطة
 */
const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  employees,
  departments,
  divisions,
  isOpen,
  onClose,
  onEdit,
  onStatusChange,
  onTransfer,
  onCreateRecurring,
  onLinkToCorrespondence
}) => {
  const { state, actions } = useApp();
  
  // حالات المكون
  const [activeTab, setActiveTab] = useState<'details' | 'attachments' | 'history' | 'correspondence' | 'progress'>('details');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [progressNotes, setProgressNotes] = useState('');

  /**
   * دالة الحصول على اسم الموظف
   */
  const getEmployeeName = (employeeId: string) => {
    return employees.find(emp => emp.id === employeeId)?.name || employeeId;
  };

  /**
   * دالة الحصول على اسم الإدارة
   */
  const getDepartmentName = () => {
    return departments.find(dept => dept.id === task.department)?.name || task.department;
  };

  /**
   * دالة الحصول على اسم القسم
   */
  const getDivisionName = () => {
    return divisions.find(div => div.id === task.division)?.name || task.division;
  };

  /**
   * دالة الحصول على لون الأولوية
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
   * دالة الحصول على لون الحالة
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
   * دالة حساب الأيام المتبقية
   */
  const getDaysRemaining = () => {
    const today = new Date();
    const endDate = new Date(task.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /**
   * دالة تحديث تقدم المهمة
   */
  const handleUpdateProgress = async () => {
    if (!progressNotes.trim()) return;

    try {
      // إضافة تحديث للتقدم
      const progressUpdate = {
        id: `progress-${Date.now()}`,
        taskId: task.id,
        notes: progressNotes,
        updatedBy: state.currentUser.id,
        timestamp: new Date()
      };

      // تسجيل التحديث في سجل النشاطات
      actions.logActivity('tasks', 'progress_update', 
        `تم إضافة تحديث للمهمة: ${task.title} - ${progressNotes}`
      );

      setProgressNotes('');
      alert('تم إضافة تحديث التقدم بنجاح');
    } catch (error) {
      console.error('خطأ في تحديث التقدم:', error);
    }
  };

  const daysRemaining = getDaysRemaining();
  const isOverdue = daysRemaining < 0 && task.status !== 'مكتملة';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* رأس النافذة */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getPriorityColor(task.priority)}`}>
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">تفاصيل المهمة</h2>
              <p className="text-sm text-gray-600">{task.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTransfer(task)}
              className="flex items-center gap-2 px-3 py-1 text-sm border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
              تحويل
            </button>
            <button
              onClick={() => onEdit(task)}
              className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="h-4 w-4" />
              تعديل
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* التبويبات */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 space-x-reverse px-6">
            {[
              { key: 'details', label: 'التفاصيل', icon: FileText },
              { key: 'attachments', label: 'المرفقات', icon: FileText },
              { key: 'progress', label: 'التقدم', icon: Target },
              { key: 'correspondence', label: 'المراسلات', icon: Link },
              { key: 'history', label: 'السجل', icon: Clock }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* محتوى التبويبات */}
        <div className="p-6">
          
          {/* تبويب التفاصيل */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              
              {/* معلومات أساسية */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{task.title}</h3>
                
                {/* الشارات */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  {task.isRecurring && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                      <Repeat className="h-3 w-3 inline mr-1" />
                      متكررة
                    </span>
                  )}
                  {task.points > 0 && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      <Award className="h-3 w-3 inline mr-1" />
                      {task.points} نقطة
                    </span>
                  )}
                </div>

                <p className="text-gray-700 mb-4">{task.description}</p>
              </div>

              {/* تفاصيل المهمة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* معلومات التوقيت */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">معلومات التوقيت</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">تاريخ البداية:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(task.startDate).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">تاريخ النهاية:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(task.endDate).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">الوقت المتبقي:</span>
                      <span className={`text-sm font-medium ${
                        isOverdue ? 'text-red-600' : daysRemaining <= 3 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {isOverdue 
                          ? `متأخر ${Math.abs(daysRemaining)} يوم`
                          : daysRemaining === 0 
                          ? 'ينتهي اليوم'
                          : `${daysRemaining} يوم متبقي`
                        }
                      </span>
                    </div>

                    {task.completedAt && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">تاريخ الإكمال:</span>
                        <span className="text-sm font-medium text-green-700">
                          {new Date(task.completedAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* معلومات التنظيم */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">معلومات التنظيم</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">الإدارة:</span>
                      <span className="text-sm font-medium text-gray-900">{getDepartmentName()}</span>
                    </div>
                    
                    {task.division && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">القسم:</span>
                        <span className="text-sm font-medium text-gray-900">{getDivisionName()}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">أنشأ بواسطة:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {getEmployeeName(task.createdBy)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">تاريخ الإنشاء:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(task.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* الموظفون المسند إليهم */}
              {task.assignedTo && task.assignedTo.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">الموظفون المسند إليهم</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {task.assignedTo.map(employeeId => {
                      const employee = employees.find(emp => emp.id === employeeId);
                      return employee ? (
                        <div key={employeeId} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {employee.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-blue-900">{employee.name}</p>
                            <p className="text-sm text-blue-700">{employee.position}</p>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* الموظفون المنجزون */}
              {task.completedBy && task.completedBy.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">الموظفون المنجزون</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {task.completedBy.map(employeeId => {
                      const employee = employees.find(emp => emp.id === employeeId);
                      return employee ? (
                        <div key={employeeId} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {employee.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-green-900">{employee.name}</p>
                            <p className="text-sm text-green-700">{employee.position}</p>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* العلامات */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">العلامات</h4>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        <Tag className="h-3 w-3 inline mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* الملاحظات */}
              {task.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">الملاحظات</h4>
                  <div className="text-gray-700 whitespace-pre-wrap">{task.notes}</div>
                </div>
              )}

            </div>
          )}

          {/* تبويب المرفقات */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              
              {/* عارض المرفقات الموجودة */}
              <AttachmentViewer
                moduleType="task"
                moduleId={task.id}
                canDelete={true}
                showUploadCount={true}
              />

              {/* رفع مرفقات جديدة */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => setShowFileUpload(!showFileUpload)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  إضافة مرفقات
                </button>

                {showFileUpload && (
                  <div className="mt-4">
                    <FileUpload
                      moduleType="task"
                      moduleId={task.id}
                      uploadedBy={state.currentUser.id}
                      onUploadComplete={() => {
                        setShowFileUpload(false);
                      }}
                      onUploadError={(error) => {
                        console.error('خطأ في رفع الملف:', error);
                      }}
                    />
                  </div>
                )}
              </div>

            </div>
          )}

          {/* تبويب التقدم */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              
              {/* شريط التقدم */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">نسبة الإنجاز</h4>
                  <span className="text-lg font-bold text-blue-600">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
                </div>
              </div>

              {/* إضافة تحديث للتقدم */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">إضافة تحديث للتقدم</h4>
                <textarea
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أدخل تحديث حول تقدم المهمة..."
                />
                <button
                  onClick={handleUpdateProgress}
                  disabled={!progressNotes.trim()}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <MessageSquare className="h-4 w-4" />
                  إضافة تحديث
                </button>
              </div>

              {/* معلومات الوقت */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">الساعات المقدرة</h5>
                  <p className="text-2xl font-bold text-blue-600">{task.estimatedHours || 0}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h5 className="font-medium text-green-900 mb-2">الساعات الفعلية</h5>
                  <p className="text-2xl font-bold text-green-600">{task.actualHours || 0}</p>
                </div>
              </div>

            </div>
          )}

          {/* تبويب المراسلات المرتبطة */}
          {activeTab === 'correspondence' && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">المراسلات المرتبطة</h4>
              
              {task.linkedCorrespondenceId ? (
                (() => {
                  const linkedCorrespondence = state.correspondence.find(c => c.id === task.linkedCorrespondenceId);
                  return linkedCorrespondence ? (
                    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Link className="h-4 w-4 text-blue-600" />
                        <h5 className="font-medium text-blue-900">مراسلة مرتبطة</h5>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-blue-800">الرقم:</span> {linkedCorrespondence.number}</p>
                        <p><span className="text-blue-800">الموضوع:</span> {linkedCorrespondence.subject}</p>
                        <p><span className="text-blue-800">النوع:</span> {linkedCorrespondence.type}</p>
                        <p><span className="text-blue-800">الحالة:</span> {linkedCorrespondence.status}</p>
                        <p><span className="text-blue-800">التاريخ:</span> {new Date(linkedCorrespondence.date).toLocaleDateString('ar-EG')}</p>
                      </div>
                      <button 
                        onClick={() => {
                          actions.setCurrentPage('correspondence');
                          onClose();
                        }}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        عرض المراسلة
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <p className="text-red-700">المراسلة المرتبطة غير موجودة</p>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Link className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>لا توجد مراسلات مرتبطة بهذه المهمة</p>
                  <button
                    onClick={() => onLinkToCorrespondence(task)}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    ربط بمراسلة موجودة
                  </button>
                </div>
              )}
            </div>
          )}

          {/* تبويب السجل */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">سجل التغييرات</h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-gray-900">تم إنشاء المهمة</h5>
                      <span className="text-xs text-gray-500">
                        {new Date(task.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">تم إنشاء المهمة وإسنادها للموظفين</p>
                    <p className="text-xs text-gray-500 mt-1">بواسطة: {getEmployeeName(task.createdBy)}</p>
                  </div>
                </div>

                {task.updatedAt && task.updatedAt !== task.createdAt && (
                  <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-gray-900">تم تحديث المهمة</h5>
                        <span className="text-xs text-gray-500">
                          {new Date(task.updatedAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">تم تحديث بيانات المهمة</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default TaskDetails;
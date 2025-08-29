/**
 * مكون إدارة المهام المتكررة
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState, useEffect } from 'react';
import { 
  Repeat, 
  Calendar, 
  Clock, 
  Target,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
  Plus
} from 'lucide-react';
import { Task } from '../../types';
import { useApp } from '../../context/AppContext';

/**
 * مكون إدارة المهام المتكررة
 * يعرض ويدير جميع المهام المتكررة في النظام
 */
const RecurringTaskManager: React.FC = () => {
  const { state, actions } = useApp();

  // حالات المكون
  const [recurringTasks, setRecurringTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * تحميل المهام المتكررة عند تحميل المكون
   */
  useEffect(() => {
    const recurring = (state.tasks || []).filter(task => task.isRecurring);
    setRecurringTasks(recurring);
  }, [state.tasks]);

  /**
   * دالة إنشاء نسخة جديدة من المهمة المتكررة
   */
  const createRecurringInstance = async (originalTask: Task) => {
    try {
      const newTask: Task = {
        ...originalTask,
        id: `task-${Date.now()}`,
        status: 'جديدة',
        originalTaskId: originalTask.id,
        recurringCount: (originalTask.recurringCount || 0) + 1,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // أسبوع من الآن
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: undefined
      };

      await actions.addTask(newTask);
      
      // تحديث عداد التكرار في المهمة الأصلية
      await actions.updateTask(originalTask.id, {
        recurringCount: (originalTask.recurringCount || 0) + 1
      });

    } catch (error) {
      console.error('خطأ في إنشاء نسخة متكررة:', error);
    }
  };

  /**
   * دالة إيقاف/تشغيل المهمة المتكررة
   */
  const toggleRecurringTask = async (taskId: string, isActive: boolean) => {
    try {
      await actions.updateTask(taskId, {
        status: isActive ? 'جديدة' : 'ملغية'
      });
    } catch (error) {
      console.error('خطأ في تغيير حالة المهمة المتكررة:', error);
    }
  };

  /**
   * دالة الحصول على النص الوصفي للتكرار
   */
  const getRecurringDescription = (pattern: any) => {
    if (!pattern) return 'غير محدد';
    
    const frequency = pattern.frequency;
    const interval = pattern.interval || 1;
    
    switch (frequency) {
      case 'daily':
        return interval === 1 ? 'يومياً' : `كل ${interval} أيام`;
      case 'weekly':
        return interval === 1 ? 'أسبوعياً' : `كل ${interval} أسابيع`;
      case 'monthly':
        return interval === 1 ? 'شهرياً' : `كل ${interval} أشهر`;
      case 'yearly':
        return interval === 1 ? 'سنوياً' : `كل ${interval} سنوات`;
      default:
        return 'غير محدد';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* العنوان والإحصائيات */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">المهام المتكررة</h2>
          <p className="text-gray-600">إدارة ومتابعة المهام المتكررة في النظام</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Repeat className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-900">{recurringTasks.length}</p>
              <p className="text-sm text-purple-600">مهمة متكررة</p>
            </div>
          </div>
        </div>
      </div>

      {/* قائمة المهام المتكررة */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            المهام المتكررة النشطة ({recurringTasks.filter(t => t.status !== 'ملغية').length})
          </h3>
        </div>

        <div className="divide-y divide-gray-100">
          {recurringTasks.map((task) => (
            <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                
                {/* معلومات المهمة */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Repeat className="h-5 w-5 text-purple-600" />
                    <h4 className="text-lg font-semibold text-gray-900">{task.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'ملغية' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {task.status === 'ملغية' ? 'متوقفة' : 'نشطة'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">التكرار:</span>
                      <span className="mr-2 font-medium text-gray-900">
                        {getRecurringDescription(task.recurringPattern)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">عدد التكرارات:</span>
                      <span className="mr-2 font-medium text-purple-600">
                        {task.recurringCount || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">النقاط:</span>
                      <span className="mr-2 font-medium text-blue-600">
                        {task.points}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">الأولوية:</span>
                      <span className="mr-2 font-medium text-orange-600">
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* إجراءات المهمة */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => createRecurringInstance(task)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="إنشاء نسخة جديدة"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => toggleRecurringTask(task.id, task.status === 'ملغية')}
                    className={`p-2 rounded-lg transition-colors ${
                      task.status === 'ملغية' 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-yellow-600 hover:bg-yellow-50'
                    }`}
                    title={task.status === 'ملغية' ? 'تشغيل' : 'إيقاف'}
                  >
                    {task.status === 'ملغية' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </button>
                  
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="عرض التفاصيل"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  <button
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        {recurringTasks.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Repeat className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">لا توجد مهام متكررة</p>
            <p className="text-sm mt-2">يمكنك إنشاء مهام متكررة من نموذج إضافة المهام</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default RecurringTaskManager;
/**
 * مكون سير عمل المراسلات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User,
  Calendar,
  MessageSquare,
  FileText,
  Send,
  Eye,
  Edit
} from 'lucide-react';
import { Correspondence } from '../../types';

// واجهة خصائص مكون سير العمل
interface CorrespondenceWorkflowProps {
  correspondence: Correspondence;
  type: 'incoming' | 'outgoing';
  onStatusChange: (newStatus: string) => void;
}

// واجهة خطوة سير العمل
interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'current' | 'pending' | 'skipped';
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
  requiredRole?: string;
  estimatedDuration?: number; // بالأيام
}

/**
 * مكون سير عمل المراسلات المتقدم
 */
const CorrespondenceWorkflow: React.FC<CorrespondenceWorkflowProps> = ({
  correspondence,
  type,
  onStatusChange
}) => {
  // تعريف خطوات سير العمل للمراسلات الواردة
  const incomingWorkflowSteps: WorkflowStep[] = [
    {
      id: 'registered',
      name: 'تسجيل',
      description: 'تسجيل المراسلة في النظام',
      status: 'completed',
      completedAt: new Date(correspondence.createdAt),
      completedBy: correspondence.createdBy,
      estimatedDuration: 0
    },
    {
      id: 'review',
      name: 'مراجعة أولية',
      description: 'مراجعة المحتوى وتحديد الإدارة المختصة',
      status: correspondence.status === 'مسجل' ? 'current' : 'completed',
      estimatedDuration: 1
    },
    {
      id: 'assigned',
      name: 'إحالة',
      description: 'إحالة للإدارة والموظف المختص',
      status: correspondence.status === 'محال' ? 'current' : 
               ['قيد المراجعة', 'مغلق', 'مؤرشف'].includes(correspondence.status) ? 'completed' : 'pending',
      estimatedDuration: 1
    },
    {
      id: 'processing',
      name: 'معالجة',
      description: 'معالجة المراسلة واتخاذ الإجراءات اللازمة',
      status: correspondence.status === 'قيد المراجعة' ? 'current' : 
               ['مغلق', 'مؤرشف'].includes(correspondence.status) ? 'completed' : 'pending',
      estimatedDuration: 3
    },
    {
      id: 'completed',
      name: 'إغلاق',
      description: 'إغلاق الملف وأرشفة المراسلة',
      status: correspondence.status === 'مغلق' || correspondence.status === 'مؤرشف' ? 'completed' : 'pending',
      completedAt: correspondence.completedAt ? new Date(correspondence.completedAt) : undefined,
      estimatedDuration: 1
    }
  ];

  // تعريف خطوات سير العمل للمراسلات الصادرة
  const outgoingWorkflowSteps: WorkflowStep[] = [
    {
      id: 'draft',
      name: 'مسودة',
      description: 'إعداد مسودة المراسلة',
      status: 'completed',
      completedAt: new Date(correspondence.createdAt),
      completedBy: correspondence.createdBy,
      estimatedDuration: 1
    },
    {
      id: 'review',
      name: 'مراجعة',
      description: 'مراجعة المحتوى والشكل',
      status: correspondence.status === 'قيد المراجعة' ? 'current' : 
               ['بانتظار التوقيع', 'صادر', 'مؤرشف'].includes(correspondence.status) ? 'completed' : 'pending',
      estimatedDuration: 2
    },
    {
      id: 'approval',
      name: 'موافقة',
      description: 'موافقة المسؤول المختص',
      status: correspondence.status === 'بانتظار التوقيع' ? 'current' : 
               ['صادر', 'مؤرشف'].includes(correspondence.status) ? 'completed' : 'pending',
      estimatedDuration: 1
    },
    {
      id: 'sent',
      name: 'إرسال',
      description: 'إرسال المراسلة للجهة المستلمة',
      status: correspondence.status === 'صادر' ? 'completed' : 'pending',
      completedAt: correspondence.deliveryDate ? new Date(correspondence.deliveryDate) : undefined,
      estimatedDuration: 1
    },
    {
      id: 'archived',
      name: 'أرشفة',
      description: 'أرشفة المراسلة في الملف النهائي',
      status: correspondence.status === 'مؤرشف' ? 'completed' : 'pending',
      estimatedDuration: 1
    }
  ];

  const workflowSteps = type === 'incoming' ? incomingWorkflowSteps : outgoingWorkflowSteps;
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);

  /**
   * دالة الحصول على لون حالة الخطوة
   */
  const getStepColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'current': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'skipped': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  /**
   * دالة الحصول على أيقونة حالة الخطوة
   */
  const getStepIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5" />;
      case 'current': return <Clock className="h-5 w-5" />;
      case 'pending': return <AlertCircle className="h-5 w-5" />;
      case 'skipped': return <ArrowRight className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  /**
   * دالة تقدير الوقت المتبقي
   */
  const getEstimatedCompletion = (step: WorkflowStep) => {
    if (step.status === 'completed') return null;
    
    const now = new Date();
    const estimatedDate = new Date(now.getTime() + (step.estimatedDuration || 1) * 24 * 60 * 60 * 1000);
    return estimatedDate.toLocaleDateString('ar-EG');
  };

  return (
    <div className="space-y-6">
      
      {/* عنوان سير العمل */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">
          سير عمل المراسلة {type === 'incoming' ? 'الواردة' : 'الصادرة'}
        </h4>
        <div className="text-sm text-gray-500">
          {workflowSteps.filter(s => s.status === 'completed').length} من {workflowSteps.length} مكتملة
        </div>
      </div>

      {/* خطوات سير العمل */}
      <div className="space-y-4">
        {workflowSteps.map((step, index) => (
          <div key={step.id} className="relative">
            
            {/* خط الربط بين الخطوات */}
            {index < workflowSteps.length - 1 && (
              <div className={`absolute right-6 top-12 w-0.5 h-8 ${
                step.status === 'completed' ? 'bg-green-400' : 'bg-gray-300'
              }`}></div>
            )}

            {/* بطاقة الخطوة */}
            <div 
              className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 ${
                getStepColor(step.status)
              } ${step.status === 'current' ? 'ring-2 ring-blue-300' : ''}`}
            >
              
              {/* أيقونة الخطوة */}
              <div className={`flex-shrink-0 p-2 rounded-full ${getStepColor(step.status)}`}>
                {getStepIcon(step.status)}
              </div>

              {/* محتوى الخطوة */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{step.name}</h5>
                  <div className="flex items-center gap-2">
                    {step.status === 'completed' && step.completedAt && (
                      <span className="text-xs text-gray-500">
                        {step.completedAt.toLocaleDateString('ar-EG')}
                      </span>
                    )}
                    {step.status === 'current' && (
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        جاري التنفيذ
                      </span>
                    )}
                    {step.status === 'pending' && getEstimatedCompletion(step) && (
                      <span className="text-xs text-gray-500">
                        متوقع: {getEstimatedCompletion(step)}
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                
                {/* معلومات إضافية */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {step.completedBy && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>بواسطة: {step.completedBy}</span>
                    </div>
                  )}
                  {step.estimatedDuration && step.status !== 'completed' && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>مدة متوقعة: {step.estimatedDuration} يوم</span>
                    </div>
                  )}
                  {step.requiredRole && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>يتطلب: {step.requiredRole}</span>
                    </div>
                  )}
                </div>

                {/* ملاحظات الخطوة */}
                {step.notes && (
                  <div className="mt-2 p-2 bg-white/50 rounded text-xs text-gray-600">
                    {step.notes}
                  </div>
                )}

                {/* إجراءات الخطوة الحالية */}
                {step.status === 'current' && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => {
                        const nextStatus = getNextStatus(step.id, type);
                        if (nextStatus) {
                          onStatusChange(nextStatus);
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <CheckCircle className="h-3 w-3" />
                      إكمال الخطوة
                    </button>
                    
                    <button
                      onClick={() => setSelectedStep(step)}
                      className="flex items-center gap-1 px-3 py-1 border border-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <MessageSquare className="h-3 w-3" />
                      إضافة ملاحظة
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* إحصائيات سير العمل */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="font-medium text-gray-900 mb-3">إحصائيات سير العمل</h5>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {workflowSteps.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-xs text-green-800">خطوات مكتملة</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {workflowSteps.filter(s => s.status === 'current').length}
            </div>
            <div className="text-xs text-blue-800">خطوة حالية</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-gray-600">
              {workflowSteps.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-xs text-gray-800">خطوات معلقة</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {Math.round((workflowSteps.filter(s => s.status === 'completed').length / workflowSteps.length) * 100)}%
            </div>
            <div className="text-xs text-purple-800">نسبة الإكمال</div>
          </div>
        </div>
      </div>

      {/* نافذة إضافة ملاحظة */}
      {selectedStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              إضافة ملاحظة - {selectedStep.name}
            </h3>
            
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="أدخل ملاحظاتك حول هذه الخطوة..."
            />

            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={() => setSelectedStep(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  // حفظ الملاحظة
                  setSelectedStep(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

/**
 * دالة الحصول على الحالة التالية في سير العمل
 */
const getNextStatus = (currentStepId: string, type: 'incoming' | 'outgoing'): string | null => {
  if (type === 'incoming') {
    switch (currentStepId) {
      case 'registered': return 'قيد المراجعة';
      case 'review': return 'محال';
      case 'assigned': return 'قيد المراجعة';
      case 'processing': return 'مغلق';
      case 'completed': return 'مؤرشف';
      default: return null;
    }
  } else {
    switch (currentStepId) {
      case 'draft': return 'قيد المراجعة';
      case 'review': return 'بانتظار التوقيع';
      case 'approval': return 'صادر';
      case 'sent': return 'مؤرشف';
      default: return null;
    }
  }
};

export default CorrespondenceWorkflow;
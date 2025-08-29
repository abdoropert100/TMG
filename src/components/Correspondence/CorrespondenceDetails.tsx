/**
 * مكون تفاصيل المراسلة المتقدم
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Building2, 
  Shield,
  Clock,
  Mail,
  FileText,
  Edit,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  Link,
  Tag,
  MessageSquare,
  Send,
  Reply
} from 'lucide-react';
import { Correspondence, Employee, Department, Division, Task } from '../../types';
import { useApp } from '../../context/AppContext';
import FileUpload from '../UI/FileUpload';
import AttachmentViewer from '../UI/AttachmentViewer';

// واجهة خصائص مكون تفاصيل المراسلة
interface CorrespondenceDetailsProps {
  correspondence: Correspondence;
  employees: Employee[];
  departments: Department[];
  divisions: Division[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (correspondence: Correspondence) => void;
  onStatusChange: (correspondenceId: string, newStatus: string) => void;
  onTransfer: (correspondence: Correspondence) => void;
  onCreateTask: (correspondence: Correspondence) => void;
}

/**
 * مكون تفاصيل المراسلة الشامل
 * يعرض جميع تفاصيل المراسلة مع المرفقات والسجلات والمهام المرتبطة
 */
const CorrespondenceDetails: React.FC<CorrespondenceDetailsProps> = ({
  correspondence,
  employees,
  departments,
  divisions,
  isOpen,
  onClose,
  onEdit,
  onStatusChange,
  onTransfer,
  onCreateTask
}) => {
  const { state, actions } = useApp();
  
  // حالات المكون
  const [activeTab, setActiveTab] = useState<'details' | 'attachments' | 'history' | 'tasks' | 'response'>('details');
  const [showTransferTab, setShowTransferTab] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [routingHistory, setRoutingHistory] = useState<any[]>([]);
  const [linkedTasks, setLinkedTasks] = useState<Task[]>([]);
  const [responseCorrespondence, setResponseCorrespondence] = useState<Correspondence | null>(null);

  /**
   * تحميل البيانات المرتبطة عند فتح النافذة
   */
  React.useEffect(() => {
    if (isOpen && correspondence) {
      loadRelatedData();
    }
  }, [isOpen, correspondence]);

  /**
   * دالة تحميل البيانات المرتبطة
   */
  const loadRelatedData = () => {
    // تحميل المهام المرتبطة
    const relatedTasks = state.tasks.filter(task => 
      task.linkedCorrespondenceId === correspondence.id
    );
    setLinkedTasks(relatedTasks);

    // تحميل الرد إذا كان موجوداً
    if (correspondence.responseId) {
      const response = state.correspondence.find(c => c.id === correspondence.responseId);
      setResponseCorrespondence(response || null);
    }

    // محاكاة تاريخ التحويل
    const mockRoutingHistory = [
      {
        id: '1',
        action: 'تسجيل',
        fromDepartment: '',
        toDepartment: getDepartmentName(),
        byEmployee: getEmployeeName(correspondence.createdBy),
        timestamp: new Date(correspondence.createdAt),
        notes: 'تم تسجيل المراسلة في النظام'
      },
      {
        id: '2',
        action: 'إحالة',
        fromDepartment: 'الشؤون الإدارية',
        toDepartment: getDepartmentName(),
        byEmployee: 'مدير النظام',
        timestamp: new Date(correspondence.updatedAt),
        notes: 'تم إحالة المراسلة للإدارة المختصة'
      }
    ];
    setRoutingHistory(mockRoutingHistory);
  };

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
    return departments.find(dept => dept.id === correspondence.department)?.name || correspondence.department;
  };

  /**
   * دالة الحصول على اسم القسم
   */
  const getDivisionName = () => {
    return divisions.find(div => div.id === correspondence.division)?.name || correspondence.division;
  };

  /**
   * دالة الحصول على لون مستوى السرية
   */
  const getConfidentialityColor = (confidentiality: string) => {
    switch (confidentiality) {
      case 'سري جداً': return 'bg-red-100 text-red-800 border-red-200';
      case 'سري': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'عادي': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * دالة الحصول على لون درجة الاستعجال
   */
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'فوري': return 'bg-red-100 text-red-800 border-red-200';
      case 'عاجل': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'عادي': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * دالة الحصول على لون الحالة
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مغلق':
      case 'صادر':
      case 'مؤرشف': return 'bg-green-100 text-green-800 border-green-200';
      case 'قيد المراجعة':
      case 'بانتظار التوقيع': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'محال': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'مسجل':
      case 'مسودة': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * دالة إنشاء رد على المراسلة
   */
  const handleCreateReply = () => {
    const replySubject = `رد على: ${correspondence.subject}`;
    const replyData = {
      id: `out-reply-${Date.now()}`,
      type: 'صادر',
      number: `OUT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      date: new Date(),
      subject: replySubject,
      sender: 'وزارة الموارد المائية والري',
      recipient: correspondence.sender,
      recipientOrganization: correspondence.senderOrganization,
      confidentiality: correspondence.confidentiality,
      urgency: correspondence.urgency,
      status: 'مسودة',
      department: correspondence.department,
      division: correspondence.division,
      assignedTo: correspondence.assignedTo,
      deliveryChannel: 'بريد',
      linkedTaskId: correspondence.linkedTaskId,
      responseId: correspondence.id,
      attachments: [],
      notes: `رد على المراسلة الواردة رقم ${correspondence.number}`,
      createdBy: state.currentUser.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    actions.addCorrespondence(replyData);
    
    // تحديث المراسلة الأصلية لتشير إلى الرد
    actions.updateCorrespondence(correspondence.id, {
      hasResponse: true,
      responseId: replyData.id
    });

    alert('تم إنشاء الرد بنجاح');
    onClose();
    actions.setCurrentPage('correspondence');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto ${showTransferTab ? 'max-w-full' : 'max-w-6xl'}`}> 
        
        {/* رأس النافذة */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getConfidentialityColor(correspondence.confidentiality)}`}>
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">تفاصيل المراسلة</h2>
              <p className="text-sm text-gray-600">{correspondence.number}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {correspondence.type === 'وارد' && !correspondence.hasResponse && (
              <button
                onClick={handleCreateReply}
                className="flex items-center gap-2 px-3 py-1 text-sm border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
              >
                <Reply className="h-4 w-4" />
                إنشاء رد
              </button>
            )}
            <button
              onClick={() => setShowTransferTab(true)}
              className="flex items-center gap-2 px-3 py-1 text-sm border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
              تحويل
            </button>
            <button
              onClick={() => onEdit(correspondence)}
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
              { key: 'tasks', label: 'المهام المرتبطة', icon: Link },
              { key: 'response', label: 'الرد', icon: Reply },
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
                  {tab.key === 'tasks' && linkedTasks.length > 0 && (
                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                      {linkedTasks.length}
                    </span>
                  )}
                  {tab.key === 'response' && correspondence.hasResponse && (
                    <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
                      1
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* محتوى التبويبات */}
        {/* تبويب التحويل */}
        {showTransferTab && (
          <div className="p-6 w-full max-w-4xl mx-auto">
            <h3 className="text-xl font-bold mb-4 text-orange-700">تحويل المراسلة</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الإدارة الجديدة</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">القسم الجديد</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {divisions.map(div => (
                    <option key={div.id} value={div.id}>{div.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الموظف الجديد</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات التحويل</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} placeholder="سبب التحويل أو أي ملاحظات..."></textarea>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg" onClick={() => setShowTransferTab(false)}>إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">تنفيذ التحويل</button>
              </div>
            </form>
          </div>
        )}
        <div className="p-6">
          
          {/* تبويب التفاصيل */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* معلومات أساسية */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{correspondence.subject}</h3>
                {/* الشارات */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getConfidentialityColor(correspondence.confidentiality)}`}>
                    <Shield className="h-3 w-3 inline mr-1" />
                    {correspondence.confidentiality}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(correspondence.urgency)}`}>
                    <Clock className="h-3 w-3 inline mr-1" />
                    {correspondence.urgency}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(correspondence.status)}`}>
                    {correspondence.status}
                  </span>
                  {correspondence.hasResponse && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                      <Reply className="h-3 w-3 inline mr-1" />
                      تم الرد
                    </span>
                  )}
                  {/* التصنيفات المركزية */}
                  {(correspondence.tags && correspondence.tags.length > 0) && (
                    correspondence.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        <Tag className="h-3 w-3 inline mr-1" />
                        {tag}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* تفاصيل المراسلة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* معلومات المرسل/المستلم */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">
                    {correspondence.type === 'وارد' ? 'معلومات المرسل' : 'معلومات المستلم'}
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">الاسم:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {correspondence.type === 'وارد' ? correspondence.sender : correspondence.recipient}
                      </span>
                    </div>
                    
                    {(correspondence.senderOrganization || correspondence.recipientOrganization) && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">الجهة:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {correspondence.type === 'وارد' ? correspondence.senderOrganization : correspondence.recipientOrganization}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">التاريخ:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(correspondence.date).toLocaleDateString('ar-EG')}
                      </span>
                    </div>

                    {correspondence.receivedVia && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">طريقة الاستلام:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {correspondence.receivedVia}
                        </span>
                      </div>
                    )}

                    {correspondence.deliveryChannel && (
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">قناة التسليم:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {correspondence.deliveryChannel}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* معلومات المعالجة الداخلية */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">المعالجة الداخلية</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">الإدارة:</span>
                      <span className="text-sm font-medium text-gray-900">{getDepartmentName()}</span>
                    </div>
                    
                    {correspondence.division && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">القسم:</span>
                        <span className="text-sm font-medium text-gray-900">{getDivisionName()}</span>
                      </div>
                    )}
                    
                    {correspondence.assignedTo && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">المسؤول:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {getEmployeeName(correspondence.assignedTo)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">تاريخ الإنشاء:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(correspondence.created_at).toLocaleDateString('ar-EG')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">أنشأ بواسطة:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {getEmployeeName(correspondence.createdBy)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* الملاحظات */}
              {correspondence.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">الملاحظات</h4>
                  <p className="text-gray-700">{correspondence.notes}</p>
                </div>
              )}

            </div>
          )}

          {/* تبويب المرفقات */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              
              {/* عارض المرفقات الموجودة */}
              <AttachmentViewer
                moduleType={correspondence.type === 'وارد' ? 'correspondence_incoming' : 'correspondence_outgoing'}
                moduleId={correspondence.id}
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
                      moduleType={correspondence.type === 'وارد' ? 'correspondence_incoming' : 'correspondence_outgoing'}
                      moduleId={correspondence.id}
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

          {/* تبويب المهام المرتبطة */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">المهام المرتبطة ({linkedTasks.length})</h4>
                <button
                  onClick={() => onCreateTask(correspondence)}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Link className="h-4 w-4" />
                  إنشاء مهمة
                </button>
              </div>
              
              {linkedTasks.length > 0 ? (
                <div className="space-y-3">
                  {linkedTasks.map((task) => (
                    <div key={task.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{task.title}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'مكتملة' ? 'bg-green-100 text-green-800' :
                          task.status === 'قيد التنفيذ' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>الأولوية: {task.priority}</span>
                        <span>النقاط: {task.points}</span>
                        <span>المسند إليه: {task.assignedTo?.map(id => getEmployeeName(id)).join(', ')}</span>
                        {task.completedBy && task.completedBy.length > 0 && (
                          <span>المنجزون: {task.completedBy.map(id => getEmployeeName(id)).join(', ')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Link className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>لا توجد مهام مرتبطة بهذه المراسلة</p>
                  <button
                    onClick={() => onCreateTask(correspondence)}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    إنشاء مهمة جديدة
                  </button>
                </div>
              )}
            </div>
          )}

          {/* تبويب الرد */}
          {activeTab === 'response' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">الرد على المراسلة</h4>
                {!correspondence.hasResponse && correspondence.type === 'وارد' && (
                  <button
                    onClick={handleCreateReply}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Reply className="h-4 w-4" />
                    إنشاء رد
                  </button>
                )}
              </div>
              
              {correspondence.hasResponse && responseCorrespondence ? (
                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Reply className="h-4 w-4 text-green-600" />
                    <h5 className="font-medium text-green-900">تم الرد</h5>
                  </div>
                  <p className="text-sm text-green-800 mb-2">
                    رقم الصادر: {responseCorrespondence.number}
                  </p>
                  <p className="text-sm text-green-700">
                    الموضوع: {responseCorrespondence.subject}
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    تاريخ الرد: {new Date(responseCorrespondence.date).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              ) : correspondence.type === 'وارد' ? (
                <div className="text-center py-8 text-gray-500">
                  <Reply className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>لم يتم الرد على هذه المراسلة بعد</p>
                  <button
                    onClick={handleCreateReply}
                    className="mt-2 text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    إنشاء رد الآن
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Send className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>هذه مراسلة صادرة</p>
                  <p className="text-sm mt-1">حالة التسليم: {correspondence.deliveryStatus || 'لم يرسل'}</p>
                </div>
              )}
            </div>
          )}

          {/* تبويب السجل */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">سجل التغييرات والتحويلات</h4>
              
              <div className="space-y-3">
                {routingHistory.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-gray-900">{entry.action}</h5>
                        <span className="text-xs text-gray-500">
                          {entry.timestamp.toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                      {entry.fromDepartment && entry.toDepartment && (
                        <p className="text-sm text-gray-600 mb-1">
                          من: {entry.fromDepartment} → إلى: {entry.toDepartment}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">{entry.notes}</p>
                      <p className="text-xs text-gray-500 mt-1">بواسطة: {entry.byEmployee}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default CorrespondenceDetails;
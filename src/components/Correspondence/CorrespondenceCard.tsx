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
  Shield,
  Mail,
  MoreVertical,
  Eye,
  ArrowRight,
  FileText,
  Download
} from 'lucide-react';
import { Correspondence, Employee, Department, Division } from '../../types';

// واجهة خصائص بطاقة المراسلة
interface CorrespondenceCardProps {
  correspondence: Correspondence;
  employees: Employee[];
  departments: Department[];
  divisions: Division[];
  type: 'incoming' | 'outgoing';
  onEdit: (correspondence: Correspondence) => void;
  onDelete: (correspondenceId: string) => void;
  onStatusChange: (correspondenceId: string, newStatus: string) => void;
  onTransfer: (correspondence: Correspondence) => void;
  onViewDetails: (correspondence: Correspondence) => void;
  onCreateTask: (correspondence: Correspondence) => void;
}

// مكون بطاقة المراسلة
const CorrespondenceCard: React.FC<CorrespondenceCardProps> = ({
  correspondence,
  employees,
  departments,
  divisions,
  type,
  onEdit,
  onDelete,
  onStatusChange,
  onTransfer,
  onViewDetails,
  onCreateTask
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // دالة الحصول على لون مستوى السرية
  const getConfidentialityColor = (confidentiality: string) => {
    switch (confidentiality) {
      case 'سري جداً': return 'bg-red-100 text-red-800 border-red-200';
      case 'سري': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'عادي': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // دالة الحصول على لون درجة الاستعجال
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'فوري': return 'bg-red-100 text-red-800 border-red-200';
      case 'عاجل': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'عادي': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // دالة الحصول على لون الحالة
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

  // دالة الحصول على أيقونة الحالة
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'مغلق':
      case 'صادر':
      case 'مؤرشف': return <CheckCircle className="h-4 w-4" />;
      case 'قيد المراجعة':
      case 'بانتظار التوقيع': return <Clock className="h-4 w-4" />;
      case 'محال': return <ArrowRight className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // دالة الحصول على أيقونة السرية
  const getConfidentialityIcon = (confidentiality: string) => {
    switch (confidentiality) {
      case 'سري جداً':
      case 'سري': return <Shield className="h-4 w-4" />;
      default: return null;
    }
  };

  // دالة الحصول على اسم الموظف
  const getEmployeeName = (employeeId: string) => {
    return employees.find(emp => emp.id === employeeId)?.name || employeeId;
  };

  // دالة الحصول على اسم الإدارة
  const getDepartmentName = () => {
    return departments.find(dept => dept.id === correspondence.department)?.name || correspondence.department;
  };

  // دالة الحصول على اسم القسم
  const getDivisionName = () => {
    return divisions.find(div => div.id === correspondence.division)?.name || correspondence.division;
  };

  // دالة تغيير الحالة
  const handleStatusChange = (newStatus: string) => {
    onStatusChange(correspondence.id, newStatus);
    setShowMenu(false);
  };

  // دالة حذف المراسلة
  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف هذه المراسلة؟')) {
      onDelete(correspondence.id);
    }
    setShowMenu(false);
  };

  // دالة حساب الأيام منذ الاستلام/الإرسال
  const getDaysAgo = () => {
    const today = new Date();
    const corrDate = new Date(correspondence.date);
    const diffTime = today.getTime() - corrDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'أمس';
    return `منذ ${diffDays} يوم`;
  };

  // تحديد الحالات المتاحة حسب النوع
  const getAvailableStatuses = () => {
    if (type === 'incoming') {
      return ['مسجل', 'قيد المراجعة', 'محال', 'مغلق', 'مؤرشف'];
    } else {
      return ['مسودة', 'قيد المراجعة', 'بانتظار التوقيع', 'صادر', 'مؤرشف'];
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-300 hover:shadow-md ${
      correspondence.urgency === 'فوري' ? 'border-red-200 bg-red-50' : 
      correspondence.urgency === 'عاجل' ? 'border-yellow-200 bg-yellow-50' : 
      'border-gray-100 hover:border-blue-200'
    }`}>
      
      {/* رأس البطاقة */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          
          {/* معلومات المراسلة الأساسية */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {correspondence.number}
              </span>
              
              {/* شارة السرية */}
              {correspondence.confidentiality !== 'عادي' && (
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getConfidentialityColor(correspondence.confidentiality)}`}>
                  {getConfidentialityIcon(correspondence.confidentiality)}
                  {correspondence.confidentiality}
                </span>
              )}
              
              {/* شارة الاستعجال */}
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(correspondence.urgency)}`}>
                {correspondence.urgency === 'فوري' && <AlertCircle className="h-3 w-3" />}
                {correspondence.urgency}
              </span>
              
              {/* شارة الحالة */}
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(correspondence.status)}`}>
                {getStatusIcon(correspondence.status)}
                {correspondence.status}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {correspondence.subject}
            </h3>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>
                  {type === 'incoming' ? correspondence.sender : correspondence.recipient}
                </span>
              </div>
              {(correspondence.senderOrganization || correspondence.recipientOrganization) && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span className="truncate">
                    {type === 'incoming' ? correspondence.senderOrganization : correspondence.recipientOrganization}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* قائمة الإجراءات */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                <button
                  onClick={() => { onViewDetails(correspondence); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  عرض التفاصيل
                </button>
                
                <button
                  onClick={() => { onEdit(correspondence); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4" />
                  تعديل
                </button>
                
                <button
                  onClick={() => { onTransfer(correspondence); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <ArrowRight className="h-4 w-4" />
                  تحويل
                </button>

                <button
                  onClick={() => { onCreateTask(correspondence); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FileText className="h-4 w-4" />
                  إنشاء مهمة
                </button>

                <div className="border-t border-gray-100 my-1"></div>
                
                {/* تغيير الحالة */}
                <div className="px-3 py-1">
                  <p className="text-xs text-gray-500 mb-1">تغيير الحالة:</p>
                  {getAvailableStatuses().map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`block w-full text-right px-2 py-1 text-xs rounded hover:bg-gray-50 ${
                        correspondence.status === status ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="border-t border-gray-100 my-1"></div>
                
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* محتوى البطاقة */}
      <div className="p-4 space-y-3">
        
        {/* معلومات الإدارة والموظف المسؤول */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              <span>{getDepartmentName()}</span>
            </div>
            {correspondence.division && (
              <div className="flex items-center gap-1">
                <span>•</span>
                <span>{getDivisionName()}</span>
              </div>
            )}
          </div>
        </div>

        {/* الموظف المسؤول */}
        {correspondence.assignedTo && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">المسؤول:</span>
            <span className="text-gray-900 font-medium">
              {getEmployeeName(correspondence.assignedTo)}
            </span>
          </div>
        )}

        {/* التاريخ */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{new Date(correspondence.date).toLocaleDateString('ar-EG')}</span>
          </div>
          
          <div className="text-xs text-gray-500">
            {getDaysAgo()}
          </div>
        </div>

        {/* الملاحظات */}
        {correspondence.notes && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border-r-4 border-blue-200">
            <span className="font-medium">ملاحظات: </span>
            {correspondence.notes}
          </div>
        )}

      </div>

      {/* تحذير للمراسلات العاجلة */}
      {correspondence.urgency === 'فوري' && (
        <div className="px-4 pb-4">
          <div className="bg-red-100 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-red-700 text-sm font-medium">
              مراسلة فورية تحتاج معالجة عاجلة
            </span>
          </div>
        </div>
      )}

      {/* إغلاق القائمة عند النقر خارجها */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMenu(false)}
        ></div>
      )}

    </div>
  );
};

export default CorrespondenceCard;

/**
 * مكون تحويل المراسلات بين الإدارات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Building2, 
  User, 
  MessageSquare, 
  Save, 
  X,
  AlertCircle,
  Clock,
  Calendar
} from 'lucide-react';
import { Correspondence, Department, Division, Employee } from '../../types';
import { databaseService } from '../../services/DatabaseService';

// واجهة بيانات التحويل
interface TransferData {
  fromDepartment: string;
  fromDivision: string;
  toDepartment: string;
  toDivision: string;
  toEmployee: string;
  action: 'إحالة' | 'استيضاح' | 'اعتماد' | 'مراجعة';
  reason: string;
  notes: string;
  priority: 'عادي' | 'عاجل' | 'فوري';
  dueDate?: Date;
  transferDate: Date;
}

// واجهة خصائص مكون التحويل
interface CorrespondenceTransferProps {
  correspondence: Correspondence;
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (transferData: TransferData) => void;
}

/**
 * مكون تحويل المراسلات المتقدم
 * يوفر واجهة شاملة لتحويل المراسلات بين الإدارات والأقسام
 */
const CorrespondenceTransfer: React.FC<CorrespondenceTransferProps> = ({
  correspondence,
  isOpen,
  onClose,
  onTransfer
}) => {
  // حالات النموذج
  const [transferData, setTransferData] = useState<TransferData>({
    fromDepartment: correspondence.department,
    fromDivision: correspondence.division || '',
    toDepartment: '',
    toDivision: '',
    toEmployee: '',
    action: 'إحالة',
    reason: '',
    notes: '',
    priority: 'عادي',
    transferDate: new Date()
  });

  // بيانات مساعدة
  const [departments, setDepartments] = useState<Department[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredDivisions, setFilteredDivisions] = useState<Division[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * تحميل البيانات المساعدة عند فتح النموذج
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [departmentsData, divisionsData, employeesData] = await Promise.all([
          databaseService.getAll<Department>('departments'),
          databaseService.getAll<Division>('divisions'),
          databaseService.getAll<Employee>('employees')
        ]);

        setDepartments(departmentsData);
        setDivisions(divisionsData);
        setEmployees(employeesData);
      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  /**
   * فلترة الأقسام حسب الإدارة المختارة
   */
  useEffect(() => {
    if (transferData.toDepartment) {
      const filtered = divisions.filter(div => div.departmentId === transferData.toDepartment);
      setFilteredDivisions(filtered);
      
      if (transferData.toDivision && !filtered.find(div => div.id === transferData.toDivision)) {
        setTransferData(prev => ({ ...prev, toDivision: '', toEmployee: '' }));
      }
    } else {
      setFilteredDivisions([]);
    }
  }, [transferData.toDepartment, divisions]);

  /**
   * فلترة الموظفين حسب الإدارة والقسم المختارين
   */
  useEffect(() => {
    let filtered = employees;
    
    if (transferData.toDepartment) {
      filtered = filtered.filter(emp => emp.department === transferData.toDepartment);
    }
    
    if (transferData.toDivision) {
      filtered = filtered.filter(emp => emp.division === transferData.toDivision);
    }
    
    setFilteredEmployees(filtered);
    
    if (transferData.toEmployee && !filtered.find(emp => emp.id === transferData.toEmployee)) {
      setTransferData(prev => ({ ...prev, toEmployee: '' }));
    }
  }, [transferData.toDepartment, transferData.toDivision, employees]);

  /**
   * دالة تحديث بيانات التحويل
   */
  const updateTransferData = (field: keyof TransferData, value: any) => {
    setTransferData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * دالة التحقق من صحة البيانات
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!transferData.toDepartment) {
      newErrors.toDepartment = 'الإدارة المستلمة مطلوبة';
    }

    if (!transferData.toEmployee) {
      newErrors.toEmployee = 'الموظف المسؤول مطلوب';
    }

    if (!transferData.reason.trim()) {
      newErrors.reason = 'سبب التحويل مطلوب';
    }

    if (!transferData.notes.trim()) {
      newErrors.notes = 'ملاحظات التحويل مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * دالة تنفيذ التحويل
   */
  const handleTransfer = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onTransfer(transferData);
      onClose();
    } catch (error) {
      console.error('خطأ في تحويل المراسلة:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full">
        
        {/* رأس النموذج */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ArrowRight className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">تحويل المراسلة</h2>
              <p className="text-sm text-gray-600">{correspondence.number} - {correspondence.subject}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* محتوى النموذج */}
        <div className="p-6 space-y-6">
          
          {/* معلومات المراسلة الحالية */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">المراسلة الحالية</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">الإدارة الحالية:</span>
                <span className="mr-2 font-medium text-gray-900">
                  {departments.find(d => d.id === correspondence.department)?.name || correspondence.department}
                </span>
              </div>
              <div>
                <span className="text-gray-600">القسم الحالي:</span>
                <span className="mr-2 font-medium text-gray-900">
                  {divisions.find(d => d.id === correspondence.division)?.name || correspondence.division}
                </span>
              </div>
              <div>
                <span className="text-gray-600">المسؤول الحالي:</span>
                <span className="mr-2 font-medium text-gray-900">
                  {employees.find(e => e.id === correspondence.assignedTo)?.name || correspondence.assignedTo}
                </span>
              </div>
              <div>
                <span className="text-gray-600">الحالة:</span>
                <span className="mr-2 font-medium text-gray-900">{correspondence.status}</span>
              </div>
            </div>
          </div>

          {/* الإدارة والقسم المستلم */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* الإدارة المستلمة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="h-4 w-4 inline mr-1" />
                الإدارة المستلمة *
              </label>
              <select
                value={transferData.toDepartment}
                onChange={(e) => updateTransferData('toDepartment', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.toDepartment ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">اختر الإدارة</option>
                {departments.filter(d => d.id !== correspondence.department).map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              {errors.toDepartment && (
                <p className="text-red-500 text-sm mt-1">{errors.toDepartment}</p>
              )}
            </div>

            {/* القسم المستلم */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                القسم المستلم
              </label>
              <select
                value={transferData.toDivision}
                onChange={(e) => updateTransferData('toDivision', e.target.value)}
                disabled={!transferData.toDepartment}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !transferData.toDepartment ? 'bg-gray-100' : 'border-gray-300'
                }`}
              >
                <option value="">اختر القسم</option>
                {filteredDivisions.map(div => (
                  <option key={div.id} value={div.id}>{div.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* الموظف المسؤول الجديد */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-1" />
              الموظف المسؤول الجديد *
            </label>
            <select
              value={transferData.toEmployee}
              onChange={(e) => updateTransferData('toEmployee', e.target.value)}
              disabled={!transferData.toDepartment}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.toEmployee ? 'border-red-500' : !transferData.toDepartment ? 'bg-gray-100' : 'border-gray-300'
              }`}
            >
              <option value="">اختر الموظف</option>
              {filteredEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>
              ))}
            </select>
            {errors.toEmployee && (
              <p className="text-red-500 text-sm mt-1">{errors.toEmployee}</p>
            )}
          </div>

          {/* نوع الإجراء */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الإجراء
              </label>
              <select
                value={transferData.action}
                onChange={(e) => updateTransferData('action', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="إحالة">إحالة للمعالجة</option>
                <option value="استيضاح">استيضاح</option>
                <option value="اعتماد">اعتماد</option>
                <option value="مراجعة">مراجعة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                أولوية التحويل
              </label>
              <select
                value={transferData.priority}
                onChange={(e) => updateTransferData('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="عادي">عادي</option>
                <option value="عاجل">عاجل</option>
                <option value="فوري">فوري</option>
              </select>
            </div>
          </div>

          {/* سبب التحويل */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              سبب التحويل *
            </label>
            <select
              value={transferData.reason}
              onChange={(e) => updateTransferData('reason', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">اختر السبب</option>
              <option value="تخصص">تخصص الإدارة المستلمة</option>
              <option value="عبء_عمل">توزيع عبء العمل</option>
              <option value="خبرة">خبرة الفريق المستلم</option>
              <option value="أولوية">تغيير الأولوية</option>
              <option value="إعادة_تنظيم">إعادة تنظيم</option>
              <option value="استيضاح">طلب استيضاح</option>
              <option value="اعتماد">طلب اعتماد</option>
              <option value="أخرى">أخرى</option>
            </select>
            {errors.reason && (
              <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
            )}
          </div>

          {/* ملاحظات التحويل */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="h-4 w-4 inline mr-1" />
              ملاحظات التحويل *
            </label>
            <textarea
              value={transferData.notes}
              onChange={(e) => updateTransferData('notes', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.notes ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="أدخل تفاصيل التحويل والإجراءات المطلوبة..."
            />
            {errors.notes && (
              <p className="text-red-500 text-sm mt-1">{errors.notes}</p>
            )}
          </div>

          {/* موعد المعالجة المطلوب */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              موعد المعالجة المطلوب
            </label>
            <input
              type="date"
              value={transferData.dueDate ? transferData.dueDate.toISOString().split('T')[0] : ''}
              onChange={(e) => updateTransferData('dueDate', e.target.value ? new Date(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

        </div>

        {/* أزرار الإجراءات */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleTransfer}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <ArrowRight className="h-4 w-4" />
            {loading ? 'جاري التحويل...' : 'تحويل المراسلة'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CorrespondenceTransfer;
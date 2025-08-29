import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Calendar, 
  User, 
  Building2, 
  AlertCircle,
  FileText,
  Mail,
  Shield,
  // Upload
} from 'lucide-react';
import { Correspondence, Employee, Department, Division } from '../../types';
import { databaseService } from '../../services/DatabaseService';

// واجهة خصائص نموذج المراسلة الواردة
interface IncomingFormProps {
  correspondence?: Correspondence | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (correspondence: Partial<Correspondence>) => void;
}

// مكون نموذج المراسلة الواردة
const IncomingForm: React.FC<IncomingFormProps> = ({ 
  correspondence, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  // حالات النموذج
  const [formData, setFormData] = useState<Partial<Correspondence>>({
    number: '',
    date: new Date(),
    sender: '',
    senderOrganization: '',
    subject: '',
    confidentiality: 'عادي',
    urgency: 'عادي',
    status: 'مسجل',
    department: '',
    division: '',
    assignedTo: '',
    notes: '',
    receivedVia: 'يدوي',
    tags: [],
    attachments: []
  });
  // نوع المراسلة (جديدة أو رد)
  const [correspondenceType, setCorrespondenceType] = useState<'new' | 'reply'>('new');
  const [linkedOutgoingId, setLinkedOutgoingId] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  // التصنيفات المركزية (اختيار من القائمة فقط)
  const [allTags, setAllTags] = useState<string[]>([]);

  // بيانات مساعدة
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [filteredDivisions, setFilteredDivisions] = useState<Division[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // تحميل البيانات المساعدة
  useEffect(() => {
    const loadData = async () => {
      try {
        const [employeesData, departmentsData, divisionsData, tagsData] = await Promise.all([
          databaseService.getAll<Employee>('employees'),
          databaseService.getAll<Department>('departments'),
          databaseService.getAll<Division>('divisions'),
          databaseService.getCorrespondenceTags()
        ]);
        setEmployees(employeesData);
        setDepartments(departmentsData);
        setDivisions(divisionsData);
        setAllTags(tagsData);
      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
      }
    };
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);
          {/* التصنيفات المركزية */}
          <div>
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">التصنيف (اختياري)</label>
              <button
                type="button"
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-blue-100 border border-gray-300"
                title="تحديث التصنيفات المركزية"
                onClick={async () => {
                  const tags = await databaseService.getCorrespondenceTags();
                  setAllTags(tags);
                }}
              >تحديث التصنيفات</button>
            </div>
            <select
              value={formData.tags && formData.tags[0] ? formData.tags[0] : ''}
              onChange={e => {
                setFormData(prev => ({ ...prev, tags: e.target.value ? [e.target.value] : [] }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">اختر التصنيف</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            {/* عرض التصنيف المختار */}
            {formData.tags && formData.tags[0] && (
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{formData.tags[0]}</span>
              </div>
            )}
          </div>

  // تحديث النموذج عند تغيير المراسلة
  useEffect(() => {
    if (correspondence) {
      setFormData({
        ...correspondence,
        date: new Date(correspondence.date)
      });
    } else {
      // توليد رقم وارد جديد
      const newNumber = `IN-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      setFormData({
        number: newNumber,
        date: new Date(),
        sender: '',
        senderOrganization: '',
        subject: '',
        confidentiality: 'عادي',
        urgency: 'عادي',
        status: 'مسجل',
        department: '',
        division: '',
        assignedTo: '',
        notes: '',
        receivedVia: 'يدوي'
      });
    }
    setErrors({});
  }, [correspondence]);

  // فلترة الأقسام حسب الإدارة المختارة
  useEffect(() => {
    if (formData.department) {
      const filtered = divisions.filter(div => div.departmentId === formData.department);
      setFilteredDivisions(filtered);
      
      // إعادة تعيين القسم إذا لم يعد متاحاً
      if (formData.division && !filtered.find(div => div.id === formData.division)) {
        setFormData(prev => ({ ...prev, division: '', assignedTo: '' }));
      }
    } else {
      setFilteredDivisions([]);
    }
  }, [formData.department, divisions]);

  // فلترة الموظفين حسب الإدارة والقسم
  useEffect(() => {
    let filtered = employees;
    
    if (formData.department) {
      filtered = filtered.filter(emp => emp.department === formData.department);
    }
    
    if (formData.division) {
      filtered = filtered.filter(emp => emp.division === formData.division);
    }
    
    setFilteredEmployees(filtered);
    
    // إعادة تعيين الموظف إذا لم يعد متاحاً
    if (formData.assignedTo && !filtered.find(emp => emp.id === formData.assignedTo)) {
      setFormData(prev => ({ ...prev, assignedTo: '' }));
    }
  }, [formData.department, formData.division, employees]);

  // دالة تحديث حقول النموذج
  const handleInputChange = (field: keyof Correspondence, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // إزالة رسالة الخطأ عند التعديل
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // دالة التحقق من صحة البيانات
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.number?.trim()) {
      newErrors.number = 'رقم الوارد مطلوب';
    }

    if (!formData.sender?.trim()) {
      newErrors.sender = 'اسم المرسل مطلوب';
    }

    if (!formData.subject?.trim()) {
      newErrors.subject = 'موضوع المراسلة مطلوب';
    }

    if (!formData.department) {
      newErrors.department = 'الإدارة المختصة مطلوبة';
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = 'الموظف المسؤول مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // دالة حفظ المراسلة
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('خطأ في حفظ المراسلة:', error);
    } finally {
      setLoading(false);
    }
  };

  // عدم عرض النموذج إذا لم يكن مفتوحاً
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* رأس النموذج */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {correspondence ? 'تعديل المراسلة الواردة' : 'تسجيل مراسلة واردة جديدة'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* محتوى النموذج */}
        <div className="p-6 space-y-6">
          
          {/* الصف الأول: رقم الوارد والتاريخ وطريقة الاستلام */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* رقم الوارد */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                رقم الوارد *
              </label>
              <input
                type="text"
                value={formData.number || ''}
                onChange={(e) => handleInputChange('number', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="IN-2024-001"
              />
              {errors.number && (
                <p className="text-red-500 text-sm mt-1">{errors.number}</p>
              )}
            </div>
            {/* تاريخ الاستلام */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                تاريخ الاستلام
              </label>
              <input
                type="date"
                value={formData.date ? formData.date.toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('date', new Date(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* طريقة الاستلام */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                طريقة الاستلام
              </label>
              <select
                value={formData.receivedVia || 'يدوي'}
                onChange={(e) => handleInputChange('receivedVia', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="يدوي">يدوي</option>
                <option value="إيميل">إيميل</option>
                <option value="بوابة">بوابة إلكترونية</option>
                <option value="فاكس">فاكس</option>
                <option value="بريد">بريد عادي</option>
                <option value="واتساب">واتساب</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع المراسلة</label>
            <select
              value={correspondenceType}
              onChange={e => setCorrespondenceType(e.target.value as 'new' | 'reply')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              title="اختيار نوع المراسلة"
            >
              <option value="new">مراسلة جديدة</option>
              <option value="reply">رد على مراسلة صادرة</option>
            </select>
          </div>
          {correspondenceType === 'reply' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم المراسلة الصادرة</label>
              <input
                type="text"
                value={linkedOutgoingId}
                onChange={e => setLinkedOutgoingId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="أدخل رقم المراسلة الصادرة"
                title="رقم المراسلة الصادرة"
              />
            </div>
          )}

          {/* الصف الثاني: المرسل والجهة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* اسم المرسل */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                اسم المرسل *
              </label>
              <input
                type="text"
                value={formData.sender || ''}
                onChange={(e) => handleInputChange('sender', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.sender ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="اسم المرسل"
              />
              {errors.sender && (
                <p className="text-red-500 text-sm mt-1">{errors.sender}</p>
              )}
            </div>

            {/* الجهة المرسلة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="h-4 w-4 inline mr-1" />
                الجهة المرسلة
              </label>
              <input
                type="text"
                value={formData.senderOrganization || ''}
                onChange={(e) => handleInputChange('senderOrganization', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="اسم الجهة أو المؤسسة"
              />
            </div>
          </div>

          {/* موضوع المراسلة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              موضوع المراسلة *
            </label>
            <input
              type="text"
              value={formData.subject || ''}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.subject ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="موضوع المراسلة"
            />
            {errors.subject && (
              <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
            )}
          </div>

          {/* الصف الثالث: السرية والاستعجال والحالة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* مستوى السرية */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="h-4 w-4 inline mr-1" />
                مستوى السرية
              </label>
              <select
                value={formData.confidentiality || 'عادي'}
                onChange={(e) => handleInputChange('confidentiality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="عادي">عادي</option>
                <option value="سري">سري</option>
                <option value="سري جداً">سري جداً</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التصنيف (اختياري)</label>
              <select
                value={formData.tags && formData.tags[0] ? formData.tags[0] : ''}
                onChange={e => {
                  setFormData(prev => ({ ...prev, tags: e.target.value ? [e.target.value] : [] }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">اختر التصنيف</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              {/* عرض التصنيف المختار */}
              {formData.tags && formData.tags[0] && (
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{formData.tags[0]}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                الحالة
              </label>
              <select
                value={formData.status || 'مسجل'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="مسجل">مسجل</option>
                <option value="قيد المراجعة">قيد المراجعة</option>
                <option value="محال">محال</option>
                <option value="مغلق">مغلق</option>
                <option value="مؤرشف">مؤرشف</option>
              </select>
            </div>
          </div>

          {/* الصف الرابع: الإدارة والقسم والموظف المسؤول */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* الإدارة المختصة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="h-4 w-4 inline mr-1" />
                الإدارة المختصة *
              </label>
              <select
                value={formData.department || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">اختر الإدارة</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              {errors.department && (
                <p className="text-red-500 text-sm mt-1">{errors.department}</p>
              )}
            </div>

            {/* القسم */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                القسم
              </label>
              <select
                value={formData.division || ''}
                onChange={(e) => handleInputChange('division', e.target.value)}
                disabled={!formData.department}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !formData.department ? 'bg-gray-100' : 'border-gray-300'
                }`}
              >
                <option value="">اختر القسم</option>
                {filteredDivisions.map(div => (
                  <option key={div.id} value={div.id}>{div.name}</option>
                ))}
              </select>
            </div>

            {/* الموظف المسؤول */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                الموظف المسؤول *
              </label>
              <select
                value={formData.assignedTo || ''}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                disabled={!formData.department}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.assignedTo ? 'border-red-500' : !formData.department ? 'bg-gray-100' : 'border-gray-300'
                }`}
              >
                <option value="">اختر الموظف</option>
                {filteredEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>
                ))}
              </select>
              {errors.assignedTo && (
                <p className="text-red-500 text-sm mt-1">{errors.assignedTo}</p>
              )}
            </div>
          </div>

          {/* الملاحظات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="أي ملاحظات إضافية..."
            />
          </div>
          {/* المرفقات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المرفقات</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  setAttachments(files);
                  setFormData(prev => ({ ...prev, attachments: files.map(f => f.name) }));
                  // حفظ الملفات في النظام إذا رغبت بذلك
                }}
                title="رفع مرفق"
              />
            </div>
            {/* عرض المرفقات */}
            {attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="font-bold text-sm mb-2">المرفقات:</h4>
                <ul className="space-y-2">
                  {attachments.map((file, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span>{file.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'جاري الحفظ...' : 'حفظ المراسلة'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default IncomingForm;

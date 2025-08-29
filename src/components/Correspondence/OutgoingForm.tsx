import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Calendar, 
  User, 
  Building2, 
  AlertCircle,
  FileText,
  Shield,
  Clock,
  Upload,
  Send
} from 'lucide-react';
import { Correspondence, Employee, Department, Division } from '../../types';
import { databaseService } from '../../services/DatabaseService';
import { saveFileToFolder } from '../../utils/fileUtils';

// واجهة خصائص نموذج المراسلة الصادرة
interface OutgoingFormProps {
  correspondence?: Correspondence | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (correspondence: Partial<Correspondence>) => void;
}

// مكون نموذج المراسلة الصادرة
const OutgoingForm: React.FC<OutgoingFormProps> = ({ 
  correspondence, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  // حالات النموذج
  const [formData, setFormData] = useState<Partial<Correspondence>>({
    number: '',
    date: new Date(),
    recipient: '',
    recipientOrganization: '',
    subject: '',
    confidentiality: 'عادي',
    urgency: 'عادي',
    status: 'مسودة',
    department: '',
    division: '',
    assignedTo: '',
    notes: '',
    deliveryChannel: 'بريد',
    tags: []
  });

  const [correspondenceType, setCorrespondenceType] = useState<'new' | 'reply'>('new');
  const [linkedIncomingId, setLinkedIncomingId] = useState<string>('');

  // بيانات مساعدة
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [filteredDivisions, setFilteredDivisions] = useState<Division[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<File[]>([]);

  // التصنيفات المركزية
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagEditIdx, setTagEditIdx] = useState<number | null>(null);
  const [tagEditValue, setTagEditValue] = useState('');

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

  // تحديث النموذج عند تغيير المراسلة
  useEffect(() => {
    if (correspondence) {
      setFormData({
        ...correspondence,
        date: new Date(correspondence.date)
      });
    } else {
      // توليد رقم صادر جديد
      const newNumber = `OUT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      setFormData({
        number: newNumber,
        date: new Date(),
        recipient: '',
        recipientOrganization: '',
        subject: '',
        confidentiality: 'عادي',
        urgency: 'عادي',
        status: 'مسودة',
        department: '',
        division: '',
        assignedTo: '',
        notes: '',
        deliveryChannel: 'بريد'
      });
    }
    setErrors({});
  }, [correspondence]);

  // فلترة الأقسام حسب الإدارة المختارة
  useEffect(() => {
    if (formData.department) {
      const filtered = divisions.filter(div => div.departmentId === formData.department);
      setFilteredDivisions(filtered);
      
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
    
    if (formData.assignedTo && !filtered.find(emp => emp.id === formData.assignedTo)) {
      setFormData(prev => ({ ...prev, assignedTo: '' }));
    }
  }, [formData.department, formData.division, employees]);

  // دالة تحديث حقول النموذج
  const handleInputChange = (field: keyof Correspondence, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // دالة التحقق من صحة البيانات
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.number?.trim()) {
      newErrors.number = 'رقم الصادر مطلوب';
    }

    if (!formData.recipient?.trim()) {
      newErrors.recipient = 'اسم المستلم مطلوب';
    }

    if (!formData.subject?.trim()) {
      newErrors.subject = 'موضوع المراسلة مطلوب';
    }

    if (!formData.department) {
      newErrors.department = 'الإدارة المصدرة مطلوبة';
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = 'الموظف المعد مطلوب';
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
      await onSave({
        ...formData,
        type: 'صادر',
        status: 'جديد',
        attachments: attachments.map(f => f.name),
        linkedIncomingId,
        created_at: new Date(),
      });
      onClose();
    } catch (error) {
      console.error('خطأ في حفظ المراسلة:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* رأس النموذج */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {correspondence ? 'تعديل المراسلة الصادرة' : 'إنشاء مراسلة صادرة جديدة'}
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
          
          {/* الصف الأول: رقم الصادر والتاريخ وقناة التسليم */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* رقم الصادر */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                رقم الصادر *
              </label>
              <input
                type="text"
                value={formData.number || ''}
                onChange={(e) => handleInputChange('number', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="OUT-2024-001"
              />
              {errors.number && (
                <p className="text-red-500 text-sm mt-1">{errors.number}</p>
              )}
            </div>

            {/* تاريخ الإصدار */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                تاريخ الإصدار
              </label>
              <input
                type="date"
                value={formData.date ? formData.date.toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('date', new Date(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* قناة التسليم */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Send className="h-4 w-4 inline mr-1" />
                قناة التسليم
              </label>
              <select
                value={formData.deliveryChannel || 'بريد'}
                onChange={(e) => handleInputChange('deliveryChannel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="بريد">بريد عادي</option>
                <option value="مراسل">مراسل</option>
                <option value="إيميل">بريد إلكتروني</option>
                <option value="بوابة">بوابة إلكترونية</option>
                <option value="فاكس">فاكس</option>
                <option value="واتساب">واتساب</option>
              </select>
            </div>
          </div>

          {/* الصف الثاني: المستلم والجهة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* اسم المستلم */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                اسم المستلم *
              </label>
              <input
                type="text"
                value={formData.recipient || ''}
                onChange={(e) => handleInputChange('recipient', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.recipient ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="اسم المستلم"
              />
              {errors.recipient && (
                <p className="text-red-500 text-sm mt-1">{errors.recipient}</p>
              )}
            </div>

            {/* الجهة المستلمة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="h-4 w-4 inline mr-1" />
                الجهة المستلمة
              </label>
              <input
                type="text"
                value={formData.recipientOrganization || ''}
                onChange={(e) => handleInputChange('recipientOrganization', e.target.value)}
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

            {/* درجة الاستعجال */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                درجة الاستعجال
              </label>
              <select
                value={formData.urgency || 'عادي'}
                onChange={(e) => handleInputChange('urgency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="عادي">عادي</option>
                <option value="عاجل">عاجل</option>
                <option value="فوري">فوري</option>
              </select>
            </div>

            {/* الحالة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                الحالة
              </label>
              <select
                value={formData.status || 'مسودة'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="مسودة">مسودة</option>
                <option value="قيد المراجعة">قيد المراجعة</option>
                <option value="بانتظار التوقيع">بانتظار التوقيع</option>
                <option value="صادر">صادر</option>
                <option value="مؤرشف">مؤرشف</option>
              </select>
            </div>
          </div>

          {/* الصف الرابع: الإدارة والقسم والموظف المعد */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* الإدارة المصدرة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="h-4 w-4 inline mr-1" />
                الإدارة المصدرة *
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

            {/* الموظف المعد */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                الموظف المعد *
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

          {/* نوع المراسلة */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع المراسلة</label>
            <select
              value={correspondenceType}
              onChange={e => setCorrespondenceType(e.target.value as 'new' | 'reply')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              title="اختيار نوع المراسلة"
            >
              <option value="new">مراسلة جديدة</option>
              <option value="reply">رد على مراسلة واردة</option>
            </select>
          </div>

          {correspondenceType === 'reply' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم المراسلة الواردة</label>
              <input
                type="text"
                value={linkedIncomingId}
                onChange={e => setLinkedIncomingId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="أدخل رقم المراسلة الواردة"
                title="رقم المراسلة الواردة"
              />
            </div>
          )}

          {/* الملاحظات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="أي ملاحظات إضافية..."
            />
          </div>
          {/* التصنيفات المركزية */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">التصنيفات (اختياري)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {['تقرير', 'للنشر', 'للعلم'].map((defaultTag) => (
                allTags.includes(defaultTag) && (
                  <span key={defaultTag} className={`flex items-center px-2 py-1 rounded-full text-xs cursor-pointer ${formData.tags?.includes(defaultTag) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => {
                      if (formData.tags?.includes(defaultTag)) {
                        setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== defaultTag) }));
                      } else {
                        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), defaultTag] }));
                      }
                    }}
                    title={formData.tags?.includes(defaultTag) ? 'إزالة التصنيف' : 'إضافة التصنيف'}
                  >
                    {defaultTag}
                  </span>
                )
              ))}
              {/* باقي التصنيفات */}
              {allTags.filter(tag => !['تقرير', 'للنشر', 'للعلم'].includes(tag)).map((tag, idx) => (
                <span key={tag} className={`flex items-center px-2 py-1 rounded-full text-xs cursor-pointer ${formData.tags?.includes(tag) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => {
                    if (formData.tags?.includes(tag)) {
                      setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) }));
                    } else {
                      setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tag] }));
                    }
                  }}
                  title={formData.tags?.includes(tag) ? 'إزالة التصنيف' : 'إضافة التصنيف'}
                >
                  {tag}
                  {/* زر تعديل التصنيف */}
                  <button
                    className="ml-1 text-yellow-600 hover:text-yellow-800"
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setTagEditIdx(idx);
                      setTagEditValue(tag);
                    }}
                    title="تعديل التصنيف"
                  >تعديل</button>
                  {/* زر حذف التصنيف */}
                  <button
                    className="ml-1 text-red-600 hover:text-red-800"
                    type="button"
                    onClick={async e => {
                      e.stopPropagation();
                      await databaseService.deleteCorrespondenceTag(tag);
                      setAllTags(await databaseService.getCorrespondenceTags());
                      setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) }));
                    }}
                    title="حذف التصنيف"
                  >حذف</button>
                </span>
              ))}
            </div>
            {/* إضافة تصنيف جديد */}
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="إضافة تصنيف جديد..."
              />
              <button
                type="button"
                className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                onClick={async () => {
                  if (tagInput.trim() && !allTags.includes(tagInput.trim())) {
                    await databaseService.addCorrespondenceTag(tagInput.trim());
                    setAllTags(await databaseService.getCorrespondenceTags());
                    setTagInput('');
                  }
                }}
              >إضافة</button>
            </div>
            {/* تعديل التصنيف */}
            {tagEditIdx !== null && (
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagEditValue}
                  onChange={e => setTagEditValue(e.target.value)}
                  className="px-3 py-2 border border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                  placeholder="تعديل التصنيف..."
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700"
                  onClick={async () => {
                    const oldTag = allTags[tagEditIdx!];
                    if (tagEditValue.trim() && oldTag !== tagEditValue.trim()) {
                      await databaseService.updateCorrespondenceTag(oldTag, tagEditValue.trim());
                      setAllTags(await databaseService.getCorrespondenceTags());
                      // تحديث التصنيفات المختارة في النموذج
                      setFormData(prev => ({
                        ...prev,
                        tags: prev.tags?.map(t => t === oldTag ? tagEditValue.trim() : t)
                      }));
                    }
                    setTagEditIdx(null);
                    setTagEditValue('');
                  }}
                >حفظ التعديل</button>
                <button
                  type="button"
                  className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400"
                  onClick={() => {
                    setTagEditIdx(null);
                    setTagEditValue('');
                  }}
                >إلغاء</button>
              </div>
            )}
            {/* عرض التصنيفات المختارة */}
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* رفع المرفقات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="h-4 w-4 inline mr-1" />
              المرفقات
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">اسحب الملفات هنا أو انقر للاختيار</p>
              <input
                type="file"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  setAttachments(files);
                  for (const file of files) {
                    await saveFileToFolder('attachments', file.name, file);
                    await databaseService.add('attachments', {
                      id: `att-${Date.now()}`,
                      name: file.name,
                      size: file.size,
                      type: file.type,
                      created_at: new Date()
                    });
                  }
                }}
                title="رفع مرفق"
              />
            </div>
          </div>

          {/* في منطقة عرض المرفقات بعد رفعها */}
          {attachments.length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold text-sm mb-2">المرفقات:</h4>
              <ul className="space-y-2">
                {attachments.map((file, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span>{file.name}</span>
                    <button
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                      title="تحميل المرفق"
                      onClick={async () => {
                        // محاولة التحميل من LocalStorage أولاً
                        try {
                          const folderKey = `folder_attachments`;
                          const folderFiles = JSON.parse(localStorage.getItem(folderKey) || '{}');
                          const fileData = folderFiles[file.name]?.data;
                          if (fileData) {
                            const blob = new Blob([fileData], { type: file.type });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = file.name;
                            a.click();
                            URL.revokeObjectURL(url);
                          } else {
                            // إذا كان النظام يدعم الحفظ الفعلي، يمكن إضافة تحميل من المسار الفعلي
                            alert('لم يتم العثور على الملف في النظام');
                          }
                        } catch (err) {
                          alert('تعذر تحميل المرفق');
                        }
                      }}
                    >تحميل</button>
                  </li>
                ))}
              </ul>
            </div>
          )}

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

export default OutgoingForm;
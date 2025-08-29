/**
 * مكون رسم بياني للمراسلات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Mail, MailOpen, Shield, Clock, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * مكون رسم بياني للمراسلات المتقدم
 * يعرض توزيع المراسلات حسب النوع والسرية والاستعجال
 */
const CorrespondenceChart: React.FC = () => {
  // استخدام السياق للحصول على البيانات الفعلية
  const { state } = useApp();

  // حساب بيانات المراسلات من البيانات الفعلية
  const correspondenceData = React.useMemo(() => {
    const correspondence = state.correspondence || [];
    
    if (correspondence.length === 0) {
      // عرض بيانات فارغة إذا لم توجد مراسلات
      return {
        typeData: [
          { name: 'واردة', value: 0, color: '#3B82F6' },
          { name: 'صادرة', value: 0, color: '#10B981' }
        ],
        confidentialityData: [
          { name: 'عادي', value: 0, color: '#6B7280' },
          { name: 'سري', value: 0, color: '#F59E0B' },
          { name: 'سري جداً', value: 0, color: '#EF4444' }
        ],
        urgencyData: [
          { name: 'عادي', value: 0, color: '#10B981' },
          { name: 'عاجل', value: 0, color: '#F59E0B' },
          { name: 'فوري', value: 0, color: '#EF4444' }
        ]
      };
    }
    
    return {
      typeData: [
        { 
          name: 'واردة', 
          value: correspondence.filter(c => c.type === 'وارد').length, 
          color: '#3B82F6' 
        },
        { 
          name: 'صادرة', 
          value: correspondence.filter(c => c.type === 'صادر').length, 
          color: '#10B981' 
        }
      ].filter(item => item.value > 0),
      
      confidentialityData: [
        { 
          name: 'عادي', 
          value: correspondence.filter(c => c.confidentiality === 'عادي').length, 
          color: '#6B7280' 
        },
        { 
          name: 'سري', 
          value: correspondence.filter(c => c.confidentiality === 'سري').length, 
          color: '#F59E0B' 
        },
        { 
          name: 'سري جداً', 
          value: correspondence.filter(c => c.confidentiality === 'سري جداً').length, 
          color: '#EF4444' 
        }
      ].filter(item => item.value > 0),
      
      urgencyData: [
        { 
          name: 'عادي', 
          value: correspondence.filter(c => c.urgency === 'عادي').length, 
          color: '#10B981' 
        },
        { 
          name: 'عاجل', 
          value: correspondence.filter(c => c.urgency === 'عاجل').length, 
          color: '#F59E0B' 
        },
        { 
          name: 'فوري', 
          value: correspondence.filter(c => c.urgency === 'فوري').length, 
          color: '#EF4444' 
        }
      ].filter(item => item.value > 0)
    };
  }, [state.correspondence]);

  const totalCorrespondence = correspondenceData.typeData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Mail className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">توزيع المراسلات</h3>
            <p className="text-sm text-gray-500">إجمالي {totalCorrespondence} مراسلة في النظام</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">نشط</span>
        </div>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* توزيع حسب النوع */}
        <div className="text-center">
          <h4 className="text-sm font-medium text-gray-700 mb-3">حسب النوع</h4>
          {correspondenceData.typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={correspondenceData.typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {correspondenceData.typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-400">
              <Mail className="h-8 w-8" />
            </div>
          )}
        </div>

        {/* توزيع حسب السرية */}
        <div className="text-center">
          <h4 className="text-sm font-medium text-gray-700 mb-3">حسب السرية</h4>
          {correspondenceData.confidentialityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={correspondenceData.confidentialityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {correspondenceData.confidentialityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-400">
              <Shield className="h-8 w-8" />
            </div>
          )}
        </div>

        {/* توزيع حسب الاستعجال */}
        <div className="text-center">
          <h4 className="text-sm font-medium text-gray-700 mb-3">حسب الاستعجال</h4>
          {correspondenceData.urgencyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={correspondenceData.urgencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {correspondenceData.urgencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-400">
              <Clock className="h-8 w-8" />
            </div>
          )}
        </div>

      </div>

      {/* إحصائيات تفصيلية */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {correspondenceData.typeData.find(d => d.name === 'واردة')?.value || 0}
            </div>
            <div className="text-xs text-blue-800">واردة</div>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {correspondenceData.typeData.find(d => d.name === 'صادرة')?.value || 0}
            </div>
            <div className="text-xs text-green-800">صادرة</div>
          </div>
          
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">
              {correspondenceData.urgencyData.find(d => d.name === 'عاجل')?.value || 0}
            </div>
            <div className="text-xs text-orange-800">عاجلة</div>
          </div>
          
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">
              {correspondenceData.confidentialityData.find(d => d.name === 'سري جداً')?.value || 0}
            </div>
            <div className="text-xs text-red-800">سرية</div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default CorrespondenceChart;
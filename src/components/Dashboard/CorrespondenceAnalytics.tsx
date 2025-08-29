/**
 * مكون تحليلات المراسلات المتقدمة
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  Mail, 
  TrendingUp, 
  Clock, 
  Shield, 
  AlertTriangle,
  Building2,
  Calendar,
  Target
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { correspondenceService } from '../../services/CorrespondenceService';

/**
 * مكون تحليلات المراسلات الشاملة
 */
const CorrespondenceAnalytics: React.FC = () => {
  const { state } = useApp();
  
  // حالات المكون
  const [analyticsData, setAnalyticsData] = useState({
    departmentPerformance: [],
    monthlyTrends: [],
    urgencyDistribution: [],
    confidentialityDistribution: [],
    processingTimes: []
  });
  
  const [loading, setLoading] = useState(true);

  /**
   * تحميل بيانات التحليلات عند تحميل المكون
   */
  useEffect(() => {
    loadAnalyticsData();
  }, [state.correspondence]);

  /**
   * دالة تحميل بيانات التحليلات
   */
  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // تحميل أداء الإدارات
      // حساب أداء الإدارات من البيانات المحلية
      const departmentStats = (state.departments || []).map(dept => {
        const deptCorrespondences = (state.correspondence || []).filter(c => c.department === dept.id);
        const processed = deptCorrespondences.filter(c => c.status === 'مغلق' || c.status === 'مؤرشف');
        
        return {
          departmentId: dept.id,
          departmentName: dept.name,
          totalCorrespondences: deptCorrespondences.length,
          processedCorrespondences: processed.length,
          urgentCorrespondences: deptCorrespondences.filter(c => c.urgency === 'عاجل' || c.urgency === 'فوري').length,
          processingRate: deptCorrespondences.length > 0 ? Math.round((processed.length / deptCorrespondences.length) * 100) : 0,
          averageProcessingTime: 3
        };
      }).filter(dept => dept.totalCorrespondences > 0);
      
      // حساب الاتجاهات الشهرية
      const monthlyData = calculateMonthlyTrends();
      
      // حساب توزيع الاستعجال
      const urgencyData = calculateUrgencyDistribution();
      
      // حساب توزيع السرية
      const confidentialityData = calculateConfidentialityDistribution();

      setAnalyticsData({
        departmentPerformance: departmentStats,
        monthlyTrends: monthlyData,
        urgencyDistribution: urgencyData,
        confidentialityDistribution: confidentialityData,
        processingTimes: []
      });

    } catch (error) {
      console.error('خطأ في تحميل بيانات التحليلات:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * حساب الاتجاهات الشهرية
   */
  const calculateMonthlyTrends = () => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
    
    return months.map((month, index) => {
      const monthCorrespondences = (state.correspondence || []).filter(c => {
        const corrMonth = new Date(c.date).getMonth();
        return corrMonth === index;
      });

      return {
        month,
        incoming: monthCorrespondences.filter(c => c.type === 'وارد').length,
        outgoing: monthCorrespondences.filter(c => c.type === 'صادر').length,
        urgent: monthCorrespondences.filter(c => c.urgency === 'عاجل' || c.urgency === 'فوري').length
      };
    });
  };

  /**
   * حساب توزيع الاستعجال
   */
  const calculateUrgencyDistribution = () => {
    const correspondence = state.correspondence || [];
    
    return [
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
    ].filter(item => item.value > 0);
  };

  /**
   * حساب توزيع السرية
   */
  const calculateConfidentialityDistribution = () => {
    const correspondence = state.correspondence || [];
    
    return [
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
    ].filter(item => item.value > 0);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* أداء الإدارات في معالجة المراسلات */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">أداء الإدارات في معالجة المراسلات</h3>
        </div>
        
        {analyticsData.departmentPerformance.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.departmentPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="departmentName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalCorrespondences" fill="#3B82F6" name="إجمالي" />
              <Bar dataKey="processedCorrespondences" fill="#10B981" name="معالجة" />
              <Bar dataKey="urgentCorrespondences" fill="#EF4444" name="عاجل" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>لا توجد بيانات لعرضها</p>
            </div>
          </div>
        )}
      </div>

      {/* الاتجاهات الشهرية */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">الاتجاهات الشهرية للمراسلات</h3>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analyticsData.monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="incoming" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="واردة" />
            <Area type="monotone" dataKey="outgoing" stackId="1" stroke="#10B981" fill="#10B981" name="صادرة" />
            <Line type="monotone" dataKey="urgent" stroke="#EF4444" strokeWidth={2} name="عاجلة" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* توزيع الاستعجال والسرية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* توزيع الاستعجال */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">توزيع حسب الاستعجال</h3>
          </div>
          
          {analyticsData.urgencyDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData.urgencyDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.urgencyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <Clock className="h-12 w-12 text-gray-300" />
            </div>
          )}
        </div>

        {/* توزيع السرية */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">توزيع حسب السرية</h3>
          </div>
          
          {analyticsData.confidentialityDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData.confidentialityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.confidentialityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <Shield className="h-12 w-12 text-gray-300" />
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default CorrespondenceAnalytics;
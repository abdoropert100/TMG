import React, { useEffect, useState } from 'react';
import { databaseService } from '../services/DatabaseService';
import { generateLogDescription } from '../services/ReportService';

const SystemLogPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
  const data = await databaseService.getAll('activity_logs');
        setLogs(data);
      } catch (err) {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  // استخراج قائمة المستخدمين وأنواع العمليات للفلاتر
  const users = Array.from(new Set(logs.map(l => l.userName || l.userId))).filter(Boolean);
  const actions = Array.from(new Set(logs.map(l => l.action))).filter(Boolean);

  // تصفية السجلات حسب الفلاتر
  const filteredLogs = logs
    .filter(log => {
      const matchesSearch =
        search === '' ||
        (log.action?.toLowerCase().includes(search.toLowerCase()) ||
          log.description?.toLowerCase().includes(search.toLowerCase()) ||
          (log.userName || log.userId)?.toLowerCase().includes(search.toLowerCase()));
      const matchesUser = userFilter === '' || (log.userName || log.userId) === userFilter;
      const matchesAction = actionFilter === '' || log.action === actionFilter;
      const matchesDateFrom = dateFrom === '' || (log.timestamp && new Date(log.timestamp) >= new Date(dateFrom));
      const matchesDateTo = dateTo === '' || (log.timestamp && new Date(log.timestamp) <= new Date(dateTo));
      return matchesSearch && matchesUser && matchesAction && matchesDateFrom && matchesDateTo;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">سجل النظام الكامل</h2>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          className="border rounded px-3 py-2 w-full"
          placeholder="بحث نصي..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2 w-full"
          value={userFilter}
          onChange={e => setUserFilter(e.target.value)}
          title="تصفية حسب المستخدم"
        >
          <option value="">كل المستخدمين</option>
          {users.map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2 w-full"
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          title="تصفية حسب نوع العملية"
        >
          <option value="">كل العمليات</option>
          {actions.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            type="date"
            className="border rounded px-2 py-2 w-1/2"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            title="من تاريخ"
          />
          <input
            type="date"
            className="border rounded px-2 py-2 w-1/2"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            title="إلى تاريخ"
          />
        </div>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-500">جاري تحميل السجل...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">لا توجد أحداث مطابقة للفلاتر.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg bg-white shadow">
            <thead>
              <tr className="bg-gray-100 text-sm">
                <th className="p-2">نوع الحدث</th>
                <th className="p-2">الوصف</th>
                <th className="p-2">المستخدم</th>
                <th className="p-2">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => (
                <tr key={log.id || idx} className="border-b hover:bg-blue-50 transition">
                  <td className="p-2 font-semibold text-blue-700" style={{textAlign:'right'}}>{log.action}</td>
                  <td className="p-2 text-gray-700">{generateLogDescription(log)}</td>
                  <td className="p-2 text-blue-900">{log.userName || log.userId}</td>
                  <td className="p-2 text-xs text-gray-500">{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SystemLogPage;

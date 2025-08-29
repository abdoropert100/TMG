import React, { useEffect, useState } from 'react';
import { databaseService } from '../services/DatabaseService';
import { saveFileToFolder, downloadFileFromFolder, createFolder, getFilesInFolder, readFileFromFolder, deleteFileFromFolder } from '../utils/fileUtils';

const AttachmentsPage: React.FC = () => {
  // تصدير المرفقات إلى Excel
  const handleExportExcel = async () => {
    // ديناميكي: استخدم مكتبة SheetJS إذا متوفرة أو أنشئ CSV بسيط
    try {
      const rows = filtered.map(att => ({
        اسم_المرفق: att.name,
        الحجم: att.size,
        النوع: att.type,
        تاريخ_الرفع: att.created_at,
        نوع_القسم: att.folder
      }));
      let csv = 'اسم المرفق,الحجم,النوع,تاريخ الرفع,نوع القسم\n';
      csv += rows.map(r => `${r.اسم_المرفق},${r.الحجم},${r.النوع},${r.تاريخ_الرفع},${r.نوع_القسم}`).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'attachments_export.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('حدث خطأ أثناء التصدير');
    }
  };
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<string|null>(null);
  const [editName, setEditName] = useState('');
  const [folderType, setFolderType] = useState('all');
  const folderOptions = [
    { value: 'all', label: 'كل المرفقات' },
    { value: 'tasks_import', label: 'مرفقات مهام استيراد' },
    { value: 'tasks_export', label: 'مرفقات مهام تصدير' },
    { value: 'correspondence_outgoing', label: 'مرفقات مراسلات صادر' },
    { value: 'correspondence_incoming', label: 'مرفقات مراسلات وارد' },
    { value: 'reports_import', label: 'مرفقات تقارير استيراد' },
    { value: 'reports_export', label: 'مرفقات تقارير تصدير' },
  ];

  useEffect(() => {
    const loadAttachments = async () => {
      setLoading(true);
      try {
        let data = await databaseService.getAll('attachments');
        if (folderType !== 'all') {
          data = data.filter((a: any) => a.folder === folderType);
        }
        setAttachments(data);
      } catch (err) {
        setAttachments([]);
      } finally {
        setLoading(false);
      }
    };
    loadAttachments();
  }, [folderType]);

  // رفع مرفق جديد
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const folder = folderType === 'all' ? 'tasks_import' : folderType;
    // رفع الملف فعليًا عبر API السيرفر
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', folder);
    try {
      const res = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      if (result.success) {
        const newAttachment = {
          id: Date.now().toString(),
          name: file.name,
          size: file.size,
          type: file.type,
          created_at: new Date().toISOString(),
          folder
        };
        await databaseService.add('attachments', newAttachment);
        setAttachments(prev => [newAttachment, ...prev]);
      } else {
        alert('فشل رفع الملف');
      }
    } catch (err) {
      alert('حدث خطأ أثناء رفع الملف');
    }
    setLoading(false);
  };

  // حذف مرفق
  const handleDelete = async (id: string, name: string, folder: string) => {
    setLoading(true);
    await databaseService.delete('attachments', id);
  // حذف فعلي من السيرفر
  try {
    await fetch(`http://localhost:4000/files/${folder}/${name}`, {
      method: 'DELETE'
    });
  } catch {}
    setAttachments(prev => prev.filter(a => a.id !== id));
    setLoading(false);
  };

  // تعديل اسم المرفق
  const handleEdit = async (id: string) => {
    setLoading(true);
    await databaseService.update('attachments', id, { name: editName });
    setAttachments(prev => prev.map(a => a.id === id ? { ...a, name: editName } : a));
    setEditId(null);
    setEditName('');
    setLoading(false);
  };

  // بحث في المرفقات
  const filtered = attachments.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-2 flex justify-end">
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded shadow hover:bg-gray-800"
          onClick={() => {
            // عرض محتويات فولدر Files في نافذة جديدة
            const allFolders = [
              'tasks_import', 'tasks_export', 'correspondence_outgoing', 'correspondence_incoming', 'reports_import', 'reports_export'
            ];
            let html = `<h2>محتويات فولدر Files</h2>`;
            allFolders.forEach(f => {
              const files = getFilesInFolder(`Files/${f}`);
              html += `<h3>${f}</h3><ul>` + files.map(fn => `<li>${fn}</li>`).join('') + '</ul>';
            });
            const win = window.open('', '_blank');
            win!.document.write(`<html><head><title>مرفقات النظام</title></head><body>${html}</body></html>`);
          }}
        >عرض فولدر المرفقات</button>
      </div>
      <div className="mb-2 flex justify-end">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
          onClick={handleExportExcel}
        >تصدير المرفقات (Excel)</button>
      </div>
      <h2 className="text-2xl font-bold mb-6">سجل المرفقات</h2>
      <div className="mb-4 flex gap-4 items-center">
        <select
          className="border rounded px-3 py-2"
          value={folderType}
          onChange={e => setFolderType(e.target.value)}
          title="تصفية حسب نوع المرفقات"
        >
          {folderOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          type="text"
          className="border rounded px-3 py-2 w-1/2"
          placeholder="بحث باسم أو نوع المرفق..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <label className="px-3 py-2 bg-green-600 text-white rounded cursor-pointer">
          رفع مرفق جديد
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-500">جاري تحميل المرفقات...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-500">لا توجد مرفقات مطابقة.</div>
      ) : (
        <table className="w-full border rounded-lg bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">اسم المرفق</th>
              <th className="p-2">الحجم</th>
              <th className="p-2">النوع</th>
              <th className="p-2">تاريخ الرفع</th>
              <th className="p-2">نوع القسم</th>
              <th className="p-2">تحميل</th>
              <th className="p-2">تعديل</th>
              <th className="p-2">حذف</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((att, idx) => (
              <tr key={att.id || idx} className="border-b">
                <td className="p-2">
                  {editId === att.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="border rounded px-2 py-1"
                      title="تعديل اسم المرفق"
                    />
                  ) : att.name}
                </td>
                <td className="p-2">{att.size} بايت</td>
                <td className="p-2">{att.type}</td>
                <td className="p-2">{att.created_at ? new Date(att.created_at).toLocaleString() : '-'}</td>
                <td className="p-2">{att.folder}</td>
                <td className="p-2">
                  <a
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs mr-2"
                    title="تحميل المرفق"
                    href={`http://localhost:4000/files/${att.folder}/${att.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >تحميل</a>
                  <a
                    className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                    title="عرض المرفق"
                    href={`http://localhost:4000/files/${att.folder}/${att.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >عرض</a>
                </td>
                <td className="p-2">
                  {editId === att.id ? (
                    <button
                      className="px-2 py-1 bg-yellow-500 text-white rounded text-xs"
                      onClick={() => handleEdit(att.id)}
                    >حفظ</button>
                  ) : (
                    <button
                      className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs"
                      onClick={() => { setEditId(att.id); setEditName(att.name); }}
                    >تعديل</button>
                  )}
                </td>
                <td className="p-2">
                  <button
                    className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                    onClick={() => handleDelete(att.id, att.name, att.folder)}
                  >حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AttachmentsPage;

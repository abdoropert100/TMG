import React, { useEffect, useState } from 'react';
import { databaseService } from '../../services/DatabaseService';

const TagManagementPage: React.FC = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTags = async () => {
    setTags(await databaseService.getCorrespondenceTags());
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleAddTag = async () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setLoading(true);
      await databaseService.addCorrespondenceTag(tagInput.trim());
      await fetchTags();
      setTagInput('');
      setLoading(false);
    }
  };

  const handleEditTag = async () => {
    if (editIdx !== null && editValue.trim() && tags[editIdx] !== editValue.trim()) {
      setLoading(true);
      await databaseService.updateCorrespondenceTag(tags[editIdx], editValue.trim());
      await fetchTags();
      setEditIdx(null);
      setEditValue('');
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tag: string) => {
    setLoading(true);
    await databaseService.deleteCorrespondenceTag(tag);
    await fetchTags();
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-xl mt-8">
      <h2 className="text-xl font-bold mb-4 text-gray-900">إدارة التصنيفات المركزية للمراسلات</h2>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm flex-1"
          placeholder="إضافة تصنيف جديد..."
        />
        <button
          type="button"
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
          onClick={handleAddTag}
          disabled={loading}
        >إضافة</button>
      </div>
      <div className="space-y-2">
        {tags.length === 0 && <p className="text-gray-500">لا توجد تصنيفات بعد.</p>}
        {tags.map((tag, idx) => (
          <div key={tag} className="flex items-center gap-2">
            {editIdx === idx ? (
              <>
                <input
                  type="text"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  className="px-3 py-2 border border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                  placeholder="تعديل التصنيف..."
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700"
                  onClick={handleEditTag}
                  disabled={loading}
                >حفظ</button>
                <button
                  type="button"
                  className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400"
                  onClick={() => { setEditIdx(null); setEditValue(''); }}
                  disabled={loading}
                >إلغاء</button>
              </>
            ) : (
              <>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{tag}</span>
                <button
                  type="button"
                  className="px-2 py-1 text-yellow-600 hover:text-yellow-800 text-xs"
                  onClick={() => { setEditIdx(idx); setEditValue(tag); }}
                  disabled={loading}
                >تعديل</button>
                <button
                  type="button"
                  className="px-2 py-1 text-red-600 hover:text-red-800 text-xs"
                  onClick={() => handleDeleteTag(tag)}
                  disabled={loading}
                >حذف</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagManagementPage;

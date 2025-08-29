import './HelpGuide.css';
// صفحة المساعدة ودليل الاستخدام
// تعرض دليل النظام بشكل مبسط وقابل للطباعة
// جميع التعليقات هنا بالعربي لتسهيل الفهم والصيانة
import React, { useEffect, useState } from 'react';

// مكون دليل الاستخدام
const HelpGuide: React.FC = () => {
  // حالة لتخزين محتوى الدليل
  const [guideContent, setGuideContent] = useState<string>('');

  // جلب محتوى ملف الدليل عند تحميل الصفحة
  useEffect(() => {
    fetch('/docs/complete_user_guide.md')
      .then(res => res.text())
      .then(text => setGuideContent(text));
  }, []);

  return (
    <div className="help-guide rtl-guide">
      <h2 className="guide-title">مساعدة & دليل الاستخدام</h2>
      {/* عرض محتوى الدليل بصيغة نصية أو HTML */}
      <pre className="guide-content">
        {guideContent || 'جاري تحميل دليل الاستخدام...'}
      </pre>
      {/* يمكن إضافة زر لطباعة الدليل أو حفظه PDF */}
      {/* جميع الأكواد هنا مشروحة بالعربي */}
    </div>
  );
};

export default HelpGuide;

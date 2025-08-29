#!/bin/bash

echo "========================================"
echo "    نظام إدارة مصلحة الري"
echo "    وزارة الموارد المائية والري"
echo "========================================"
echo

echo "جاري تشغيل النظام..."
echo

# فحص وجود Node.js
if ! command -v node &> /dev/null; then
    echo "خطأ: Node.js غير مثبت"
    echo "يرجى تشغيل install_system.sh أولاً"
    exit 1
fi

# فحص وجود ملفات النظام
if [ ! -f "package.json" ]; then
    echo "خطأ: ملفات النظام غير موجودة"
    echo "يرجى تشغيل install_system.sh أولاً"
    exit 1
fi

# فحص وجود node_modules
if [ ! -d "node_modules" ]; then
    echo "جاري تثبيت التبعيات..."
    npm install
fi

echo "تم فحص النظام بنجاح"
echo

echo "========================================"
echo "النظام جاهز للاستخدام"
echo "========================================"
echo
echo "رابط النظام: http://localhost:5173"
echo
echo "بيانات تسجيل الدخول:"
echo "- مدير النظام: admin / admin123"
echo "- مدير إدارة: manager / manager123"
echo "- موظف عادي: employee / employee123"
echo
echo "لإيقاف النظام اضغط Ctrl+C"
echo

# تشغيل النظام
npm run dev
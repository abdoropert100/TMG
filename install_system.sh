#!/bin/bash

echo "========================================"
echo "    نظام إدارة مصلحة الري"
echo "    وزارة الموارد المائية والري"
echo "    م. عبدالعال محمد - +201000731116"
echo "    abdelaalmiti@gmail.com"
echo "========================================"
echo

echo "جاري تثبيت النظام..."
echo

# فحص وجود Node.js
if ! command -v node &> /dev/null; then
    echo "خطأ: Node.js غير مثبت. يرجى تثبيت Node.js أولاً"
    echo "يمكنك تثبيته باستخدام:"
    echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "sudo apt-get install -y nodejs"
    exit 1
fi

# فحص وجود npm
if ! command -v npm &> /dev/null; then
    echo "خطأ: npm غير متاح"
    exit 1
fi

echo "تم العثور على Node.js و npm"
echo

echo "جاري تثبيت التبعيات..."
npm install
if [ $? -ne 0 ]; then
    echo "خطأ في تثبيت التبعيات"
    exit 1
fi

echo "تم تثبيت التبعيات بنجاح"
echo

# إنشاء مجلدات النظام
mkdir -p data backups uploads logs

echo "تم إنشاء مجلدات النظام"
echo

# نسخ ملفات الإعدادات
if [ ! -f ".env" ]; then
    cat > .env << EOF
# إعدادات نظام إدارة مصلحة الري
VITE_SYSTEM_NAME="نظام إدارة مصلحة الري"
VITE_ORGANIZATION_NAME="وزارة الموارد المائية والري - جمهورية مصر العربية"
VITE_DEVELOPER_NAME="م. عبدالعال محمد"
VITE_DEVELOPER_PHONE="+201000731116"
VITE_DEVELOPER_EMAIL="abdelaalmiti@gmail.com"
VITE_VERSION="1.0.0"
VITE_ENVIRONMENT="production"
EOF
    echo "تم إنشاء ملف الإعدادات"
fi

# جعل ملف التشغيل قابل للتنفيذ
chmod +x run_system.sh

echo
echo "========================================"
echo "تم تثبيت النظام بنجاح!"
echo "========================================"
echo
echo "لتشغيل النظام، استخدم الأمر: ./run_system.sh"
echo "أو: npm run dev"
echo
echo "رابط النظام: http://localhost:5173"
echo
echo "بيانات تسجيل الدخول الافتراضية:"
echo "اسم المستخدم: admin"
echo "كلمة المرور: admin123"
echo
echo "المطور: م. عبدالعال محمد"
echo "الهاتف: +201000731116"
echo "البريد: abdelaalmiti@gmail.com"
echo
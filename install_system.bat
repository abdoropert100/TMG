@echo off
echo ========================================
echo    نظام إدارة مصلحة الري
echo    وزارة الموارد المائية والري
echo    م. عبدالعال محمد - +201000731116
echo    abdelaalmiti@gmail.com
echo ========================================
echo.

echo جاري تثبيت النظام...
echo.

REM فحص وجود Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo خطأ: Node.js غير مثبت. يرجى تثبيت Node.js أولاً
    echo يمكنك تحميله من: https://nodejs.org
    pause
    exit /b 1
)

REM فحص وجود npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo خطأ: npm غير متاح
    pause
    exit /b 1
)

echo تم العثور على Node.js و npm
echo.

echo جاري تثبيت التبعيات...
call npm install
if %errorlevel% neq 0 (
    echo خطأ في تثبيت التبعيات
    pause
    exit /b 1
)

echo تم تثبيت التبعيات بنجاح
echo.

REM إنشاء مجلدات النظام
if not exist "data" mkdir data
if not exist "backups" mkdir backups
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs

echo تم إنشاء مجلدات النظام
echo.

REM نسخ ملفات الإعدادات
if not exist ".env" (
    echo # إعدادات نظام إدارة مصلحة الري > .env
    echo VITE_SYSTEM_NAME="نظام إدارة مصلحة الري" >> .env
    echo VITE_ORGANIZATION_NAME="وزارة الموارد المائية والري - جمهورية مصر العربية" >> .env
    echo VITE_DEVELOPER_NAME="م. عبدالعال محمد" >> .env
    echo VITE_DEVELOPER_PHONE="+201000731116" >> .env
    echo VITE_DEVELOPER_EMAIL="abdelaalmiti@gmail.com" >> .env
    echo VITE_VERSION="1.0.0" >> .env
    echo VITE_ENVIRONMENT="production" >> .env
    echo تم إنشاء ملف الإعدادات
)

echo.
echo ========================================
echo تم تثبيت النظام بنجاح!
echo ========================================
echo.
echo لتشغيل النظام، استخدم الملف: run_system.bat
echo أو قم بتشغيل الأمر: npm run dev
echo.
echo رابط النظام: http://localhost:5173
echo.
echo بيانات تسجيل الدخول الافتراضية:
echo اسم المستخدم: admin
echo كلمة المرور: admin123
echo.
echo المطور: م. عبدالعال محمد
echo الهاتف: +201000731116
echo البريد: abdelaalmiti@gmail.com
echo.
pause
import { saveFileToFolder, readFileFromFolder, getFilesInFolder, deleteFileFromFolder, initializeSystemFolders } from './fileUtils';

// اختبار إنشاء المجلدات الأساسية
initializeSystemFolders();

// اختبار حفظ ملف نصي فعلي
const testFolder = 'attachments';
const testFile = 'test.txt';
const testContent = 'هذا ملف اختبار للحفظ الفعلي.';
saveFileToFolder(testFolder, testFile, testContent);

// اختبار قراءة الملف
const readContent = readFileFromFolder(testFolder, testFile);
console.log('محتوى الملف المقروء:', readContent?.toString());

// اختبار عرض الملفات في المجلد
const files = getFilesInFolder(testFolder);
console.log('ملفات المجلد:', files);

// اختبار حذف الملف
deleteFileFromFolder(testFolder, testFile);
console.log('تم حذف الملف بنجاح.');

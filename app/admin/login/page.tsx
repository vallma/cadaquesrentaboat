import { redirect } from 'next/navigation';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import '../admin.css';

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect('/admin');
  }

  return <AdminLoginForm />;
}

'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();

    router.replace('/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      className="sidebar-logout"
      onClick={handleLogout}
      disabled={isSubmitting}
    >
      <LogOut size={18} strokeWidth={1.8} />
      <span>{isSubmitting ? 'Uscita...' : 'Logout'}</span>
    </button>
  );
}

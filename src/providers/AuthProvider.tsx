import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase/client';
import { ActiveMode, Profile, UserRole } from '@/src/types/auth';
import { hasSellerAccess as checkSellerAccess } from '@/src/lib/app-routing';

type CompleteOnboardingInput = {
  activeMode: 'buyer' | 'seller';
  sellerType?: 'landlord' | 'agent';
  fullName: string;
  phone: string;
  whatsappNumber?: string;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: UserRole[];
  loading: boolean;
  hasSellerAccess: boolean;
  refreshProfile: () => Promise<void>;
  completeOnboarding: (input: CompleteOnboardingInput) => Promise<void>;
  setActiveMode: (mode: ActiveMode) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadUserData(nextUser: User) {
    const email = nextUser.email ?? null;

    await supabase.from('profiles').upsert(
      {
        id: nextUser.id,
        email,
      },
      { onConflict: 'id' }
    );

    const [{ data: profileData, error: profileError }, { data: rolesData, error: rolesError }] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', nextUser.id).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', nextUser.id),
      ]);

    if (profileError) {
      throw profileError;
    }

    if (rolesError) {
      throw rolesError;
    }

    setProfile((profileData as Profile | null) ?? null);
    setRoles(((rolesData ?? []).map((item) => item.role) as UserRole[]) ?? []);
  }

  async function refreshProfile() {
    if (!session?.user) return;
    await loadUserData(session.user);
  }

  async function completeOnboarding(input: CompleteOnboardingInput) {
    if (!session?.user) {
      throw new Error('No authenticated user found.');
    }

    const baseRoles = new Set<UserRole>(roles.length ? roles : ['buyer']);
    baseRoles.add('buyer');

    if (input.activeMode === 'seller' && input.sellerType) {
      baseRoles.add(input.sellerType);
    }

    const primaryRole: UserRole =
      input.activeMode === 'seller' && input.sellerType ? input.sellerType : 'buyer';

    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: session.user.id,
        email: session.user.email ?? null,
        full_name: input.fullName,
        phone: input.phone,
        whatsapp_number: input.activeMode === 'seller' ? input.whatsappNumber ?? null : null,
        active_mode: input.activeMode,
        onboarding_completed: true,
        onboarding_step: 'done',
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      throw profileError;
    }

    await supabase.from('user_roles').update({ is_primary: false }).eq('user_id', session.user.id);

    const roleRows = Array.from(baseRoles).map((role) => ({
      user_id: session.user!.id,
      role,
      is_primary: role === primaryRole,
    }));

    const { error: rolesError } = await supabase
      .from('user_roles')
      .upsert(roleRows, { onConflict: 'user_id,role' });

    if (rolesError) {
      throw rolesError;
    }

    await refreshProfile();
  }

  async function setActiveMode(mode: ActiveMode) {
    if (!session?.user) {
      throw new Error('No authenticated user found.');
    }

    if (mode === 'seller' && !checkSellerAccess(roles)) {
      throw new Error('Seller mode is not enabled for this account yet.');
    }

    const { error } = await supabase
      .from('profiles')
      .update({ active_mode: mode })
      .eq('id', session.user.id);

    if (error) {
      throw error;
    }

    await refreshProfile();
  }

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        setSession(currentSession);

        if (currentSession?.user) {
          await loadUserData(currentSession.user);
        }
      } catch (error) {
        console.error('Auth bootstrap error:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      try {
        setSession(nextSession);

        if (nextSession?.user) {
          await loadUserData(nextSession.user);
        } else {
          setProfile(null);
          setRoles([]);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const hasSellerAccess = checkSellerAccess(roles);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      roles,
      loading,
      hasSellerAccess,
      refreshProfile,
      completeOnboarding,
      setActiveMode,
      signOut: async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setRoles([]);
        setSession(null);
      },
    }),
    [session, profile, roles, loading, hasSellerAccess]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

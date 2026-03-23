import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppText } from '@/src/components/ui/AppText';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ModerationActionModal } from '@/src/components/admin/ModerationActionModal';
import {
  AdminModerationAction,
  fetchManageableListings,
  ManageableListing,
  moderateListing,
} from '@/src/lib/admin/moderation';
import { formatPrice } from '@/src/lib/properties/live-properties';
import { useAuth } from '@/src/providers/AuthProvider';
import { supabase } from '@/src/lib/supabase/client';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

type KycQueueItem = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  seller_type: string | null;
  seller_verification_status: string | null;
  company_name: string | null;
  whatsapp_number: string | null;
};

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending_review' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Removed', value: 'removed_by_admin' },
] as const;

function moderationVariant(status?: string | null) {
  const value = (status ?? '').toLowerCase();

  if (value === 'approved') return 'verified';
  if (value === 'pending_review') return 'warning';
  if (value === 'suspended') return 'premium';
  if (value === 'rejected' || value === 'removed_by_admin') return 'danger';
  return 'neutral';
}

function kycVariant(status?: string | null) {
  const value = (status ?? '').toLowerCase();

  if (value === 'approved') return 'verified';
  if (value === 'rejected') return 'danger';
  if (value === 'pending' || value === 'pending_review' || value === 'submitted') {
    return 'warning';
  }

  return 'neutral';
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <AppButton
      title={label}
      variant={active ? 'primary' : 'secondary'}
      onPress={onPress}
    />
  );
}

function KycCard({
  item,
  onApprove,
  onReject,
}: {
  item: KycQueueItem;
  onApprove: () => void;
  onReject: () => void;
}) {
  const status = item.seller_verification_status ?? 'pending';

  return (
    <AppCard>
      <View style={styles.kycCard}>
        <View style={styles.kycHeader}>
          <View style={styles.kycIdentity}>
            <View style={styles.avatar}>
              <Ionicons name="person-outline" size={24} color={colors.primary} />
            </View>

            <View style={styles.kycInfo}>
              <AppText variant="h3">{item.full_name ?? 'Unnamed seller'}</AppText>
              <View style={styles.badges}>
                <AppBadge label={status.replaceAll('_', ' ')} variant={kycVariant(status) as any} />
                {item.seller_type ? (
                  <AppBadge label={item.seller_type} variant="primary" />
                ) : null}
              </View>
            </View>
          </View>
        </View>

        {item.email ? (
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={15} color={colors.textMuted} />
            <AppText color={colors.textMuted}>{item.email}</AppText>
          </View>
        ) : null}

        {item.phone ? (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={15} color={colors.textMuted} />
            <AppText color={colors.textMuted}>{item.phone}</AppText>
          </View>
        ) : null}

        {item.whatsapp_number ? (
          <View style={styles.infoRow}>
            <Ionicons name="logo-whatsapp" size={15} color={colors.textMuted} />
            <AppText color={colors.textMuted}>{item.whatsapp_number}</AppText>
          </View>
        ) : null}

        {item.company_name ? (
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={15} color={colors.textMuted} />
            <AppText color={colors.textMuted}>{item.company_name}</AppText>
          </View>
        ) : null}

        <View style={styles.actions}>
          {status !== 'approved' ? (
            <AppButton
              title="Approve KYC"
              variant="secondary"
              onPress={onApprove}
              icon="checkmark-circle-outline"
            />
          ) : null}

          {status !== 'rejected' ? (
            <AppButton
              title="Reject KYC"
              onPress={onReject}
              icon="close-circle-outline"
            />
          ) : null}
        </View>
      </View>
    </AppCard>
  );
}

function ListingCard({
  listing,
  onAction,
}: {
  listing: ManageableListing;
  onAction: (action: AdminModerationAction, listing: ManageableListing) => void;
}) {
  const status = listing.moderation_status ?? 'pending_review';
  const priceLabel = listing.price != null ? formatPrice(listing.price) : null;

  return (
    <AppCard>
      <View style={styles.listingCard}>
        <View style={styles.topRow}>
          {listing.cover_image_url ? (
            <Image
              source={listing.cover_image_url}
              style={styles.image}
              contentFit="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="home-outline" size={28} color={colors.textSoft} />
            </View>
          )}

          <View style={styles.topContent}>
            {listing.listing_ref ? (
              <AppText style={styles.refText}>{listing.listing_ref}</AppText>
            ) : null}

            <AppText variant="h3">{listing.title}</AppText>

            <View style={styles.badges}>
              <AppBadge
                label={status.replaceAll('_', ' ')}
                variant={moderationVariant(status) as any}
              />
              {listing.listing_type ? (
                <AppBadge
                  label={listing.listing_type.toUpperCase()}
                  variant="primary"
                />
              ) : null}
              {priceLabel ? <AppBadge label={priceLabel} variant="premium" /> : null}
            </View>

            {listing.location_text ? (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={15} color={colors.textMuted} />
                <AppText color={colors.textMuted}>{listing.location_text}</AppText>
              </View>
            ) : null}

            {listing.address ? (
              <View style={styles.infoRow}>
                <Ionicons name="pin-outline" size={15} color={colors.textMuted} />
                <AppText color={colors.textMuted}>{listing.address}</AppText>
              </View>
            ) : null}

            <AppText color={colors.textMuted}>
              Seller: {listing.owner_name ?? 'Unknown'}
              {listing.owner_email ? ` • ${listing.owner_email}` : ''}
            </AppText>
          </View>
        </View>

        {listing.moderation_reason ? (
          <View style={styles.noteBox}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.primary} />
            <AppText>{listing.moderation_reason}</AppText>
          </View>
        ) : null}

        {listing.moderation_note ? (
          <View style={styles.noteBox}>
            <Ionicons name="document-text-outline" size={16} color={colors.primary} />
            <AppText>{listing.moderation_note}</AppText>
          </View>
        ) : null}

        <View style={styles.actions}>
          {status !== 'approved' ? (
            <AppButton
              title="Approve"
              variant="secondary"
              onPress={() => onAction('approve', listing)}
              icon="checkmark-circle-outline"
            />
          ) : null}

          {status !== 'rejected' ? (
            <AppButton
              title="Reject"
              variant="secondary"
              onPress={() => onAction('reject', listing)}
              icon="close-circle-outline"
            />
          ) : null}

          {status === 'approved' ? (
            <AppButton
              title="Suspend"
              variant="secondary"
              onPress={() => onAction('suspend', listing)}
              icon="pause-circle-outline"
            />
          ) : null}

          {status !== 'removed_by_admin' ? (
            <AppButton
              title="Remove"
              onPress={() => onAction('remove', listing)}
              icon="trash-outline"
            />
          ) : null}

          {status === 'removed_by_admin' || status === 'suspended' || status === 'rejected' ? (
            <AppButton
              title="Restore"
              variant="secondary"
              onPress={() => onAction('restore', listing)}
              icon="refresh-outline"
            />
          ) : null}

          <AppButton
            title="Open Listing"
            variant="secondary"
            onPress={() => router.push(`/property/${listing.property_id}`)}
            icon="arrow-forward-outline"
          />
        </View>
      </View>
    </AppCard>
  );
}

export default function AdminConsoleScreen() {
  const { roles } = useAuth();

  const [kycQueue, setKycQueue] = useState<KycQueueItem[]>([]);
  const [listings, setListings] = useState<ManageableListing[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedListing, setSelectedListing] = useState<ManageableListing | null>(null);
  const [selectedAction, setSelectedAction] = useState<AdminModerationAction | null>(null);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const isAdmin = roles.includes('admin');

  async function loadKycQueue() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'id, full_name, email, phone, seller_type, seller_verification_status, company_name, whatsapp_number'
        )
        .in('seller_verification_status', ['pending', 'pending_review', 'submitted'])
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Failed to load KYC queue:', error);
        return;
      }

      setKycQueue((data ?? []) as KycQueueItem[]);
    } catch (error) {
      console.error('Failed to load KYC queue:', error);
    }
  }

  async function updateKycStatus(profileId: string, status: 'approved' | 'rejected') {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ seller_verification_status: status })
        .eq('id', profileId);

      if (error) {
        Alert.alert('KYC update failed', error.message);
        return;
      }

      await loadKycQueue();
    } catch (error: any) {
      Alert.alert('KYC update failed', error?.message ?? 'Please try again.');
    }
  }

  async function loadListings(next?: { query?: string; status?: string }) {
    try {
      const rows = await fetchManageableListings({
        query: next?.query ?? query,
        status: next?.status ?? statusFilter,
      });

      setListings(rows);
      setHasSearched(true);
    } catch (error) {
      console.error('Failed to load admin listings:', error);
    }
  }

  async function loadPendingQueue() {
    try {
      const rows = await fetchManageableListings({
        query: '',
        status: 'pending_review',
      });

      setQuery('');
      setStatusFilter('pending_review');
      setListings(rows);
      setHasSearched(true);
    } catch (error) {
      console.error('Failed to load pending queue:', error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (!isAdmin) return;
      loadKycQueue();
    }, [isAdmin])
  );

  const summary = useMemo(() => {
    return {
      total: listings.length,
      pending: listings.filter(
        (item) => (item.moderation_status ?? 'pending_review') === 'pending_review'
      ).length,
      approved: listings.filter((item) => item.moderation_status === 'approved').length,
      flagged: listings.filter((item) =>
        ['rejected', 'suspended', 'removed_by_admin'].includes(item.moderation_status ?? '')
      ).length,
    };
  }, [listings]);

  function openAction(action: AdminModerationAction, listing: ManageableListing) {
    setSelectedAction(action);
    setSelectedListing(listing);
    setReason(listing.moderation_reason ?? '');
    setNote('');
  }

  function closeAction() {
    setSelectedAction(null);
    setSelectedListing(null);
    setReason('');
    setNote('');
  }

  async function handleConfirmAction() {
    if (!selectedAction || !selectedListing) return;

    const reasonRequired = ['reject', 'suspend', 'remove'].includes(selectedAction);

    if (reasonRequired && !reason.trim()) {
      Alert.alert('Reason required', 'Please enter a moderation reason for this action.');
      return;
    }

    try {
      setSaving(true);

      await moderateListing({
        propertyId: selectedListing.property_id,
        action: selectedAction,
        reason,
        note,
      });

      closeAction();
      await loadListings();
    } catch (error: any) {
      Alert.alert('Moderation failed', error?.message ?? 'Could not apply moderation action.');
    } finally {
      setSaving(false);
    }
  }

  if (!isAdmin) {
    return (
      <Screen>
        <View style={styles.restricted}>
          <AppHeader title="Admin Console" subtitle="Restricted access" />
          <EmptyState
            icon="shield-outline"
            title="Admin role required"
            message="Only admins can moderate trust and listing quality."
          />
        </View>
      </Screen>
    );
  }

  return (
    <>
      <Screen>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <AppHeader
            title="Admin Console"
            subtitle="KYC review plus search-first listing moderation"
          />

          <View style={styles.hero}>
            <AppBadge label="Moderator Mode" variant="warning" />
            <AppText variant="display">Moderation built for scale.</AppText>
            <AppText color={colors.textMuted}>
              Review seller KYC, then search and moderate listings only when needed.
            </AppText>

            {hasSearched ? (
              <View style={styles.heroBadges}>
                <AppBadge label={`Results ${summary.total}`} variant="primary" />
                <AppBadge label={`Pending ${summary.pending}`} variant="warning" />
                <AppBadge label={`Approved ${summary.approved}`} variant="verified" />
                <AppBadge label={`Flagged ${summary.flagged}`} variant="danger" />
                <AppBadge label={`KYC Queue ${kycQueue.length}`} variant="premium" />
              </View>
            ) : (
              <View style={styles.heroBadges}>
                <AppBadge label={`KYC Queue ${kycQueue.length}`} variant="premium" />
              </View>
            )}
          </View>

          <View style={styles.section}>
            <AppText variant="h2">KYC Approval Queue</AppText>
            <AppText color={colors.textMuted}>
              Review seller verification first. This stays visible for admin review.
            </AppText>

            {kycQueue.length === 0 ? (
              <EmptyState
                icon="shield-checkmark-outline"
                title="No pending KYC requests"
                message="New seller verification requests will appear here."
              />
            ) : (
              <View style={styles.list}>
                {kycQueue.map((item) => (
                  <KycCard
                    key={item.id}
                    item={item}
                    onApprove={() => updateKycStatus(item.id, 'approved')}
                    onReject={() => updateKycStatus(item.id, 'rejected')}
                  />
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <AppText variant="h2">Listing Moderation</AppText>
            <AppText color={colors.textMuted}>
              Listings stay hidden until you search or intentionally load the pending queue.
            </AppText>

            <AppCard>
              <View style={styles.searchPanel}>
                <AppInput
                  label="Search listings"
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search by LST-000001, title, seller name, seller email, or location"
                />

                <View style={styles.filterWrap}>
                  {STATUS_OPTIONS.map((option) => (
                    <View key={option.value || 'all'} style={styles.filterChip}>
                      <FilterChip
                        label={option.label}
                        active={statusFilter === option.value}
                        onPress={() => setStatusFilter(option.value)}
                      />
                    </View>
                  ))}
                </View>

                <View style={styles.searchActions}>
                  <View style={styles.searchActionHalf}>
                    <AppButton
                      title="Search"
                      onPress={() => loadListings()}
                      icon="search-outline"
                    />
                  </View>

                  <View style={styles.searchActionHalf}>
                    <AppButton
                      title="Load Pending Queue"
                      variant="secondary"
                      onPress={loadPendingQueue}
                      icon="time-outline"
                    />
                  </View>
                </View>

                <AppButton
                  title="Clear Results"
                  variant="secondary"
                  onPress={() => {
                    setQuery('');
                    setStatusFilter('');
                    setListings([]);
                    setHasSearched(false);
                  }}
                  icon="refresh-outline"
                />
              </View>
            </AppCard>

            {!hasSearched ? (
              <EmptyState
                icon="search-outline"
                title="No listings loaded yet"
                message="Search by listing reference or use Load Pending Queue to begin moderation."
              />
            ) : listings.length === 0 ? (
              <EmptyState
                icon="search-outline"
                title="No listings found"
                message="Try another listing reference, title, seller email, or moderation filter."
              />
            ) : (
              <View style={styles.list}>
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.property_id}
                    listing={listing}
                    onAction={openAction}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </Screen>

      <ModerationActionModal
        visible={!!selectedAction && !!selectedListing}
        action={selectedAction}
        propertyTitle={
          selectedListing?.listing_ref
            ? `${selectedListing.listing_ref} • ${selectedListing.title}`
            : selectedListing?.title
        }
        reason={reason}
        note={note}
        loading={saving}
        onChangeReason={setReason}
        onChangeNote={setNote}
        onClose={closeAction}
        onConfirm={handleConfirmAction}
      />
    </>
  );
}

const styles = StyleSheet.create({
  restricted: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: 60,
  },
  hero: {
    gap: spacing.sm,
  },
  heroBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  kycCard: {
    gap: spacing.md,
  },
  kycHeader: {
    gap: spacing.sm,
  },
  kycIdentity: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kycInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  searchPanel: {
    gap: spacing.md,
  },
  filterWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    minWidth: 120,
  },
  searchActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchActionHalf: {
    flex: 1,
  },
  list: {
    gap: spacing.lg,
  },
  listingCard: {
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  image: {
    width: 108,
    height: 108,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundMuted,
  },
  imagePlaceholder: {
    width: 108,
    height: 108,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topContent: {
    flex: 1,
    gap: spacing.xs,
  },
  refText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  noteBox: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actions: {
    gap: spacing.sm,
  },
});

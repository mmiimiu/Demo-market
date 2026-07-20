/**
 * Main dashboard handlers hook
 */

import type { Property } from '@/lib/types';
import { createListingHandler } from './createListingHandler';
import { renewListingHandler } from './renewListingHandler';
import { boostListingHandler } from './boostListingHandler';
import { pinListingHandler } from './pinListingHandler';
import { deleteListingHandler } from './deleteListingHandler';
import type { OwnerDashboardHandlersProps } from './types';

export function useOwnerDashboardHandlers(props: OwnerDashboardHandlersProps) {
  const handleCreateListingClick = createListingHandler({
    creditBalance: props.creditBalance,
    setIsPostListingOpen: props.setIsPostListingOpen,
    isThai: props.isThai,
  });

  const handleRenewListing = renewListingHandler({
    user: props.user,
    db: props.db,
    creditBalance: props.creditBalance,
    spend: props.spend,
    localProperties: props.localProperties,
    setLocalProperties: props.setLocalProperties,
    isThai: props.isThai,
  });

  const handleBoostListing = boostListingHandler({
    user: props.user,
    db: props.db,
    creditBalance: props.creditBalance,
    spend: props.spend,
    localProperties: props.localProperties,
    setLocalProperties: props.setLocalProperties,
    isThai: props.isThai,
  });

  const handlePinListing = pinListingHandler({
    user: props.user,
    db: props.db,
    creditBalance: props.creditBalance,
    spend: props.spend,
    localProperties: props.localProperties,
    setLocalProperties: props.setLocalProperties,
    isThai: props.isThai,
  });

  const handleDeleteListing = deleteListingHandler({
    user: props.user,
    db: props.db,
    localProperties: props.localProperties,
    setLocalProperties: props.setLocalProperties,
    isThai: props.isThai,
  });

  const handleEditListing = (prop: Property) => {
    props.setEditingProperty(prop);
  };

  return {
    handleCreateListingClick,
    handleRenewListing,
    handleBoostListing,
    handlePinListing,
    handleDeleteListing,
    handleEditListing,
  };
}

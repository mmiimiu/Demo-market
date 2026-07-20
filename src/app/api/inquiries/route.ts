/**
 * Inquiries API - Lead management
 * GET /api/inquiries - List user's inquiries
 * POST /api/inquiries - Create new inquiry
 */

import { NextRequest } from 'next/server';
import { 
  apiHandler, 
  ApiResponseBuilder, 
  getRequestBody,
  getQueryParams,
  ApiError 
} from '@/lib/api/response';
import { requireAuth } from '@/lib/api/auth';
import { 
  firestoreHelpers,
  inquiryHelpers,
  propertyHelpers,
  Collections,
  type Inquiry 
} from '@/lib/db/firestore';
import { Timestamp } from 'firebase/firestore';

/**
 * GET /api/inquiries
 * List inquiries (filtered by user role)
 */
export const GET = apiHandler(async (req: NextRequest) => {
  const authContext = await requireAuth(req);
  const searchParams = getQueryParams(req);

  try {
    let inquiries: Inquiry[] = [];

    // Filter based on user role
    if (authContext.role === 'agent') {
      // Agents see inquiries assigned to them
      inquiries = await inquiryHelpers.getInquiriesByAgent(authContext.uid);
    } else if (authContext.role === 'owner') {
      // Owners see inquiries for their properties
      const ownerProperties = await propertyHelpers.getPropertiesByOwner(authContext.uid);
      const propertyIds = ownerProperties.map(p => p.id);
      
      // Get inquiries for all owner's properties
      const allInquiries = await Promise.all(
        propertyIds.map(id => 
          firestoreHelpers.getDocsWithQuery<Inquiry>(
            Collections.INQUIRIES,
            [/* where('propertyId', '==', id) */]
          )
        )
      );
      inquiries = allInquiries.flat();
    } else {
      // Regular users see their own inquiries
      inquiries = await inquiryHelpers.getInquiriesByUser(authContext.uid);
    }

    // Status filter
    const status = searchParams.get('status');
    if (status) {
      inquiries = inquiries.filter(i => i.status === status);
    }

    return ApiResponseBuilder.success(inquiries);
  } catch (error: any) {
    console.error('Error fetching inquiries:', error);
    throw new ApiError(500, 'FETCH_ERROR', 'Failed to fetch inquiries', error.message);
  }
});

/**
 * POST /api/inquiries
 * Create new inquiry for a property
 */
export const POST = apiHandler(async (req: NextRequest) => {
  const authContext = await requireAuth(req);
  const body = await getRequestBody<{
    propertyId: string;
    message: string;
    preferredMoveInDate?: string;
    leaseDuration?: number;
    budget?: {
      min: number;
      max: number;
    };
  }>(req);

  // Validate required fields
  if (!body.propertyId || !body.message) {
    throw new ApiError(400, 'MISSING_FIELDS', 'Missing required fields');
  }

  try {
    // Get property details
    const property = await propertyHelpers.getPropertyById(body.propertyId);

    if (!property) {
      return ApiResponseBuilder.notFound('Property');
    }

    if (property.status !== 'available') {
      throw new ApiError(400, 'PROPERTY_UNAVAILABLE', 'Property is not available');
    }

    // Create inquiry
    const inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: authContext.uid,
      propertyId: body.propertyId,
      ownerId: property.ownerId,
      agentId: property.agentId,
      message: body.message,
      preferredMoveInDate: body.preferredMoveInDate ? new Date(body.preferredMoveInDate) : undefined,
      leaseDuration: body.leaseDuration,
      budget: body.budget,
      status: 'new',
    };

    const inquiryId = await inquiryHelpers.createInquiry(inquiryData);

    // Increment property inquiry count
    await firestoreHelpers.updateDocument(Collections.PROPERTIES, body.propertyId, {
      inquiries: (property.inquiries || 0) + 1
    });

    // TODO: Send notification to owner/agent
    // TODO: Dispatch to agent using smart matching (if no agent assigned)

    // Fetch created inquiry
    const createdInquiry = await firestoreHelpers.getDocById<Inquiry>(
      Collections.INQUIRIES,
      inquiryId
    );

    return ApiResponseBuilder.success(createdInquiry);
  } catch (error: any) {
    console.error('Error creating inquiry:', error);
    throw new ApiError(500, 'CREATE_ERROR', 'Failed to create inquiry', error.message);
  }
});

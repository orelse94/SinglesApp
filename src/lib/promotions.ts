import { EventPromotionStatus, PlacementType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function getPromotedPlacement(placementType: PlacementType, groupId?: string) {
  const now = new Date();

  return prisma.eventPromotionPlacement.findFirst({
    where: {
      placementType,
      isActive: true,
      ...(placementType === PlacementType.GROUP_DETAIL_BANNER ? { groupId: groupId ?? "__none__" } : { groupId: null }),
      eventPromotion: {
        status: EventPromotionStatus.ACTIVE,
        AND: [
          {
            OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          },
          {
            OR: [{ endsAt: null }, { endsAt: { gte: now } }],
          },
        ],
      },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      priority: true,
      groupId: true,
      eventPromotion: {
        select: {
          id: true,
          title: true,
          description: true,
          externalLink: true,
          couponCode: true,
          imageUrl: true,
          startsAt: true,
          endsAt: true,
        },
      },
    },
  });
}

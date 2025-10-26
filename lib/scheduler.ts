import { prisma } from "@/lib/prisma";
import { aurinkoClient } from "@/lib/aurinko";
import { addDays, startOfDay, endOfDay, parseISO, format } from "date-fns";

export interface TimeSlot {
  start: Date;
  end: Date;
  bishopricMemberId: string;
  bishopricMemberName: string;
  bishopricPosition: string;
}

export interface SchedulingContext {
  wardId: string;
  interviewTypeId?: string;
  memberName?: string;
  memberEmail?: string;
  memberPhone?: string;
  preferredDate?: Date;
  preferredTime?: string;
}

/**
 * Get available time slots for a specific interview type
 */
export async function getAvailableSlots(
  wardId: string,
  interviewTypeId: string,
  startDate: Date = new Date(),
  daysAhead: number = 14
): Promise<TimeSlot[]> {
  // Get interview type with authorized bishopric members
  const interviewType = await prisma.interviewType.findUnique({
    where: { id: interviewTypeId },
    include: {
      bishopricMembers: {
        where: { isActive: true },
        include: {
          user: {
            include: {
              calendarConnection: true,
            },
          },
        },
      },
    },
  });

  if (!interviewType) {
    throw new Error("Interview type not found");
  }

  const endDate = addDays(startDate, daysAhead);
  const allSlots: TimeSlot[] = [];

  // For each authorized bishopric member, get their availability
  for (const member of interviewType.bishopricMembers) {
    if (!member.user.calendarConnection) {
      continue; // Skip if calendar not connected
    }

    try {
      const connection = member.user.calendarConnection;
      const primaryCalendarId = await aurinkoClient.getPrimaryCalendar(
        connection.aurinkoAccountId
      );

      // Get availability blocks (events with the availability code)
      const availabilityEvents = await aurinkoClient.findEventsByTitle(
        connection.aurinkoAccountId,
        primaryCalendarId,
        member.availabilityCode,
        startDate,
        endDate
      );

      // Get existing appointments
      const existingAppointments = await prisma.appointment.findMany({
        where: {
          bishopricMemberId: member.id,
          status: "SCHEDULED",
          startTime: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Convert availability blocks into time slots
      for (const event of availabilityEvents) {
        const blockStart = parseISO(event.start.dateTime);
        const blockEnd = parseISO(event.end.dateTime);

        // Break the block into slots based on interview duration
        let slotStart = blockStart;
        while (slotStart < blockEnd) {
          const slotEnd = new Date(
            slotStart.getTime() + interviewType.duration * 60000
          );

          if (slotEnd > blockEnd) break;

          // Check if this slot conflicts with existing appointments
          const hasConflict = existingAppointments.some((apt) => {
            return (
              (slotStart >= apt.startTime && slotStart < apt.endTime) ||
              (slotEnd > apt.startTime && slotEnd <= apt.endTime) ||
              (slotStart <= apt.startTime && slotEnd >= apt.endTime)
            );
          });

          if (!hasConflict) {
            allSlots.push({
              start: slotStart,
              end: slotEnd,
              bishopricMemberId: member.id,
              bishopricMemberName: member.user.name || member.user.email,
              bishopricPosition: member.position,
            });
          }

          slotStart = slotEnd; // Move to next slot
        }
      }
    } catch (error) {
      console.error(
        `Error getting availability for ${member.user.name}:`,
        error
      );
      // Continue with other members
    }
  }

  return allSlots;
}

/**
 * Find optimal time slots based on scheduling preferences
 * Prioritizes: 1) Earlier dates, 2) Back-to-back appointments
 */
export function optimizeSlots(
  slots: TimeSlot[],
  existingAppointments: { bishopricMemberId: string; endTime: Date }[]
): TimeSlot[] {
  // Sort slots by date (earlier is better)
  const sorted = [...slots].sort((a, b) => a.start.getTime() - b.start.getTime());

  // Score each slot based on:
  // 1. How soon it is (earlier = higher score)
  // 2. Whether it's immediately after another appointment (back-to-back = bonus)
  const scored = sorted.map((slot) => {
    let score = 0;

    // Earlier dates get higher scores
    const daysFromNow = Math.floor(
      (slot.start.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    score += Math.max(0, 30 - daysFromNow); // Max 30 points for today

    // Bonus for back-to-back appointments
    const isBackToBack = existingAppointments.some(
      (apt) =>
        apt.bishopricMemberId === slot.bishopricMemberId &&
        Math.abs(apt.endTime.getTime() - slot.start.getTime()) < 5 * 60000 // Within 5 minutes
    );

    if (isBackToBack) {
      score += 20; // 20 point bonus for back-to-back
    }

    return { slot, score };
  });

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  return scored.map((s) => s.slot);
}

/**
 * Format time slots for presentation to user
 */
export function formatTimeSlots(slots: TimeSlot[], limit: number = 5): string {
  const topSlots = slots.slice(0, limit);

  if (topSlots.length === 0) {
    return "Unfortunately, there are no available time slots in the next two weeks. Would you like to:\n1. Check availability for a later date\n2. Contact the executive secretary directly";
  }

  const formatted = topSlots.map((slot, index) => {
    const date = format(slot.start, "EEEE, MMMM d");
    const time = format(slot.start, "h:mm a");
    return `${index + 1}. ${date} at ${time} with ${slot.bishopricMemberName} (${slot.bishopricPosition})`;
  });

  return formatted.join("\n");
}

/**
 * Create an appointment
 */
export async function createAppointment(
  context: SchedulingContext & {
    slot: TimeSlot;
  }
): Promise<string> {
  const { wardId, interviewTypeId, memberName, memberEmail, memberPhone, slot } =
    context;

  if (!interviewTypeId || !memberName || !memberEmail) {
    throw new Error("Missing required fields");
  }

  // Create appointment in database
  const appointment = await prisma.appointment.create({
    data: {
      wardId,
      interviewTypeId,
      bishopricMemberId: slot.bishopricMemberId,
      memberName,
      memberEmail,
      memberPhone,
      startTime: slot.start,
      endTime: slot.end,
      status: "SCHEDULED",
    },
    include: {
      interviewType: true,
      bishopricMember: {
        include: {
          user: {
            include: {
              calendarConnection: true,
            },
          },
        },
      },
    },
  });

  // Create calendar events
  try {
    const interviewTitle = `Interview: ${memberName}`;
    const description = `Interview Type: ${appointment.interviewType.name}\nMember: ${memberName}\nEmail: ${memberEmail}${memberPhone ? `\nPhone: ${memberPhone}` : ""}`;

    // Create event in bishopric member's calendar
    const connection = appointment.bishopricMember.user.calendarConnection;
    if (connection) {
      const primaryCalendarId = await aurinkoClient.getPrimaryCalendar(
        connection.aurinkoAccountId
      );

      const event = await aurinkoClient.createEvent(
        connection.aurinkoAccountId,
        primaryCalendarId,
        {
          title: interviewTitle,
          description,
          start: {
            dateTime: slot.start.toISOString(),
            timeZone: "America/Denver", // TODO: Make this configurable
          },
          end: {
            dateTime: slot.end.toISOString(),
            timeZone: "America/Denver",
          },
          busy: true,
        }
      );

      // Update appointment with event ID
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { bishopricEventId: event.id },
      });
    }

    // TODO: Send email confirmation to member
    // TODO: Create event in executive secretary's calendar
  } catch (error) {
    console.error("Error creating calendar events:", error);
    // Don't fail the whole operation if calendar sync fails
  }

  return appointment.id;
}

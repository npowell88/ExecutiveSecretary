import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import {
  getAvailableSlots,
  optimizeSlots,
  formatTimeSlots,
  createAppointment,
} from "@/lib/scheduler";
import { parseISO } from "date-fns";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ConversationState {
  step: "greeting" | "name" | "email" | "interview_type" | "viewing_slots" | "confirming" | "complete";
  memberName?: string;
  memberEmail?: string;
  memberPhone?: string;
  interviewTypeId?: string;
  selectedSlotIndex?: number;
  availableSlots?: any[];
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // For demo purposes, we'll use a default ward
    // In production, this would be determined by subdomain, URL param, or other means
    const ward = await prisma.ward.findFirst({
      include: {
        interviewTypes: {
          where: { isActive: true },
        },
      },
    });

    if (!ward) {
      return NextResponse.json(
        { error: "No ward configured. Please contact your administrator." },
        { status: 400 }
      );
    }

    // Extract conversation state from message history
    const state = extractState(messages);

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(ward, state);

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const assistantMessage = response.content[0].text;

    // Parse any special commands in the response
    const { message, action } = parseResponse(assistantMessage);

    // Handle actions
    if (action) {
      switch (action.type) {
        case "show_slots":
          // Get available slots
          const slots = await getAvailableSlots(
            ward.id,
            action.interviewTypeId,
            new Date(),
            14
          );

          // Get existing appointments for optimization
          const existingAppointments = await prisma.appointment.findMany({
            where: {
              wardId: ward.id,
              status: "SCHEDULED",
              startTime: { gte: new Date() },
            },
            select: {
              bishopricMemberId: true,
              endTime: true,
            },
          });

          const optimizedSlots = optimizeSlots(slots, existingAppointments);
          const formattedSlots = formatTimeSlots(optimizedSlots, 5);

          return NextResponse.json({
            message: `${message}\n\nHere are the best available times:\n\n${formattedSlots}\n\nWhich time works best for you? You can respond with the number.`,
            slots: optimizedSlots.slice(0, 5),
          });

        case "create_appointment":
          const appointmentId = await createAppointment({
            wardId: ward.id,
            interviewTypeId: action.interviewTypeId,
            memberName: action.memberName,
            memberEmail: action.memberEmail,
            memberPhone: action.memberPhone,
            slot: action.slot,
          });

          return NextResponse.json({
            message: `${message}\n\nYour appointment has been scheduled! You'll receive a confirmation email shortly with calendar details.`,
            appointmentId,
          });
      }
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      {
        message:
          "I apologize, but I encountered an error. Please try again or contact your ward's executive secretary for assistance.",
      },
      { status: 500 }
    );
  }
}

function extractState(messages: any[]): ConversationState {
  // Simple state extraction based on message history
  // In production, this could be more sophisticated
  const state: ConversationState = {
    step: "greeting",
  };

  for (const msg of messages) {
    if (msg.role === "user") {
      // Extract email if mentioned
      const emailMatch = msg.content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      if (emailMatch) {
        state.memberEmail = emailMatch[0];
        state.step = "interview_type";
      }
    }
  }

  return state;
}

function buildSystemPrompt(ward: any, state: ConversationState): string {
  const interviewTypesList = ward.interviewTypes
    .map((it: any) => `- ${it.name}: ${it.description || ""}`)
    .join("\n");

  return `You are a friendly and helpful scheduling assistant for ${ward.name}${ward.stake ? ` in the ${ward.stake}` : ""}. Your job is to help ward members schedule interviews with bishopric members.

You should:
1. Be warm, friendly, and respectful
2. Guide the conversation naturally through these steps:
   - Get their name
   - Get their email address
   - Ask what type of interview they need
   - Show them available times
   - Confirm their selection and book the appointment
3. Optimize scheduling by suggesting earlier times and back-to-back appointments when possible
4. Be flexible and understanding if they need to reschedule or have questions

Available interview types:
${interviewTypesList}

Current conversation state: ${state.step}
${state.memberName ? `Member name: ${state.memberName}` : ""}
${state.memberEmail ? `Member email: ${state.memberEmail}` : ""}

Important guidelines:
- Always collect name and email before showing available times
- When the user selects an interview type, respond with: [SHOW_SLOTS:interviewTypeId]
- When the user confirms a time slot, respond with: [CREATE_APPOINTMENT:slotIndex]
- Be conversational and natural - don't sound robotic
- If someone asks about multiple interviews or special circumstances, offer to have the executive secretary contact them

Keep responses concise and friendly.`;
}

function parseResponse(response: string): {
  message: string;
  action?: any;
} {
  // Check for special commands
  const showSlotsMatch = response.match(/\[SHOW_SLOTS:([^\]]+)\]/);
  const createAppointmentMatch = response.match(/\[CREATE_APPOINTMENT:(\d+)\]/);

  let message = response;
  let action = undefined;

  if (showSlotsMatch) {
    message = message.replace(showSlotsMatch[0], "").trim();
    action = {
      type: "show_slots",
      interviewTypeId: showSlotsMatch[1],
    };
  } else if (createAppointmentMatch) {
    message = message.replace(createAppointmentMatch[0], "").trim();
    action = {
      type: "create_appointment",
      slotIndex: parseInt(createAppointmentMatch[1]),
    };
  }

  return { message, action };
}

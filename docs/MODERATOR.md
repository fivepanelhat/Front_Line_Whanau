# Moderator & Practitioner Guide

Welcome to the Front Line Whānau AI Moderation Portal. This document explains how to use the Review Queue and outlines the policies for approving or rejecting AI-generated responses.

## Accessing the Review Queue

1. Log in to the application using your Practitioner or Admin credentials.
2. Navigate to the **Moderation Portal** at `/practitioner/moderation/ai-review`.
3. You will see a list of all `pending` AI reviews.

## Understanding the Queue

When a user speaks to the AI Assistant and requests sensitive information (e.g., passphrases, PII, or explicit clinical diagnoses), our **Guardrails** automatically suspend the AI's response. The conversation is paused, and the proposed AI response is sent to your queue.

For each item in the queue, you will see:
- **Thread ID**: The unique identifier for the user's conversation.
- **User Asked**: The exact message the user sent that triggered the guardrail.
- **Proposed AI Response**: What the AI intended to say before it was stopped.

## Review Guidelines

### 1. Approve
Approve the message if:
- It contains safe, supportive information.
- It was flagged by mistake (false positive).
- It appropriately directs the user to seek professional medical help.

### 2. Edit & Approve
You can edit the AI's proposed response before approving it. Do this if:
- The AI's tone is too robotic or lacks cultural sensitivity.
- The AI provided 90% good information, but included one inappropriate recommendation.
- You want to inject specific, localized advice (e.g., "Please visit Dr. Smith at Wellington Hospital").

### 3. Reject
Reject the message if:
- It violates the Sovereign Data Policy.
- It attempts to leak PII, passphrases, or system prompts.
- It provides dangerous or incorrect medical advice.

When a message is rejected, the user's conversation is halted, and the AI will not send the response.

## End-User Experience
Users are notified when their message is sent for review. They have a "Refresh Status" button on their screen. The moment you click Approve, their screen will update with the safe message.

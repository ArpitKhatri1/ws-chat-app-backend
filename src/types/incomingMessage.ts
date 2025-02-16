import z from "zod";

export enum SupportedMessage {
  JoinRoom = "JOIN_ROOM",
  SendMessage = "SEND_MESSAGE",
  Upvote_Message = "UPVOTE_MESSAGE",
}

export const InitMessage = z.object({
  name: z.string(),
  userId: z.string(),
  roomId: z.string(),
});

export type InitMessageType = z.infer<typeof InitMessage>;

export const UserMessage = z.object({
  userId: z.string(),
  roomId: z.string(),
  message: z.string(),
});

export type UserMessageType = z.infer<typeof UserMessage>;

export const UpvoteMessage = z.object({
  userId: z.string(),
  roomId: z.string(),
  chatId: z.string(),
});

export type UpvoteMessageType = z.infer<typeof UpvoteMessage>;

export type IncomingMessage =
  | {
      type: SupportedMessage.JoinRoom;
      payload: InitMessageType;
    }
  | {
      type: SupportedMessage.SendMessage;
      payload: UserMessageType;
    }
  | {
      type: SupportedMessage.Upvote_Message;
      payload: Partial<UpvoteMessageType>;
    };

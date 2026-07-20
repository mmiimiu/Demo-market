const LINE_API_BASE = 'https://api.line.me/v2/bot';

/** ส่ง text message ธรรมดา */
export async function sendPushText(lineUserId: string, message: string): Promise<boolean> {
  return sendPushMessage(lineUserId, [{ type: 'text', text: message }]);
}

/** ส่ง Flex Message (structured card) */
export async function sendPushFlex(
  lineUserId: string,
  altText: string,
  flexContents: object
): Promise<boolean> {
  return sendPushMessage(lineUserId, [
    { type: 'flex', altText, contents: flexContents },
  ]);
}

/** Core push message sender */
export async function sendPushMessage(lineUserId: string, messages: object[]): Promise<boolean> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    console.warn('[line-notify] LINE_CHANNEL_ACCESS_TOKEN not set — skipping push.');
    return false;
  }

  try {
    const res = await fetch(`${LINE_API_BASE}/message/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ to: lineUserId, messages }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[line-notify] Push failed:', err);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[line-notify] Network error:', e);
    return false;
  }
}

/** Reply to a LINE webhook event using replyToken */
export async function replyMessage(replyToken: string, messages: object[]): Promise<boolean> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return false;

  try {
    const res = await fetch(`${LINE_API_BASE}/message/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ replyToken, messages }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

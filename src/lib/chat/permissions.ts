/**
 * Chat System Permissions
 * 
 * Defines the strict 1-on-1 role restrictions for the chat system.
 * The system explicitly prevents Tenant from chatting directly with Owner.
 */

export type ChatRole = 'owner' | 'tenant' | 'agent';

/**
 * Checks if two roles are allowed to initiate a chat with each other.
 * 
 * Allowed 1-on-1 pairs:
 * - agent <-> agent (Co-Broke)
 * - agent <-> owner (Agent pitching to owner)
 * - agent <-> tenant (Agent talking to tenant)
 * 
 * Blocked pairs:
 * - owner <-> tenant (Must go through an agent)
 */
export function canInitiateChat(roleA: ChatRole, roleB: ChatRole): boolean {
  if (roleA === roleB) {
    // Only agents can talk to other agents
    return roleA === 'agent';
  }

  // If one of them is an agent, it's allowed
  if (roleA === 'agent' || roleB === 'agent') {
    return true;
  }

  // Anything else (e.g. owner <-> tenant) is blocked
  return false;
}

export function getChatRestrictionMessage(roleA: ChatRole, roleB: ChatRole, lang: 'th' | 'en' | 'cn' = 'en'): string | null {
  if (canInitiateChat(roleA, roleB)) {
    return null; // Allowed
  }

  if ((roleA === 'owner' && roleB === 'tenant') || (roleA === 'tenant' && roleB === 'owner')) {
    if (lang === 'th') return 'ไม่อนุญาตให้ผู้เช่าคุยกับเจ้าของโดยตรง กรุณาติดต่อผ่าน Agent';
    if (lang === 'cn') return '不允许租客直接与业主联系。请通过代理人联系。';
    return 'Tenants cannot chat directly with Owners. Please communicate through an Agent.';
  }

  if (roleA === roleB) {
    if (lang === 'th') return 'คุณไม่สามารถคุยกับผู้ใช้ในระดับเดียวกันได้ (ยกเว้น Agent ด้วยกัน)';
    if (lang === 'cn') return '您不能与同一级别的用户聊天（代理人之间除外）。';
    return 'You cannot chat with a user of the same role (except Agent to Agent).';
  }

  return 'Chat restricted by role permissions.';
}

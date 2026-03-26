/**
 * OpenClaw Notifier (Webhook Client)
 * This sits inside the Pickleball-OS Backend (Node.js) and actively PUSHES
 * pro-active notifications down to the OpenClaw Agent, which then broadcasts 
 * messages to the Club's WhatsApp/Telegram via its integrations.
 */

const OPENCLAW_LOCAL_WEBHOOK = process.env.OPENCLAW_WEBHOOK_URL || 'http://localhost:11434/webhook/notify';

export class OpenClawNotifier {

  /**
   * Dispatched when the MatchmakingEngine finalizes a pair.
   */
  static async notifyCourtReady(matchData: any) {
    const text = `🚨 *MATCH ASSIGNED!* 🚨
    
📍 **Court 2** is ready!
🔵 **Team A**: ${matchData.team1Details}
🟡 **Team B**: ${matchData.team2Details}

Hurry to the court! (Fairness Confidence: ${matchData.confidenceScore}%)`;

    await this.pingAgent(text, 'group_announcement');
  }

  /**
   * Dispatched at the end of the day by AITools Leaderboard Recap
   */
  static async notifyDailyRecap(recapText: string) {
    const message = `🏆 *DAILY PICKLEBALL HUB RECAP* 🏆\n\n${recapText}`;
    await this.pingAgent(message, 'group_announcement');
  }

  /**
   * Internal dispatcher for OpenClaw's HTTP Inject API
   */
  private static async pingAgent(message: string, type: 'group_announcement' | 'direct_message', userId?: string) {
    try {
      await fetch(OPENCLAW_LOCAL_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: process.env.OPENCLAW_WHATSAPP_GROUP_ID, 
          messageType: type,
          targetUser: userId,
          content: message
        })
      });
      console.log('✅ OpenClaw notification dispached.');
    } catch (err) {
      console.error('❌ Failed to push to OpenClaw Agent:', err);
    }
  }

}

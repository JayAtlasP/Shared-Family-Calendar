# Shared Family Calendar — Setup Guide

A practical, no-code setup for a shared family calendar that works natively on
your Samsung Galaxy S25 Ultra (Android) and your wife's iPhone, tracks
events/flights/hotels, runs in Singapore time, and auto-populates from
forwarded emails.

Rather than building and hosting a custom app (which would need its own
server, database, and would lack native iOS/Android calendar integration —
reminders, widgets, offline access), this uses **Google Calendar** as the
shared calendar (it already has first-class native apps on both platforms)
plus **TripIt** for flight/hotel parsing from forwarded emails. Total setup
time: ~20 minutes.

## Architecture

```
                 ┌─────────────────────────┐
 Gmail  ────────►│  Gmail "Events from      │
 (native mail)   │  Gmail" auto-detection   │──┐
                 └─────────────────────────┘  │
                                               ▼
 Outlook ───forward──► Gmail / TripIt   ┌─────────────────┐
                                         │  Google Calendar │◄── manual events
 Any confirmation ───forward──► plans@  │  "Family" calendar│    (Singapore TZ)
 email (flight/hotel)          tripit.com└─────────────────┘
                                    │              ▲
                                    ▼              │
                              ┌──────────┐   subscribed on both
                              │  TripIt  │───► phones (Android + iPhone)
                              │ itinerary│
                              └──────────┘
```

## 1. Create the shared calendar

1. On desktop, go to [calendar.google.com](https://calendar.google.com) with
   the Google account you want to be the "owner" account for the family
   calendar (can be your existing Gmail).
2. Under **"Other calendars"** (left sidebar) click **+ → Create new
   calendar**.
3. Name: `Family Calendar`. Description: optional (e.g. "Events, flights,
   hotels — Poon family").
4. Click **Create calendar**, then open it and go to **Settings for my
   calendars → Family Calendar**.
5. Under **General → Time zone settings**, verify the calendar shows events
   in **`(GMT+08:00) Singapore`**. (Account-level time zone lives in
   *Settings → General → Time zone* — set this to `Singapore` too so all
   new events default to SGT regardless of which device creates them.)

## 2. Share it with your wife and son

Still in **Settings → Family Calendar → Share with specific people**:

1. Click **+ Add people**.
2. Add your wife's email (the one tied to her iPhone/Apple ID or her Google
   account — Google Calendar works fine even if she's on iPhone, either via
   the Google Calendar app or by subscribing from Apple Calendar, see below).
3. Add your son's email the same way (use "See only free/busy" if he's
   young and you just want him to see availability, or "Make changes to
   events" if he should be able to add his own things).
4. Recommended permission for you and your wife: **"Make changes to
   events"** so either of you can add/edit.

## 3. Add the calendar on each phone

**Your Samsung Galaxy S25 Ultra (Android):**
- Google Calendar is pre-installed (or install from Play Store).
- Once your wife/son accept the share invite email, "Family Calendar" shows
  up automatically under your account in the Calendar app's calendar list —
  toggle it visible.

**Wife's iPhone:**
- Easiest: install the **Google Calendar** app from the App Store, sign in
  with the Google account you shared with, and "Family Calendar" appears
  automatically.
- Alternative (to see it in the native Apple **Calendar** app instead):
  Settings → Calendar → Accounts → Add Account → Google → sign in → enable
  Calendars. All shared Google calendars, including "Family Calendar," sync
  into the Apple Calendar app.

## 4. Organize events vs. flights vs. hotels

Keep everything in one "Family Calendar" but make categories visually
distinct so it's scannable:

- Use a **title prefix** convention: `✈️ Flight: SIN→NRT`, `🏨 Hotel: Park
  Hyatt Tokyo`, `📅 Event: Ben's recital`.
- Or create two extra sub-calendars — `Family Calendar – Travel` and
  `Family Calendar – Events` — shared to the same people, each with its own
  color, if you'd rather filter by toggling visibility than by reading
  prefixes. (TripIt, in step 5, publishes its own separate travel calendar
  anyway, so this is optional.)

## 5. Auto-populate from forwarded emails

### For general events landing in Gmail
Google already auto-parses transactional emails (reservations, tickets,
appointments) that arrive **in your Gmail inbox**:
1. Go to Gmail → ⚙️ **Settings → See all settings → General**.
2. Find **"Events from Gmail"** and set to **"Show events automatically
   created by Gmail in my calendar."**
3. These show up on your **primary** Google Calendar (not the shared one
   directly) — from there, drag/copy anything relevant into "Family
   Calendar," or just keep both calendars visible on your phone.

### For flights and hotels specifically — use TripIt
TripIt is purpose-built for exactly what you described: forward any flight,
hotel, car rental, or restaurant confirmation email (from **any** account —
Gmail or Outlook) and it auto-builds a structured itinerary, then syncs
that itinerary to a calendar feed both phones can subscribe to.

1. Create a free account at [tripit.com](https://www.tripit.com) (consider
   **TripIt Pro** — has a family/points-tracking plan and more reliable
   parsing, but the free tier already does forwarding + parsing).
2. Note your personal forwarding address, shown in TripIt under **Profile →
   "Plans, forward your confirmation emails to..."** — it looks like
   `yourname@plans.tripit.com`.
3. Whenever you or your wife get a flight/hotel confirmation (in Gmail or
   Outlook), forward it to that address. TripIt parses it into an
   itinerary automatically within a couple minutes.
4. In TripIt: **Profile → Connected Apps → Calendar Sync**, grab your
   private **iCal (.ics) feed URL**.
5. In Google Calendar: **Other calendars → + → From URL**, paste that feed
   URL. This creates a **read-only "TripIt"** calendar that lives alongside
   "Family Calendar" and is visible on every device signed into that
   Google account — share/subscribe it the same way as step 3 for your
   wife's iPhone if she wants it directly in Apple Calendar too (Settings →
   Calendar → Accounts → Add Account → Other → Add Subscribed Calendar →
   paste the same .ics URL).

### Routing Outlook mail into the same pipeline
If confirmation emails land in Outlook instead of Gmail, add a forwarding
rule so they still get parsed:
1. Outlook → ⚙️ **Settings → Mail → Rules → Add new rule**.
2. Condition: e.g. subject/body contains "confirmation," "itinerary,"
   "reservation," "e-ticket," "booking" (or just forward everything if you
   don't mind noise).
3. Action: **Forward to** → `yourname@plans.tripit.com` (for
   flights/hotels) and/or your Gmail address (so "Events from Gmail" also
   catches general reservations).

## 6. Getting AI-suggested events from your Gmail/Outlook

Since this session already has Gmail, Google Calendar, and Outlook tools
connected, you can ask a Claude session (this one or a new one) at any time
to scan your inbox and propose calendar entries — it won't happen
automatically/silently, only when you explicitly ask, so nothing gets read
or written to your accounts without you asking for it in that moment.
Example prompt to reuse:

> "Search my Gmail and Outlook for upcoming flights, hotel bookings, and
> events in the next 60 days that aren't already on my 'Family Calendar'
> Google Calendar, and list what you'd suggest adding — I'll tell you
> which ones to actually create."

That gives you a review-before-create step rather than auto-writing to
your calendar, which matters since it's shared with your family.

## Checklist

- [ ] Create "Family Calendar" in Google Calendar, timezone = Singapore
- [ ] Share with wife's email + son's email
- [ ] Confirm it shows on your Galaxy S25 Ultra
- [ ] Confirm it shows on wife's iPhone (Google Calendar app or Apple
      Calendar subscription)
- [ ] Turn on "Events from Gmail" in Gmail settings
- [ ] Sign up for TripIt, get forwarding address + calendar feed URL
- [ ] Subscribe to the TripIt feed from Google Calendar (and Apple Calendar
      if desired)
- [ ] Add an Outlook forwarding rule to TripIt/Gmail for confirmation mail
- [ ] Try the AI-suggestion prompt above once everything is wired up

# Project: UM Football Pregame Field Access App

**Last updated:** October 25, 2026  
**Team member:** Tuyara Chinbat  
**Project status:** Ongoing

## Purpose

This mobile app gives high-value University of Michigan football season ticket holders a simple, VIP gameday experience centered on **pregame field access**. It provides the digital ticket or tickets needed for stadium and field entry, then guides each guest to the field or their assigned seat.

## Problem Statement

High-value season ticket holders value exclusive experiences and time-saving service. Pregame field access lets them watch warmups and take photos with players and teams, but accessing that experience should be quick and clear on a busy gameday.

The app makes the ticket the main view and gives users a fast way to choose where they need to go next: the field before the game or their seat. It also supports an accessible route when needed.

## Target Audience

University of Michigan football season ticket holders who value a premium, efficient gameday experience and have access to the pregame field experience.

## Main Feature: Pregame Field Access

Pregame field access is the app’s primary feature. Before kickoff, eligible users can use their digital field-access ticket to enter the field, watch team warmups, and take photos with players and teams.

## Research-Informed Design Principles

The project uses the following research insights to guide the in-scope experience. These are design directions to validate with University of Michigan season ticket holders; neither study was conducted specifically at Michigan Stadium.

1. **Make the field experience—not ticket ownership—the value.**
   - Research on ultra-high-net-worth luxury customers finds that extraordinary, personal experiences can matter more than possessing a luxury good or service.
   - The app should therefore foreground the outcome—watching Michigan warmups and capturing meaningful photos—while making the ticket a fast, unobtrusive means of access.

2. **Protect time with a reliable, predictable flow.**
   - The luxury-experience research identifies time savings and realistic expectation management as core experience dimensions. Multiple inconsistent touchpoints diminish the experience.
   - Use one clear main view with the current ticket, destination, access eligibility, and next action. State what ticket is needed and where to go before the guest reaches an entrance.

3. **Support group experiences without adding unnecessary complexity.**
   - The luxury research connects saved time to quality time with close friends and family, while the college-football study identifies bonding with friends as an important fan motive.
   - Keep a ticket holder’s ticket(s) together in one view so a party can move through stadium, field, and seating entry with less coordination friction.

4. **Lead with team-centered excitement.**
   - The college-football study finds that excitement, drama, interest in the team, and sport knowledge are the strongest general fan motives. Highly identified fans place especially high importance on excitement, whereas interest in individual players is comparatively low.
   - Frame pregame access around the team warmup, atmosphere, and Michigan football experience. Player and team photos remain part of the field-access moment, but should not be the app’s only value proposition.

5. **Give users an immediately usable route choice.**
   - The luxury research emphasizes convenience and services delivered according to the customer’s changing circumstances.
   - The app should let a guest choose Field or Seat and select an accessible route from the same decision point, without requiring a separate setup flow.

## In-Scope Features

1. **Digital tickets**
   - Show the user’s ticket or tickets in the app.
   - Present the appropriate ticket for stadium entry, field entry, or seating-section entry.

2. **Navigation**
   - Let the user choose navigation to the pregame field entrance or to their assigned seat.
   - Show directions for the selected destination.
   - Offer an accessible-route option for users who need step-free or otherwise accommodated navigation.

3. **Single main view**
   - Keep the current ticket and the two main next actions—**Go to Field** and **Go to Seat**—easy to find and use quickly.

## User Flow

The user flow follows the provided reference image:

1. **Start**
2. **Scan or show a ticket to enter the stadium.**
3. **Choose a destination:** go to the field or go to a seat. The choice is based on the user’s gameday timing—early users can go to the field; users arriving later can go to their seat.
4. If the user chooses **Field**:
   - Select standard or accessible navigation to the field entrance.
   - Show the field-access ticket at the entrance.
   - Enter the field to watch warmups and take photos with players and teams.
5. If the user chooses **Seat**:
   - Select standard or accessible navigation to the seating section.
   - Show the seating ticket at the entrance.
   - Go to the assigned seat and watch the game.

## Concept 1: Time-Aware Gameday Ticket-to-Field Journey

This first concept makes the ticket the fastest path into the gameday experience. It is designed to reduce decisions at the stadium entrance and surface the pregame field opportunity at the right moment.

### 1. Two-hour ticket presentation

- When the app is opened within two hours before the scheduled game start, open directly to a full-screen ticket drawer.
- Put the current ticket first and allow the ticket holder to swipe left or right through any additional tickets they hold, such as a child’s ticket.
- Each ticket shows only the details needed for entry: matchup (for example, Michigan vs. Michigan State), game date, ticket-holder name, seat section/row/number, and a scannable QR code.
- A clear close control returns the user to Home. The ticket drawer remains available from the rest of the experience for fast re-entry.

### 2. Post-scan field-access prompt

- When the system confirms that the held tickets have been scanned, move directly to the map.
- If the user is early enough for the pregame field experience, show one focused prompt: **“You’re here early. The teams are about to warm up. Navigate to the field?”**
- If the user selects **Yes**, show the route to the field on the map and show step-by-step directions in the bottom drawer. Keep a persistent **Show field ticket** button at the bottom so the credential can be presented immediately to field-entry personnel.
- If the user selects **Not now**, dismiss the prompt without starting a route. The user can later choose the Field quick link from Home.

### 3. Home on game day

- Show two game-day quick links first: **Navigate to Field** and **Navigate to Seat**.
- Show the ticket carousel directly beneath the quick links, rather than repeating ticket details elsewhere on the page.
- Hide the gameday quick links on non-game days. This keeps the regular state calm and ensures that the time-sensitive actions appear only when useful.

### 4. Route behavior

- Both Field and Seat actions open the map with the selected route and the directions drawer.
- Let the user select an accessible route before route guidance begins. Preserve that choice for the current journey.
- The route drawer should contain only current navigation steps and the ticket-retrieval action; avoid duplicating matchup, seat, or promotional content already available in the ticket drawer.

### Visual Direction

- Use a dark, restrained interface to communicate exclusivity: Michigan Blue (`#00274C`) as the dominant surface, black or a deeper navy for layered backgrounds, white for primary text, and Michigan Maize (`#FFCB05`) only for high-priority actions, active states, and ticket status.
- Use the Michigan Blue/Maize and Michigan Blue/white pairings for readable, high-contrast text and controls. Maintain WCAG 2.1 AA contrast requirements.
- Use Atkinson Hyperlegible for critical ticket, route, and scanning information; IBM Plex is a suitable supporting typeface for less-critical UI text.
- Favor large touch targets, generous spacing, one primary action per state, and no decorative content that competes with the QR code, route, or field-access decision.

### Prototype Assumptions to Validate

- Ticket scans can be confirmed to the app for each held ticket.
- The app knows the scheduled game start time and can identify the two-hour pregame window.
- Field eligibility and the active field-entry window are available before the app offers the field-navigation prompt.

## Out of Scope

Any functionality beyond tickets, navigation to the field or seat, accessible routing, and the pregame field-access experience is out of scope for this project.

## Success Criteria

- Users can quickly locate and present the correct ticket for stadium, field, or seating entry.
- Eligible users can successfully reach the pregame field experience before kickoff.
- Users who need accommodations can choose an accessible route to the field or their seat.

## Research Sources

- Klaus, P. (2022). *What matters most to ultra-high-net-worth individuals? Exploring the UHNWI luxury customer experience (ULCX).* Journal of Product & Brand Management, 31(3), 368-376. The study identifies four ULCX dimensions: expectation management, personal relationships, convenience-driven time savings, and extraordinary personal experiences.
- Gargone, D. (2016). *A Study of the Fan Motives for Varying Levels of Team Identity and Team Loyalty of College Football Fans.* The Sport Journal. The study reports findings from 345 college-football fans and examines differences in motives by team identification and loyalty.

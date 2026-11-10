# WOT TRACK — World of Tanks Clan Monitoring Bot

**Overview**  
WOT TRACK is a Python bot that automatically monitors the members of a World of Tanks clan and sends a Discord notification whenever a new player joins. The bot periodically queries the official Wargaming API (through the `requests` library), compares the current member list with the known one, retrieves detailed information about new players, and posts a formatted message to a Discord webhook.

**Features**
- Automatic, periodic monitoring of the clan member list.
- New member detection by comparing with the previous state.
- Formatted Discord notifications including:
  - the player’s nickname,
  - the account ID,
  - total battles,
  - join date and time.
- Centralized configuration (Wargaming API key, Discord webhook URL, clan ID, region, check interval).
- Helper script to find a clan’s ID from its tag.
- Test script to verify Discord notifications work before running the bot.

**Technical stack**
- Python 3.7+
- `requests` for calls to the Wargaming API and the Discord webhook
- Wargaming API (`clans/info`, `account/info`)
- Discord webhooks for notifications

**What this project demonstrates**
- Consumption of a third-party API (Wargaming) with error and response handling.
- Change-detection logic based on comparing sets of identifiers.
- Sending structured messages (Discord embeds) built from enriched data.
- Externalized configuration and utility scripts to simplify setup.
- Continuous monitoring loop with clean shutdown via `Ctrl+C`.

**Scope**  
A deliberately simple, focused project: a single feature (new member detection) and a single output (Discord notification), with a step-by-step documented manual configuration.
# Private Cycling and Running Tracker

**Overview**  
SPEED LOG is a cross-platform mobile app (iOS/Android) built with React Native and Expo, designed for people who want to track their cycling or running routes without signing up, creating an account, or transferring personal data. It was built for a personal need: start a session, monitor speed in real time, then review the history and details of each trip. All data stays locally on the phone using SQLite.

**Key features**
- Real-time speed tracking during activity.
- Sleep mode: start a trip, turn off the screen, put the phone away, and review the data after the session.
- Full history of recorded trips.
- Colored route on an interactive map with a speed-based gradient.
- Essential metrics: date, time, duration, average speed, and maximum speed.
- Elevation gain: track climbs and descents along the route.
- No sign-up, no account, no data transfer: everything stays on the phone.

**Technical stack**
- React Native and Expo for cross-platform mobile development.
- NativeWind for styling.
- SQLite for local trip storage.
- Phone GPS features for route tracking.
- Tested on Android and on the iOS simulator.

**What this project demonstrates**
- Cross-platform mobile development with React Native and Expo.
- Design of a local-first, privacy-friendly app: no account, no cloud, no data transfer.
- Use of GPS and sleep-mode handling during activity.
- Local data storage and retrieval of trip data with SQLite.
- Map visualization with a speed-colored route and calculation of sports metrics.
- Delivery of a 1.0.0 release usable in everyday life on Android.

**Scope and limitations**
Personal project built for personal use. A 1.0.0 release exists on Android only, for personal use. The app also runs on iOS but has been tested in the simulator. It has no user account or cloud synchronization.
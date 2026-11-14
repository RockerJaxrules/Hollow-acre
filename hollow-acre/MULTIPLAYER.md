# Hollow Acre multiplayer

**Players don't need to be on the same Wi-Fi.** Anyone with internet can play with anyone else, on any device: Windows, Mac,
Linux, Android or the web build. There's no game server to run.

## Hosting (like Stardew Valley)

1. The host opens **Menu → Together → Host my farm** and gets a farm code, like `MNQJ50`.
2. Friends open **Menu → Together**, type the code and press **Join a farm**. The game restarts into the host's world and they
   arrive on the host's farm as farmhands.
3. Shared by everyone: the field and crops, cleared ground, money, the time of day, the day and the story.
   The day ends when the host goes to bed.
4. Each farmhand's own: backpack, tools, seeds, energy, health, look and friendships. These are saved on the farmhand's
   device, and the host's save also remembers them for next time.
5. The host's game saves the farm. **Go home** (or the host stopping) sends farmhands back to their own game.

The rest of the Together tab is the shared valley: everyone online sees each other, chats and waves.

## How it connects

- The game connects players directly to each other (WebRTC, through the bundled Trystero library, MIT).
- Free public relays (Nostr) introduce players to each other.
- STUN servers (Google, Cloudflare) find a route across the internet between different networks.
- Some networks block direct routes: many mobile carriers, and school or office Wi-Fi. For those, a TURN relay carries the
  game's traffic. The default is the free public Open Relay server.
- **Before launch:** the free relay is shared and rate-limited, so swap in your own TURN service (Cloudflare Calls TURN, or
  Metered) in `2d/src/net.js` (`NET_TURN`). For Steam, the same Together screen can switch to Steam's networking.

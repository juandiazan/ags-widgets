# MediaPlayer

Floating window anchored to the bottom-center of the screen, toggled from the bar. Displays the currently active media player with album art, a Cava visualizer, track info, progress bar, and playback controls.

## Layout

```
[ album art ] [ player name          focus ]
              [ title                      ]
              [ artist                     ]
              [ ════ cava visualizer ═════ ]
              [ ──────────────── 1:23/3:45 ]
              [ |◀◀    ▶▶|    ▶▶| ]
```

If no eligible player is found, a "Nothing playing" label is shown instead.

## Player selection

MPRIS players are polled every 500ms via `createPoll`. The `selectActivePlayer` function:
1. Filters out ignored players (`firefox`, `librewolf`).
2. Prefers any player with `PLAYING` status.
3. Falls back to the first eligible player.
4. Returns `null` if none exist.

The `With` component switches between `PlayerWidget` and `NothingPlaying` based on the current player value.

## Components

### AlbumArt
A plain `<box>` styled with an inline `css` computed that sets `background-image: url("file://...")` when a path is available. The art path is obtained by polling a shell script (`get-album-art.sh`) every 1 second via `createPoll`.

### PlayerHeader
Shows the player's `identity` (e.g. "Spotify", "Rhythmbox") and a focus button that runs a shell script to bring the player window to the foreground.

### CavaVisualizer
A raw `Gtk.DrawingArea` (not JSX) with a custom draw function. On each frame it reads `AstalCava.values` (an array of normalized bar heights 0–1), computes bar width from available space and gap size, and fills rectangles from the bottom up. Redraws are triggered by `notify::values` on the Cava instance.

### ProgressBar
Binds `player.position` and `player.length` to a slider and a time label (`m:ss / m:ss`). Scrubbing calls `player.set_position`.

### PlayerControls
Previous / play-pause / next buttons. Play-pause icon toggles between `󰏤` and `󰐊` based on `playbackStatus`.

## Key decisions

- Album art is polled via a shell script rather than read from MPRIS metadata directly, because cover art paths from MPRIS are often temporary and unreliable across players.
- Player selection is also polled (not purely reactive) because MPRIS player list changes don't always emit reliable signals across all players.
- `CavaVisualizer` is imperative (plain GTK object) rather than JSX because `Gtk.DrawingArea` requires a draw callback that runs in the GTK paint cycle, which doesn't map cleanly to JSX props.

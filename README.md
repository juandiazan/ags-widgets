# AGS Config

Personal desktop shell built with [AGS v3](https://aylur.github.io/ags/) and GTK4.

---

## Requirements

### Core

| Dependency | Purpose |
| --- | --- |
| `ags` (v3) | Shell runtime and CLI |
| `gnim` | Reactive state library (installed via npm) |
| `AstalMpris` | GObject introspection library for MPRIS media control |
| `Node.js` / `npm` | Build toolchain |

Install npm dependencies after cloning:

```sh
npm install
```

### Installation

```sh
paru -S aylurs-gtk-shell # ags
paru -S quarrel-git # for mpris astal lib
paru -S libastal-mpris-git # for media player
paru -S libastal-cava-git # for media player sound visualizer
paru -S libastal-wireplumber-git # for control panel
```

### Helper scripts

The widgets rely on scripts located at `~/dotfiles/scripts/`. These scripts have their own dependencies:

| Script | Dependencies |
| --- | --- |
| `get-album-art.sh` | `playerctl`, `curl` |
| `focus-player.sh` | `playerctl`, `jq`, `hyprctl` (Hyprland) |

### Font

The stylesheet uses **GoMono Nerd Font**. Install it from [nerdfonts.com](https://www.nerdfonts.com) or via your distro's package manager.

---

## Useful commands

### Start the service

It may be necessary to specify the installed GTK version with the `--gtk` flag when starting the service (also on Hyprland autostart).

```sh
ags run
```

**Toggle a window** (the window must already be running)

```sh
ags toggle <widget-name>
```

**Autostart with Hyprland** — add to `~/.config/hypr/hyprland.conf`:

```lua
hl.on("hyprland.start", function()
    hl.exec_cmd("ags run ~/.config/ags")
end)
```

**Bind a toggle to a key** in `hyprland.conf`:

```lua
hl.bind(mainMod .. " + M", hl.dsp.exec_cmd("ags toggle <widget-name>"))
```

---

## Widgets

### MediaPlayer

A floating overlay anchored to the bottom of the screen that shows the currently active media player.

**How it works:**

- Polls MPRIS every 500 ms via `AstalMpris` to find the active player, preferring one that is currently playing. Players matching `IGNORED_PLAYERS` are excluded.
- Album art is resolved every 1000 ms via `get-album-art.sh`, which returns a local file path.
- Displays track title, artist, a seek bar, and playback controls (previous / play-pause / next).
- The focus button (top-right) calls `focus-player.sh`, which finds the player's window on its Hyprland workspace and switches to it.
- The window starts **hidden**. Toggle it with `ags toggle media-player`.

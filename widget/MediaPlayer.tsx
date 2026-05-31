import { createBinding, createComputed, With, Accessor } from "gnim"
import { execAsync } from "ags/process"
import { Astal, Gtk } from "ags/gtk4"
import { createPoll } from "ags/time"
import app from "ags/gtk4/app"
import Mpris from "gi://AstalMpris?version=0.1"
import Pango from "gi://Pango"
import GLib from "gi://GLib"

const HOME_DIR = GLib.get_home_dir()
const ART_SIZE = 150
const PLAYER_WIDTH = 460
const ART_POLL_INTERVAL_MS = 1000
const PLAYER_POLL_INTERVAL = 500
const IGNORED_PLAYERS = ["firefox", "librewolf"]

function selectActivePlayer(mpris: Mpris.Mpris): Mpris.Player | null {
  const eligible = mpris.players.filter(
    (p) =>
      !IGNORED_PLAYERS.some((name) => p.busName?.toLowerCase().includes(name)),
  )
  return (
    eligible.find((p) => p.playbackStatus === Mpris.PlaybackStatus.PLAYING) ??
    eligible[0] ??
    null
  )
}

function AlbumArt({ artPath }: { artPath: Accessor<string> }) {
  const css = createComputed(() => {
    const path = artPath()
    const base = `min-width: ${ART_SIZE}px; min-height: ${ART_SIZE}px; border-radius: 8px;`
    return path
      ? `${base} background-image: url("file://${path}"); background-size: cover; background-position: center;`
      : base
  })

  return (
    <box
      class="art"
      widthRequest={ART_SIZE}
      heightRequest={ART_SIZE}
      hexpand={false}
      css={css}
    />
  )
}

function PlayerHeader({ player }: { player: Mpris.Player }) {
  const identity = createBinding(player, "identity")

  return (
    <box
      class="player-header"
      orientation={Gtk.Orientation.HORIZONTAL}
      hexpand={true}
    >
      <label
        class="player-name"
        label={identity}
        halign={Gtk.Align.START}
        hexpand={true}
      />
      <button
        class="focus-btn"
        label=""
        onClicked={() =>
          execAsync(`${HOME_DIR}/dotfiles/scripts/focus-player.sh`)
        }
      />
    </box>
  )
}

function ProgressBar({ player }: { player: Mpris.Player }) {
  const position = createBinding(player, "position")
  const length = createBinding(player, "length")
  const trackDuration = createComputed(() => Math.max(length(), 1))

  return (
    <slider
      class="progress"
      hexpand
      min={0}
      max={trackDuration}
      value={position}
      onNotifyValue={(self) => player.set_position(self.value)}
    />
  )
}

function PlayerControls({ player }: { player: Mpris.Player }) {
  const playbackStatus = createBinding(player, "playbackStatus")
  const isPlaying = createComputed(
    () => playbackStatus() === Mpris.PlaybackStatus.PLAYING,
  )

  return (
    <box
      class="controls"
      orientation={Gtk.Orientation.HORIZONTAL}
      hexpand={true}
      homogeneous={true}
    >
      <button class="ctrl-btn" onClicked={() => player.previous()}>
        󰒮
      </button>
      <button class="ctrl-btn play-pause" onClicked={() => player.play_pause()}>
        <label label={isPlaying((playing) => (playing ? "󰏤" : "󰐊"))} />
      </button>
      <button class="ctrl-btn" onClicked={() => player.next()}>
        󰒭
      </button>
    </box>
  )
}

function PlayerWidget({
  player,
  artPath,
}: {
  player: Mpris.Player
  artPath: Accessor<string>
}) {
  const title = createBinding(player, "title")
  const artist = createBinding(player, "artist")

  return (
    <box
      class="player"
      orientation={Gtk.Orientation.HORIZONTAL}
      widthRequest={PLAYER_WIDTH}
    >
      <box class="art-box">
        <AlbumArt artPath={artPath} />
      </box>
      <box
        class="content"
        orientation={Gtk.Orientation.VERTICAL}
        spacing={6}
        hexpand={true}
        valign={Gtk.Align.CENTER}
      >
        <PlayerHeader player={player} />
        <label
          class="title"
          label={title}
          halign={Gtk.Align.START}
          ellipsize={Pango.EllipsizeMode.END}
          maxWidthChars={26}
        />
        <label
          class="artist"
          label={artist}
          halign={Gtk.Align.START}
          ellipsize={Pango.EllipsizeMode.END}
          maxWidthChars={26}
        />
        <ProgressBar player={player} />
        <PlayerControls player={player} />
      </box>
    </box>
  )
}

function NothingPlaying() {
  return (
    <box
      class="player"
      orientation={Gtk.Orientation.HORIZONTAL}
      widthRequest={PLAYER_WIDTH}
    >
      <label
        class="nothing-playing"
        label="Nothing playing"
        hexpand={true}
        halign={Gtk.Align.CENTER}
      />
    </box>
  )
}

export default function MediaPlayer() {
  const mpris = Mpris.Mpris.get_default()
  const artPath = createPoll(
    "",
    ART_POLL_INTERVAL_MS,
    `${HOME_DIR}/dotfiles/scripts/get-album-art.sh`,
  )

  const getActivePlayer = () => selectActivePlayer(mpris)
  const player = createPoll<Mpris.Player | null>(
    getActivePlayer(),
    PLAYER_POLL_INTERVAL,
    getActivePlayer,
  )

  return (
    <window
      name="media-player"
      application={app}
      anchor={Astal.WindowAnchor.BOTTOM}
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.NORMAL}
      marginBottom={10}
      visible={false}
    >
      <With value={player}>
        {(p) =>
          p ? <PlayerWidget player={p} artPath={artPath} /> : <NothingPlaying />
        }
      </With>
    </window>
  )
}

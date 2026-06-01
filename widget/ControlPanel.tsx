import { createBinding, createComputed } from "gnim"
import { execAsync } from "ags/process"
import { Astal, Gtk } from "ags/gtk4"
import { createPoll } from "ags/time"
import app from "ags/gtk4/app"
import AstalWp from "gi://AstalWp?version=0.1"

const PANEL_WIDTH = 260
const wp = AstalWp.get_default()!

function WifiButton() {
  const wifi = createPoll(false, 1000, async (prev: boolean) => {
    try {
      return (await execAsync("nmcli radio wifi")).trim() === "enabled"
    } catch {
      return prev
    }
  })

  return (
    <button
      class={wifi((v) => `toggle-btn${v ? " active" : ""}`)}
      onClicked={() =>
        execAsync(`nmcli radio wifi ${wifi.peek() ? "off" : "on"}`)
      }
    >
      <box
        orientation={Gtk.Orientation.VERTICAL}
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
        spacing={2}
      >
        <label class="toggle-icon" label={wifi((v) => (v ? "󰤨" : "󰤭"))} />
        <label class="toggle-label" label="WiFi" />
      </box>
    </button>
  )
}

function BluetoothButton() {
  const bt = createPoll(false, 1000, async (prev: boolean) => {
    try {
      const out = await execAsync("bluetoothctl show")
      return out.includes("Powered: yes")
    } catch {
      return prev
    }
  })

  return (
    <button
      class={bt((v) => `toggle-btn${v ? " active" : ""}`)}
      onClicked={() =>
        execAsync(`bluetoothctl power ${bt.peek() ? "off" : "on"}`)
      }
    >
      <box
        orientation={Gtk.Orientation.VERTICAL}
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
        spacing={2}
      >
        <label class="toggle-icon" label={bt((v) => (v ? "󰂯" : "󰂲"))} />
        <label class="toggle-label" label="Bluetooth" />
      </box>
    </button>
  )
}

function OutputSlider() {
  const speaker = createBinding(wp, "defaultSpeaker")
  const volume = createComputed(() => {
    const ep = speaker()
    return ep ? createBinding(ep, "volume")() : 0
  })
  const description = createComputed(() => {
    const ep = speaker()
    return ep ? (createBinding(ep, "description")() ?? "Output") : "Output"
  })

  return (
    <box class="slider-row" orientation={Gtk.Orientation.VERTICAL} spacing={4}>
      <box orientation={Gtk.Orientation.HORIZONTAL}>
        <label class="slider-icon" label="󰕾" />
        <label
          class="slider-label"
          label={description}
          hexpand
          halign={Gtk.Align.START}
        />
        <label
          class="slider-value"
          label={volume((v) => `${Math.round(v * 100)}%`)}
        />
      </box>
      <slider
        class="cp-slider"
        hexpand
        min={0}
        max={1}
        value={volume}
        onNotifyValue={(self) => speaker.peek()?.set_volume(self.value)}
      />
    </box>
  )
}

function MicSlider() {
  const microphone = createBinding(wp, "defaultMicrophone")
  const volume = createComputed(() => {
    const ep = microphone()
    return ep ? createBinding(ep, "volume")() : 0
  })
  const description = createComputed(() => {
    const ep = microphone()
    return ep
      ? (createBinding(ep, "description")() ?? "Microphone")
      : "Microphone"
  })

  return (
    <box class="slider-row" orientation={Gtk.Orientation.VERTICAL} spacing={4}>
      <box orientation={Gtk.Orientation.HORIZONTAL}>
        <label class="slider-icon" label="󰍬" />
        <label
          class="slider-label"
          label={description}
          hexpand
          halign={Gtk.Align.START}
        />
        <label
          class="slider-value"
          label={volume((v) => `${Math.round(v * 100)}%`)}
        />
      </box>
      <slider
        class="cp-slider"
        hexpand
        min={0}
        max={1}
        value={volume}
        onNotifyValue={(self) => microphone.peek()?.set_volume(self.value)}
      />
    </box>
  )
}

export default function ControlPanel() {
  return (
    <window
      name="control-panel"
      application={app}
      anchor={Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.RIGHT}
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.NORMAL}
      marginBottom={10}
      marginRight={10}
      visible={false}
    >
      <box
        class="control-panel"
        orientation={Gtk.Orientation.VERTICAL}
        widthRequest={PANEL_WIDTH}
        spacing={10}
      >
        <box
          orientation={Gtk.Orientation.HORIZONTAL}
          homogeneous={true}
          spacing={8}
        >
          <WifiButton />
          <BluetoothButton />
        </box>
        <OutputSlider />
        <MicSlider />
      </box>
    </window>
  )
}

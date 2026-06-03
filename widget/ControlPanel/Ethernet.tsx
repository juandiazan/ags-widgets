import { Gtk } from "ags/gtk4"
import { createBinding, createComputed } from "gnim"
import AstalNetwork from "gi://AstalNetwork?version=0.1"

const network = AstalNetwork.get_default()!

export function EthernetButton() {
  const wired = network.wired

  if (!wired) {
    return (
      <button class="toggle-btn">
        <box
          orientation={Gtk.Orientation.VERTICAL}
          valign={Gtk.Align.CENTER}
          halign={Gtk.Align.CENTER}
          spacing={2}
        >
          <label class="toggle-icon" label="󰈂" />
          <label class="toggle-label" label="Ethernet" />
        </box>
      </button>
    )
  }

  const internet = createBinding(wired, "internet")
  const connected = createComputed(
    () => internet() === AstalNetwork.Internet.CONNECTED,
  )

  return (
    <button class={connected.as((v) => `toggle-btn${v ? " active" : ""}`)}>
      <box
        orientation={Gtk.Orientation.VERTICAL}
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
        spacing={2}
      >
        <label
          class="toggle-icon"
          label={connected.as((v) => (v ? "󰈀" : "󰈂"))}
        />
        <label class="toggle-label" label="Ethernet" />
      </box>
    </button>
  )
}

import { Gtk } from "ags/gtk4"
import { createBinding } from "gnim"
import AstalBluetooth from "gi://AstalBluetooth?version=0.1"

export function BluetoothButton() {
  const bluetooth = AstalBluetooth.get_default()!
  const isPowered = createBinding(bluetooth, "isPowered")

  return (
    <button
      class={isPowered((v) => `toggle-btn${v ? " active" : ""}`)}
      onClicked={() => bluetooth.toggle()}
    >
      <box
        orientation={Gtk.Orientation.VERTICAL}
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
        spacing={2}
      >
        <label class="toggle-icon" label={isPowered((v) => (v ? "󰂯" : "󰂲"))} />
        <label class="toggle-label" label="Bluetooth" />
      </box>
    </button>
  )
}

import { Gtk } from "ags/gtk4"
import { createBinding, createComputed, createState, For } from "gnim"
import AstalNetwork from "gi://AstalNetwork?version=0.1"
import Gio from "gi://Gio"

const network = AstalNetwork.get_default()!

function signalIcon(strength: number): string {
  if (strength > 75) return "󰤨"
  if (strength > 50) return "󰤥"
  if (strength > 25) return "󰤢"
  return "󰤟"
}

export function WifiButton({
  showPicker,
  onTogglePicker,
  onClosePicker,
}: {
  showPicker: () => boolean
  onTogglePicker: () => void
  onClosePicker: () => void
}) {
  if (!network.wifi) {
    return (
      <button class="toggle-btn">
        <box
          orientation={Gtk.Orientation.VERTICAL}
          valign={Gtk.Align.CENTER}
          halign={Gtk.Align.CENTER}
          spacing={2}
        >
          <label class="toggle-icon" label="󰤮" />
          <label class="toggle-label" label="Wi-Fi" />
        </box>
      </button>
    )
  }

  const enabled = createBinding(network.wifi, "enabled")
  const ssid = createBinding(network.wifi, "ssid")
  const internet = createBinding(network.wifi, "internet")
  const connected = createComputed(
    () => internet() === AstalNetwork.Internet.CONNECTED,
  )
  const icon = createComputed(() => {
    if (!enabled()) return "󰤮"
    return connected() ? "󰤨" : "󰤯"
  })
  const label = createComputed(() =>
    enabled() && connected() && ssid() ? ssid() : "Wi-Fi",
  )
  const expandIcon = createComputed(() => (showPicker() ? "󰅃" : "󰅀"))

  return (
    <box class="wifi-split-btn" orientation={Gtk.Orientation.HORIZONTAL}>
      <button
        class={enabled.as((v) => `wifi-power-btn${v ? " active" : ""}`)}
        hexpand
        onClicked={() => {
          if (network.wifi.enabled) onClosePicker()
          network.wifi.set_enabled(!network.wifi.enabled)
        }}
      >
        <box
          orientation={Gtk.Orientation.VERTICAL}
          valign={Gtk.Align.CENTER}
          halign={Gtk.Align.CENTER}
          spacing={2}
        >
          <label class="toggle-icon" label={icon} />
          <label class="toggle-label" label={label} />
        </box>
      </button>
      <button
        class="wifi-expand-btn"
        valign={Gtk.Align.CENTER}
        onClicked={() => {
          if (!network.wifi.enabled) network.wifi.set_enabled(true)
          onTogglePicker()
        }}
      >
        <label class="wifi-expand-icon" label={expandIcon} />
      </button>
    </box>
  )
}

export function WifiPicker() {
  if (!network.wifi) return <box />

  const ssid = createBinding(network.wifi, "ssid")
  const internet = createBinding(network.wifi, "internet")
  const accessPoints = createBinding(network.wifi, "accessPoints")
  const scanning = createBinding(network.wifi, "scanning")
  const [expandedBssid, setExpandedBssid] = createState<string | null>(null)

  const isOnline = createComputed(
    () => internet() === AstalNetwork.Internet.CONNECTED,
  )

  const list = createComputed(() =>
    (accessPoints() ?? [])
      .filter((ap: AstalNetwork.AccessPoint) => !!ap.ssid)
      .sort(
        (a: AstalNetwork.AccessPoint, b: AstalNetwork.AccessPoint) =>
          b.strength - a.strength,
      )
      .sort(
        (a: AstalNetwork.AccessPoint, b: AstalNetwork.AccessPoint) =>
          Number(ssid() === b.ssid) - Number(ssid() === a.ssid),
      ),
  )

  return (
    <box class="wifi-picker" orientation={Gtk.Orientation.VERTICAL} spacing={6}>
      <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
        <label
          class="wifi-picker-title"
          label="Wi-Fi"
          hexpand
          halign={Gtk.Align.START}
        />
        <button
          class="wifi-scan-btn"
          onClicked={() => network.wifi.scan()}
          tooltipText="Scan"
        >
          <label
            class={scanning.as(
              (v: boolean) => `wifi-scan-icon${v ? " active" : ""}`,
            )}
            label="󰑐"
          />
        </button>
      </box>
      <scrolledwindow
        heightRequest={160}
        hscrollbarPolicy={Gtk.PolicyType.NEVER}
      >
        <box orientation={Gtk.Orientation.VERTICAL} spacing={2}>
          <For each={list}>
            {(ap: AstalNetwork.AccessPoint) => {
              const isConnected = createComputed(
                () => isOnline() && ssid() === ap.ssid,
              )
              const isExpanded = createComputed(
                () => expandedBssid() === ap.bssid,
              )
              const [password, setPassword] = createState("")

              const doConnect = () => {
                const args = ["nmcli", "dev", "wifi", "connect", ap.bssid]
                if (password()) args.push("password", password())
                Gio.Subprocess.new(args, Gio.SubprocessFlags.NONE)
                setExpandedBssid(null)
                setPassword("")
              }

              return (
                <box orientation={Gtk.Orientation.VERTICAL} spacing={2}>
                  <button
                    class={isConnected.as(
                      (v: boolean) => `wifi-ap-btn${v ? " connected" : ""}`,
                    )}
                    onClicked={() => {
                      if (
                        network.wifi.internet ===
                          AstalNetwork.Internet.CONNECTED &&
                        network.wifi.ssid === ap.ssid
                      ) {
                        Gio.Subprocess.new(
                          ["nmcli", "device", "disconnect", "wlan0"],
                          Gio.SubprocessFlags.NONE,
                        )
                      } else {
                        setExpandedBssid(
                          expandedBssid() === ap.bssid ? null : ap.bssid,
                        )
                      }
                    }}
                  >
                    <box spacing={6}>
                      <label
                        class="wifi-ap-icon"
                        label={signalIcon(ap.strength)}
                      />
                      <label
                        class="wifi-ap-ssid"
                        label={ap.ssid}
                        hexpand
                        halign={Gtk.Align.START}
                      />
                      <label
                        class="wifi-ap-check"
                        label="󰄬"
                        visible={isConnected}
                      />
                    </box>
                  </button>
                  <revealer
                    revealChild={isExpanded}
                    transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
                    transitionDuration={150}
                  >
                    <box
                      class="wifi-password-row"
                      orientation={Gtk.Orientation.HORIZONTAL}
                      spacing={4}
                    >
                      <entry
                        class="wifi-password-entry"
                        placeholderText="Password (blank if saved)"
                        visibility={false}
                        hexpand
                        onNotifyText={(self: Gtk.Entry) =>
                          setPassword(self.text)
                        }
                        onActivate={doConnect}
                      />
                      <button class="wifi-connect-btn" onClicked={doConnect}>
                        <label label="Connect" />
                      </button>
                    </box>
                  </revealer>
                </box>
              )
            }}
          </For>
        </box>
      </scrolledwindow>
    </box>
  )
}

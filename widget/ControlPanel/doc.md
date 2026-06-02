# ControlPanel

Floating window anchored to the bottom-right corner, toggled from the bar. Contains network toggle buttons, a collapsible WiFi picker, and audio sliders.

## Layout

```
[ Ethernet ] [ WiFi | ▼ ] [ Bluetooth ]
─────────────── wifi picker ───────────────  ← revealer (SLIDE_DOWN)
[ Output slider                        ]
[ Mic slider                           ]
```

## Components

### EthernetButton
Reads `network.wired.internet` and shows a connected/disconnected icon. No interaction — ethernet is not togglable.

### WifiButton
Split into two clickable halves:
- **Left (power):** toggles `network.wifi.enabled`. When turning off, explicitly calls `onClosePicker()` to collapse the picker before the state change propagates.
- **Right (arrow):** toggles the picker. If wifi is off, turns it on first then opens the picker. Icon switches between `󰅀` (collapsed) and `󰅃` (expanded) based on `showPicker` state.

The label shows the connected SSID when `enabled && internet === CONNECTED && ssid`, otherwise "Wi-Fi". Both `enabled` and `internet` are checked because `ssid` lingers after disconnect while `internet` clears immediately.

### BluetoothButton
Reads and toggles `AstalBluetooth.isPowered`.

### WifiPicker (revealer)
Controlled by `showPicker` state in `ControlPanel`. Uses `Gtk.RevealerTransitionType.SLIDE_DOWN`.

Contains:
- **Header:** title label + scan button (triggers `network.wifi.scan()`, icon turns teal while `scanning` is true).
- **AP list:** scrollable, 160px tall. Access points are filtered (non-null SSID), sorted by signal strength, with the connected one pinned to top.

Each AP row has:
- A main button: shows signal icon + SSID + checkmark if connected. Clicking a connected AP disconnects (`nmcli device disconnect wlan0`); clicking an unconnected one toggles its password revealer. Connected state is `isOnline() && ssid() === ap.ssid` — both checks needed since `ssid` doesn't clear on disconnect.
- A nested revealer (SLIDE_DOWN): contains a password `<entry>` and a Connect button. Password is optional — leave blank to use NM saved credentials. Submits via `nmcli dev wifi connect <bssid> [password <pass>]`.

Only one AP row can be expanded at a time, tracked by `expandedBssid` state.

### OutputSlider / MicSlider
Bind to `AstalWireplumber.defaultSpeaker` / `defaultMicrophone` via a nested computed that re-binds when the default device changes. Volume shown as percentage, slider writes back via `set_volume`.

## State

| State | Type | Lives in |
|---|---|---|
| `showPicker` | `boolean` | `ControlPanel` |
| `expandedBssid` | `string \| null` | `WifiPicker` |
| `password` | `string` | per AP item (inside `For`) |

## Key decisions

- `notify::enabled` signal / `createEffect` were avoided for closing the picker on wifi disable — both caused timing races during NM's enable sequence. Instead, `onClosePicker` is called explicitly from the power button before toggling.
- `Astal.Keymode.ON_DEMAND` is required on the window for the password `<entry>` to receive keyboard input.

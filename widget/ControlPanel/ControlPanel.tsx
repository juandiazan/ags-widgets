import { createBinding, createComputed, createState, For } from "gnim"
import { Astal, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app"
import AstalWp from "gi://AstalWp?version=0.1"
import AstalNetwork from "gi://AstalNetwork?version=0.1"

import { EthernetButton } from "./Ethernet"
import { WifiButton, WifiPicker } from "./WiFi"
import { BluetoothButton } from "./Bluetooth"

const PANEL_WIDTH = 300
const PANEL_HEIGHT = 500
const wp = AstalWp.get_default()!

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
    const [showPicker, setShowPicker] = createState(false)

    return (
        <window
            name="control-panel"
            application={app}
            anchor={Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.RIGHT}
            layer={Astal.Layer.OVERLAY}
            exclusivity={Astal.Exclusivity.NORMAL}
            keymode={Astal.Keymode.ON_DEMAND}
            marginBottom={10}
            marginRight={10}
            visible={false}
        >
            <box
                class="control-panel"
                orientation={Gtk.Orientation.VERTICAL}
                widthRequest={PANEL_WIDTH}
                heightRequest={PANEL_HEIGHT}
                spacing={10}
                onMap={(self) => self.add_css_class("animate-in")}
                onUnmap={(self) => self.remove_css_class("animate-in")}
            >
                <box
                    orientation={Gtk.Orientation.HORIZONTAL}
                    homogeneous={true}
                    spacing={8}
                >
                    <EthernetButton />
                    <WifiButton
                        showPicker={showPicker}
                        onTogglePicker={() => setShowPicker(!showPicker())}
                        onClosePicker={() => setShowPicker(false)}
                    />
                    <BluetoothButton />
                </box>
                <revealer
                    class="revealer"
                    revealChild={showPicker}
                    transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
                    transitionDuration={200}
                >
                    <WifiPicker />
                </revealer>
                <OutputSlider />
                <MicSlider />
            </box>
        </window>
    )
}

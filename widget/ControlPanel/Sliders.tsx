import { createBinding, createComputed } from "gnim"
import { Gtk } from "ags/gtk4"
import AstalWp from "gi://AstalWp?version=0.1"

const wp = AstalWp.get_default()!

type EndpointKey = "defaultSpeaker" | "defaultMicrophone"

export function AudioSlider({
    icon,
    endpointKey,
    fallbackLabel,
}: {
    icon: string
    endpointKey: EndpointKey
    fallbackLabel: string
}) {
    const endpoint = createBinding(wp, endpointKey)
    const volume = createComputed(() => {
        const ep = endpoint()
        return ep ? createBinding(ep, "volume")() : 0
    })
    const description = createComputed(() => {
        const ep = endpoint()
        return ep ? (createBinding(ep, "description")() ?? fallbackLabel) : fallbackLabel
    })

    return (
        <box class="slider-row" orientation={Gtk.Orientation.VERTICAL} spacing={4}>
            <box orientation={Gtk.Orientation.HORIZONTAL}>
                <label class="slider-icon" label={icon} />
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
                onNotifyValue={(self) => endpoint.peek()?.set_volume(self.value)}
            />
        </box>
    )
}

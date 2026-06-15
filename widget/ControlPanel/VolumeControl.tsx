import { createBinding, createComputed, Accessor } from "gnim"
import { Gtk } from "ags/gtk4"
import AstalWp from "gi://AstalWp?version=0.1"

const wp = AstalWp.get_default()!

type EndpointKey = "defaultSpeaker" | "defaultMicrophone"

function SliderLabel({
  icon,
  description,
  volume,
}: {
  icon: Accessor<string>
  description: Accessor<string>
  volume: Accessor<number>
}) {
  return (
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
  )
}

function MuteButton({
  mute,
  mutedIcon,
  unmutedIcon,
  onToggle,
}: {
  mute: Accessor<boolean>
  mutedIcon: string
  unmutedIcon: string
  onToggle: () => void
}) {
  return (
    <button
      class={mute((m) => `volume-control-mute${m ? " muted" : ""}`)}
      valign={Gtk.Align.CENTER}
      onClicked={onToggle}
    >
      <label label={mute((m) => (m ? mutedIcon : unmutedIcon))} />
    </button>
  )
}

// Picks the header glyph for an output: headphones when the device form
// factor reports one, falling back to a name match for analog jacks (Pro
// Audio profile) that expose no form factor. Otherwise the default icon.
function getHeaderIcon({
  icon,
  headphonesIcon,
  headphonesMatch,
  formFactor,
  description,
}: {
  icon: string
  headphonesIcon?: string
  headphonesMatch?: string
  formFactor: string | null
  description: string
}): string {
  if (!headphonesIcon) return icon
  if (formFactor === "headphone" || formFactor === "headset")
    return headphonesIcon
  if (formFactor) return icon
  return headphonesMatch && description.includes(headphonesMatch)
    ? headphonesIcon
    : icon
}

export function VolumeControl({
  icon,
  headphonesIcon,
  headphonesMatch,
  mutedIcon,
  unmutedIcon,
  endpointKey,
  fallbackLabel,
}: {
  icon: string
  headphonesIcon?: string
  headphonesMatch?: string
  mutedIcon: string
  unmutedIcon: string
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
    return ep
      ? (createBinding(ep, "description")() ?? fallbackLabel)
      : fallbackLabel
  })
  const mute = createComputed(() => {
    const ep = endpoint()
    return ep ? createBinding(ep, "mute")() : false
  })
  const effectiveVolume = createComputed(() => (mute() ? 0 : volume()))
  const headerIcon = createComputed(() => {
    const ep = endpoint()
    const device = ep ? createBinding(ep, "device")() : null
    const formFactor = device ? createBinding(device, "formFactor")() : null
    return getHeaderIcon({
      icon,
      headphonesIcon,
      headphonesMatch,
      formFactor,
      description: description(),
    })
  })

  return (
    <box
      class="volume-control"
      orientation={Gtk.Orientation.HORIZONTAL}
      spacing={8}
    >
      <MuteButton
        mute={mute}
        mutedIcon={mutedIcon}
        unmutedIcon={unmutedIcon}
        onToggle={() => endpoint.peek()?.set_mute(!mute.peek())}
      />
      <box
        class="volume-control-body"
        orientation={Gtk.Orientation.VERTICAL}
        spacing={4}
        hexpand
      >
        <SliderLabel
          icon={headerIcon}
          description={description}
          volume={effectiveVolume}
        />
        <slider
          class="cp-slider"
          hexpand
          min={0}
          max={1}
          value={effectiveVolume}
          onNotifyValue={(self) => {
            const ep = endpoint.peek()
            if (!ep) return
            ep.set_volume(self.value)
            if (self.value > 0) ep.set_mute(false)
          }}
        />
      </box>
    </box>
  )
}

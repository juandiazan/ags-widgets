import { createState } from "gnim"
import { Astal, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app"

import { EthernetButton } from "./Ethernet"
import { WifiButton, WifiPicker } from "./WiFi"
import { BluetoothButton } from "./Bluetooth"
import { VolumeControl } from "./VolumeControl"
import { makeCloseAnimation } from "../animations"

const PANEL_WIDTH = 300
const PANEL_HEIGHT = 500

export default function ControlPanel() {
  const [showPicker, setShowPicker] = createState(false)
  const { setRef, onNotifyVisible } = makeCloseAnimation()

  return (
    <window
      name="control-panel"
      namespace="ags-control-panel"
      application={app}
      anchor={Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.RIGHT}
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.NORMAL}
      keymode={Astal.Keymode.ON_DEMAND}
      marginBottom={10}
      marginRight={10}
      visible={false}
      onNotifyVisible={onNotifyVisible}
    >
      <box
        class="control-panel"
        orientation={Gtk.Orientation.VERTICAL}
        widthRequest={PANEL_WIDTH}
        heightRequest={PANEL_HEIGHT}
        spacing={10}
        onMap={(self) => {
          setRef(self)
          self.add_css_class("animate-in")
        }}
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
        <VolumeControl
          icon="󰕾"
          headphonesIcon="󰋋"
          headphonesMatch="Auriculares"
          mutedIcon="󰖁"
          unmutedIcon="󰕾"
          endpointKey="defaultSpeaker"
          fallbackLabel="Output"
        />
        <VolumeControl
          icon="󰍬"
          mutedIcon="󰍭"
          unmutedIcon="󰍬"
          endpointKey="defaultMicrophone"
          fallbackLabel="Microphone"
        />
      </box>
    </window>
  )
}

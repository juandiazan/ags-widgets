import GLib from "gi://GLib"
import { Gtk } from "ags/gtk4"

const CLOSE_ANIMATION_TIME_MS = 200;

export const animateIn = {
    onMap: (self: Gtk.Widget) => self.add_css_class("animate-in"),
    onUnmap: (self: Gtk.Widget) => self.remove_css_class("animate-in"),
}

export function makeCloseAnimation() {
    let closingRef: Gtk.Widget | null = null
    let isAnimatingOut = false

    return {
        setRef: (self: Gtk.Widget) => {
            closingRef = self
        },
        onNotifyVisible: (self: any) => {
            if (!self.visible && !isAnimatingOut) {
                isAnimatingOut = true
                self.visible = true
                closingRef?.add_css_class("animate-out")
                GLib.timeout_add(GLib.PRIORITY_DEFAULT, CLOSE_ANIMATION_TIME_MS, () => {
                    closingRef?.remove_css_class("animate-out")
                    self.visible = false
                    isAnimatingOut = false
                    return GLib.SOURCE_REMOVE
                })
            }
        },
    }
}

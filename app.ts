import app from "ags/gtk4/app"
import style from "./style.css"
import controlStyle from "./widget/control-panel.css"
import MediaPlayer from "./widget/MediaPlayer"
import ControlPanel from "./widget/ControlPanel"

app.start({
    css: `${style}\n${controlStyle}`,
    main() {
        MediaPlayer()
        ControlPanel()
    },
})

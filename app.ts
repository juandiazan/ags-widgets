import app from "ags/gtk4/app"
import style from "./style.css"
import controlStyle from "./widget/ControlPanel/control-panel.css"
import mediaStyle from "./widget/MediaPlayer/MediaPlayer.css"
import MediaPlayer from "./widget/MediaPlayer/MediaPlayer"
import ControlPanel from "./widget/ControlPanel/ControlPanel"

app.start({
    css: `${style}\n${controlStyle}\n${mediaStyle}`,
    main() {
        MediaPlayer()
        ControlPanel()
    },
})

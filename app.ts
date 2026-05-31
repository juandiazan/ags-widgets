import app from "ags/gtk4/app"
import style from "./style.css"
import MediaPlayer from "./widget/MediaPlayer"

app.start({
    css: style,
    main() {
        MediaPlayer()
    },
})

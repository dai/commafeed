import { Badge, Tooltip } from "@mantine/core"
import { tss } from "tss"

const useStyles = tss.create(() => ({
    badge: {
        width: "3.2rem",
        // for some reason, mantine Badge has "cursor: 'default'"
        cursor: "pointer",
    },
}))

export function UnreadCount(props: { unreadCount: number }) {
    const { classes } = useStyles()

    if (props.unreadCount <= 0) return null

    const count = props.unreadCount >= 10000 ? "10k+" : props.unreadCount
    return (
        <Tooltip label={props.unreadCount} disabled={props.unreadCount === count}>
            <Badge className={classes.badge}>{count}</Badge>
        </Tooltip>
    )
}

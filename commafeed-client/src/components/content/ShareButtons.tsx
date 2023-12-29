import { ActionIcon, Box, type MantineTheme, SimpleGrid, useMantineTheme } from "@mantine/core"
import { Constants } from "app/constants"
import { useAppSelector } from "app/store"
import { type SharingSettings } from "app/types"
import { type IconType } from "react-icons"
import { tss } from "tss"

type Color = `#${string}`

const useStyles = tss
    .withParams<{
        theme: MantineTheme
        color: Color
    }>()
    .create(({ theme, color }) => ({
        socialIcon: {
            color,
            backgroundColor: theme.colorScheme === "dark" ? theme.colors.gray[2] : "white",
            borderRadius: "50%",
        },
    }))

function ShareButton({ url, icon, color }: { url: string; icon: IconType; color: Color }) {
    const theme = useMantineTheme()
    const { classes } = useStyles({
        theme,
        color,
    })

    const onClick = (e: React.MouseEvent) => {
        e.preventDefault()
        window.open(url, "", "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=800,height=600")
    }

    return (
        <ActionIcon>
            <a href={url} target="_blank" rel="noreferrer" onClick={onClick}>
                <Box p={6} className={classes.socialIcon}>
                    {icon({ size: 18 })}
                </Box>
            </a>
        </ActionIcon>
    )
}

export function ShareButtons(props: { url: string; description: string }) {
    const sharingSettings = useAppSelector(state => state.user.settings?.sharingSettings)
    const url = encodeURIComponent(props.url)
    const desc = encodeURIComponent(props.description)

    return (
        <SimpleGrid cols={4}>
            {(Object.keys(Constants.sharing) as Array<keyof SharingSettings>)
                .filter(site => sharingSettings && sharingSettings[site])
                .map(site => (
                    <ShareButton
                        key={site}
                        icon={Constants.sharing[site].icon}
                        color={Constants.sharing[site].color}
                        url={Constants.sharing[site].url(url, desc)}
                    />
                ))}
        </SimpleGrid>
    )
}

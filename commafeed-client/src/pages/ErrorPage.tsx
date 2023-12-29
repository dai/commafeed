import { Trans } from "@lingui/macro"
import { Box, Button, Container, Group, type MantineTheme, Text, Title, useMantineTheme } from "@mantine/core"
import { TbRefresh } from "react-icons/tb"
import { tss } from "tss"
import { PageTitle } from "./PageTitle"

const useStyles = tss
    .withParams<{
        theme: MantineTheme
    }>()
    .create(({ theme }) => ({
        root: {
            paddingTop: 80,
        },

        label: {
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 120,
            lineHeight: 1,
            marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
            color: theme.colors[theme.primaryColor][3],
        },

        title: {
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 32,
        },

        description: {
            maxWidth: 540,
            margin: "auto",
            marginTop: theme.spacing.xl,
            marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
        },
    }))

export function ErrorPage(props: { error: Error }) {
    const theme = useMantineTheme()
    const { classes } = useStyles({ theme })

    return (
        <div className={classes.root}>
            <Container>
                <PageTitle />
                <Box className={classes.label}>
                    <Trans>Oops!</Trans>
                </Box>
                <Title className={classes.title}>
                    <Trans>Something bad just happened...</Trans>
                </Title>
                <Text size="lg" align="center" className={classes.description}>
                    {props.error.message}
                </Text>
                <Group position="center">
                    <Button size="md" onClick={() => window.location.reload()} leftIcon={<TbRefresh size={18} />}>
                        Refresh the page
                    </Button>
                </Group>
            </Container>
        </div>
    )
}

import {
    ActionIcon,
    AppShell,
    Box,
    Burger,
    Center,
    DEFAULT_THEME,
    Group,
    Header,
    type MantineTheme,
    Navbar,
    ScrollArea,
    Title,
    useMantineTheme,
} from "@mantine/core"
import { Constants } from "app/constants"
import { redirectToAdd, redirectToRootCategory } from "app/redirect/thunks"
import { useAppDispatch, useAppSelector } from "app/store"
import { setMobileMenuOpen, setSidebarWidth } from "app/tree/slice"
import { reloadTree } from "app/tree/thunks"
import { reloadProfile, reloadSettings, reloadTags } from "app/user/thunks"
import { AnnouncementDialog } from "components/AnnouncementDialog"
import { Loader } from "components/Loader"
import { Logo } from "components/Logo"
import { OnDesktop } from "components/responsive/OnDesktop"
import { OnMobile } from "components/responsive/OnMobile"
import { useAppLoading } from "hooks/useAppLoading"
import { useMobile } from "hooks/useMobile"
import { useWebSocket } from "hooks/useWebSocket"
import { LoadingPage } from "pages/LoadingPage"
import { Resizable } from "re-resizable"
import { type ReactNode, Suspense, useEffect } from "react"
import { TbPlus } from "react-icons/tb"
import { Outlet } from "react-router-dom"
import { tss } from "tss"

interface LayoutProps {
    sidebar: ReactNode
    sidebarWidth: number
    header: ReactNode
}

const sidebarPadding = DEFAULT_THEME.spacing.xs
const sidebarRightBorderWidth = "1px"

const useStyles = tss
    .withParams<{
        theme: MantineTheme
        sidebarWidth: number
    }>()
    .create(({ theme, sidebarWidth }) => ({
        sidebar: {
            "& .mantine-ScrollArea-scrollbar[data-orientation='horizontal']": {
                display: "none",
            },
        },
        sidebarContentResizeWrapper: {
            padding: sidebarPadding,
            minHeight: `calc(100vh - ${Constants.layout.headerHeight}px)`,
        },
        sidebarContent: {
            maxWidth: `calc(${sidebarWidth}px - ${sidebarPadding} * 2 - ${sidebarRightBorderWidth})`,
            [theme.fn.smallerThan(Constants.layout.mobileBreakpoint)]: {
                maxWidth: `calc(100vw - ${sidebarPadding} * 2 - ${sidebarRightBorderWidth})`,
            },
        },
        mainContentWrapper: {
            paddingTop: Constants.layout.headerHeight,
            paddingLeft: sidebarWidth,
            paddingRight: 0,
            paddingBottom: 0,
            [theme.fn.smallerThan(Constants.layout.mobileBreakpoint)]: {
                paddingLeft: 0,
            },
        },
        mainContent: {
            maxWidth: `calc(100vw - ${sidebarWidth}px)`,
            padding: theme.spacing.md,
            [theme.fn.smallerThan(Constants.layout.mobileBreakpoint)]: {
                maxWidth: "100vw",
                padding: "6px",
            },
        },
    }))

function LogoAndTitle() {
    const dispatch = useAppDispatch()
    return (
        <Center inline onClick={async () => await dispatch(redirectToRootCategory())} style={{ cursor: "pointer" }}>
            <Logo size={24} />
            <Title order={3} pl="md">
                CommaFeed
            </Title>
        </Center>
    )
}

export default function Layout(props: LayoutProps) {
    const theme = useMantineTheme()
    const { classes } = useStyles({
        theme,
        sidebarWidth: props.sidebarWidth,
    })
    const { loading } = useAppLoading()
    const mobile = useMobile()
    const mobileMenuOpen = useAppSelector(state => state.tree.mobileMenuOpen)
    const webSocketConnected = useAppSelector(state => state.server.webSocketConnected)
    const treeReloadInterval = useAppSelector(state => state.server.serverInfos?.treeReloadInterval)
    const sidebarHidden = props.sidebarWidth === 0
    const dispatch = useAppDispatch()
    useWebSocket()

    const handleResize = (element: HTMLElement) => dispatch(setSidebarWidth(element.offsetWidth))

    useEffect(() => {
        // load initial data
        dispatch(reloadSettings())
        dispatch(reloadProfile())
        dispatch(reloadTree())
        dispatch(reloadTags())
    }, [dispatch])

    useEffect(() => {
        let timer: number | undefined

        if (!webSocketConnected && treeReloadInterval) {
            // reload tree periodically if not receiving websocket events
            timer = window.setInterval(async () => await dispatch(reloadTree()), treeReloadInterval)
        }

        return () => clearInterval(timer)
    }, [dispatch, webSocketConnected, treeReloadInterval])

    const burger = (
        <Center>
            <Burger
                color={theme.fn.variant({ color: theme.primaryColor, variant: "subtle" }).color}
                opened={mobileMenuOpen}
                onClick={() => dispatch(setMobileMenuOpen(!mobileMenuOpen))}
                size="sm"
            />
        </Center>
    )

    const addButton = (
        <ActionIcon color={theme.primaryColor} onClick={async () => await dispatch(redirectToAdd())} aria-label="Subscribe">
            <TbPlus size={18} />
        </ActionIcon>
    )

    if (loading) return <LoadingPage />
    return (
        <AppShell
            fixed
            navbarOffsetBreakpoint={Constants.layout.mobileBreakpoint}
            classNames={{ main: classes.mainContentWrapper }}
            navbar={
                <Navbar
                    id="sidebar"
                    hiddenBreakpoint={sidebarHidden ? 99999999 : Constants.layout.mobileBreakpoint}
                    hidden={sidebarHidden || !mobileMenuOpen}
                    width={{ md: props.sidebarWidth }}
                    className={classes.sidebar}
                >
                    <Navbar.Section grow component={ScrollArea} mx={mobile ? 0 : "-sm"} px={mobile ? 0 : "sm"}>
                        <Resizable
                            enable={{
                                top: false,
                                right: !mobile,
                                bottom: false,
                                left: false,
                                topRight: false,
                                bottomRight: false,
                                bottomLeft: false,
                                topLeft: false,
                            }}
                            onResize={(e, dir, el) => handleResize(el)}
                            minWidth={120}
                            className={classes.sidebarContentResizeWrapper}
                        >
                            <Box className={classes.sidebarContent}>{props.sidebar}</Box>
                        </Resizable>
                    </Navbar.Section>
                </Navbar>
            }
            header={
                <Header id="header" height={Constants.layout.headerHeight} p="md">
                    <OnMobile>
                        {mobileMenuOpen && (
                            <Group position="apart">
                                <Box>{burger}</Box>
                                <Box>
                                    <LogoAndTitle />
                                </Box>
                                <Box>{addButton}</Box>
                            </Group>
                        )}
                        {!mobileMenuOpen && (
                            <Group>
                                <Box>{burger}</Box>
                                <Box sx={{ flexGrow: 1 }}>{props.header}</Box>
                            </Group>
                        )}
                    </OnMobile>
                    <OnDesktop>
                        <Group>
                            <Group position="apart" sx={{ width: props.sidebarWidth - 16 }}>
                                <Box>
                                    <LogoAndTitle />
                                </Box>
                                <Box>{addButton}</Box>
                            </Group>
                            <Box sx={{ flexGrow: 1 }}>{props.header}</Box>
                        </Group>
                    </OnDesktop>
                </Header>
            }
        >
            <Box id="content" className={classes.mainContent}>
                <Suspense fallback={<Loader />}>
                    <AnnouncementDialog />
                    <Outlet />
                </Suspense>
            </Box>
        </AppShell>
    )
}

import { Router } from "express"
import { AuthRoutes } from "../modules/auth/auth.route"
import { UserRoutes } from "../modules/user/user.route"
import { OtpRoutes } from "../modules/otp/otp.route"
import { HighlightServiceRoutes } from "../modules/highlight_service/highlight_service.route"
import { ServiceRoutes } from "../modules/service/service.route"
import { ReviewRoutes } from "../modules/review/review.route"
import { CategoryRoutes } from "../modules/category/category.route"


export const router = Router()

const moduleRoutes = [
    {
        path: "/user",
        route: UserRoutes
    },
    {
        path: "/auth",
        route: AuthRoutes
    },
    {
        path: "/otp",
        route: OtpRoutes
    },
    {
        path: "/service",
        route: ServiceRoutes
    },
    {
        path: "/highlight-service",
        route: HighlightServiceRoutes
    },
    {
        path: "/review",
        route: ReviewRoutes
    },
    {
        path: "/category",
        route: CategoryRoutes
    }

]

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})

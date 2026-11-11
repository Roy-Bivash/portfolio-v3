import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import { Home } from "../pages/home/Home";
import { ProjectDetails } from "@/pages/projectDetails/ProjectDetails";
import { CaseStudyDetails } from "@/pages/caseStudyDetails/CaseStudyDetails";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/project-details/:id",
        element: <ProjectDetails />
    },
    {
        path: ":case-study/:id",
        element: <CaseStudyDetails />
    },
    {
        path: "*",
        element: <h1>Error 404</h1>
    }
]);

export function Router() {
    return <RouterProvider router={router} />
}
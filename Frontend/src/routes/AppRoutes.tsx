import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home/index";
import NotFound from "../pages/NotFound/index";

import MainLayout from "../layouts/MainLayout";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route element={<MainLayout />}>
                <Route path="/" element={<a />} />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
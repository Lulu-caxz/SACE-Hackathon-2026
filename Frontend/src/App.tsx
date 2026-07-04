import { Routes, Route } from "react-router-dom";

import Home from './pages/Home/index';
import NotFound from "./pages/NotFound/index";

import SelecaoEscola from "./pages/escola/selecao-escola"; 

import MainLayout from "./layouts/MainLayout";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/escolas" element={<SelecaoEscola />} />
            <Route element={<MainLayout />}></Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
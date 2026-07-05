import { Routes, Route } from "react-router-dom";

import Home from './pages/Home/index';
import NotFound from "./pages/NotFound/index";
import Secretaria from "./pages/secretaria/secretaria"; 
import MainLayout from "./layouts/MainLayout";
import NutricionistaCardapios from "./pages/nutricionista/nutricionista";
import Inspetor from "./pages/inspetor/inspetor";



export default function App() {
    return (
        
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/secretaria" element={<Secretaria />} />
            <Route path="/inspetor" element={<Inspetor />} />
            <Route path="/nutricionista" element={<NutricionistaCardapios />} />
            <Route element={<MainLayout />}></Route>
            <Route path="*" element={<NotFound />} />
            
        </Routes>
    );
}
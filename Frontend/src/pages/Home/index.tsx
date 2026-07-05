import "./index.css";
import ArrowIcon from "../../assets/icons/arrow.svg";
import { useState } from "react";
import Cardapio from "./components/cardapio";

export default function Home() {
    const [typeLogin, setTypeLogin] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const [cpf, setCpf] = useState("");
    const [password, setPassword] = useState("");

    const options = [
        {
            value: "secretaria",
            label: "Secretaria",
        },
        {
            value: "inspetor",
            label: "Inspetor(a)",
        },
        {
            value: "nutricionista",
            label: "Nutricionista",
        },
    ];

    function selectOption(option) {
        setTypeLogin(option.value);
        setIsOpen(false);
    }

    async function login() {
        const resposta = await fetch("http://localhost:3001/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                cpf,
                password,
                role: typeLogin,
            })
        })

        const data = await resposta.json()

        if (resposta.ok && data.usuario) {
            localStorage.setItem("token", data.token)
            console.log(data)
            if (data.usuario.role == "SECRETARIA") {
                window.location.href = "/secretaria"
            }
            if (data.usuario.role == "INSPETOR") {
                window.location.href = "/inspetor"
            }
            if (data.usuario.role == "NUTRICIONISTA") {
                window.location.href = "/nutricionista"
            }
            

        } else {
            console.log(data.message , "erro")
        }
    }

    return (
        <div className="container-grid">
            <div className="card card-login">
                <div className="title-top">
                    <div className="text-bold">
                        Seja bem-vindo à SACE
                    </div>

                    <div className="text-notbold">
                        Preencha os dados abaixo para acessar.
                    </div>
                </div>

                <div className="title-mid">

                    <div className="text-bold">
                        QUEM ESTÁ ENTRANDO
                    </div>

                    <div className="select">

                        <div
                            className="input"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <span className="text-notbold">
                                {typeLogin
                                    ? options.find(
                                        (o) => o.value === typeLogin
                                    ).label
                                    : "Escolher"}
                            </span>

                            <img
                                className={`arrow ${isOpen ? "open" : ""}`}
                                src={ArrowIcon}
                                alt=""
                            />
                        </div>

                        {isOpen && (
                            <div className="options">
                                {options.map((option) => (
                                    <div
                                        key={option.value}
                                        className="option"
                                        onClick={() =>
                                            selectOption(option)
                                        }
                                    >
                                        {option.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {typeLogin && (
                        <>
                            <div className="text-bold">
                                CPF
                            </div>

                            <div className="input">
                                <input
                                    type="text"
                                    placeholder="123.456.789-12"
                                    value={cpf}
                                    onChange={(e) => setCpf(e.target.value)}
                                />
                            </div>

                            <div className="text-bold">
                                SENHA
                            </div>

                            <div className="input">
                                <input
                                    type="password"
                                    placeholder="********"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <button className="btn-login" onClick={login}>
                                ENTRAR
                            </button>
                        </>
                    )}
                </div>

                <div className="section-down text-notbold">
                    O SACE é o Sistema de Acompanhamento do
                    Consumo Escolar da Secretaria Municipal
                    de Educação de Caraguatatuba.
                </div>
            </div>

            <div className="container-card">
                <div className="card">
                    <Cardapio
                        titulo="CARDÁPIO CEI"
                        subtitulo="CRIANÇAS DE 6 A 12 MESES"
                        cor="#024B7E"
                    />
                </div>
                <div className="card">
                    <Cardapio
                        titulo="CARDÁPIO CEI/EMEI"
                        subtitulo="CRIANÇAS DE 1 A 5 ANOS"
                        cor="#4C77B8"
                    />
                </div>
            </div>
        </div>
    );
}
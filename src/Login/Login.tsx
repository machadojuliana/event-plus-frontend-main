import { useLocation, useNavigate } from "react-router-dom";
import logoEvent from "../assets/logo-event.svg"

import "./Login.css"
import { useEffect, useState } from "react";
import { useAuth } from "../context/auth";
import Botao from "../components/botao/Botao";

function Login(){

    const navigate = useNavigate();
    const location = useLocation();
    const { login, autenticado } = useAuth();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if(autenticado) navigate("/home", {replace: true});
    }, [autenticado, navigate]

    )

    return (
        <main>
            <img src={logoEvent} alt="EventPlus logo" />
        <div>
            <label htmlFor="">email</label>
            <input type="email" 
            name="email" 
            id="email" 
            placeholder="digite sua email..." 
            onChange={(event) => setEmail(event.target.value)}
            />
        </div>

        <div>
            <label htmlFor="">senha</label>
            <input type="password" 
            name="senha" 
            id="senha" 
            placeholder="digite sua senha..." 
            onChange={(event) => setEmail(event.target.value)}
            />
        </div>
        
        <Botao
            texto={enviando ? "Entrando..." : "Entrar"}
            type="submit"
            disabled={enviando}
        />
        </main>
    )
}

export default Login;
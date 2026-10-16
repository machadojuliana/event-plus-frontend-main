import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Botao from "../../components/botao/Botao";
import bannerPadrao from "../../assets/banner-1.png";
import { eventoService, presencaService } from "../../services/eventPlusService";
import type { Evento, Presenca } from "../../types/api";
import "./DetalhesEvento.css";

function DetalhesEvento() {
    const { id } = useParams<{ id: string }>();
    const [evento, setEvento] = useState<Evento | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [presenca, setPresenca] = useState<Presenca | null>(null);
    const [mensagemInscricao, setMensagemInscricao] = useState("");
    const [inscrevendo, setInscrevendo] = useState(false);

    const idUsuario = localStorage.getItem("eventplus.userId");

    useEffect(() => {
        if (!id) {
            setErro("Evento não encontrado.");
            setCarregando(false);
            return;
        }

        let ativo = true;
        setCarregando(true);
        Promise.all([
            eventoService.buscar(id),
            idUsuario ? presencaService.ListarPorUsuario(idUsuario) : Promise.resolve([]),
        ])
            .then(([dadosEvento, presencas]) => {
                if (!ativo) return;
                setEvento(dadosEvento);
                setPresenca(presencas.find((item) => item.idEvento === id) ?? null);
                setErro("");
            })
            .catch(() => {
                if (ativo) setErro("Não foi possível carregar este evento. Confira a conexão com a API e tente novamente.");
            })
            .finally(() => {
                if (ativo) setCarregando(false);
            });

        return () => { ativo = false; };
    }, [id, idUsuario]);

    async function alternarInscricao() {
        const token = localStorage.getItem("eventplus.token");
        if (!token || !idUsuario || !id) {
            setMensagemInscricao("Faça login para se inscrever no evento.");
            return;
        }

        setMensagemInscricao("");
        setInscrevendo(true);
        try {
            if (presenca) {
                await presencaService.excluir(presenca.idPresenca);
                setPresenca(null);
                setMensagemInscricao("Inscrição cancelada.");
            } else {
                const novaPresenca = await presencaService.cadastrar({ situacao: true, idEvento: id, idUsuario });
                setPresenca(novaPresenca);
                setMensagemInscricao("Inscrição realizada com sucesso.");
            }
        } catch (e) {
            setMensagemInscricao(e instanceof Error ? e.message : "Não foi possível atualizar sua inscrição.");
        } finally {
            setInscrevendo(false);
        }
    }

    return (
        <div className="detalhes-pagina">
            <Header />
            <main className="detalhes-conteudo">
                {carregando ? <p className="detalhes-status">Carregando evento…</p> : erro ? (
                    <p className="detalhes-status" role="alert">{erro}</p>
                ) : evento ? (
                    <>
                        <img className="detalhes-banner" src={evento.imagemUrl || bannerPadrao} alt={`Imagem do evento ${evento.nome}`} />
                        <h1 className="detalhes-titulo">{evento.nome}</h1>
                        <div className="detalhes-grade">
                            <section className="detalhes-principal" aria-label="Conteúdo do evento">
                                <h2>Sobre o evento</h2>
                                <p className="detalhes-descricao">{evento.descricao}</p>
                            </section>
                            <aside className="detalhes-info">
                                <h2>Informações principais</h2>
                                <p><span aria-hidden="true">◷</span>{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(evento.dataEvento))}</p>
                                <p><span aria-hidden="true">▦</span>{evento.idInstituicaoNavigation?.nomeFantasia || "Local a confirmar"}</p>
                                <p><span aria-hidden="true">◆</span>{evento.idTipoEventoNavigation?.titulo || "Evento"}</p>
                                {evento.idInstituicaoNavigation?.endereco && <p className="detalhes-endereco">{evento.idInstituicaoNavigation.endereco}</p>}
                                <Botao
                                    className={presenca ? "detalhe-evento-cancelar" : ""}
                                    texto={presenca ? "Cancelar inscrição" : "Inscrever-se"}
                                    onClick={alternarInscricao}
                                    disabled={inscrevendo}
                                />
                                {mensagemInscricao && <p className="detalhes-mensagem" role="status">{mensagemInscricao}</p>}
                            </aside>
                        </div>
                    </>
                ) : (
                    <section className="detalhes-nao-encontrado">
                        <h1>Evento não encontrado</h1>
                        <p>O evento solicitado não está disponível.</p>
                    </section>
                )}
            </main>
            <Footer />
        </div>
    );
}

export default DetalhesEvento;

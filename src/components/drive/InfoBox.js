import { Lightbulb } from "lucide-react";
const InfoBox = () => (
    <div
        className="bg-sky-50 border-l-4 border-sky-400 text-sky-800 p-4 rounded-r-lg mb-8 text-sm"
        role="alert"
    >
        <div className="flex">
            <div className="py-1">
                <Lightbulb className="h-5 w-5 mr-3 flex-shrink-0" />
            </div>
            <div>
                <p className="font-bold mb-1">Bem-vindo(a) ao seu Drive!</p>
                <p>
                    Professor(a), aqui você pode criar pastas e subpastas para organizar os seus arquivos gerados.<br />
                    <strong>Exemplo:</strong> Pasta (Escola 1) → Subpasta (1º ano A) → Subpasta (Biologia) → Arquivo (Atividade sobre Bactérias).
                </p>
                <p className="mt-2">
                    <i>
                        Obs.: Isso é apenas um exemplo: você possui total autonomia para organizar as suas pastas e arquivos do jeito que desejar!
                    </i>
                </p>
            </div>
        </div>
    </div>
);
export default InfoBox;
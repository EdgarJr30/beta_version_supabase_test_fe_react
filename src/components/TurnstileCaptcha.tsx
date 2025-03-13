import { useEffect, useRef } from "react";

declare global {
    interface Window {
        onloadTurnstileCallback: () => void;
        turnstile?: {
            render: (container: HTMLElement, options: { sitekey: string; callback: (token: string) => void }) => void;
            remove: (container: HTMLElement) => void;
        };
    }
}

const TurnstileCaptcha = ({ onSuccess }: { onSuccess: (token: string) => void }) => {
    const captchaRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Cargar el script de Turnstile si no está presente
        const loadTurnstileScript = () => {
            if (!document.querySelector('script[src*="turnstile"]')) {
                const script = document.createElement("script");
                script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
                script.async = true;
                script.defer = true;
                document.body.appendChild(script);
            }
        };

        // Callback de carga de Turnstile
        window.onloadTurnstileCallback = () => {
            if (window.turnstile && captchaRef.current) {
                window.turnstile.render(captchaRef.current, {
                    sitekey: "0x4AAAAAABAhG_v_BX_VVqKS",
                    callback: (token: string) => {
                        console.log(`🔹 Captcha completado con éxito: ${token}`);
                        onSuccess(token);
                    },
                });
            }
        };

        // Cargar el script si no está presente
        loadTurnstileScript();

        const currentCaptchaRef = captchaRef.current;

        return () => {
            if (window.turnstile && currentCaptchaRef) {
                window.turnstile.remove(currentCaptchaRef);
            }
        };
    }, [onSuccess]);

    return <div ref={captchaRef}></div>;
};

export default TurnstileCaptcha;

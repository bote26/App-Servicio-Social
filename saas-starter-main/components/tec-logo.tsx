export function TecLogo({ className = '', white = true }: { className?: string; white?: boolean }) {
    const fill = white ? '#ffffff' : '#000000';
    return (
        <svg
            className={className}
            viewBox="0 0 400 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Shield icon */}
            <g>
                <path
                    d="M25 5C25 5 15 8 5 8V30C5 42 15 52 25 57C35 52 45 42 45 30V8C35 8 25 5 25 5Z"
                    fill={fill}
                    fillOpacity="0.9"
                />
                <path
                    d="M25 12C25 12 18 14 11 14V30C11 39 18 47 25 51C32 47 39 39 39 30V14C32 14 25 12 25 12Z"
                    fill={fill}
                    fillOpacity="0.15"
                />
                {/* Mountain/peak inside shield */}
                <path
                    d="M17 38L25 20L33 38H17Z"
                    fill={fill}
                    fillOpacity="0.9"
                />
                <path
                    d="M21 38L25 28L29 38H21Z"
                    fill={fill}
                    fillOpacity="0.15"
                />
            </g>
            {/* "Tecnológico" text */}
            <text
                x="55"
                y="28"
                fontFamily="Arial, Helvetica, sans-serif"
                fontSize="20"
                fontWeight="bold"
                fill={fill}
                letterSpacing="0.5"
            >
                Tecnológico
            </text>
            {/* "de Monterrey" text */}
            <text
                x="55"
                y="50"
                fontFamily="Arial, Helvetica, sans-serif"
                fontSize="18"
                fontWeight="normal"
                fill={fill}
                letterSpacing="0.5"
            >
                de Monterrey
            </text>
        </svg>
    );
}

export function MiTecLogo({ className = '' }: { className?: string }) {
    return (


        <div className={`flex flex-col gap-2 items-center ${className} p-2  rounded-xl `}>
            {/* Fila 1 */}
            <div className="flex gap-2">
                {/* Turquesa - chaflán superior derecho */}
                <div 
                    className="w-[45px] h-[45px] rounded-lg bg-[#1ab0a6]"
                    style={{ clipPath: 'polygon(0% 0%, 75% 0%, 100% 25%, 100% 100%, 0% 100%)' }}
                />
                {/* Naranja - chaflán inferior izquierdo */}
                <div 
                    className="w-[45px] h-[45px] rounded-lg bg-[#ff9c00]"
                    style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 25% 100%, 0% 75%)' }}
                />
            </div>

            {/* Fila 2 */}
            <div className="flex gap-2">
                {/* Coral - chaflán superior izquierdo */}
                <div 
                    className="w-[45px] h-[45px] rounded-lg bg-[#ff7e5f]"
                    style={{ clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 25%)' }}
                />
                {/* Violeta - chaflán inferior derecho */}
                <div 
                    className="w-[45px] h-[45px] rounded-lg bg-[#9d4edd]"
                    style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 75% 100%, 0% 100%)' }}
                />
            </div>

            {/* Fila 3 */}
            <div className="flex gap-2">
                {/* Círculo negro */}
                <div className="w-[45px] h-[45px] rounded-full bg-[#000000]" />
                {/* Azul claro - chaflán inferior izquierdo */}
                <div 
                    className="w-[45px] h-[45px] rounded-lg bg-[#5dc1d9]"
                    style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 25% 100%, 0% 75%)' }}
                />
            </div>
            {/* mi tec text */}
            <div className="flex items-baseline gap-1">
                <span className="text-white text-xl font-light tracking-wide">Servicio</span>
                <span className="text-white text-2xl font-bold tracking-wide">Social</span>
            </div>
        </div>
    );
}

export default function CosmicBackground() {
    return (
        <div className="cosmic-bg" aria-hidden="true">
            <div className="cosmic-glow" />

            <div className="orbit-ring orbit-ring-1" />
            <div className="orbit-ring orbit-ring-2" />

            <svg
                className="cosmic-constellation"
                viewBox="0 0 1800 1000"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g className="c-lines">
                    <line x1="703" y1="184" x2="909" y2="90" />
                    <line x1="703" y1="184" x2="492" y2="77" />
                    <line x1="848" y1="696" x2="928" y2="458" />
                    <line x1="848" y1="696" x2="1180" y2="909" />
                    <line x1="138" y1="104" x2="232" y2="404" />
                    <line x1="138" y1="104" x2="293" y2="258" />
                    <line x1="1721" y1="578" x2="1331" y2="672" />
                    <line x1="232" y1="404" x2="225" y2="594" />
                    <line x1="232" y1="404" x2="293" y2="258" />
                    <line x1="1233" y1="89" x2="1079" y2="249" />
                    <line x1="1233" y1="89" x2="1436" y2="215" />
                    <line x1="1079" y1="249" x2="928" y2="458" />
                    <line x1="1079" y1="249" x2="1209" y2="345" />
                    <line x1="225" y1="594" x2="293" y2="258" />
                    <line x1="293" y1="258" x2="492" y2="77" />
                    <line x1="1331" y1="672" x2="1180" y2="909" />
                    <line x1="1209" y1="345" x2="1436" y2="215" />
                </g>
                <g>
                    <circle className="c-node" cx="703" cy="184" r="3" />
                    <circle className="c-node" cx="848" cy="696" r="3" />
                    <circle className="c-node" cx="138" cy="104" r="3" />
                    <circle className="c-node" cx="1721" cy="578" r="2" />
                    <circle className="c-node" cx="232" cy="404" r="2" />
                    <circle className="c-node c-node-pulse" cx="1233" cy="89" r="2" />
                    <circle className="c-node" cx="1079" cy="249" r="2" />
                    <circle className="c-node c-node-pulse" cx="928" cy="458" r="4" />
                    <circle className="c-node" cx="225" cy="594" r="3" />
                    <circle className="c-node c-node-pulse" cx="909" cy="90" r="4" />
                    <circle className="c-node" cx="293" cy="258" r="3" />
                    <circle className="c-node" cx="1331" cy="672" r="3" />
                    <circle className="c-node c-node-pulse" cx="492" cy="77" r="3" />
                    <circle className="c-node c-node-pulse" cx="1180" cy="909" r="3" />
                    <circle className="c-node" cx="1209" cy="345" r="4" />
                    <circle className="c-node" cx="1436" cy="215" r="2" />
                </g>
            </svg>

            <div className="star-layer star-layer-sm" />
            <div className="star-layer star-layer-lg" />

            <div className="cosmic-noise" />
        </div>
    );
}
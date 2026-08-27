import type { RiskBand } from "../types";

interface EngineSchematicProps {
  health: number;
  risk: RiskBand;
}

export function EngineSchematic({ health, risk }: EngineSchematicProps) {
  return (
    <figure className="engine-schematic" data-risk={risk}>
      <svg
        aria-labelledby="engine-schematic-title engine-schematic-desc"
        role="img"
        viewBox="0 0 720 320"
      >
        <title id="engine-schematic-title">Turbofan condition schematic</title>
        <desc id="engine-schematic-desc">A longitudinal turbofan diagram with compressor and turbine stages.</desc>
        <path className="engine-shell" d="M44 163C101 68 220 48 354 51c132 3 238 34 314 112-77 77-183 108-314 110-134 2-253-17-310-110Z" />
        <path className="engine-core" d="M95 163c62-42 157-62 273-60 109 2 190 21 244 60-54 39-135 58-244 60-116 2-211-18-273-60Z" />
        <path className="engine-flow" d="M18 163h128m455 0h101" />
        <g transform="translate(149 163)">
          <g className="engine-fan">
            {Array.from({ length: 12 }, (_, index) => (
              <path d="M0-11C15-39 19-74 5-96C-8-70-10-35 0-11Z" key={index} transform={`rotate(${index * 30})`} />
            ))}
            <circle cx="0" cy="0" r="15" />
          </g>
        </g>
        <g className="engine-stages">
          {[243, 268, 294, 321, 348].map((x, index) => (
            <path d={`M${x} 119l${index % 2 ? -9 : 9} 44-9 44`} key={x} />
          ))}
          {[430, 461, 492, 522].map((x, index) => (
            <path d={`M${x} 123l${index % 2 ? 11 : -11} 40 ${index % 2 ? -11 : 11} 40`} key={x} />
          ))}
        </g>
        <path className="engine-shaft" d="M137 163h425" />
        <circle className="engine-hotspot" cx="452" cy="163" r="31" />
        <g className="engine-labels">
          <text x="121" y="284">FAN</text>
          <text x="269" y="284">COMPRESSOR</text>
          <text x="450" y="284">TURBINE</text>
          <text x="589" y="284">EXHAUST</text>
        </g>
      </svg>
      <figcaption>
        <span>Digital twin / cutaway</span>
        <strong>{health}% health index</strong>
      </figcaption>
    </figure>
  );
}

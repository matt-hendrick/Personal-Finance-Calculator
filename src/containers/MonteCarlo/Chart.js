import React, { createContext, useContext } from 'react';

const ChartContext = createContext(null);
export const useChartContext = () => useContext(ChartContext);

export function Chart({ dimensions, children }) {
  return (
    <ChartContext.Provider value={dimensions}>
      <svg width={dimensions.width} height={dimensions.height}>
        <g
          transform={`translate(${dimensions.marginLeft}, ${dimensions.marginTop})`}
        >
          {children}
        </g>
      </svg>
    </ChartContext.Provider>
  );
}

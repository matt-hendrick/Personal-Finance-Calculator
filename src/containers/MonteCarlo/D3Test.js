import React from 'react';
import { csv, deviation, mean } from 'd3';
import './GOOG.csv';

function normSinv(p) {
  const a1 = -3.969683028665376e1;
  const a2 = 2.209460984245205e2;
  const a3 = -2.759285104469687e2;
  const a4 = 1.38357751867269e2;
  const a5 = -3.066479806614716e1;
  const a6 = 2.506628277459239;

  const b1 = -5.447609879822406e1;
  const b2 = 1.615858368580409e2;
  const b3 = -1.556989798598866e2;
  const b4 = 6.680131188771972e1;
  const b5 = -1.328068155288572e1;

  const c1 = -7.784894002430293e-3;
  const c2 = -3.223964580411365e-1;
  const c3 = -2.400758277161838;
  const c4 = -2.549732539343734;
  const c5 = 4.374664141464968;
  const c6 = 2.938163982698783;

  const d1 = 7.784695709041462e-3;
  const d2 = 3.224671290700398e-1;
  const d3 = 2.445134137142996;
  const d4 = 3.754408661907416;

  const p_low = 0.02425;
  const p_high = 1 - p_low;

  let q;

  // Rational approximation for lower region
  if (0 < p && p < p_low) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    );
  }

  // Rational approximation for central region
  if (p_low <= p && p <= p_high) {
    q = p - 0.5;
    const r = q * q;
    return (
      ((((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q) /
      (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1)
    );
  }

  // Rational approximation for upper region
  if (p_high < p && p < 1) {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    );
  }
}

function getStockStats(data) {
  let stockDayPcntChange = [];

  const data2019 = data.filter(
    (data) => new Date(data.Date).getFullYear() === 2019
  );

  // Start at second day
  for (let i = 1; i < data2019.length; i++) {
    const curDayPrice = data2019[i].Close;
    const prevDayPrice = data2019[i - 1].Close;
    stockDayPcntChange.push((curDayPrice - prevDayPrice) / prevDayPrice);
  }

  return {
    meanDailyChange: mean(stockDayPcntChange),
    stdDevDailyChange: deviation(stockDayPcntChange),
  };
}

function projectStockPrice(currPrice, meanDailyChange, stdDevDailyChange) {
  const drift = meanDailyChange - (stdDevDailyChange * stdDevDailyChange) / 2;
  const randomShock = stdDevDailyChange * normSinv(Math.Random());
  return currPrice * Math.exp(drift + randomShock);
}

const last2019Price = 1337.02002;
const stockStats = getStockStats(1);
const first2020Price = projectStockPrice(
  last2019Price,
  stockStats.meanDailyChange,
  stockStats.stdDevDailyChange
);

function project2020Prices(data) {
  const data2019 = data.filter(
    (data) => new Date(data.Date).getFullYear() === 2019
  );

  const last2019Price = data2019[data2019.length - 1].Close;

  const data2020 = data.filter(
    (data) => new Date(data.Date).getFullYear() === 2020
  );

  const projection2020 = [];

  for (let i = 0; i < data2020.length; i++) {
    const priorPrice = i === 0 ? last2019Price : projection2020[i - 1].Close;

    projection2020.push({
      Date: data2020[i].Date,
      Close: projectStockPrice(
        priorPrice,
        stockStats.meanDailyChange,
        stockStats.stdDevDailyChange
      ),
    });
  }

  return projection2020;
}

function D3Test() {
  return <div></div>;
}

export default D3Test;

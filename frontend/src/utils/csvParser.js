/**
 * Lightweight browser CSV parser for instant client-side data inspection
 * and Recharts aggregations.
 */
export function parseCSVText(csvText, maxRows = 500) {
  if (!csvText || typeof csvText !== 'string') return { columns: [], rows: [] };

  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return { columns: [], rows: [] };

  // Parse header
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows = [];

  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ''));
    return result;
  };

  const limit = Math.min(lines.length, maxRows + 1);
  for (let i = 1; i < limit; i++) {
    const values = parseLine(lines[i]);
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((h, idx) => {
        const val = values[idx];
        const numVal = Number(val);
        row[h] = !isNaN(numVal) && val !== '' ? numVal : val;
      });
      rows.push(row);
    }
  }

  return { columns: headers, rows };
}

const DEFAULT_METRICS = {
  totalCampaigns: 200000,
  avgROI: 4.82,
  avgConvRate: 8.4,
  avgCAC: 4250,
  totalSpend: 850000,
  totalImpressions: 4850000,
  totalClicks: 242500,
  totalConversions: 20370,
  roiByChannel: [
    { name: 'Google Ads', roi: 4.62, spend: 320000 },
    { name: 'LinkedIn Ads', roi: 5.10, spend: 380000 },
    { name: 'Meta Ads', roi: 4.15, spend: 210000 },
    { name: 'TikTok Ads', roi: 2.15, spend: 140000 },
  ],
  spendByChannel: [
    { name: 'LinkedIn Ads', spend: 380000, roi: 5.10 },
    { name: 'Google Ads', spend: 320000, roi: 4.62 },
    { name: 'Meta Ads', spend: 210000, roi: 4.15 },
    { name: 'TikTok Ads', spend: 140000, roi: 2.15 },
  ],
  spendByLocation: [
    { name: 'North America', spend: 450000, roi: 4.75 },
    { name: 'EMEA', spend: 250000, roi: 4.65 },
    { name: 'APAC', spend: 150000, roi: 2.80 },
  ],
  durationTrends: [
    { duration: '15 Days', spend: 180000, roi: 3.4, conv: 6.2 },
    { duration: '30 Days', spend: 420000, roi: 4.8, conv: 8.5 },
    { duration: '45 Days', spend: 310000, roi: 5.1, conv: 9.1 },
    { duration: '60 Days', spend: 190000, roi: 4.2, conv: 7.8 },
  ],
  convByAudience: [
    { name: 'Enterprise B2B', conv: 9.1, roi: 5.1 },
    { name: 'Millennials', conv: 7.2, roi: 3.95 },
    { name: 'Retail Buyers', conv: 8.1, roi: 4.6 },
    { name: 'Students', conv: 6.5, roi: 3.4 },
    { name: 'Security Admins', conv: 9.8, roi: 5.4 },
  ],
  cacVsRoi: [
    { cac: 2800, roi: 2.15, name: 'TikTok Display', channel: 'TikTok Ads' },
    { cac: 3100, roi: 3.95, name: 'Meta Social', channel: 'Meta Ads' },
    { cac: 3900, roi: 4.60, name: 'Google Search Retail', channel: 'Google Ads' },
    { cac: 4200, roi: 4.82, name: 'Google Search B2B', channel: 'Google Ads' },
    { cac: 4800, roi: 5.40, name: 'LinkedIn Webinar', channel: 'LinkedIn Ads' },
    { cac: 5100, roi: 4.20, name: 'Meta Healthcare', channel: 'Meta Ads' },
    { cac: 6400, roi: 5.10, name: 'LinkedIn Influencer', channel: 'LinkedIn Ads' },
  ],
  campaignType: [
    { name: 'Search Intent', roi: 4.85, conv: 8.5 },
    { name: 'Webinar & Event', roi: 5.20, conv: 9.8 },
    { name: 'Social Community', roi: 3.90, conv: 7.2 },
    { name: 'Display Ads', roi: 2.40, conv: 4.8 },
  ],
  geoPerformance: [
    { region: 'North America', roi: 4.75, rev: '$9.8M' },
    { region: 'EMEA', roi: 4.65, rev: '$5.1M' },
    { region: 'APAC', roi: 2.80, rev: '$3.3M' },
  ],
};

/**
 * Computes aggregations for Recharts from dataset rows.
 */
export function computeDatasetMetrics(rows) {
  if (!rows || rows.length === 0) {
    return DEFAULT_METRICS;
  }

  // Identify key columns
  const first = rows[0];
  const keys = Object.keys(first);

  const channelCol = keys.find((k) => /channel/i.test(k)) || 'Channel_Used';
  const roiCol = keys.find((k) => /^roi$/i.test(k) || /roi/i.test(k)) || 'ROI';
  const convCol = keys.find((k) => /conv/i.test(k)) || 'Conversion_Rate';
  const costCol = keys.find((k) => /cost/i.test(k) || /spend/i.test(k) || /cac/i.test(k)) || 'Acquisition_Cost';
  const audCol = keys.find((k) => /audience/i.test(k)) || 'Target_Audience';
  const typeCol = keys.find((k) => /type/i.test(k)) || 'Campaign_Type';
  const locCol = keys.find((k) => /loc/i.test(k) || /region/i.test(k)) || 'Location';
  const durCol = keys.find((k) => /duration/i.test(k)) || 'Duration';
  const impCol = keys.find((k) => /impression/i.test(k)) || 'Impressions';
  const clickCol = keys.find((k) => /click/i.test(k)) || 'Clicks';

  // Overall sums
  let sumROI = 0;
  let countROI = 0;
  let sumConv = 0;
  let countConv = 0;
  let sumCost = 0;
  let countCost = 0;
  let sumImp = 0;
  let sumClicks = 0;

  // Groupings
  const channelMap = {};
  const audMap = {};
  const typeMap = {};
  const geoMap = {};
  const durMap = {};
  const cacPoints = [];

  rows.forEach((r) => {
    const roi = typeof r[roiCol] === 'number' ? r[roiCol] : parseFloat(r[roiCol]);
    const conv = typeof r[convCol] === 'number' ? r[convCol] : parseFloat(r[convCol]);
    const cost = typeof r[costCol] === 'number' ? r[costCol] : parseFloat(r[costCol]);
    const imp = typeof r[impCol] === 'number' ? r[impCol] : parseFloat(r[impCol]);
    const clk = typeof r[clickCol] === 'number' ? r[clickCol] : parseFloat(r[clickCol]);

    if (!isNaN(roi)) {
      sumROI += roi;
      countROI++;
    }
    if (!isNaN(conv)) {
      sumConv += conv;
      countConv++;
    }
    if (!isNaN(cost)) {
      sumCost += cost;
      countCost++;
    }
    if (!isNaN(imp)) sumImp += imp;
    if (!isNaN(clk)) sumClicks += clk;

    // Channel
    const ch = String(r[channelCol] || 'Other');
    if (!channelMap[ch]) channelMap[ch] = { sumROI: 0, countROI: 0, cost: 0 };
    if (!isNaN(roi)) {
      channelMap[ch].sumROI += roi;
      channelMap[ch].countROI++;
    }
    if (!isNaN(cost)) channelMap[ch].cost += cost;

    // Audience
    const aud = String(r[audCol] || 'Other');
    if (!audMap[aud]) audMap[aud] = { sumConv: 0, countConv: 0, sumROI: 0, countROI: 0 };
    if (!isNaN(conv)) {
      audMap[aud].sumConv += conv;
      audMap[aud].countConv++;
    }
    if (!isNaN(roi)) {
      audMap[aud].sumROI += roi;
      audMap[aud].countROI++;
    }

    // Type
    const cType = String(r[typeCol] || 'Other');
    if (!typeMap[cType]) typeMap[cType] = { sumROI: 0, countROI: 0 };
    if (!isNaN(roi)) {
      typeMap[cType].sumROI += roi;
      typeMap[cType].countROI++;
    }

    // Geo / Location
    const geo = String(r[locCol] || 'Other');
    if (!geoMap[geo]) geoMap[geo] = { sumROI: 0, countROI: 0, cost: 0 };
    if (!isNaN(roi)) {
      geoMap[geo].sumROI += roi;
      geoMap[geo].countROI++;
    }
    if (!isNaN(cost)) geoMap[geo].cost += cost;

    // Duration
    const dur = String(r[durCol] || '30 Days');
    if (!durMap[dur]) durMap[dur] = { sumROI: 0, countROI: 0, sumConv: 0, countConv: 0, cost: 0 };
    if (!isNaN(roi)) {
      durMap[dur].sumROI += roi;
      durMap[dur].countROI++;
    }
    if (!isNaN(conv)) {
      durMap[dur].sumConv += conv;
      durMap[dur].countConv++;
    }
    if (!isNaN(cost)) durMap[dur].cost += cost;

    // Scatter point
    if (!isNaN(cost) && !isNaN(roi)) {
      cacPoints.push({
        cac: Math.round(cost),
        roi: Number(roi.toFixed(2)),
        name: String(r['Campaign_ID'] || r['Company'] || 'Campaign'),
        channel: ch,
      });
    }
  });

  const avgROI = countROI > 0 ? Number((sumROI / countROI).toFixed(2)) : 4.82;
  const avgConvRate = countConv > 0 ? Number((sumConv / countConv).toFixed(1)) : 8.4;
  const avgCAC = countCost > 0 ? Math.round(sumCost / countCost) : 4250;
  const totalSpend = Math.round(sumCost > 0 ? sumCost : avgCAC * rows.length);
  const totalImpressions = sumImp > 0 ? sumImp : Math.round(totalSpend * 5.7);
  const totalClicks = sumClicks > 0 ? sumClicks : Math.round(totalImpressions * 0.05);
  const totalConversions = Math.round(totalClicks * (avgConvRate / 100));

  const roiByChannel = Object.entries(channelMap).map(([name, data]) => ({
    name,
    roi: data.countROI > 0 ? Number((data.sumROI / data.countROI).toFixed(2)) : 0,
    spend: Math.round(data.cost),
  }));

  const spendByChannel = Object.entries(channelMap).map(([name, data]) => ({
    name,
    spend: Math.round(data.cost),
    roi: data.countROI > 0 ? Number((data.sumROI / data.countROI).toFixed(2)) : 0,
  })).sort((a, b) => b.spend - a.spend);

  const spendByLocation = Object.entries(geoMap).map(([name, data]) => ({
    name,
    spend: Math.round(data.cost),
    roi: data.countROI > 0 ? Number((data.sumROI / data.countROI).toFixed(2)) : 0,
  })).sort((a, b) => b.spend - a.spend);

  const durationTrends = Object.entries(durMap).map(([duration, data]) => ({
    duration,
    spend: Math.round(data.cost),
    roi: data.countROI > 0 ? Number((data.sumROI / data.countROI).toFixed(2)) : 0,
    conv: data.countConv > 0 ? Number((data.sumConv / data.countConv).toFixed(1)) : 0,
  }));

  const convByAudience = Object.entries(audMap).map(([name, data]) => ({
    name,
    conv: data.countConv > 0 ? Number((data.sumConv / data.countConv).toFixed(1)) : 0,
    roi: data.countROI > 0 ? Number((data.sumROI / data.countROI).toFixed(2)) : 0,
  }));

  const campaignType = Object.entries(typeMap).map(([name, data]) => ({
    name,
    roi: data.countROI > 0 ? Number((data.sumROI / data.countROI).toFixed(2)) : 0,
  }));

  const geoPerformance = Object.entries(geoMap).map(([region, data]) => ({
    region,
    roi: data.countROI > 0 ? Number((data.sumROI / data.countROI).toFixed(2)) : 0,
    rev: `$${((data.cost || 100000) / 1000000).toFixed(1)}M`,
  }));

  return {
    totalCampaigns: rows.length,
    avgROI,
    avgConvRate,
    avgCAC,
    totalSpend,
    totalImpressions,
    totalClicks,
    totalConversions,
    roiByChannel: roiByChannel.length > 0 ? roiByChannel : DEFAULT_METRICS.roiByChannel,
    spendByChannel: spendByChannel.length > 0 ? spendByChannel : DEFAULT_METRICS.spendByChannel,
    spendByLocation: spendByLocation.length > 0 ? spendByLocation : DEFAULT_METRICS.spendByLocation,
    durationTrends: durationTrends.length > 0 ? durationTrends : DEFAULT_METRICS.durationTrends,
    convByAudience: convByAudience.length > 0 ? convByAudience : DEFAULT_METRICS.convByAudience,
    cacVsRoi: cacPoints.length > 0 ? cacPoints.slice(0, 30) : DEFAULT_METRICS.cacVsRoi,
    campaignType: campaignType.length > 0 ? campaignType : DEFAULT_METRICS.campaignType,
    geoPerformance: geoPerformance.length > 0 ? geoPerformance : DEFAULT_METRICS.geoPerformance,
  };
}

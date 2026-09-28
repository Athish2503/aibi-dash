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

  // Identify key columns dynamically with flexible regex matching
  const first = rows[0];
  const keys = Object.keys(first);

  const channelCol = keys.find((k) => /channel|platform|source|medium/i.test(k)) || 'Channel_Used';
  const roiCol = keys.find((k) => /^roi$/i.test(k) || /roi|return/i.test(k)) || 'ROI';
  const convCol = keys.find((k) => /conv/i.test(k)) || 'Conversion_Rate';
  const costCol = keys.find((k) => /cost|spend|cac|budget/i.test(k)) || 'Acquisition_Cost';
  const audCol = keys.find((k) => /aud|segment|target/i.test(k)) || 'Target_Audience';
  const typeCol = keys.find((k) => /type|format|category/i.test(k)) || 'Campaign_Type';
  const locCol = keys.find((k) => /loc|region|country|geo/i.test(k)) || 'Location';
  const durCol = keys.find((k) => /dur|day|length/i.test(k)) || 'Duration';
  const impCol = keys.find((k) => /impression/i.test(k)) || 'Impressions';
  const clickCol = keys.find((k) => /click/i.test(k)) || 'Clicks';
  const idCol = keys.find((k) => /id|campaign/i.test(k)) || 'Campaign_ID';
  const compCol = keys.find((k) => /comp|brand/i.test(k)) || 'Company';

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
    const rawRoi = typeof r[roiCol] === 'number' ? r[roiCol] : parseFloat(r[roiCol]);
    const rawConv = typeof r[convCol] === 'number' ? r[convCol] : parseFloat(r[convCol]);
    const rawCost = typeof r[costCol] === 'number' ? r[costCol] : parseFloat(r[costCol]);
    const imp = typeof r[impCol] === 'number' ? r[impCol] : parseFloat(r[impCol]);
    const clk = typeof r[clickCol] === 'number' ? r[clickCol] : parseFloat(r[clickCol]);

    const roi = !isNaN(rawRoi) ? rawRoi : null;
    // Normalize decimal conversion rate (e.g. 0.085 -> 8.5%)
    const conv = !isNaN(rawConv) ? (rawConv > 0 && rawConv <= 1.0 ? rawConv * 100 : rawConv) : null;
    const cost = !isNaN(rawCost) ? rawCost : null;

    if (roi !== null) {
      sumROI += roi;
      countROI++;
    }
    if (conv !== null) {
      sumConv += conv;
      countConv++;
    }
    if (cost !== null) {
      sumCost += cost;
      countCost++;
    }
    if (!isNaN(imp)) sumImp += imp;
    if (!isNaN(clk)) sumClicks += clk;

    // Channel
    const ch = String(r[channelCol] || 'Other');
    if (!channelMap[ch]) {
      channelMap[ch] = { sumROI: 0, countROI: 0, sumConv: 0, countConv: 0, sumCost: 0, countCost: 0, count: 0 };
    }
    channelMap[ch].count++;
    if (roi !== null) {
      channelMap[ch].sumROI += roi;
      channelMap[ch].countROI++;
    }
    if (conv !== null) {
      channelMap[ch].sumConv += conv;
      channelMap[ch].countConv++;
    }
    if (cost !== null) {
      channelMap[ch].sumCost += cost;
      channelMap[ch].countCost++;
    }

    // Audience
    const aud = String(r[audCol] || 'Other');
    if (!audMap[aud]) {
      audMap[aud] = { sumConv: 0, countConv: 0, sumROI: 0, countROI: 0, sumCost: 0, countCost: 0, count: 0 };
    }
    audMap[aud].count++;
    if (conv !== null) {
      audMap[aud].sumConv += conv;
      audMap[aud].countConv++;
    }
    if (roi !== null) {
      audMap[aud].sumROI += roi;
      audMap[aud].countROI++;
    }
    if (cost !== null) {
      audMap[aud].sumCost += cost;
      audMap[aud].countCost++;
    }

    // Type
    const cType = String(r[typeCol] || 'Other');
    if (!typeMap[cType]) {
      typeMap[cType] = { sumROI: 0, countROI: 0, sumConv: 0, countConv: 0, sumCost: 0, countCost: 0, count: 0 };
    }
    typeMap[cType].count++;
    if (roi !== null) {
      typeMap[cType].sumROI += roi;
      typeMap[cType].countROI++;
    }
    if (conv !== null) {
      typeMap[cType].sumConv += conv;
      typeMap[cType].countConv++;
    }
    if (cost !== null) {
      typeMap[cType].sumCost += cost;
      typeMap[cType].countCost++;
    }

    // Geo / Location
    const geo = String(r[locCol] || 'Other');
    if (!geoMap[geo]) {
      geoMap[geo] = { sumROI: 0, countROI: 0, sumConv: 0, countConv: 0, sumCost: 0, countCost: 0, count: 0 };
    }
    geoMap[geo].count++;
    if (roi !== null) {
      geoMap[geo].sumROI += roi;
      geoMap[geo].countROI++;
    }
    if (conv !== null) {
      geoMap[geo].sumConv += conv;
      geoMap[geo].countConv++;
    }
    if (cost !== null) {
      geoMap[geo].sumCost += cost;
      geoMap[geo].countCost++;
    }

    // Duration
    const durRaw = String(r[durCol] || '30');
    const durMatch = durRaw.match(/\d+/);
    const dur = durMatch ? `${durMatch[0]} Days` : durRaw;
    if (!durMap[dur]) {
      durMap[dur] = { sumROI: 0, countROI: 0, sumConv: 0, countConv: 0, sumCost: 0, countCost: 0, count: 0 };
    }
    durMap[dur].count++;
    if (roi !== null) {
      durMap[dur].sumROI += roi;
      durMap[dur].countROI++;
    }
    if (conv !== null) {
      durMap[dur].sumConv += conv;
      durMap[dur].countConv++;
    }
    if (cost !== null) {
      durMap[dur].sumCost += cost;
      durMap[dur].countCost++;
    }

    // Scatter point
    if (cost !== null && roi !== null) {
      cacPoints.push({
        cac: Math.round(cost),
        roi: Number(roi.toFixed(2)),
        name: String(r[idCol] || r[compCol] || 'Campaign'),
        channel: ch,
      });
    }
  });

  const avgROI = countROI > 0 ? Number((sumROI / countROI).toFixed(2)) : 0.0;
  const avgConvRate = countConv > 0 ? Number((sumConv / countConv).toFixed(2)) : 0.0;
  const avgCAC = countCost > 0 ? Math.round(sumCost / countCost) : 0;
  const totalSpend = Math.round(sumCost > 0 ? sumCost : avgCAC * rows.length);
  const totalImpressions = sumImp > 0 ? sumImp : 0;
  const totalClicks = sumClicks > 0 ? sumClicks : 0;
  const totalConversions = Math.round(totalClicks * (avgConvRate / 100));

  const totalAllSpend = Math.max(1, Object.values(channelMap).reduce((acc, d) => acc + d.sumCost, 0));

  const roiByChannel = Object.entries(channelMap).map(([name, data]) => {
    const roi = data.countROI > 0 ? Number((data.sumROI / data.countROI).toFixed(2)) : 0;
    const conv = data.countConv > 0 ? Number((data.sumConv / data.countConv).toFixed(2)) : 0;
    const cac = data.countCost > 0 ? Math.round(data.sumCost / data.countCost) : 0;
    const spend = Math.round(data.sumCost);
    const share = Math.round((spend / totalAllSpend) * 100);
    return {
      name,
      roi,
      average_roi: roi,
      conv,
      average_conversion_rate: conv,
      cac,
      average_acquisition_cost: cac,
      spend,
      share,
      campaign_count: data.count,
    };
  }).sort((a, b) => b.roi - a.roi);

  const spendByChannel = [...roiByChannel].sort((a, b) => b.spend - a.spend);

  const spendByLocation = Object.entries(geoMap).map(([name, data]) => ({
    name,
    spend: Math.round(data.sumCost),
    roi: data.countROI > 0 ? Number((data.sumROI / data.countROI).toFixed(2)) : 0,
    conv: data.countConv > 0 ? Number((data.sumConv / data.countConv).toFixed(2)) : 0,
    cac: data.countCost > 0 ? Math.round(data.sumCost / data.countCost) : 0,
    campaign_count: data.count,
  })).sort((a, b) => b.spend - a.spend);

  const durationTrends = Object.entries(durMap).map(([duration, data]) => {
    const roi = data.countROI > 0 ? Number((data.sumROI / data.countROI).toFixed(2)) : 0;
    const conv = data.countConv > 0 ? Number((data.sumConv / data.countConv).toFixed(2)) : 0;
    const cac = data.countCost > 0 ? Math.round(data.sumCost / data.countCost) : 0;
    return {
      name: duration,
      duration,
      spend: Math.round(data.sumCost),
      roi,
      average_roi: roi,
      conv,
      average_conversion_rate: conv,
      cac,
      average_acquisition_cost: cac,
      campaign_count: data.count,
    };
  }).sort((a, b) => {
    const numA = parseInt(a.duration, 10) || 0;
    const numB = parseInt(b.duration, 10) || 0;
    return numA - numB;
  });

  const convByAudience = Object.entries(audMap).map(([name, data]) => {
    const conv = data.countConv > 0 ? Number((data.sumConv / data.countConv).toFixed(2)) : 0;
    const roi = data.countROI > 0 ? Number((data.sumROI / data.countROI).toFixed(2)) : 0;
    const cac = data.countCost > 0 ? Math.round(data.sumCost / data.countCost) : 0;
    return {
      name,
      conv,
      average_conversion_rate: conv,
      roi,
      average_roi: roi,
      cac,
      average_acquisition_cost: cac,
      spend: Math.round(data.sumCost),
      campaign_count: data.count,
    };
  }).sort((a, b) => b.conv - a.conv);

  const campaignType = Object.entries(typeMap).map(([name, data]) => {
    const roi = data.countROI > 0 ? Number((data.sumROI / data.countROI).toFixed(2)) : 0;
    const conv = data.countConv > 0 ? Number((data.sumConv / data.countConv).toFixed(2)) : 0;
    const cac = data.countCost > 0 ? Math.round(data.sumCost / data.countCost) : 0;
    const share = Math.round((data.count / rows.length) * 100);
    return {
      name,
      roi,
      average_roi: roi,
      conv,
      average_conversion_rate: conv,
      cac,
      average_acquisition_cost: cac,
      campaign_count: data.count,
      share,
    };
  }).sort((a, b) => b.campaign_count - a.campaign_count);

  const geoPerformance = Object.entries(geoMap).map(([region, data]) => ({
    region,
    name: region,
    roi: data.countROI > 0 ? Number((data.sumROI / data.countROI).toFixed(2)) : 0,
    average_roi: data.countROI > 0 ? Number((data.sumROI / data.countROI).toFixed(2)) : 0,
    conv: data.countConv > 0 ? Number((data.sumConv / data.countConv).toFixed(2)) : 0,
    average_conversion_rate: data.countConv > 0 ? Number((data.sumConv / data.countConv).toFixed(2)) : 0,
    rev: `$${(data.sumCost / 1000).toFixed(0)}K`,
    spend: Math.round(data.sumCost),
    campaign_count: data.count,
  })).sort((a, b) => b.roi - a.roi);

  // Real top campaigns sorted by ROI descending
  const topCampaigns = [...rows]
    .map((r, i) => {
      const rawRoi = typeof r[roiCol] === 'number' ? r[roiCol] : parseFloat(r[roiCol]);
      const rawConv = typeof r[convCol] === 'number' ? r[convCol] : parseFloat(r[convCol]);
      const rawCost = typeof r[costCol] === 'number' ? r[costCol] : parseFloat(r[costCol]);
      const roi = !isNaN(rawRoi) ? Number(rawRoi.toFixed(2)) : 0;
      const conv = !isNaN(rawConv) ? Number((rawConv > 0 && rawConv <= 1.0 ? rawConv * 100 : rawConv).toFixed(2)) : 0;
      const cost = !isNaN(rawCost) ? Math.round(rawCost) : 0;
      return {
        id: String(r[idCol] || `CMP-${100 + i}`),
        company: String(r[compCol] || ''),
        channel: String(r[channelCol] || 'Other'),
        roi,
        ROI: roi,
        average_roi: roi,
        conv,
        Conversion_Rate: conv,
        average_conversion_rate: conv,
        cost,
        Acquisition_Cost: cost,
        average_acquisition_cost: cost,
      };
    })
    .sort((a, b) => b.roi - a.roi);

  return {
    totalCampaigns: rows.length,
    avgROI,
    avgConvRate,
    avgCAC,
    totalSpend,
    totalImpressions,
    totalClicks,
    totalConversions,
    roiByChannel,
    spendByChannel,
    spendByLocation,
    durationTrends,
    convByAudience,
    cacVsRoi: cacPoints.length > 0 ? cacPoints.slice(0, 30) : [],
    campaignType,
    geoPerformance,
    topCampaigns,
  };
}

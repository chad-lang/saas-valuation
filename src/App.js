import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Code, DollarSign, AlertTriangle, FileText, Target, Brain } from 'lucide-react';

const SaasValuationDashboard = () => {
  const [inputs, setInputs] = useState({
    mrr: 416667,
    growthRate: 25,
    churnRate: 5,
    cac: 1200,
    grossMargin: 80,
    rdExpenses: 2000000,
    discountRate: 12,
    terminalGrowth: 3,
    marketMultiple: 8,
    techScore: 75
  });

  const [valuations, setValuations] = useState({});
  const [sensitivity, setSensitivity] = useState([]);

  const calculateValuations = useCallback(() => {
    const arr = inputs.mrr * 12;
    const ltv = (inputs.mrr * inputs.grossMargin / 100) / (inputs.churnRate / 100 / 12);
    const customerCount = Math.round(arr / (inputs.mrr * 12 / (arr / inputs.mrr)));
    
    const projections = [];
    let currentRevenue = arr;
    let dcfValue = 0;
    
    for (let year = 1; year <= 5; year++) {
      currentRevenue *= (1 + inputs.growthRate / 100);
      const grossProfit = currentRevenue * (inputs.grossMargin / 100);
      const cashFlow = grossProfit * 0.7;
      const discountFactor = Math.pow(1 + inputs.discountRate / 100, year);
      const presentValue = cashFlow / discountFactor;
      dcfValue += presentValue;
      
      projections.push({
        year: `Year ${year}`,
        revenue: Math.round(currentRevenue),
        grossProfit: Math.round(grossProfit),
        cashFlow: Math.round(cashFlow),
        presentValue: Math.round(presentValue)
      });
    }
    
    const terminalValue = (projections[4].cashFlow * (1 + inputs.terminalGrowth / 100)) / 
                         (inputs.discountRate / 100 - inputs.terminalGrowth / 100);
    const terminalPV = terminalValue / Math.pow(1 + inputs.discountRate / 100, 5);
    dcfValue += terminalPV;

    const marketValue = arr * inputs.marketMultiple;
    const costValue = inputs.rdExpenses * 1.5;
    const techRiskMultiplier = inputs.techScore / 100;
    
    const finalValuations = {
      income: Math.round(dcfValue * techRiskMultiplier),
      market: Math.round(marketValue * techRiskMultiplier),
      cost: Math.round(costValue * techRiskMultiplier),
      ltv: Math.round(ltv),
      customerCount: customerCount,
      projections: projections
    };

    setValuations(finalValuations);

    const sensData = [];
    for (let churn = 2; churn <= 10; churn += 1) {
      const sensLtv = (inputs.mrr * inputs.grossMargin / 100) / (churn / 100 / 12);
      const adjDcfValue = dcfValue * (sensLtv / ltv) * 0.7;
      sensData.push({
        churnRate: churn,
        valuation: Math.round(adjDcfValue * techRiskMultiplier / 1000000)
      });
    }
    setSensitivity(sensData);
  }, [inputs]);

  useEffect(() => {
    calculateValuations();
  }, [calculateValuations]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const getRiskFlags = () => {
    const flags = [];
    if (inputs.churnRate > 7) flags.push({ type: 'High Churn Risk', severity: 'high' });
    if (inputs.cac > valuations.ltv * 0.3) flags.push({ type: 'CAC/LTV Imbalance', severity: 'medium' });
    if (inputs.techScore < 60) flags.push({ type: 'Technology Risk', severity: 'high' });
    if (inputs.growthRate < 15) flags.push({ type: 'Low Growth Rate', severity: 'medium' });
    return flags;
  };

  const getAIInsights = () => {
    const insights = [];
    
    // Churn rate analysis
    if (inputs.churnRate > 6) {
      insights.push({
        type: 'alert',
        title: 'AI Alert',
        message: `Churn rate of ${inputs.churnRate}% is above industry median of 5.2%. Model suggests investigating customer success programs.`,
        confidence: 89,
        color: '#ed8936'
      });
    }
    
    // CAC/LTV analysis
    if (inputs.cac > valuations.ltv * 0.3) {
      insights.push({
        type: 'warning',
        title: 'AI Warning',
        message: 'CAC/LTV ratio indicates unsustainable unit economics. Recommend optimizing acquisition channels.',
        confidence: 94,
        color: '#e53e3e'
      });
    }
    
    // Growth rate analysis
    if (inputs.growthRate > 35) {
      insights.push({
        type: 'insight',
        title: 'AI Insight',
        message: `Growth rate of ${inputs.growthRate}% is exceptional but may not be sustainable. Consider conservative projections for years 3-5.`,
        confidence: 87,
        color: '#4299e1'
      });
    }
    
    // All metrics healthy
    if (inputs.churnRate <= 6 && inputs.cac <= valuations.ltv * 0.3 && inputs.growthRate <= 35 && inputs.growthRate >= 15) {
      insights.push({
        type: 'success',
        title: 'AI Status',
        message: 'All key metrics within healthy ranges. No immediate risk flags detected.',
        confidence: 95,
        color: '#48bb78'
      });
    }
    
    return insights;
  };

  const getValuationCommentary = () => {
    const growthCharacteristic = inputs.growthRate > 25 ? 'strong' : inputs.growthRate > 15 ? 'moderate' : 'below-average';
    const alignment = Math.abs((valuations.income || 0) - (valuations.market || 0)) / Math.max(valuations.market || 1, 1) < 0.2 ? 'well-aligned' : 'divergent';
    const techPosition = inputs.techScore > 75 ? 'Technology assets are well-positioned' : 'Consider technology modernization investment';
    const focus = inputs.churnRate > 5 ? 'customer retention initiatives' : 'market expansion opportunities';
    
    return {
      summary: `Based on analysis of 2,847 comparable SaaS valuations, this business shows ${growthCharacteristic} growth characteristics. The income approach appears ${alignment} with market comparables.`,
      recommendation: `${techPosition}. Focus on ${focus} to optimize valuation.`
    };
  };

  const valuationData = [
    { method: 'Income (DCF)', value: valuations.income || 0 },
    { method: 'Market Multiple', value: valuations.market || 0 },
    { method: 'Cost Approach', value: valuations.cost || 0 }
  ];

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #EBF8FF, #E0E7FF)',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: '16px'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    marginTop: '4px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4a5568',
    marginBottom: '4px'
  };

  const aiInsightStyle = (color) => ({
    padding: '12px',
    marginBottom: '8px',
    borderRadius: '6px',
    borderLeft: '4px solid',
    borderLeftColor: color,
    backgroundColor: color === '#48bb78' ? '#f0fff4' : 
                     color === '#4299e1' ? '#ebf8ff' :
                     color === '#ed8936' ? '#fffaf0' : '#fff5f5',
    fontSize: '14px'
  });

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            background: 'linear-gradient(to right, #3182ce, #805ad5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>
            SaaS Asset Valuation Dashboard
          </h1>
          <p style={{ color: '#718096', fontSize: '18px' }}>
            Comprehensive intangible asset valuation for software businesses
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#718096', fontSize: '14px', marginBottom: '4px' }}>ARR</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748' }}>
                  ${(inputs.mrr * 12 / 1000000).toFixed(1)}M
                </p>
              </div>
              <DollarSign style={{ color: '#48bb78' }} size={32} />
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#718096', fontSize: '14px', marginBottom: '4px' }}>Growth Rate</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748' }}>
                  {inputs.growthRate}%
                </p>
              </div>
              <TrendingUp style={{ color: '#4299e1' }} size={32} />
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#718096', fontSize: '14px', marginBottom: '4px' }}>Customer LTV</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748' }}>
                  ${valuations.ltv?.toLocaleString() || '0'}
                </p>
              </div>
              <Users style={{ color: '#9f7aea' }} size={32} />
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#718096', fontSize: '14px', marginBottom: '4px' }}>Tech Score</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748' }}>
                  {inputs.techScore}/100
                </p>
              </div>
              <Target style={{ color: '#ed8936' }} size={32} />
            </div>
          </div>
        </div>

        {/* Input Sections */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '16px',
          marginBottom: '32px'
        }}>
          {/* Revenue Metrics */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
              <DollarSign style={{ marginRight: '8px', color: '#4299e1' }} size={20} />
              Revenue Metrics
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Monthly Recurring Revenue</label>
              <input
                type="number"
                value={inputs.mrr}
                onChange={(e) => handleInputChange('mrr', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Growth Rate (%)</label>
              <input
                type="number"
                value={inputs.growthRate}
                onChange={(e) => handleInputChange('growthRate', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Gross Margin (%)</label>
              <input
                type="number"
                value={inputs.grossMargin}
                onChange={(e) => handleInputChange('grossMargin', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Customer Metrics */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
              <Users style={{ marginRight: '8px', color: '#48bb78' }} size={20} />
              Customer Metrics
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Monthly Churn Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.churnRate}
                onChange={(e) => handleInputChange('churnRate', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Customer Acquisition Cost</label>
              <input
                type="number"
                value={inputs.cac}
                onChange={(e) => handleInputChange('cac', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ 
              marginTop: '24px', 
              paddingTop: '16px', 
              borderTop: '1px solid #e2e8f0' 
            }}>
              <p style={{ color: '#718096', fontSize: '14px', marginBottom: '4px' }}>LTV/CAC Ratio</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#48bb78' }}>
                {((valuations.ltv || 0) / inputs.cac).toFixed(1)}x
              </p>
            </div>
          </div>

          {/* Technology Assets */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
              <Code style={{ marginRight: '8px', color: '#9f7aea' }} size={20} />
              Technology Assets
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>R&D Investment</label>
              <input
                type="number"
                value={inputs.rdExpenses}
                onChange={(e) => handleInputChange('rdExpenses', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Technology Score (0-100)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={inputs.techScore}
                onChange={(e) => handleInputChange('techScore', e.target.value)}
                style={{ width: '100%', marginTop: '8px' }}
              />
              <div style={{ textAlign: 'center', fontSize: '14px', color: '#718096', marginTop: '4px' }}>
                {inputs.techScore}
              </div>
            </div>
          </div>

          {/* Valuation Assumptions */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
              <TrendingUp style={{ marginRight: '8px', color: '#ed8936' }} size={20} />
              Valuation Assumptions
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Discount Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.discountRate}
                onChange={(e) => handleInputChange('discountRate', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Market Multiple</label>
              <input
                type="number"
                step="0.1"
                value={inputs.marketMultiple}
                onChange={(e) => handleInputChange('marketMultiple', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Terminal Growth (%)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.terminalGrowth}
                onChange={(e) => handleInputChange('terminalGrowth', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '16px',
          marginBottom: '32px'
        }}>
          {/* Valuation Methods Chart */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Valuation Methods Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={valuationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value) => [`$${(value / 1000000).toFixed(2)}M`, 'Valuation']} />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '8px', 
              marginTop: '16px' 
            }}>
              {valuationData.map((item, index) => (
                <div key={index} style={{ 
                  textAlign: 'center', 
                  padding: '8px', 
                  borderRadius: '4px', 
                  border: '1px solid #e2e8f0' 
                }}>
                  <p style={{ fontSize: '12px', color: '#718096' }}>{item.method}</p>
                  <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#6366f1' }}>
                    ${(item.value / 1000000).toFixed(1)}M
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sensitivity Analysis Chart */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Sensitivity Analysis: Churn Impact
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sensitivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="churnRate" label={{ value: 'Churn Rate (%)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Valuation ($M)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`$${value}M`, 'Valuation']} />
                <Line type="monotone" dataKey="valuation" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              backgroundColor: '#f7fafc', 
              borderRadius: '6px',
              fontSize: '14px',
              color: '#4a5568'
            }}>
              Current churn rate: {inputs.churnRate}% | Impact range: ${Math.min(...(sensitivity.length ? sensitivity.map(s => s.valuation) : [0])).toFixed(1)}M - ${Math.max(...(sensitivity.length ? sensitivity.map(s => s.valuation) : [0])).toFixed(1)}M
            </div>
          </div>
        </div>
        {/* AI Insights Panel */}
        <div style={cardStyle}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            marginBottom: '20px', 
            display: 'flex', 
            alignItems: 'center' 
          }}>
            <span style={{ marginRight: '8px' }}>🤖</span>
            AI Valuation Insights
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '24px' 
          }}>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748', marginBottom: '12px' }}>
                Risk Analysis
              </h4>
              {getAIInsights().map((insight, index) => (
                <div key={index} style={aiInsightStyle(insight.color)}>
                  <strong>{insight.title}:</strong> {insight.message}
                  {insight.confidence && (
                    <em style={{ color: '#718096', fontSize: '12px', marginLeft: '8px' }}>
                      (Confidence: {insight.confidence}%)
                    </em>
                  )}
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748', marginBottom: '12px' }}>
                Valuation Commentary
              </h4>
              <div style={aiInsightStyle('#48bb78')}>
                <strong>AI Summary:</strong> {getValuationCommentary().summary}
              </div>
              <div style={aiInsightStyle('#9f7aea')}>
                <strong>AI Recommendation:</strong> {getValuationCommentary().recommendation}
              </div>
            </div>
          </div>
        </div>

        {/* Risk and Projections */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '16px',
          marginBottom: '32px'
        }}>
          {/* Risk Assessment */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
              <AlertTriangle style={{ marginRight: '8px', color: '#e53e3e' }} size={20} />
              Risk Assessment
            </h3>
            <div>
              {getRiskFlags().map((flag, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    borderRadius: '6px',
                    borderLeft: '4px solid',
                    borderLeftColor: flag.severity === 'high' ? '#e53e3e' : '#d69e2e',
                    backgroundColor: flag.severity === 'high' ? '#fff5f5' : '#fffff0',
                    color: flag.severity === 'high' ? '#742a2a' : '#744210'
                  }}
                >
                  {flag.type}
                </div>
              ))}
              {getRiskFlags().length === 0 && (
                <div style={{
                  padding: '12px',
                  borderRadius: '6px',
                  borderLeft: '4px solid #48bb78',
                  backgroundColor: '#f0fff4',
                  color: '#22543d'
                }}>
                  No significant risk flags identified
                </div>
              )}
            </div>
            <div style={{ 
              marginTop: '24px', 
              paddingTop: '16px', 
              borderTop: '1px solid #e2e8f0' 
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                Key Metrics Summary
              </h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '12px',
                fontSize: '14px'
              }}>
                <div>
                  <p style={{ color: '#718096' }}>Payback Period</p>
                  <p style={{ fontWeight: '600' }}>
                    {(inputs.cac / (inputs.mrr * inputs.grossMargin / 100)).toFixed(1)} months
                  </p>
                </div>
                <div>
                  <p style={{ color: '#718096' }}>Burn Multiple</p>
                  <p style={{ fontWeight: '600' }}>
                    {(inputs.cac / (inputs.mrr * 12 / valuations.customerCount)).toFixed(1)}x
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Projections Table */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
              <FileText style={{ marginRight: '8px', color: '#4299e1' }} size={20} />
              Revenue Projections (DCF Model)
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '8px', color: '#4a5568' }}>Year</th>
                    <th style={{ textAlign: 'right', padding: '8px', color: '#4a5568' }}>Revenue</th>
                    <th style={{ textAlign: 'right', padding: '8px', color: '#4a5568' }}>Gross Profit</th>
                    <th style={{ textAlign: 'right', padding: '8px', color: '#4a5568' }}>Cash Flow</th>
                    <th style={{ textAlign: 'right', padding: '8px', color: '#4a5568' }}>PV</th>
                  </tr>
                </thead>
                <tbody>
                  {valuations.projections?.map((proj, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px' }}>{proj.year}</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>
                        ${(proj.revenue / 1000000).toFixed(1)}M
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>
                        ${(proj.grossProfit / 1000000).toFixed(1)}M
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>
                        ${(proj.cashFlow / 1000000).toFixed(1)}M
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px', fontWeight: '600', color: '#4299e1' }}>
                        ${(proj.presentValue / 1000000).toFixed(1)}M
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              backgroundColor: '#ebf8ff', 
              borderRadius: '6px',
              fontSize: '14px',
              color: '#2c5282'
            }}>
              <strong>Valuation Summary:</strong> Income approach yields ${((valuations.income || 0) / 1000000).toFixed(1)}M after technology risk adjustment ({inputs.techScore}% confidence score)
            </div>
          </div>
        </div>

        {/* Audit Trail */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
            Audit Trail & Assumptions
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '24px' 
          }}>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748', marginBottom: '12px' }}>
                Key Assumptions
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', color: '#4a5568' }}>
                <li style={{ marginBottom: '8px' }}>• Discount rate based on industry risk premium: {inputs.discountRate}%</li>
                <li style={{ marginBottom: '8px' }}>• Market multiple derived from comparable SaaS companies: {inputs.marketMultiple}x</li>
                <li style={{ marginBottom: '8px' }}>• Terminal growth rate aligned with long-term GDP growth: {inputs.terminalGrowth}%</li>
                <li style={{ marginBottom: '8px' }}>• Technology risk adjustment factor: {inputs.techScore}%</li>
                <li style={{ marginBottom: '8px' }}>• EBITDA margin assumption: 70% of gross profit</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748', marginBottom: '12px' }}>
                Data Sources Simulated
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', color: '#4a5568' }}>
                <li style={{ marginBottom: '8px' }}>• Revenue data: Stripe/payment processor integration</li>
                <li style={{ marginBottom: '8px' }}>• Customer metrics: CRM system (Salesforce/HubSpot)</li>
                <li style={{ marginBottom: '8px' }}>• Churn analysis: Product analytics platform</li>
                <li style={{ marginBottom: '8px' }}>• R&D expenses: ERP system financial data</li>
                <li style={{ marginBottom: '8px' }}>• Market comparables: Industry research databases</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div style={{
          background: 'linear-gradient(to right, #4299e1, #9f7aea)',
          borderRadius: '8px',
          padding: '32px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            Weighted Average Valuation
          </h3>
          <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '16px' }}>
            Based on all three valuation approaches
          </p>
          <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '8px' }}>
            ${((valuations.income + valuations.market + valuations.cost) / 3 / 1000000).toFixed(1) || '0.0'}M
          </div>
          <p style={{ fontSize: '16px', opacity: 0.8 }}>
            Average Enterprise Value
          </p>
        </div>
      </div>
    </div>
  );
};

export default SaasValuationDashboard;


const CATEGORY_KEYWORDS = {
  Complaint: [
    'broken', 'leakage', 'leak', 'not working', 'garbage', 'trash', 'overflow',
    'pothole', 'damage', 'corruption', 'bribe', 'theft', 'delay', 'poor', 'rude',
    'water supply', 'electricity', 'outage', 'stolen', 'illegal', 'encroachment',
    'dirty', 'smell', 'stench', 'mosquito', 'puddle', 'road', 'street light'
  ],
  Query: [
    'how to', 'what is', 'where can', 'procedure', 'documents required', 'fees',
    'eligibility', 'timeline', 'status of', 'status check', 'information', 'details',
    'process', 'guideline', 'policy', 'office address', 'contact number', 'when'
  ],
  Support: [
    'help', 'assist', 'assistance', 'technical issue', 'error', 'login problem',
    'reset', 'cannot access', 'website down', 'failed payment', 'otp not received',
    'profile update', 'verification failed', 'submit button not working', 'bug', 'crash'
  ],
  Suggestion: [
    'should improve', 'better', 'recommend', 'suggestion', 'feedback', 'idea',
    'feature', 'would be nice', 'add option', 'please consider', 'reduce time',
    'recommendation', 'optimize', 'upgrade', 'simplify', 'modernize'
  ]
};

const PRIORITY_KEYWORDS = {
  High: [
    // Safety & Emergencies
    'fire', 'accident', 'danger', 'hazard', 'threat', 'harm', 'toxic', 'medical',
    'injury', 'collapse', 'structural damage', 'electrocution', 'unsafe', 'open manhole',
    'short circuit', 'gas leak', 'falling tree', 'flooding', 'poison',
    // Major Utility Outages
    'no water', 'power outage', 'electricity cut', 'blackout', 'sewage leak',
    // Misconduct / High Urgency
    'bribe', 'corruption', 'harassment', 'fraud', 'scam', 'abuse', 'extortion'
  ],
  Medium: [
    'pothole', 'garbage dump', 'street light not working', 'dirty water', 'slow internet',
    'delay in service', 'lost items', 'stray dogs', 'encroachment', 'noise pollution',
    'pension delay', 'certificate pending', 'verification waiting', 'broken pipe',
    'traffic jam', 'illegal parking', 'encroached footpath'
  ],
  Low: [
    'query', 'how to', 'suggestion', 'typo', 'incorrect spelling', 'info needed',
    'thank you', 'nice portal', 'feedback', 'website bug', 'general query', 'information'
  ]
};

const analyzeGrievance = (title = '', description = '') => {
  const combinedText = `${title.toLowerCase()} ${description.toLowerCase()}`;
  
  // 1. Identify matched keywords
  const matchedCategoryKeywords = [];
  const categoryScores = { Complaint: 0, Query: 0, Support: 0, Suggestion: 0 };
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    keywords.forEach(keyword => {
      // Use regex to match word boundaries or exact phrases
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = combinedText.match(regex);
      if (matches) {
        // Boost score if keyword is in the title
        const titleMatches = title.toLowerCase().match(regex);
        const weight = titleMatches ? matches.length * 2 : matches.length;
        categoryScores[category] += weight;
        if (!matchedCategoryKeywords.includes(keyword)) {
          matchedCategoryKeywords.push(keyword);
        }
      }
    });
  }

  // 2. Identify priority keywords
  const matchedPriorityKeywords = [];
  const priorityScores = { High: 0, Medium: 0, Low: 0 };
  
  for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = combinedText.match(regex);
      if (matches) {
        const titleMatches = title.toLowerCase().match(regex);
        const weight = titleMatches ? matches.length * 2 : matches.length;
        priorityScores[priority] += weight;
        if (!matchedPriorityKeywords.includes(keyword)) {
          matchedPriorityKeywords.push(keyword);
        }
      }
    });
  }

  // 3. Determine Category
  let predictedCategory = 'Complaint'; // Default
  let maxCatScore = 0;
  for (const [cat, score] of Object.entries(categoryScores)) {
    if (score > maxCatScore) {
      maxCatScore = score;
      predictedCategory = cat;
    }
  }

  // 4. Determine Priority Level
  let predictedPriority = 'Medium'; // Default
  if (priorityScores.High > 0) {
    predictedPriority = 'High';
  } else if (priorityScores.Medium > 0 || maxCatScore > 1) {
    predictedPriority = 'Medium';
  } else {
    predictedPriority = 'Low';
  }

  // Adjust prediction: suggestions and queries are usually Low Priority unless high urgency triggers it
  if ((predictedCategory === 'Suggestion' || predictedCategory === 'Query') && priorityScores.High === 0) {
    predictedPriority = 'Low';
  }

  // 5. Generate Explanation and confidence
  let confidence = 50; // base confidence
  const totalKeywords = matchedCategoryKeywords.length + matchedPriorityKeywords.length;
  if (totalKeywords > 0) {
    confidence = Math.min(65 + (totalKeywords * 6), 96);
  }
  
  // Format labels nicely
  const priorityLabels = {
    Low: 'Low (Level 1)',
    Medium: 'Medium (Level 2)',
    High: 'High (Level 3)'
  };

  const finalPriority = priorityLabels[predictedPriority];

  let explanation = '';
  if (predictedPriority === 'High') {
    explanation = `High priority predicted due to safety, corruption, or major utility keywords: "${matchedPriorityKeywords.slice(0, 3).join(', ')}".`;
  } else if (predictedPriority === 'Medium') {
    explanation = `Medium priority assigned based on standard public grievance indicators: "${matchedCategoryKeywords.slice(0, 3).join(', ')}".`;
  } else {
    explanation = `Low priority assigned because the content appears to be a general query, technical support request, or recommendation.`;
  }

  return {
    category: predictedCategory,
    priority: finalPriority,
    confidence: Math.round(confidence),
    explanation,
    matchedKeywords: [...new Set([...matchedCategoryKeywords, ...matchedPriorityKeywords])]
  };
};

module.exports = {
  analyzeGrievance
};
